// const axios = require('axios');

// const HF_API = 'https://api-inference.huggingface.co/embeddings';
// const HF_MODEL = process.env.HF_EMBEDDING_MODEL || 'blip-image-captioning-base';
// const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
// const SKIP_HF = (process.env.SKIP_HF_EMBEDDINGS || 'false') === 'true';

// // Fake embedding (for local dev)
// function fakeEmbedding(seedStr, dim = 384) {
//   const out = new Array(dim);
//   let seed = 0;
//   for (let i = 0; i < seedStr.length; i++)
//     seed = ((seed << 5) - seed) + seedStr.charCodeAt(i);
//   seed = Math.abs(seed) || 1;
//   for (let i = 0; i < dim; i++) out[i] = Math.sin(seed + i) * 0.5;
//   return out;
// }

// async function getImageEmbedding(imageUrl) {
//   if (SKIP_HF) return fakeEmbedding(imageUrl, 384);

//   if (!HF_TOKEN) throw new Error('Missing HUGGINGFACE_API_TOKEN');

//   try {
//     const resp = await axios.post(
//       `${HF_API}/${encodeURIComponent(HF_MODEL)}`,
//       { inputs: imageUrl },
//       {
//         headers: {
//           Authorization: `Bearer ${HF_TOKEN}`,
//           'Content-Type': 'application/json'
//         },
//         timeout: 60000
//       }
//     );

//     const data = resp.data;
//     if (Array.isArray(data)) return data;
//     if (Array.isArray(data.embedding)) return data.embedding;
//     if (Array.isArray(data.data?.[0])) return data.data[0];
//     throw new Error('Unexpected Hugging Face response');
//   } catch (err) {
//     console.error('HF embedding error:', err.response?.data || err.message);
//     throw new Error('Failed to generate embedding from HuggingFace');
//   }
// }

// module.exports = { getImageEmbedding };


// src/services/embeddingService.js
const axios = require('axios');

const HF_API = 'https://api-inference.huggingface.co/embeddings';
const HF_MODEL = process.env.HF_EMBEDDING_MODEL || 'sentence-transformers/clip-ViT-B-32';
const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const SKIP_HF = (process.env.SKIP_HF_EMBEDDINGS || 'false') === 'true';

// quick deterministic fake embedding for local/dev when SKIP_HF=true
function fakeEmbedding(seedStr, dim = 512) {
  const out = new Array(dim);
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++)
    seed = ((seed << 5) - seed) + seedStr.charCodeAt(i);
  seed = Math.abs(seed) || 1;
  for (let i = 0; i < dim; i++) out[i] = Math.sin(seed + i) * 0.5;
  return out;
}

// normalize vector to unit length
function normalize(vec) {
  if (!Array.isArray(vec)) return vec;
  let n = 0;
  for (let i = 0; i < vec.length; i++) n += vec[i] * vec[i];
  n = Math.sqrt(n);
  if (n === 0) return vec.map(() => 0);
  return vec.map(v => v / n);
}

async function getImageEmbedding(imageUrl) {
  if (SKIP_HF) {
    // use predictable dimension 512 for dev
    return normalize(fakeEmbedding(imageUrl, 512));
  }

  if (!HF_TOKEN) throw new Error('Missing HUGGINGFACE_API_TOKEN');

  try {
    const resp = await axios.post(
      `${HF_API}/${encodeURIComponent(HF_MODEL)}`,
      { inputs: imageUrl },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    let data = resp.data;
    // HuggingFace embeddings API returns different shapes; handle common cases:
    if (Array.isArray(data) && typeof data[0] === 'number') {
      return normalize(data);
    }
    if (Array.isArray(data?.embedding) && typeof data.embedding[0] === 'number') {
      return normalize(data.embedding);
    }
    if (Array.isArray(data?.data?.[0]) && typeof data.data[0][0] === 'number') {
      return normalize(data.data[0]);
    }
    // unexpected shape
    console.error('Unexpected HF response shape', JSON.stringify(data).slice(0, 500));
    throw new Error('Unexpected Hugging Face embedding response');
  } catch (err) {
    console.error('HF embedding error:', err.response?.data || err.message);
    // bubble up friendly error
    throw new Error('Failed to generate embedding from HuggingFace');
  }
}

module.exports = { getImageEmbedding, normalize };

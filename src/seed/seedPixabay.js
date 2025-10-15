

// require('dotenv').config();
// const axios = require('axios');
// const mongoose = require('mongoose');
// const Product = require('../models/Product');
// const { getImageEmbedding } = require('../services/embeddingService');

// const PIXABAY_KEY = process.env.PIXABAY_API_KEY;
// if (!PIXABAY_KEY) {
//   console.error('❌ PIXABAY_API_KEY missing in .env');
//   process.exit(1);
// }

// // Simple delay helper
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// // Retry wrapper for embeddings
// async function tryGetEmbeddingWithRetries(url, maxAttempts = 3) {
//   let lastErr;
//   for (let i = 1; i <= maxAttempts; i++) {
//     try {
//       return await getImageEmbedding(url);
//     } catch (err) {
//       lastErr = err;
//       console.warn(`Embedding attempt ${i} failed: ${err.message || err}`);
//       // If 402 -> bail out (billing)
//       if (err.message && err.message.includes('402')) {
//         throw err; // don't retry on payment required
//       }
//       // backoff
//       const backoff = 2000 * i; // 2s, 4s, 6s
//       await delay(backoff + Math.floor(Math.random() * 500));
//     }
//   }
//   throw lastErr;
// }

// // Connect to MongoDB and start seeding
// mongoose.connect(process.env.MONGO_URI)
//   .then(async () => {
//     console.log('✅ Connected to MongoDB');

//     const categories = [
//       { q: 'running shoes', cat: 'Shoes' },
//       { q: 'leather bag', cat: 'Bags' },
//       { q: 'wrist watch', cat: 'Watches' },
//       { q: 'sunglasses', cat: 'Glasses' },
//       { q: 'jacket', cat: 'Jackets' }
//     ];

//     let created = 0;

//     for (const c of categories) {
//       console.log(`\n📸 Fetching images for category: ${c.q}`);

//       const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(c.q)}&image_type=photo&per_page=20`;
//       const resp = await axios.get(url);
//       const hits = resp.data.hits || [];

//       for (const h of hits) {
//         if (!h.largeImageURL) continue;

//         try {
//           console.log(`🔹 Generating embedding for: ${h.largeImageURL}`);

//           const embedding = await tryGetEmbeddingWithRetries(h.largeImageURL, 3);
//           if (!embedding || !Array.isArray(embedding)) {
//             console.warn('⚠️ Skipping image — no valid embedding generated');
//             continue;
//           }

//           const product = new Product({
//             name: h.tags.split(',')[0] || c.q,
//             category: c.cat,
//             imageUrl: h.largeImageURL,
//             embedding,
//             metadata: { source: 'pixabay', pixabay_id: h.id }
//           });

//           await product.save();
//           created++;
//           console.log(`✅ Saved product (${created}): ${product.name}`);

//           // Delay between each embedding request to avoid 429
//           await delay(3000 + Math.floor(Math.random() * 1000)); // 3-4s

//           // Stop after ~120 products total
//           if (created >= 120) break;
//         } catch (err) {
//           console.error('❌ embedding or save error:', err.response ? err.response.status : err.message, err.response && err.response.data ? err.response.data : '');
//           await delay(2000);
//         }
//       }

//       if (created >= 120) break;
//     }

//     console.log(`\n🎉 Seeding complete. Total products created: ${created}`);
//     process.exit(0);
//   })
//   .catch((err) => {
//     console.error('❌ Mongo connection error:', err);
//     process.exit(1);
//   });



// scripts/seedProducts.js
require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { getImageEmbedding } = require('../services/embeddingService');

const PIXABAY_KEY = process.env.PIXABAY_API_KEY;
if (!PIXABAY_KEY) {
  console.error('❌ PIXABAY_API_KEY missing in .env');
  process.exit(1);
}

// Simple delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry wrapper for embeddings
async function tryGetEmbeddingWithRetries(url, maxAttempts = 3) {
  let lastErr;
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      return await getImageEmbedding(url);
    } catch (err) {
      lastErr = err;
      console.warn(`Embedding attempt ${i} failed: ${err.message || err}`);
      // If 402 -> billing issue, stop retrying
      if (err.message && err.message.includes('402')) {
        throw err;
      }
      // Backoff (2s, 4s, 6s + jitter)
      const backoff = 2000 * i;
      await delay(backoff + Math.floor(Math.random() * 500));
    }
  }
  throw lastErr;
}

// Connect to MongoDB and start seeding
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    const categories = [
      { q: 'running shoes', cat: 'Shoes' },
      { q: 'leather bag', cat: 'Bags' },
      { q: 'wrist watch', cat: 'Watches' },
      { q: 'sunglasses', cat: 'Glasses' },
      { q: 'jacket', cat: 'Jackets' },
    ];

    let created = 0;

    for (const c of categories) {
      console.log(`\n📸 Fetching images for category: ${c.q}`);

      const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(c.q)}&image_type=photo&per_page=20`;
      const resp = await axios.get(url);
      const hits = resp.data.hits || [];

      for (const h of hits) {
        if (!h.largeImageURL) continue;

        try {
          console.log(`🔹 Generating embedding for: ${h.largeImageURL}`);

          const embedding = await tryGetEmbeddingWithRetries(h.largeImageURL, 3);

          // ✅ Improved validation (includes your merged condition)
          if (!embedding || !Array.isArray(embedding) || embedding.length < 16) {
            console.warn('⚠️ Skipping image — no valid embedding generated');
            continue;
          }

          const product = new Product({
            name: h.tags.split(',')[0] || c.q,
            category: c.cat,
            imageUrl: h.largeImageURL,
            embedding,
            metadata: { source: 'pixabay', pixabay_id: h.id },
          });

          await product.save();
          created++;
          console.log(`✅ Saved product (${created}): ${product.name}`);

          // Delay between each embedding request to avoid 429 (rate limit)
          await delay(3000 + Math.floor(Math.random() * 1000)); // 3–4 seconds

          // Stop after ~120 products total
          if (created >= 120) break;
        } catch (err) {
          console.error(
            '❌ embedding or save error:',
            err.response ? err.response.status : err.message,
            err.response && err.response.data ? err.response.data : ''
          );
          await delay(2000);
        }
      }

      if (created >= 120) break;
    }

    console.log(`\n🎉 Seeding complete. Total products created: ${created}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Mongo connection error:', err);
    process.exit(1);
  });



// function cosineSimilarity(a, b) {
//   if (!a || !b || a.length !== b.length) return -1;
//   let dot = 0, na = 0, nb = 0;
//   for (let i = 0; i < a.length; i++) {
//     dot += a[i] * b[i];
//     na += a[i] * a[i];
//     nb += b[i] * b[i];
//   }
//   if (na === 0 || nb === 0) return 0;
//   return dot / (Math.sqrt(na) * Math.sqrt(nb));
// }

// function topKBySimilarity(queryVec, items, k = 10) {
//   return items
//     .map(item => ({ item, score: cosineSimilarity(queryVec, item.embedding || []) }))
//     .sort((a, b) => b.score - a.score)
//     .slice(0, k);
// }

// module.exports = { cosineSimilarity, topKBySimilarity };


// src/utils/cosine.js
// expects embeddings already normalized (unit length)
// returns dot product which equals cosine when vectors are unit length
function dotProduct(a, b) {
  if (!a || !b || a.length !== b.length) return -1;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function topKBySimilarity(queryVec, items, k = 10) {
  if (!queryVec || !Array.isArray(queryVec)) return [];
  return items
    .map(item => {
      const emb = item.embedding || [];
      const score = dotProduct(queryVec, emb);
      return { item, score: Number.isFinite(score) ? score : -1 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

module.exports = { dotProduct, topKBySimilarity };

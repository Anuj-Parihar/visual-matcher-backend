
// const Product = require('../models/Product');
// const { getImageEmbedding } = require('../services/embeddingService');
// const { topKBySimilarity } = require('../utils/cosine');
// const { uploadBuffer } = require('../services/storageService');

// async function searchRoute(req, res, next) {
//   try {
//     const k = Math.min(100, parseInt(req.body.k || '10', 10));
//     let queryEmbedding;

//     if (req.file) {
//       const filename = Date.now() + '-' + req.file.originalname;
//       const imageUrl = await uploadBuffer(req.file.buffer, filename);
//       queryEmbedding = await getImageEmbedding(imageUrl);
//     } else if (req.body.url) {
//       if (!req.body.url.startsWith('http')) {
//         return res.status(400).json({ error: 'url must be a full http/https address' });
//       }
//       queryEmbedding = await getImageEmbedding(req.body.url);
//     } else {
//       return res.status(400).json({ error: 'file or url required' });
//     }

//     const products = await Product.find({}, { name:1, category:1, imageUrl:1, embedding:1 }).lean();
//     if (!products || products.length === 0) return res.json({ results: [] });

//     const ranked = topKBySimilarity(queryEmbedding, products, k);
//     return res.json({ results: ranked.map(r => ({ product: r.item, score: r.score })) });
//   } catch (err) {
//     next(err);
//   }
// }

// module.exports = { searchRoute };


// src/controllers/searchController.js
const Product = require('../models/Product');
const { getImageEmbedding } = require('../services/embeddingService');
const { topKBySimilarity } = require('../utils/cosine');
const { uploadBuffer } = require('../services/storageService');

async function searchRoute(req, res, next) {
  try {
    const k = Math.min(100, parseInt(req.body.k || '10', 10));
    let queryEmbedding;

    if (req.file) {
      const filename = Date.now() + '-' + req.file.originalname.replace(/\s+/g, '_');
      const imageUrl = await uploadBuffer(req.file.buffer, filename);
      queryEmbedding = await getImageEmbedding(imageUrl);
    } else if (req.body.url) {
      if (!req.body.url.startsWith('http')) {
        return res.status(400).json({ error: 'url must be a full http/https address' });
      }
      queryEmbedding = await getImageEmbedding(req.body.url);
    } else {
      return res.status(400).json({ error: 'file or url required' });
    }

    // Ensure query embedding is normalized and valid
    if (!Array.isArray(queryEmbedding) || queryEmbedding.length < 16) {
      return res.status(500).json({ error: 'Invalid embedding generated' });
    }

    // load only necessary fields
    const products = await Product.find({}, { name:1, category:1, imageUrl:1, embedding:1 }).lean();
    if (!products || products.length === 0) return res.json({ results: [] });

    const ranked = topKBySimilarity(queryEmbedding, products, k);
    // map to output (score in [ -1 .. 1 ], for normalized vectors usually near [0..1])
    return res.json({
      results: ranked.map(r => ({
        product: r.item,
        score: r.score
      }))
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { searchRoute };

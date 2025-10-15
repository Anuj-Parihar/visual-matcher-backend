

// const multer = require('multer');
// const { uploadBuffer } = require('../services/storageService');
// const { getImageEmbedding } = require('../services/embeddingService');
// const Product = require('../models/Product');
// const storage = multer.memoryStorage();
// const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB

// async function uploadImageRoute(req, res, next) {
//   try {
//     if (req.file) {
//       const buffer = req.file.buffer;
//       const filename = Date.now() + '-' + req.file.originalname.replace(/\s+/g, '_');
//       const imageUrl = await uploadBuffer(buffer, filename);

//       // ensure imageUrl is public
//       if (!imageUrl || !imageUrl.startsWith('http')) throw new Error('Failed to upload image to storage service');

//       const embedding = await getImageEmbedding(imageUrl);
//       if (!embedding || !Array.isArray(embedding)) throw new Error('Failed to generate embedding');

//       const product = new Product({
//         name: req.body.name || 'Uploaded Product',
//         category: req.body.category || 'unknown',
//         imageUrl,
//         embedding,
//         metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {}
//       });
//       await product.save();
//       return res.json({ ok: true, product });
//     } else if (req.body.url) {
//       const url = req.body.url;
//       if (!url.startsWith('http')) return res.status(400).json({ error: 'url must be a valid http(s) address' });

//       const embedding = await getImageEmbedding(url);
//       if (!embedding || !Array.isArray(embedding)) throw new Error('Failed to generate embedding');

//       const product = new Product({
//         name: req.body.name || 'URL Product',
//         category: req.body.category || 'unknown',
//         imageUrl: url,
//         embedding,
//         metadata: {}
//       });
//       await product.save();
//       return res.json({ ok: true, product });
//     } else {
//       return res.status(400).json({ error: 'No file or url provided' });
//     }
//   } catch (err) {
//     next(err);
//   }
// }

// module.exports = { upload, uploadImageRoute };

// routes/uploadRoute.js
const multer = require('multer');
const { uploadBuffer } = require('../services/storageService');
const { getImageEmbedding } = require('../services/embeddingService');
const Product = require('../models/Product');

// Configure multer for memory storage (max 5MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

async function uploadImageRoute(req, res, next) {
  try {
    // --- CASE 1: FILE UPLOAD ---
    if (req.file) {
      const buffer = req.file.buffer;
      const filename = Date.now() + '-' + req.file.originalname.replace(/\s+/g, '_');
      const imageUrl = await uploadBuffer(buffer, filename);

      if (!imageUrl || !imageUrl.startsWith('http')) {
        throw new Error('Failed to upload image to storage service');
      }

      const embedding = await getImageEmbedding(imageUrl);
      if (!embedding || !Array.isArray(embedding)) {
        throw new Error('Failed to generate embedding');
      }

      // Save embedding as-is (it's normalized by service)
      const product = new Product({
        name: req.body.name || 'Uploaded Product',
        category: req.body.category || 'unknown',
        imageUrl,
        embedding,
        metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {},
      });

      await product.save();
      return res.json({ ok: true, product });
    }

    // --- CASE 2: URL INPUT ---
    else if (req.body.url) {
      const url = req.body.url;
      if (!url.startsWith('http')) {
        return res.status(400).json({ error: 'url must be a valid http(s) address' });
      }

      const embedding = await getImageEmbedding(url);
      if (!embedding || !Array.isArray(embedding)) {
        throw new Error('Failed to generate embedding');
      }

      // Save embedding as-is (it's normalized by service)
      const product = new Product({
        name: req.body.name || 'URL Product',
        category: req.body.category || 'unknown',
        imageUrl: url,
        embedding,
        metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {},
      });

      await product.save();
      return res.json({ ok: true, product });
    }

    // --- CASE 3: NO INPUT ---
    else {
      return res.status(400).json({ error: 'No file or url provided' });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { upload, uploadImageRoute };

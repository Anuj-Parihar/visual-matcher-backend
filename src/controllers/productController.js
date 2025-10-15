// const Product = require('../models/Product');

// async function listProducts(req, res, next) {
//   try {
//     const page = parseInt(req.query.page || '1', 10);
//     const limit = Math.min(100, parseInt(req.query.limit || '50', 10));
//     const products = await Product.find().skip((page-1)*limit).limit(limit);
//     res.json({ products });
//   } catch (err) {
//     next(err);
//   }
// }

// module.exports = { listProducts };


const Product = require('../models/Product');

async function listProducts(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(100, parseInt(req.query.limit || '50', 10));
    const products = await Product.find().skip((page-1)*limit).limit(limit).lean();
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProducts };

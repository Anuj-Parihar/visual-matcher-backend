// const mongoose = require('mongoose');

// const ProductSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   category: String,
//   imageUrl: { type: String, required: true },   // hosted (cloudinary / pixabay link)
//   embedding: { type: [Number], required: true }, // CLIP vector
//   metadata: Object,
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Product', ProductSchema);

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  imageUrl: { type: String, required: true },
  embedding: { type: [Number], required: true },
  metadata: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);

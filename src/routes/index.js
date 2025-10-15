// const express = require('express');
// const router = express.Router();
// const uploadController = require('../controllers/uploadController');
// const searchController = require('../controllers/searchController');
// const productController = require('../controllers/productController');

// router.get('/products', productController.listProducts);
// router.post('/upload', uploadController.upload.single('file'), uploadController.uploadImageRoute);
// router.post('/search', uploadController.upload.single('file'), searchController.searchRoute);

// module.exports = router;

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const searchController = require('../controllers/searchController');
const productController = require('../controllers/productController');

router.get('/products', productController.listProducts);
router.post('/upload', uploadController.upload.single('file'), uploadController.uploadImageRoute);
router.post('/search', uploadController.upload.single('file'), searchController.searchRoute);

module.exports = router;

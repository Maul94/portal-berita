const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.homepage);
router.get('/artikel/:slug', publicController.articleDetail);
router.get('/kategori/:slug', publicController.categoryPage);
router.get('/cari', publicController.search);
router.post('/api/views/:id', publicController.incrementViews);

module.exports = router;

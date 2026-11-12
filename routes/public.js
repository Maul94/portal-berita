const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const pool = require('../config/database');

// Diagnostic route to test DB connectivity and queries directly
router.get('/test-db', async (req, res) => {
  const result = { timestamp: new Date().toISOString(), tests: {} };
  
  // 1. Ping connection
  try {
    const [row] = await pool.query('SELECT 1 + 1 AS calc');
    result.tests.ping = { status: 'OK', result: row[0].calc };
  } catch (e) {
    result.tests.ping = { status: 'ERROR', message: e.message };
  }

  // 2. Categories
  try {
    const [cats] = await pool.query('SELECT id, name, slug FROM categories');
    result.tests.categories = { status: 'OK', count: cats.length, data: cats };
  } catch (e) {
    result.tests.categories = { status: 'ERROR', message: e.message };
  }

  // 3. Articles
  try {
    const [arts] = await pool.query('SELECT id, title, status FROM articles LIMIT 5');
    result.tests.articles = { status: 'OK', count: arts.length, data: arts };
  } catch (e) {
    result.tests.articles = { status: 'ERROR', message: e.message };
  }

  res.json(result);
});

router.get('/', publicController.homepage);
router.get('/artikel/:slug', publicController.articleDetail);
router.get('/kategori/:slug', publicController.categoryPage);
router.get('/cari', publicController.search);
router.post('/api/views/:id', publicController.incrementViews);

module.exports = router;

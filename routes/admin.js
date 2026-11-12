const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const articleController = require('../controllers/articleController');
const { isAuthenticated, isGuest } = require('../middleware/auth');

// Auth
router.get('/login', isGuest, adminController.loginPage);
router.post('/login', isGuest, adminController.loginPost);
router.get('/logout', adminController.logout);

// Dashboard
router.get('/', isAuthenticated, adminController.dashboard);

// Categories
router.get('/categories', isAuthenticated, adminController.categories);
router.post('/categories', isAuthenticated, adminController.storeCategory);
router.put('/categories/:id', isAuthenticated, adminController.updateCategory);
router.delete('/categories/:id', isAuthenticated, adminController.destroyCategory);

// Articles
router.get('/articles', isAuthenticated, articleController.index);
router.get('/articles/create', isAuthenticated, articleController.create);
router.post('/articles/store', isAuthenticated, articleController.uploadMiddleware, articleController.store);
router.get('/articles/:id/edit', isAuthenticated, articleController.edit);
router.put('/articles/:id', isAuthenticated, articleController.uploadMiddleware, articleController.update);
router.delete('/articles/:id', isAuthenticated, articleController.destroy);

module.exports = router;

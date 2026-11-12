const Article = require('../models/Article');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const { timeAgo, formatDate } = require('../utils/helpers');

exports.homepage = async (req, res) => {
  console.log('📌 [HOMEPAGE] Request diterima, mengambil data dari DB...');
  try {
    console.log('📌 [HOMEPAGE] Query 1: findHeadline...');
    const headline = await Article.findHeadline();
    console.log('📌 [HOMEPAGE] Headline selesai:', headline ? headline.title.substring(0, 30) + '...' : 'null');

    console.log('📌 [HOMEPAGE] Query 2: findTrending...');
    const trending = await Article.findTrending(5);
    console.log('📌 [HOMEPAGE] Trending selesai, jumlah:', trending.length);

    console.log('📌 [HOMEPAGE] Query 3: findLatest...');
    const latest = await Article.findLatest(12);
    console.log('📌 [HOMEPAGE] Latest selesai, jumlah:', latest.length);

    console.log('📌 [HOMEPAGE] Query 4: Category.findAll...');
    const categories = await Category.findAll();
    console.log('📌 [HOMEPAGE] Categories selesai, jumlah:', categories.length);

    console.log('📌 [HOMEPAGE] Melakukan rendering public/index.ejs...');
    res.render('public/index', {
      title: 'Beranda - Portal Berita Nasional',
      headline, trending, latest, categories, timeAgo, formatDate
    });
    console.log('📌 [HOMEPAGE] Rendering selesai dikirim ke browser!');
  } catch (err) {
    console.error('❌ [HOMEPAGE ERROR]:', err);
    res.status(500).render('public/error', { title: 'Error', code: 500, message: 'Terjadi kesalahan server: ' + err.message });
  }
};

exports.articleDetail = async (req, res) => {
  try {
    const article = await Article.findBySlug(req.params.slug);
    if (!article) return res.status(404).render('public/error', { title: '404', code: 404, message: 'Artikel tidak ditemukan.' });
    
    // Increment views asynchronously
    Article.incrementViews(article.id).catch(console.error);
    
    const [related, tags, categories] = await Promise.all([
      Article.findRelated(article.category_id, article.id, 4),
      Tag.findByArticle(article.id),
      Category.findAll()
    ]);

    res.render('public/article', {
      title: `${article.title} - Portal Berita`,
      article, related, tags, categories, timeAgo, formatDate
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('public/error', { title: 'Error', code: 500, message: 'Terjadi kesalahan server.' });
  }
};

exports.categoryPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    const [category, categories] = await Promise.all([
      Category.findBySlug(req.params.slug),
      Category.findAll()
    ]);
    if (!category) return res.status(404).render('public/error', { title: '404', code: 404, message: 'Kategori tidak ditemukan.' });
    const [articles, total] = await Promise.all([
      Article.findByCategory(req.params.slug, limit, offset),
      Article.countAll({ category: req.params.slug, status: 'published' })
    ]);
    const totalPages = Math.ceil(total / limit);
    res.render('public/category', {
      title: `${category.name} - Portal Berita`,
      category, articles, categories, page, totalPages, timeAgo, formatDate
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('public/error', { title: 'Error', code: 500, message: 'Terjadi kesalahan server.' });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    const [articles, total, categories] = await Promise.all([
      q ? Article.findAll({ search: q, status: 'published', limit, offset }) : Promise.resolve([]),
      q ? Article.countAll({ search: q, status: 'published' }) : Promise.resolve(0),
      Category.findAll()
    ]);
    const totalPages = Math.ceil(total / limit);
    res.render('public/search', {
      title: q ? `Hasil Pencarian "${q}" - Portal Berita` : 'Pencarian - Portal Berita',
      q, articles, categories, page, totalPages, total, timeAgo, formatDate
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('public/error', { title: 'Error', code: 500, message: 'Terjadi kesalahan server.' });
  }
};

exports.incrementViews = async (req, res) => {
  try {
    await Article.incrementViews(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
};

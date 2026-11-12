const Article = require('../models/Article');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { formatDate } = require('../utils/helpers');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `thumb-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|png|webp|gif)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Hanya file gambar yang diizinkan.'));
  }
});

exports.uploadMiddleware = upload.single('thumbnail');

exports.index = async (req, res) => {
  try {
    const { category, status, search, page: pageStr } = req.query;
    const page = parseInt(pageStr) || 1;
    const limit = 15;
    const offset = (page - 1) * limit;
    const [articles, total, categories] = await Promise.all([
      Article.findAll({ category, status, search, limit, offset }),
      Article.countAll({ category, status, search }),
      Category.findAllAdmin()
    ]);
    const totalPages = Math.ceil(total / limit);
    res.render('admin/articles/index', {
      title: 'Manajemen Berita - Admin',
      articles, categories, total, page, totalPages,
      filters: { category, status, search }, formatDate
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat daftar berita.');
    res.redirect('/admin');
  }
};

exports.create = async (req, res) => {
  try {
    const categories = await Category.findAllAdmin();
    res.render('admin/articles/create', {
      title: 'Buat Berita Baru - Admin',
      categories, article: null
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat form.');
    res.redirect('/admin/articles');
  }
};

exports.store = async (req, res) => {
  try {
    const { title, excerpt, content, category_id, tags, thumbnail_caption, status, is_headline } = req.body;
    if (!title || !content || !category_id) {
      req.flash('error', 'Judul, konten, dan kategori wajib diisi.');
      return res.redirect('/admin/articles/create');
    }
    const thumbnail_url = req.file ? `/uploads/${req.file.filename}` : null;
    const { id: articleId, slug } = await Article.create({
      author_id: req.session.user.id,
      category_id: parseInt(category_id),
      title, excerpt, content, thumbnail_url, thumbnail_caption,
      status: status || 'draft',
      is_headline: is_headline === 'on'
    });
    if (tags) await Tag.syncTags(articleId, tags);
    req.flash('success', status === 'published' ? 'Berita berhasil dipublikasikan!' : 'Berita disimpan sebagai draft.');
    res.redirect(`/admin/articles/${articleId}/edit`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menyimpan berita.');
    res.redirect('/admin/articles/create');
  }
};

exports.edit = async (req, res) => {
  try {
    const [article, categories] = await Promise.all([
      Article.findById(req.params.id),
      Category.findAllAdmin()
    ]);
    if (!article) { req.flash('error', 'Berita tidak ditemukan.'); return res.redirect('/admin/articles'); }
    const tags = await Tag.findByArticle(req.params.id);
    const tagString = tags.map(t => t.name).join(', ');
    res.render('admin/articles/edit', {
      title: `Edit: ${article.title} - Admin`,
      article, categories, tagString, formatDate
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat form edit.');
    res.redirect('/admin/articles');
  }
};

exports.update = async (req, res) => {
  try {
    const { title, excerpt, content, category_id, tags, thumbnail_caption, status, is_headline } = req.body;
    const updateData = {
      category_id: parseInt(category_id), title, excerpt, content,
      thumbnail_caption, status: status || 'draft',
      is_headline: is_headline === 'on'
    };
    if (req.file) updateData.thumbnail_url = `/uploads/${req.file.filename}`;
    await Article.update(req.params.id, updateData);
    if (tags !== undefined) await Tag.syncTags(req.params.id, tags);
    req.flash('success', 'Berita berhasil diperbarui.');
    res.redirect(`/admin/articles/${req.params.id}/edit`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memperbarui berita.');
    res.redirect('/admin/articles');
  }
};

exports.destroy = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (article && article.thumbnail_url) {
      const thumbPath = path.join(__dirname, '..', 'public', article.thumbnail_url);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }
    await Article.delete(req.params.id);
    req.flash('success', 'Berita berhasil dihapus.');
    res.redirect('/admin/articles');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menghapus berita.');
    res.redirect('/admin/articles');
  }
};

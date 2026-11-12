const User = require('../models/User');
const Article = require('../models/Article');
const Category = require('../models/Category');
const { formatDate } = require('../utils/helpers');

exports.loginPage = async (req, res) => {
  res.render('admin/login', { title: 'Login Admin - Portal Berita' });
};

exports.loginPost = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      req.flash('error', 'Email dan password wajib diisi.');
      return res.redirect('/admin/login');
    }
    const user = await User.findByEmail(email);
    if (!user) {
      req.flash('error', 'Email atau password salah.');
      return res.redirect('/admin/login');
    }
    const isValid = await User.verifyPassword(password, user.password_hash);
    if (!isValid) {
      req.flash('error', 'Email atau password salah.');
      return res.redirect('/admin/login');
    }
    req.session.user = { id: user.id, name: user.name, email: user.email, avatar: user.avatar };
    req.flash('success', `Selamat datang, ${user.name}!`);
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Terjadi kesalahan. Silakan coba lagi.');
    res.redirect('/admin/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
};

exports.dashboard = async (req, res) => {
  try {
    const [stats, recentArticles, categories] = await Promise.all([
      Article.getStats(),
      Article.findRecent(5),
      Category.findAll()
    ]);
    res.render('admin/dashboard', {
      title: 'Dashboard - Admin Portal Berita',
      stats, recentArticles, categories, formatDate
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('admin/error', { title: 'Error', code: 500, message: 'Terjadi kesalahan server.' });
  }
};

exports.categories = async (req, res) => {
  try {
    const categories = await Category.findAllAdmin();
    res.render('admin/categories/index', {
      title: 'Manajemen Kategori - Admin',
      categories
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat kategori.');
    res.redirect('/admin');
  }
};

exports.storeCategory = async (req, res) => {
  try {
    const { name, description, sort_order, is_active } = req.body;
    if (!name) { req.flash('error', 'Nama kategori wajib diisi.'); return res.redirect('/admin/categories'); }
    await Category.create({ name, description, sort_order, is_active: is_active === 'on' });
    req.flash('success', 'Kategori berhasil ditambahkan.');
    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menambah kategori.');
    res.redirect('/admin/categories');
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description, sort_order, is_active } = req.body;
    await Category.update(req.params.id, { name, description, sort_order, is_active: is_active === 'on' });
    req.flash('success', 'Kategori berhasil diperbarui.');
    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memperbarui kategori.');
    res.redirect('/admin/categories');
  }
};

exports.destroyCategory = async (req, res) => {
  try {
    await Category.delete(req.params.id);
    req.flash('success', 'Kategori berhasil dihapus.');
    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menghapus kategori. Pastikan tidak ada artikel yang menggunakan kategori ini.');
    res.redirect('/admin/categories');
  }
};

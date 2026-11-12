exports.notFound = (req, res, next) => {
  res.status(404);
  const isAdmin = req.path.startsWith('/admin');
  if (isAdmin) {
    res.render('admin/error', { title: 'Halaman Tidak Ditemukan', code: 404, message: 'Halaman yang Anda cari tidak ditemukan.' });
  } else {
    res.render('public/error', { title: 'Halaman Tidak Ditemukan', code: 404, message: 'Halaman yang Anda cari tidak ditemukan.' });
  }
};

exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  const isAdmin = req.path.startsWith('/admin');
  if (isAdmin) {
    res.render('admin/error', { title: 'Terjadi Kesalahan', code: 500, message: 'Maaf, terjadi kesalahan pada server.' });
  } else {
    res.render('public/error', { title: 'Terjadi Kesalahan', code: 500, message: 'Maaf, terjadi kesalahan pada server.' });
  }
};

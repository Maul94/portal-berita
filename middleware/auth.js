exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error', 'Silakan login terlebih dahulu.');
  res.redirect('/admin/login');
};

exports.isGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/admin');
  }
  next();
};

exports.setLocals = (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentPath = req.path;
  next();
};

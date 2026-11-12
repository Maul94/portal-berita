require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const { setLocals } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`➡️  [${new Date().toLocaleTimeString('id-ID')}] ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    console.log(`⬅️  [${new Date().toLocaleTimeString('id-ID')}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Method override for PUT/DELETE forms
app.use(methodOverride('_method'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Flash messages
app.use(flash());

// Set locals middleware
app.use(setLocals);

// Routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Portal Berita running at http://localhost:${PORT}`);
  console.log(`📊 Admin CMS: http://localhost:${PORT}/admin`);
});

module.exports = app;

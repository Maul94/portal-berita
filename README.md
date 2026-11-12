# 📰 Portal Berita Nasional Modern

Portal Berita Nasional berbasis **Node.js + Express + EJS + MySQL** dengan **Dashboard Admin CMS** yang bersih, cepat, dan hemat data.

---

## 🚀 Cara Menjalankan (Quick Start)

### Prasyarat
- Node.js v18+ 
- MySQL / MariaDB 8.0+
- npm

### 1. Setup Database

Buka MySQL dan jalankan schema:
```bash
mysql -u root -p < database/schema.sql
```
Atau buka file [schema.sql](database/schema.sql) di HeidiSQL / phpMyAdmin dan jalankan.

### 2. Install Dependencies
```bash
cd portal-berita
npm install
```

### 3. Konfigurasi Environment

Edit file `.env` sesuai konfigurasi MySQL Anda:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=        # isi password MySQL Anda
DB_NAME=portal_berita
SESSION_SECRET=portal_berita_secret_2024_change_in_production
```

### 4. Jalankan Aplikasi
```bash
# Mode development (auto-restart):
npm run dev

# Mode production:
npm start
```

### 5. Buka di Browser

| URL | Keterangan |
|-----|-----------|
| `http://localhost:3000` | Portal Berita (Publik) |
| `http://localhost:3000/admin` | Dashboard Admin CMS |
| `http://localhost:3000/admin/login` | Login Admin |

**Kredensial Default Admin:**
- Email: `admin@portalberita.id`
- Password: `admin123`

> ⚠️ **Ganti password** setelah login pertama kali!

---

## 🗂️ Struktur Proyek

```
portal-berita/
├── 📄 server.js                  # Entry point Express
├── 📄 package.json
├── 📄 .env                       # Konfigurasi environment
├── 📄 .env.example
│
├── config/
│   └── database.js               # MySQL2 connection pool
│
├── middleware/
│   ├── auth.js                   # Session auth + locals
│   └── errorHandler.js           # 404 & 500 handler
│
├── models/                       # Data access layer
│   ├── Article.js
│   ├── Category.js
│   ├── User.js
│   └── Tag.js
│
├── controllers/
│   ├── publicController.js       # Homepage, artikel, kategori, search
│   ├── adminController.js        # Auth, dashboard, kategori CMS
│   └── articleController.js     # CRUD artikel + upload thumbnail
│
├── routes/
│   ├── public.js                 # Route publik (/)
│   └── admin.js                  # Route admin (/admin)
│
├── utils/
│   ├── slugify.js                # Generator slug URL
│   └── helpers.js                # timeAgo, formatDate, readingTime
│
├── views/
│   ├── layouts/
│   │   └── main.ejs              # Base layout publik
│   ├── partials/
│   │   ├── header.ejs            # Navbar + Category Bar
│   │   ├── footer.ejs
│   │   └── breaking-news.ejs    # Ticker berita terkini
│   ├── public/
│   │   ├── index.ejs             # 🏠 Homepage
│   │   ├── article.ejs           # 📄 Halaman baca artikel
│   │   ├── category.ejs          # 🗂️ Daftar per kategori
│   │   ├── search.ejs            # 🔍 Hasil pencarian
│   │   └── error.ejs
│   └── admin/
│       ├── login.ejs             # 🔐 Login admin
│       ├── dashboard.ejs         # 📊 Dashboard + statistik
│       ├── error.ejs
│       ├── partials/
│       │   ├── sidebar.ejs       # Sidebar navigasi admin
│       │   └── topbar.ejs        # Header admin
│       ├── articles/
│       │   ├── index.ejs         # Daftar berita + filter
│       │   ├── create.ejs        # Form buat berita (Quill.js)
│       │   └── edit.ejs          # Form edit berita
│       └── categories/
│           └── index.ejs         # Manajemen kategori
│
├── public/
│   ├── css/style.css             # Custom CSS + tipografi artikel
│   ├── js/main.js                # Dark mode, slug gen, share
│   └── uploads/                  # Thumbnail berita (auto-created)
│
└── database/
    └── schema.sql                # Schema + seed data lengkap
```

---

## 🗄️ Skema Database

```
roles ──────────┐
                ↓
users ──────── articles ───── article_tags ───── tags
                    ↑
categories ─────────┘
```

| Tabel | Keterangan |
|-------|-----------|
| `roles` | Super Admin, Redaktur, Jurnalis + JSON permissions |
| `users` | Akun admin dengan role, bcrypt hash password |
| `categories` | 6 kanal: Nasional, Politik & Hukum, Ekonomi, Olahraga, Teknologi, Opini |
| `articles` | Berita lengkap: status (draft/published/archived), is_headline, views_count |
| `tags` + `article_tags` | Relasi many-to-many untuk topik/tagar |

**Seed data bawaan:**
- 1 akun Super Admin (`admin@portalberita.id`)
- 6 kategori berita nasional
- 5 artikel contoh dengan konten lengkap berbahasa Indonesia

---

## ✨ Fitur Utama

### Portal Publik
| Fitur | Detail |
|-------|--------|
| **Homepage Hero** | Grid asimetris 8/12 headline + 4/12 trending (tanpa gambar, hemat data) |
| **Reading Progress Bar** | Garis merah di atas layar mengikuti scroll |
| **Dark Mode** | Toggle dengan simpan preferensi ke localStorage |
| **Breaking News Ticker** | Animasi teks berjalan warna merah |
| **Category Bar** | Scroll horizontal mulus di mobile |
| **Share Ringan** | WhatsApp, Twitter/X, Salin Tautan — tanpa script tracker berat |
| **Lazy Loading** | `loading="lazy"` pada semua gambar below the fold |
| **16:9 Placeholder** | Mencegah layout shift (CLS) saat gambar belum termuat |
| **Waktu Relatif** | "15 menit lalu", "2 jam lalu" dalam Bahasa Indonesia |
| **Estimasi Baca** | Dihitung otomatis (avg 200 kata/menit) |

### Dashboard Admin CMS
| Halaman | Fitur |
|---------|-------|
| **Login** | Form aman dengan session, flash error |
| **Dashboard** | 4 kartu statistik + tabel 5 berita terbaru |
| **Manajemen Berita** | Filter: kategori, status, pencarian judul + pagination |
| **Editor Berita** | Quill.js rich text, auto-slug, thumbnail preview |
| **Upload Gambar** | Multer, preview instan, maks 5MB, format JPG/PNG/WebP |
| **Kategori** | CRUD inline: tambah, edit, hapus + jumlah artikel |
| **Headline Toggle** | Checkbox jadikan berita utama beranda |
| **Draft / Publish** | Dua tombol aksi terpisah |

---

## 🎨 Design System

| Element | Nilai |
|---------|-------|
| **Font** | Plus Jakarta Sans (Google Fonts) |
| **Primary Color** | `#E63946` (merah portal berita) |
| **Background** | `#FFFFFF` / `#F8FAFC` (slate-50) |
| **Text Utama** | `#0F172A` (slate-900) |
| **Artikel Font Size** | 17px, `line-height: 1.85` |
| **Max Kolom Artikel** | 700px (terpusat) |
| **CSS Framework** | Tailwind CSS (Play CDN) |
| **JS** | Vanilla JS minimal, Alpine.js tidak diperlukan |

---

## 🔧 Kustomisasi

### Ganti Nama Portal
Cari-ganti `Portal Berita` di semua file `.ejs` dan `server.js`.

### Tambah Kategori
Masuk ke `/admin/categories` → klik **Tambah Kategori**.

### Password Admin
Jalankan script ini untuk generate bcrypt hash baru:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('password_baru', 10).then(h => console.log(h));
```
Lalu update tabel `users` di database.

### Upload Gambar Eksternal
Edit `controllers/articleController.js` → ganti multer storage dengan S3/Cloudinary SDK.

---

## 🔒 Keamanan (Production)

- [ ] Ganti `SESSION_SECRET` di `.env` dengan string acak panjang
- [ ] Aktifkan HTTPS (gunakan reverse proxy Nginx + Let's Encrypt)  
- [ ] Tambahkan `helmet` middleware: `npm install helmet`
- [ ] Tambahkan rate limiting: `npm install express-rate-limit`
- [ ] Set `cookie: { secure: true, httpOnly: true }` di session config
- [ ] Gunakan `.env` yang tidak di-commit ke Git (tambahkan ke `.gitignore`)

---

## 📦 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js 4.x |
| Database | MySQL 8 / MariaDB (via `mysql2`) |
| Templating | EJS (Server-Side Rendering) |
| CSS | Tailwind CSS (Play CDN) |
| Rich Editor | Quill.js 2.x |
| Auth | express-session + bcryptjs |
| Upload | Multer |
| Form Override | method-override (PUT/DELETE) |

---

*Dibuat dengan ❤️ — Portal Berita Nasional Modern 2026*

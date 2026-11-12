-- ============================================================
-- PORTAL BERITA NASIONAL - Database Schema
-- MySQL / MariaDB
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS `portal_berita`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `portal_berita`;

-- ============================================================
-- TABLE: roles
-- ============================================================
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_name` VARCHAR(50) NOT NULL,
  `permissions` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`id`, `role_name`, `permissions`) VALUES
(1, 'Super Admin', '{"articles":["create","read","update","delete","publish"],"categories":["create","read","update","delete"],"users":["create","read","update","delete"]}'),
(2, 'Redaktur', '{"articles":["create","read","update","publish"],"categories":["read"]}'),
(3, 'Jurnalis', '{"articles":["create","read","update"],"categories":["read"]}');

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_id` INT UNSIGNED NOT NULL DEFAULT 3,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Super Admin: password = "admin123"
INSERT INTO `users` (`id`, `role_id`, `name`, `email`, `password_hash`, `is_active`) VALUES
(1, 1, 'Super Admin', 'admin@portalberita.id', '$2a$10$ol8Ti5SDADxJo1Weq6E2mu3zYufQvSbAYcK7By.R2j1m4SuomkZFW', 1);
-- bcrypt hash of "admin123"

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 99,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `sort_order`, `is_active`) VALUES
(1, 'Nasional', 'nasional', 'Berita nasional terkini dari seluruh penjuru Indonesia', 1, 1),
(2, 'Politik & Hukum', 'politik-hukum', 'Berita politik, pemerintahan, dan hukum Indonesia', 2, 1),
(3, 'Ekonomi', 'ekonomi', 'Berita ekonomi, bisnis, dan keuangan nasional', 3, 1),
(4, 'Olahraga', 'olahraga', 'Berita olahraga nasional dan internasional terkini', 4, 1),
(5, 'Teknologi', 'teknologi', 'Berita teknologi, digital, dan inovasi terkini', 5, 1),
(6, 'Opini', 'opini', 'Opini, editorial, dan kolom dari pakar dan redaksi', 6, 1);

-- ============================================================
-- TABLE: articles
-- ============================================================
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `author_id` INT UNSIGNED NOT NULL,
  `editor_id` INT UNSIGNED DEFAULT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(600) NOT NULL UNIQUE,
  `excerpt` TEXT DEFAULT NULL,
  `content` LONGTEXT NOT NULL,
  `thumbnail_url` VARCHAR(500) DEFAULT NULL,
  `thumbnail_caption` VARCHAR(300) DEFAULT NULL,
  `status` ENUM('draft','pending_review','published','archived') NOT NULL DEFAULT 'draft',
  `is_headline` TINYINT(1) NOT NULL DEFAULT 0,
  `views_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `reading_time_minutes` INT NOT NULL DEFAULT 1,
  `published_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category_id`),
  KEY `idx_author` (`author_id`),
  KEY `idx_published_at` (`published_at`),
  KEY `idx_views` (`views_count`),
  KEY `idx_headline` (`is_headline`),
  CONSTRAINT `fk_article_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_article_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `fk_article_editor` FOREIGN KEY (`editor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `articles` (`id`, `author_id`, `category_id`, `title`, `slug`, `excerpt`, `content`, `thumbnail_url`, `thumbnail_caption`, `status`, `is_headline`, `views_count`, `reading_time_minutes`, `published_at`) VALUES

(1, 1, 1,
'Presiden Resmikan Ibu Kota Nusantara: Babak Baru Sejarah Indonesia',
'presiden-resmikan-ibu-kota-nusantara-babak-baru-sejarah-indonesia-001',
'Presiden secara resmi mendeklarasikan Nusantara sebagai ibu kota negara Indonesia yang baru, menandai babak penting dalam sejarah bangsa setelah pemindahan dari Jakarta.',
'<p>NUSANTARA — Sebuah momen bersejarah terukir pada hari ini ketika Presiden Republik Indonesia secara resmi mendeklarasikan <strong>Nusantara</strong> sebagai ibu kota negara yang baru. Upacara kenegaraan yang khidmat digelar di Istana Garuda, Penajam Paser Utara, Kalimantan Timur, dihadiri oleh ribuan tamu undangan dari seluruh penjuru negeri.</p>

<p>"Hari ini kita mencatat sejarah baru. Nusantara bukan hanya ibu kota baru, tapi adalah simbol transformasi Indonesia menuju bangsa yang lebih maju, merata, dan berkeadilan," ujar Presiden dalam pidatonya yang disambut tepuk tangan meriah.</p>

<h2>Visi Kota Masa Depan</h2>

<p>Nusantara dirancang sebagai <em>smart city</em> berkelas dunia yang mengedepankan prinsip keberlanjutan lingkungan. Sekitar 70% area kawasan akan dialokasikan sebagai ruang hijau dan kawasan hutan yang dilindungi, menjadikannya salah satu ibu kota paling ramah lingkungan di dunia.</p>

<blockquote>"Kami ingin Nusantara menjadi contoh bagi dunia bahwa pembangunan bisa berjalan beriringan dengan kelestarian alam." — Kepala Otorita Nusantara</blockquote>

<p>Pembangunan infrastruktur utama telah rampung, mencakup Istana Kepresidenan, gedung-gedung kementerian, kawasan perumahan ASN, rumah sakit rujukan nasional, serta sistem transportasi publik terintegrasi berbasis energi hijau.</p>

<h2>Dampak bagi Jakarta</h2>

<p>Jakarta, yang selama lebih dari 400 tahun menjadi pusat pemerintahan, kini akan beralih fungsi menjadi pusat bisnis, perdagangan, dan keuangan bertaraf internasional. Pemerintah DKI Jakarta telah menyiapkan berbagai program revitalisasi untuk menyambut era baru ini.</p>

<p>Para ekonom memperkirakan transformasi ini akan mendistribusikan pertumbuhan ekonomi lebih merata ke kawasan timur Indonesia, sekaligus mengurangi beban Jakarta yang telah lama menanggung kepadatan penduduk dan kemacetan yang parah.</p>

<p>Pemindahan resmi seluruh aparatur sipil negara pusat dijadwalkan berlangsung secara bertahap hingga tahun 2028 mendatang.</p>',
'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=75',
'Istana Garuda, Nusantara - Foto: Dokumentasi Sekretariat Negara',
'published', 1, 15420, 4,
NOW() - INTERVAL 2 HOUR),

(2, 1, 2,
'DPR Sahkan RUU Omnibus Law Ketenagakerjaan: Pro dan Kontra Bergema',
'dpr-sahkan-ruu-omnibus-law-ketenagakerjaan-pro-kontra-bergema-002',
'Dewan Perwakilan Rakyat mengesahkan Rancangan Undang-Undang Omnibus Law Ketenagakerjaan di tengah demonstrasi ribuan buruh di berbagai kota besar Indonesia.',
'<p>JAKARTA — Di tengah gelombang demonstrasi yang digelar oleh puluhan ribu buruh di berbagai kota besar Indonesia, Dewan Perwakilan Rakyat (DPR) RI akhirnya mengesahkan <strong>Rancangan Undang-Undang (RUU) Omnibus Law Ketenagakerjaan</strong> dalam Sidang Paripurna yang berlangsung dramatis pada Kamis malam.</p>

<p>Pengesahan dilakukan dengan mekanisme voting setelah fraksi-fraksi gagal mencapai mufakat. Sebanyak 7 dari 9 fraksi menyatakan setuju, sementara 2 fraksi menyatakan menolak dan melakukan <em>walkout</em> dari ruang sidang.</p>

<h2>Poin-Poin Kontroversial</h2>

<p>Sejumlah pasal dalam undang-undang baru ini memicu perdebatan panas, antara lain:</p>
<ul>
  <li>Ketentuan upah minimum yang dikaitkan langsung dengan produktivitas daerah</li>
  <li>Perluasan ketentuan pekerja kontrak dan outsourcing</li>
  <li>Perubahan mekanisme pesangon menjadi sistem jaminan kehilangan pekerjaan</li>
  <li>Aturan cuti yang dinilai kurang menguntungkan pekerja</li>
</ul>

<h2>Suara Buruh</h2>

<blockquote>"Ini bukan kemenangan rakyat, ini pengkhianatan terhadap kaum buruh. Kami akan terus berjuang." — Presiden Konfederasi Serikat Pekerja Indonesia</blockquote>

<p>Ribuan buruh yang tergabung dalam berbagai serikat pekerja menyatakan akan mengajukan judicial review ke Mahkamah Konstitusi dan melancarkan aksi mogok nasional sebagai respons atas pengesahan undang-undang ini.</p>

<h2>Argumen Pemerintah</h2>

<p>Pemerintah berpendapat bahwa regulasi baru ini diperlukan untuk meningkatkan daya saing investasi Indonesia di kancah global. Menteri Ketenagakerjaan menegaskan bahwa aturan-aturan krusial terkait hak dasar pekerja tetap terlindungi.</p>',
'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=75',
'Sidang Paripurna DPR RI - Foto: Dokumentasi DPR',
'published', 0, 8923, 4,
NOW() - INTERVAL 5 HOUR),

(3, 1, 3,
'Bank Indonesia Pertahankan Suku Bunga 6,25%: Ini Dampaknya bagi Masyarakat',
'bank-indonesia-pertahankan-suku-bunga-625-persen-dampak-masyarakat-003',
'Rapat Dewan Gubernur Bank Indonesia memutuskan mempertahankan BI Rate di level 6,25% untuk menjaga stabilitas nilai tukar rupiah dan mengendalikan inflasi.',
'<p>JAKARTA — Rapat Dewan Gubernur (RDG) Bank Indonesia yang berlangsung selama dua hari memutuskan untuk <strong>mempertahankan suku bunga acuan (BI Rate) di level 6,25%</strong>. Keputusan ini diambil dengan mempertimbangkan perkembangan kondisi perekonomian global yang masih penuh dengan ketidakpastian.</p>

<p>Gubernur Bank Indonesia menyatakan bahwa keputusan ini konsisten dengan upaya menjaga inflasi tetap dalam kisaran target 2,5±1% dan mendukung pertumbuhan ekonomi yang berkelanjutan.</p>

<h2>Alasan Mempertahankan Suku Bunga</h2>

<p>Ada beberapa faktor utama yang menjadi pertimbangan Bank Indonesia:</p>
<ol>
  <li>Tekanan inflasi global yang masih tinggi akibat ketegangan geopolitik</li>
  <li>Volatilitas nilai tukar rupiah terhadap dolar AS</li>
  <li>Posisi current account deficit yang perlu dijaga kestabilannya</li>
  <li>Antisipasi kebijakan Federal Reserve Amerika Serikat</li>
</ol>

<h2>Dampak bagi Masyarakat</h2>

<blockquote>Suku bunga tinggi ibarat pedang bermata dua: melindungi nilai uang kita dari inflasi, tapi di sisi lain membuat kredit lebih mahal. — Ekonom Senior Bank Mandiri</blockquote>

<p>Bagi masyarakat, pertahanan suku bunga di level tinggi ini membawa konsekuensi yang beragam. Pemilik deposito dan tabungan akan menikmati imbal hasil yang relatif menarik. Namun, peminjam KPR, KUR, dan kredit konsumsi lainnya harus bersiap dengan cicilan yang tetap tinggi.</p>

<p>Sektor properti dan otomotif diprediksi masih akan menghadapi tekanan permintaan yang lebih rendah dari biasanya sepanjang semester pertama tahun ini.</p>',
'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=75',
'Gedung Bank Indonesia, Jakarta - Foto: Antara',
'published', 0, 6234, 4,
NOW() - INTERVAL 8 HOUR),

(4, 1, 4,
'Timnas Indonesia U-23 Lolos ke Final Piala AFF: Garuda Muda Terbang Tinggi',
'timnas-indonesia-u23-lolos-final-piala-aff-garuda-muda-terbang-tinggi-004',
'Timnas Indonesia U-23 memastikan tiket ke babak final Piala AFF U-23 setelah mengalahkan Thailand 3-1 dalam laga semifinal yang seru di Stadion Utama Gelora Bung Karno.',
'<p>JAKARTA — <strong>Garuda Muda terbang tinggi!</strong> Timnas Indonesia U-23 memastikan langkah ke babak final Piala AFF U-23 setelah membungkam Thailand 3-1 dalam pertandingan seru di Stadion Utama Gelora Bung Karno, Jakarta, Rabu malam. Lebih dari 70.000 penonton memadati stadion dan menyaksikan penampilan memukau anak-anak bangsa.</p>

<p>Indonesia tampil agresif sejak menit pertama dan berhasil mencetak gol pembuka melalui <strong>Marselino Ferdinan</strong> pada menit ke-23 lewat tendangan voli spektakuler dari luar kotak penalti.</p>

<h2>Jalannya Pertandingan</h2>

<p>Thailand sempat menyamakan kedudukan melalui sepak pojok di menit ke-37, namun Indonesia kembali unggul jelang turun minum berkat gol Rafael Struick yang memanfaatkan umpan silang sempurna dari sisi kanan.</p>

<p>Di babak kedua, tim asuhan Shin Tae-yong semakin dominan. Gol ketiga dicetak oleh Witan Sulaeman pada menit ke-78 yang mengakhiri perlawanan Thailand secara definitif.</p>

<blockquote>"Anak-anak bermain dengan hati dan determinasi yang luar biasa malam ini. Saya sangat bangga. Final sudah menanti kita." — Shin Tae-yong, Pelatih Timnas Indonesia</blockquote>

<h2>Menanti Lawan di Final</h2>

<p>Indonesia akan menantikan hasil semifinal lain antara Vietnam dan Malaysia. Partai final dijadwalkan berlangsung empat hari ke depan di tempat yang sama. Seluruh bangsa berharap Garuda Muda bisa meraih gelar juara yang sudah lama dinantikan.</p>

<p>Tiket final dilaporkan telah habis terjual dalam hitungan menit setelah loket dibuka, membuktikan antusiasme luar biasa masyarakat Indonesia terhadap sepak bola nasional.</p>',
'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=75',
'Selebrasi gol Timnas Indonesia U-23 - Foto: PSSI',
'published', 0, 11567, 4,
NOW() - INTERVAL 12 HOUR),

(5, 1, 5,
'Google Luncurkan Gemini Ultra di Indonesia: Era Baru Kecerdasan Buatan Tanah Air',
'google-luncurkan-gemini-ultra-indonesia-era-baru-kecerdasan-buatan-tanah-air-005',
'Google secara resmi meluncurkan Gemini Ultra di Indonesia dengan dukungan penuh Bahasa Indonesia, menandai masuknya model AI paling canggih Google ke pasar Asia Tenggara.',
'<p>JAKARTA — Google secara resmi meluncurkan <strong>Gemini Ultra</strong> di Indonesia, menghadirkan model kecerdasan buatan (AI) paling canggih dari raksasa teknologi asal Mountain View ini ke pasar Asia Tenggara. Peluncuran dilakukan dalam sebuah acara eksklusif di Jakarta yang dihadiri ratusan developer, akademisi, dan pelaku industri teknologi.</p>

<p>Yang membuat peluncuran ini istimewa adalah dukungan <strong>penuh Bahasa Indonesia</strong> yang diklaim Google lebih baik dari generasi model AI sebelumnya. Gemini Ultra diklaim mampu memahami konteks, idiom, dan nuansa budaya Indonesia dengan akurasi yang jauh lebih tinggi.</p>

<h2>Fitur Unggulan Gemini Ultra</h2>

<p>Berbeda dari model AI lain yang sudah hadir sebelumnya, Gemini Ultra menawarkan sejumlah kemampuan yang diklaim melampaui GPT-4 dalam beberapa benchmark:</p>
<ul>
  <li>Pemrosesan teks panjang hingga 1 juta token sekaligus</li>
  <li>Kemampuan multimodal: teks, gambar, audio, dan video sekaligus</li>
  <li>Penalaran matematika dan koding tingkat tinggi</li>
  <li>Dukungan 50+ bahasa termasuk Bahasa Indonesia dan beberapa bahasa daerah</li>
</ul>

<h2>Peluang bagi Ekosistem Digital Indonesia</h2>

<blockquote>"Indonesia adalah salah satu pasar digital terbesar dan paling dinamis di dunia. Kami berkomitmen untuk mendukung transformasi digital Indonesia dengan teknologi AI terdepan." — VP Google Asia Pacific</blockquote>

<p>Kehadiran Gemini Ultra diyakini akan menjadi katalis bagi pengembangan startup teknologi berbasis AI di Indonesia. Pemerintah melalui Kementerian Kominfo menyambut positif langkah ini dan berencana menjalin kerjasama untuk program pelatihan AI bagi talenta digital nasional.</p>

<p>Layanan Gemini Ultra akan tersedia melalui Google One AI Premium dengan harga yang disesuaikan untuk pasar Indonesia, serta API untuk pengembang melalui Google Cloud.</p>',
'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=75',
'Peluncuran Gemini Ultra di Jakarta - Foto: Google Indonesia',
'published', 0, 9876, 5,
NOW() - INTERVAL 1 DAY);

-- ============================================================
-- TABLE: tags
-- ============================================================
CREATE TABLE IF NOT EXISTS `tags` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tags` (`id`, `name`, `slug`) VALUES
(1, 'nusantara', 'nusantara'),
(2, 'ibu-kota', 'ibu-kota'),
(3, 'omnibus-law', 'omnibus-law'),
(4, 'buruh', 'buruh'),
(5, 'bank-indonesia', 'bank-indonesia'),
(6, 'suku-bunga', 'suku-bunga'),
(7, 'timnas', 'timnas'),
(8, 'piala-aff', 'piala-aff'),
(9, 'google', 'google'),
(10, 'artificial-intelligence', 'artificial-intelligence'),
(11, 'kebijakan', 'kebijakan'),
(12, 'ekonomi', 'ekonomi');

-- ============================================================
-- TABLE: article_tags
-- ============================================================
CREATE TABLE IF NOT EXISTS `article_tags` (
  `article_id` INT UNSIGNED NOT NULL,
  `tag_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`article_id`, `tag_id`),
  CONSTRAINT `fk_at_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_at_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `article_tags` (`article_id`, `tag_id`) VALUES
(1, 1), (1, 2), (1, 11),
(2, 3), (2, 4), (2, 11),
(3, 5), (3, 6), (3, 12),
(4, 7), (4, 8),
(5, 9), (5, 10);

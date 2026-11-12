const pool = require('../config/database');
const { generateUniqueSlug } = require('../utils/slugify');
const { calculateReadingTime } = require('../utils/helpers');

const Article = {
  async findAll({ category = null, status = null, search = null, limit = 20, offset = 0 } = {}) {
    let query = `
      SELECT a.*, c.name as category_name, c.slug as category_slug, 
             u.name as author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (category) { query += ' AND c.slug = ?'; params.push(category); }
    if (status) { query += ' AND a.status = ?'; params.push(status); }
    if (search) { query += ' AND (a.title LIKE ? OR a.excerpt LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async countAll({ category = null, status = null, search = null } = {}) {
    let query = `SELECT COUNT(*) as total FROM articles a LEFT JOIN categories c ON a.category_id = c.id WHERE 1=1`;
    const params = [];
    if (category) { query += ' AND c.slug = ?'; params.push(category); }
    if (status) { query += ' AND a.status = ?'; params.push(status); }
    if (search) { query += ' AND (a.title LIKE ? OR a.excerpt LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  },

  async findBySlug(slug) {
    const [rows] = await pool.execute(`
      SELECT a.*, c.name as category_name, c.slug as category_slug,
             u.name as author_name, u.avatar as author_avatar
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.slug = ? AND a.status = 'published'
    `, [slug]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(`
      SELECT a.*, c.name as category_name, c.slug as category_slug, u.name as author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
    `, [id]);
    return rows[0] || null;
  },

  async findHeadline() {
    const [rows] = await pool.query(`
      SELECT a.*, c.name as category_name, c.slug as category_slug, u.name as author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.status = 'published' AND a.is_headline = 1
      ORDER BY a.published_at DESC LIMIT 1
    `);
    if (rows[0]) return rows[0];
    // fallback: latest published
    const [fallback] = await pool.query(`
      SELECT a.*, c.name as category_name, c.slug as category_slug, u.name as author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.status = 'published'
      ORDER BY a.published_at DESC LIMIT 1
    `);
    return fallback[0] || null;
  },

  async findTrending(limit = 5) {
    const num = parseInt(limit) || 5;
    const [rows] = await pool.query(`
      SELECT a.id, a.title, a.slug, a.views_count, a.published_at,
             c.name as category_name, c.slug as category_slug
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'published'
      ORDER BY a.views_count DESC LIMIT ${num}
    `);
    return rows;
  },

  async findLatest(limit = 12) {
    const num = parseInt(limit) || 12;
    const [rows] = await pool.query(`
      SELECT a.id, a.title, a.slug, a.excerpt, a.thumbnail_url, a.views_count,
             a.published_at, a.reading_time_minutes,
             c.name as category_name, c.slug as category_slug, u.name as author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.status = 'published'
      ORDER BY a.published_at DESC LIMIT ${num}
    `);
    return rows;
  },

  async findByCategory(categorySlug, limit = 12, offset = 0) {
    const [rows] = await pool.execute(`
      SELECT a.id, a.title, a.slug, a.excerpt, a.thumbnail_url, a.views_count,
             a.published_at, a.reading_time_minutes,
             c.name as category_name, c.slug as category_slug, u.name as author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.status = 'published' AND c.slug = ?
      ORDER BY a.published_at DESC LIMIT ? OFFSET ?
    `, [categorySlug, parseInt(limit), parseInt(offset)]);
    return rows;
  },

  async findRelated(categoryId, currentId, limit = 4) {
    const [rows] = await pool.execute(`
      SELECT a.id, a.title, a.slug, a.thumbnail_url, a.published_at, a.reading_time_minutes,
             c.name as category_name, c.slug as category_slug
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'published' AND a.category_id = ? AND a.id != ?
      ORDER BY a.published_at DESC LIMIT ?
    `, [categoryId, currentId, limit]);
    return rows;
  },

  async create(data) {
    const slug = await generateUniqueSlug(data.title);
    const readingTime = calculateReadingTime(data.content);
    const publishedAt = data.status === 'published' ? new Date() : null;
    const [result] = await pool.execute(`
      INSERT INTO articles (author_id, category_id, title, slug, excerpt, content,
        thumbnail_url, thumbnail_caption, status, is_headline, reading_time_minutes, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.author_id, data.category_id, data.title, slug, data.excerpt || '',
      data.content, data.thumbnail_url || null, data.thumbnail_caption || null,
      data.status || 'draft', data.is_headline ? 1 : 0, readingTime, publishedAt
    ]);
    return { id: result.insertId, slug };
  },

  async update(id, data) {
    const readingTime = calculateReadingTime(data.content);
    const params = [
      data.category_id, data.title, data.excerpt || '', data.content,
      data.thumbnail_caption || null, data.status || 'draft',
      data.is_headline ? 1 : 0, readingTime
    ];
    if (data.thumbnail_url) {
      await pool.execute('UPDATE articles SET thumbnail_url = ? WHERE id = ?', [data.thumbnail_url, id]);
    }
    if (data.status === 'published') {
      await pool.execute(`
        UPDATE articles SET
          category_id=?, title=?, excerpt=?, content=?, thumbnail_caption=?,
          status=?, is_headline=?, reading_time_minutes=?,
          published_at = COALESCE(published_at, NOW()), updated_at=NOW()
        WHERE id=?
      `, [...params, id]);
    } else {
      await pool.execute(`
        UPDATE articles SET
          category_id=?, title=?, excerpt=?, content=?, thumbnail_caption=?,
          status=?, is_headline=?, reading_time_minutes=?, updated_at=NOW()
        WHERE id=?
      `, [...params, id]);
    }
    return true;
  },

  async delete(id) {
    await pool.execute('DELETE FROM article_tags WHERE article_id = ?', [id]);
    const [result] = await pool.execute('DELETE FROM articles WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async incrementViews(id) {
    await pool.execute('UPDATE articles SET views_count = views_count + 1 WHERE id = ?', [id]);
  },

  async getStats() {
    const [published] = await pool.execute("SELECT COUNT(*) as count FROM articles WHERE status='published'");
    const [draft] = await pool.execute("SELECT COUNT(*) as count FROM articles WHERE status='draft'");
    const [views] = await pool.execute("SELECT SUM(views_count) as total FROM articles");
    const [categories] = await pool.execute("SELECT COUNT(*) as count FROM categories WHERE is_active=1");
    return {
      totalPublished: published[0].count,
      totalDraft: draft[0].count,
      totalViews: views[0].total || 0,
      totalCategories: categories[0].count
    };
  },

  async findRecent(limit = 5) {
    const [rows] = await pool.execute(`
      SELECT a.id, a.title, a.slug, a.status, a.views_count, a.published_at,
             c.name as category_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY a.created_at DESC LIMIT ?
    `, [limit]);
    return rows;
  }
};

module.exports = Article;

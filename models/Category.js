const pool = require('../config/database');

const Category = {
  async findAll() {
    const [rows] = await pool.query(`
      SELECT c.*, COUNT(a.id) as article_count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `);
    return rows;
  },

  async findAllAdmin() {
    const [rows] = await pool.query(`
      SELECT c.*, COUNT(a.id) as article_count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `);
    return rows;
  },

  async findBySlug(slug) {
    const [rows] = await pool.execute('SELECT * FROM categories WHERE slug = ? AND is_active = 1', [slug]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const [result] = await pool.execute(
      'INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES (?, ?, ?, ?, ?)',
      [data.name, slug, data.description || '', data.sort_order || 99, data.is_active !== false ? 1 : 0]
    );
    return result.insertId;
  },

  async update(id, data) {
    await pool.execute(
      'UPDATE categories SET name=?, description=?, sort_order=?, is_active=?, updated_at=NOW() WHERE id=?',
      [data.name, data.description || '', data.sort_order || 99, data.is_active ? 1 : 0, id]
    );
    return true;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Category;

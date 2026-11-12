const pool = require('../config/database');

const Tag = {
  async findByArticle(articleId) {
    const [rows] = await pool.execute(`
      SELECT t.* FROM tags t
      INNER JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
      ORDER BY t.name ASC
    `, [articleId]);
    return rows;
  },

  async syncTags(articleId, tagNamesStr) {
    if (!tagNamesStr) return;
    const tagNames = tagNamesStr.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
    await pool.execute('DELETE FROM article_tags WHERE article_id = ?', [articleId]);
    for (const name of tagNames) {
      let [existing] = await pool.execute('SELECT id FROM tags WHERE name = ?', [name]);
      let tagId;
      if (existing.length > 0) {
        tagId = existing[0].id;
      } else {
        const [res] = await pool.execute('INSERT INTO tags (name, slug) VALUES (?, ?)', [name, name.replace(/\s+/g, '-')]);
        tagId = res.insertId;
      }
      await pool.execute('INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)', [articleId, tagId]);
    }
  }
};

module.exports = Tag;

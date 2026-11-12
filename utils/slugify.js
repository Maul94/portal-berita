const generateSlug = (text) => {
  const baseSlug = text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return baseSlug;
};

const generateUniqueSlug = (text) => {
  const base = generateSlug(text);
  const timestamp = Date.now().toString().slice(-6);
  return `${base}-${timestamp}`;
};

module.exports = { generateSlug, generateUniqueSlug };

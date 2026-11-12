// Reading progress bar
function initReadingProgress() {
  const bar = document.getElementById('reading-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = Math.min(progress, 100) + '%';
  });
}

// Auto-generate slug from title
function initSlugGenerator() {
  const titleInput = document.getElementById('title');
  const slugPreview = document.getElementById('slug-preview');
  if (!titleInput || !slugPreview) return;
  titleInput.addEventListener('input', () => {
    const slug = titleInput.value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    slugPreview.textContent = slug || 'slug-akan-muncul-di-sini';
  });
}

// Copy link share
function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.getElementById('copy-link-btn');
    if (btn) {
      btn.textContent = '✓ Tersalin!';
      setTimeout(() => btn.textContent = '🔗 Salin Tautan', 2000);
    }
  });
}

// Dark mode toggle
function initDarkMode() {
  const toggle = document.getElementById('dark-mode-toggle');
  if (!toggle) return;
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) document.documentElement.classList.add('dark');
  toggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
  });
}

// Mobile menu toggle
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => menu.classList.toggle('hidden'));
}

// Admin: confirm delete
function confirmDelete(form) {
  if (confirm('Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.')) {
    form.submit();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initReadingProgress();
  initSlugGenerator();
  initDarkMode();
  initMobileMenu();
});

/* ==========================================
   Application Initialization
   ========================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Store
  await Store.init();

  // 2. Initialize Player
  Player.init();

  // 3. Bind Sidebar Drawer Controls
  const menuTrigger = document.getElementById('menu-trigger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  const toggleSidebar = () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  };

  menuTrigger?.addEventListener('click', toggleSidebar);
  overlay?.addEventListener('click', toggleSidebar);

  // Close sidebar on link click (mobile)
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 992) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      }
    });
  });

  // 4. Bind Theme Toggle
  const themeBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');

  const updateThemeUI = () => {
    const isDark = Store.theme === 'dark';
    if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';
    if (themeText) themeText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  };

  updateThemeUI();

  themeBtn?.addEventListener('click', () => {
    const nextTheme = Store.theme === 'dark' ? 'light' : 'dark';
    Store.setTheme(nextTheme);
    updateThemeUI();
  });

  // 5. Initialize Router
  Router.init();
});

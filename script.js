const $ = (selector) => document.querySelector(selector);

function initTheme() {
  const btn = $('#themeBtn');
  if (!btn) return;          

  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) { }
  if (saved) document.documentElement.dataset.theme = saved;

  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { }
  });
}

/* ---------- Feature 2: mobile menu with ARIA state ---------- */
function initMenu() {
  const btn = $('#menuBtn');
  const list = $('#navList');
  if (!btn || !list) return;

  btn.addEventListener('click', () => {
    const open = list.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  // Close the menu after choosing a link
  list.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      list.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------- Start everything safely ---------- */
[initTheme, initMenu].forEach((fn) => {
  try {
    fn();
  } catch (err) {
    console.error(`${fn.name} failed:`, err);
  }
});

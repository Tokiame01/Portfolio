/* Portfolio interactions. Read each function and personalize the content before submission. */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const projects = [
  { title: 'Fitlife Wellness Centre', category: 'Website', desc: 'A website that display a management dashboard for fitness centre, including function of enrollment, manage payment, make booking etc. Data overview and report also provided.', link: '', image: 'images/flwc.png', imageAlt: 'Screenshot showing the main features of my project'},
  { title: 'DirectFarm System', category: 'System', desc: 'A system enables a farm to manage their order, let user to place order and track the order.', link: '', image: 'images/directfarm.png', imageAlt: 'Screenshot showing the main features of my project'},
  { title: 'MediTrack - Hospital Patient Management System', category: 'System', desc: 'A management system that manage the data of hospital patient, including record patient information, search patient, and sorting patient base on the requirement.', link: '', image: 'images/meditrack.png', imageAlt: 'Screenshot showing the main features of my project'},
  { title: 'Personalized Fitness Tracker', category: 'Application', desc: 'A personalize fitness tracker that provides function of recording daily activities, food taken, calculating the calorie goal and generates a daily summary report.', link: '', image: 'images/fitnesstracker.png', imageAlt: 'Screenshot showing the main features of my project'},
  { title: 'EduQuest App', category: 'Application', desc: 'A web-based application that enables user to learn about SDG 4 - Quality Education, provides a quiz for user to test understanding and a score rankings that motivate user to get higher score.', link: '', image: 'images/eduquest.png', imageAlt: 'Screenshot showing the main features of my project'},
];

// Keep anchor targets clear of the persistent header, including when text wraps.
function initHeaderOffset() {
  const header = $('header');
  if (!header) return;
  const update = () => {
    document.documentElement.style.setProperty('--header-offset', `${header.offsetHeight + 16}px`);
  };
  update();
  window.addEventListener('resize', update, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(header);
}

// 1. Theme switch with remembered preference and an announced toggle state.
function initTheme() {
  const button = $('#themeBtn');
  if (!button) return;
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch { }
  const initial = saved === 'dark' || saved === 'light'
    ? saved
    : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  };
  applyTheme(initial);
  button.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch { }
  });
  button.hidden = false;
}

// 2. Mobile menu: links close it; Escape closes it and returns focus to Menu.
function initMenu() {
  const button = $('#menuBtn');
  const list = $('#navList');
  if (!button || !list) return;
  const mobile = window.matchMedia('(max-width: 52rem)');
  const setOpen = (open) => {
    list.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
  };
  button.addEventListener('click', () => setOpen(!list.classList.contains('open')));
  list.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && list.classList.contains('open')) {
      setOpen(false);
      button.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('nav')) setOpen(false);
  });
  mobile.addEventListener('change', () => {
    if (mobile.matches && list.contains(document.activeElement)) button.focus();
    if (!mobile.matches && document.activeElement === button) list.querySelector('a')?.focus();
    setOpen(false);
  });
  // Navigation stays visible on small screens if JavaScript is unavailable.
  document.documentElement.classList.add('has-menu');
}

// 3. Indicate the current section visually and to assistive technology.
function initScrollSpy() {
  const links = [...$$('nav a[href^="#"]')];
  const sections = [...$$('main section')];
  const header = $('header');
  if (!links.length || !sections.length) return;
  let queued = false;
  const update = () => {
    queued = false;
    let current = sections[0].id;
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= (header?.offsetHeight || 0) + 32) current = section.id;
    });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      current = sections[sections.length - 1].id;
    }
    links.forEach((link) => {
      const active = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const schedule = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
}

// Pure validation logic can be checked separately from the browser interface.
function validateContactValues(values) {
  const message = values.message.trim();
  return {
    name: values.name.trim() ? '' : 'Please enter your name.',
    email: EMAIL_PATTERN.test(values.email.trim()) ? '' : 'Please enter a valid email address.',
    message: message.length >= 10 && values.message.length <= 300
      ? '' : 'Enter a message of 10 to 300 characters.',
  };
}

// 4. Local form validation with field descriptions, error states, and focus.
function initForm() {
  const form = $('#contactForm');
  if (!form) return;
  const fields = { name: $('#name'), email: $('#email'), message: $('#message') };
  const status = $('#formStatus');
  const readValues = () => Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value]));
  const showError = (key, message) => {
    $(`#${key}Error`).textContent = message;
    fields[key].setAttribute('aria-invalid', String(Boolean(message)));
  };
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const errors = validateContactValues(readValues());
    // Keep the browser's email validity check as well as the basic format check.
    if (!fields.email.validity.valid && !errors.email) errors.email = 'Please enter a valid email address.';
    Object.entries(errors).forEach(([key, message]) => showError(key, message));
    const firstInvalid = Object.keys(errors).find((key) => errors[key]);
    if (firstInvalid) {
      status.textContent = 'Please correct the highlighted fields.';
      fields[firstInvalid].focus();
    } else {
      status.textContent = 'Your entries are valid. No message was sent. Use the email link above to contact me.';
      // Keep the message available so the visitor can copy it into an email.
    }
  });
  Object.entries(fields).forEach(([key, field]) => {
    field.addEventListener('input', () => {
      status.textContent = '';
      if (field.getAttribute('aria-invalid') === 'true') {
        const errors = validateContactValues(readValues());
        if (key === 'email' && !field.validity.valid) errors.email = 'Please enter a valid email address.';
        showError(key, errors[key]);
      }
    });
  });
  form.noValidate = true;
  $('#checkMessage').disabled = false;
}

// 5. Typing animation; a separate static copy is available to screen readers.
function initTyping() {
  const element = $('#typedText');
  if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const text = element.textContent.trim();
  element.textContent = '';
  let position = 0;
  const timer = setInterval(() => {
    element.textContent = text.slice(0, ++position);
    if (position >= text.length) clearInterval(timer);
  }, 55);
}

// 6. Project cards use textContent; links appear only when a destination exists.
function renderProjects(list) {
  const grid = $('#projectGrid');
  if (!grid) return;
  grid.replaceChildren();
  list.forEach((project) => {
    const card = document.createElement('article');
    card.className = 'card';
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = project.category;
    const heading = document.createElement('h3');
    heading.textContent = project.title;
    const description = document.createElement('p');
    description.textContent = project.desc;
    if (project.image) {
    const image = document.createElement('img');
    image.src = project.image;
    image.alt = project.imageAlt || `${project.title} screenshot`;
    image.className = 'project-image';
    image.loading = 'lazy';
    card.append(image);
}
    card.append(tag, heading, description);
    const destination = project.link?.trim();
    if (destination && destination !== '#') {
      const link = document.createElement('a');
      link.href = destination;
      link.textContent = `View ${project.title}`;
      card.append(link);
    }
    grid.append(card);
  });
  const count = $('#projectCount');
  if (count) count.textContent = `${list.length} ${list.length === 1 ? 'project' : 'projects'} shown.`;
}

function filterProjectsByCategory(category) {
  return category === 'all' ? projects : projects.filter((project) => project.category === category);
}

// 7. Filter projects and announce how many results are visible.
function initFilters() {
  const filters = $('#filters');
  if (!filters) return;
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    filters.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    renderProjects(filterProjectsByCategory(button.dataset.filter));
  });
  renderProjects(projects);
  filters.hidden = false;
}

// 8. Back to top respects reduced motion and moves keyboard focus to Home.
function initBackToTop() {
  const button = $('#toTop');
  if (!button) return;
  const update = () => { button.hidden = window.scrollY < 400; };
  window.addEventListener('scroll', update, { passive: true });
  button.addEventListener('click', () => {
    const heading = $('#homeTitle');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  update();
}

// 9. Update progress immediately, on scroll, and when the viewport changes.
function initProgressBar() {
  const bar = $('#progress');
  if (!bar) return;
  const update = () => {
    const maximum = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maximum > 0 ? Math.min(100, Math.max(0, window.scrollY / maximum * 100)) : 0;
    bar.style.width = `${progress}%`;
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

// 10. Leave content visible if observers are unavailable or motion is reduced.
function initReveal() {
  const items = $$('.reveal');
  if (!items.length || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach((item) => observer.observe(item));
  document.documentElement.classList.add('js-ready');
}

// 11. One email source: edit the mailto link in index.html, not this function.
function initCopyEmail() {
  const button = $('#copyEmail');
  const link = $('#emailLink');
  const status = $('#copyStatus');
  if (!button || !link || !status) return;
  button.addEventListener('click', async () => {
    const email = link.textContent.trim();
    try {
      await navigator.clipboard.writeText(decodeURIComponent(email));
      status.textContent = 'Email address copied.';
    } catch {
      status.textContent = 'Copy is unavailable. Please select and copy the email address above.';
    }
  });
  button.hidden = false;
}

// 12. Message character counter.
function initCounter() {
  const field = $('#message');
  const counter = $('#count');
  if (!field || !counter) return;
  const update = () => { counter.textContent = `${field.value.length} / ${field.maxLength}`; };
  field.addEventListener('input', update);
  update();
}

function greetingForHour(hour) {
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

// 13. Greeting based on the visitor's local time.
function initGreeting() {
  const element = $('#greeting');
  if (element) element.textContent = `${greetingForHour(new Date().getHours())}, welcome to my portfolio.`;
}

function initYear() {
  const element = $('#year');
  if (element) element.textContent = new Date().getFullYear();
}

// Start independently so a problem in one feature does not stop the others.
[
  initHeaderOffset, initTheme, initMenu, initForm, initTyping, initFilters,
  initScrollSpy, initBackToTop, initProgressBar, initReveal, initCopyEmail,
  initCounter, initGreeting, initYear,
].forEach((initialize) => {
  try { initialize(); }
  catch (error) { console.error(`${initialize.name} failed:`, error); }
});

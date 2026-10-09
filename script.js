'use strict';
const header = document.querySelector('.header');
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menu');
  navigation.classList.remove('open');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  navigation.classList.toggle('open', open);
  header.classList.remove('hidden');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    toggle.focus();
  }
});
document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
let navigationUntil = 0;
// O destino alinha sua borda ao topo. O padding da seção protege o conteúdo do header.
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const hash = link.getAttribute('href');
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    event.preventDefault();
    closeMenu();
    navigationUntil = performance.now() + (reducedMotion.matches ? 100 : 1500);
    header.classList.remove('hidden');
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.pushState(null, '', hash);
    window.scrollTo({
      top: Math.max(0, target.getBoundingClientRect().top + window.scrollY),
      behavior: reducedMotion.matches ? 'instant' : 'smooth'
    });
  });
});
['wheel', 'touchstart'].forEach(type => window.addEventListener(type, () => {
  navigationUntil = 0;
}, { passive: true }));
let previousY = window.scrollY;
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = Math.max(0, window.scrollY);
    updateProgress();
    if (Math.abs(y - previousY) > 5 || y < 90) {
      header.classList.toggle('hidden', performance.now() > navigationUntil && y > 90 && y > previousY && toggle.getAttribute('aria-expanded') !== 'true' && !header.contains(document.activeElement));
      previousY = y;
    }
    ticking = false;
  });
}, { passive: true });
header.addEventListener('focusin', () => header.classList.remove('hidden'));
// Entradas independentes permitem animar o conteúdo ao longo de cada seção.
const sections = [...document.querySelectorAll('main .section')];
const revealElements = new Set(document.querySelectorAll('.service, .steps article, .care-list article, .about-photo, .work-visual'));
sections.forEach(section => {
  section.querySelectorAll('.eyebrow, h2, .section-text, .text-link, .address-line, details, .button, .phone').forEach(element => revealElements.add(element));
});
document.querySelectorAll('.reveal').forEach(element => {
  if (!revealElements.has(element)) element.classList.remove('reveal');
});
revealElements.forEach(element => element.classList.add('reveal'));
// Escalonamento dentro de grupos, com atrasos curtos inclusive no celular.
document.querySelectorAll('.service-grid, .steps, .care-list, .accordion').forEach(group => {
  [...group.children].forEach((element, index) => element.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 90}ms`));
});
document.querySelectorAll('h2').forEach(title => {
  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  let index = 0;
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(word => {
      if (!word.trim()) { fragment.append(document.createTextNode(word)); return; }
      const span = document.createElement('span');
      span.className = 'title-word';
      span.textContent = word;
      span.style.setProperty('--word-delay', `${Math.min(index++, 7) * 45}ms`);
      fragment.append(span);
    });
    node.replaceWith(fragment);
  });
  title.classList.add('animated-title');
});
let revealObserver;
function syncMotion() {
  if (!('IntersectionObserver' in window)) return;
  revealObserver?.disconnect();
  document.body.classList.toggle('motion', !reducedMotion.matches);
  if (reducedMotion.matches) {
    revealElements.forEach(element => element.classList.add('visible'));
    return;
  }
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
  revealElements.forEach(element => {
    if (!element.classList.contains('visible')) revealObserver.observe(element);
  });
}
syncMotion();
reducedMotion.addEventListener('change', syncMotion);
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigation.querySelectorAll('a[href^="#"]').forEach(link => {
        const active = link.hash === '#' + entry.target.id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-20% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
}
// A resposta do FAQ entra suavemente, mantendo o comportamento nativo de details.
document.querySelectorAll('details').forEach(item => item.addEventListener('toggle', () => {
  if (item.open && !reducedMotion.matches) {
    item.querySelector('p').animate([
      { opacity: 0, transform: 'translateY(-6px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 280, easing: 'ease-out' });
  }
}));
const progress = document.createElement('div');
progress.className = 'reading-progress';
progress.setAttribute('aria-hidden', 'true');
header.append(progress);
function updateProgress() {
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0})`;
}
updateProgress();
window.addEventListener('resize', updateProgress, { passive: true });
document.querySelector('#year').textContent = String(new Date().getFullYear());


// Carrossel leve com navegação, toque, indicadores e autoplay retomado após interação.
const slider = document.querySelector('.photo-slider');
if (slider) {
  const track = slider.querySelector('.photo-track');
  const slides = [...track.querySelectorAll('.photo-slide')];
  const dots = [...slider.querySelectorAll('.slider-dots button')];
  const controls = slider.querySelector('.slider-controls');
  const pauseButton = slider.querySelector('.slider-pause');
  controls.hidden = false;
  let current = 0;
  let timer;
  let paused = false;
  let hovered = false;
  let focused = false;
  let onscreen = false;
  let scrollingFrame = false;
  function restart() {
    clearInterval(timer);
    if (paused || hovered || focused || !onscreen || document.hidden || reducedMotion.matches) return;
    timer = setInterval(() => go(current + 1, false), 4800);
  }
  function go(index, interaction = true) {
    current = (index + slides.length) % slides.length;
    track.scrollTo({ left: current * track.clientWidth, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    if (interaction) restart();
  }
  function updateDots() {
    current = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / (track.clientWidth || 1))));
    dots.forEach((dot, index) => dot.setAttribute('aria-pressed', String(index === current)));
  }
  slider.querySelector('.slider-prev').addEventListener('click', () => go(current - 1));
  slider.querySelector('.slider-next').addEventListener('click', () => go(current + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => go(index)));
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? 'Retomar reprodução automática' : 'Pausar reprodução automática');
    pauseButton.textContent = paused ? '▶' : 'Ⅱ';
    restart();
  });
  track.addEventListener('scroll', () => {
    if (scrollingFrame) return;
    scrollingFrame = true;
    requestAnimationFrame(() => { updateDots(); scrollingFrame = false; });
  }, { passive: true });
  track.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    go(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  track.addEventListener('pointerup', restart);
  track.addEventListener('touchend', restart, { passive: true });
  slider.addEventListener('mouseenter', () => { hovered = true; restart(); });
  slider.addEventListener('mouseleave', () => { hovered = false; restart(); });
  slider.addEventListener('focusin', () => { focused = true; restart(); });
  slider.addEventListener('focusout', event => {
    if (!slider.contains(event.relatedTarget)) { focused = false; restart(); }
  });
  document.addEventListener('visibilitychange', restart);
  reducedMotion.addEventListener('change', restart);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      onscreen = entries[0].isIntersecting;
      restart();
    }, { threshold: 0.15 }).observe(slider);
  } else { onscreen = true; restart(); }
  window.addEventListener('resize', () => {
    track.scrollTo({ left: current * track.clientWidth, behavior: 'instant' });
    updateDots();
  }, { passive: true });
}

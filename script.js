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
let previousY = window.scrollY;
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = Math.max(0, window.scrollY);
    updateProgress();
    if (Math.abs(y - previousY) > 5 || y < 90) {
      header.classList.toggle('hidden', y > 90 && y > previousY && toggle.getAttribute('aria-expanded') !== 'true' && !header.contains(document.activeElement));
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
  section.querySelectorAll('.eyebrow, h2, .section-text, .text-link, .address-line, details, .final-cta .button, .final-cta .phone').forEach(element => revealElements.add(element));
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

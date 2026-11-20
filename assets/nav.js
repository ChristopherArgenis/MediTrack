// Mide la barra fija para que los anclas no queden ocultas y marca la sección activa del índice.
(function () {
  const nav = document.querySelector('.sitenav');
  const root = document.documentElement;
  const setH = () => root.style.setProperty('--navh', (nav ? nav.offsetHeight : 0) + 'px');
  setH();
  addEventListener('resize', setH);
  // Corrige la posición si se entra directo con #ancla
  if (location.hash) addEventListener('load', () => { const t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t) t.scrollIntoView(); });
  const links = [...document.querySelectorAll('.toc a[href^="#"]')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.remove('on')); const a = byId.get(e.target.id); if (a) a.classList.add('on'); } });
  }, {rootMargin: '-20% 0px -70% 0px'});
  byId.forEach((a, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
})();

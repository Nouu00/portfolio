// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Sticky header shadow on scroll
const header = document.getElementById('siteHeader');
const onScroll = () => {
  if (window.scrollY > 8) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal, .reveal-blur');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// Lightbox for zoomable images
const lightboxImgs = document.querySelectorAll('.lightbox-trigger');
if (lightboxImgs.length) {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  const overlayImg = document.createElement('img');
  overlay.appendChild(overlayImg);
  document.body.appendChild(overlay);

  const openLightbox = (src, alt) => {
    overlayImg.src = src;
    overlayImg.alt = alt || '';
    overlay.classList.add('open');
    document.body.classList.add('lightbox-lock');
  };
  const closeLightbox = () => {
    overlay.classList.remove('open');
    document.body.classList.remove('lightbox-lock');
  };

  lightboxImgs.forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

// Marquee: keep looping seamlessly at any screen width
const marqueeEl = document.querySelector('.marquee');
const marqueeTrack = document.getElementById('marqueeTrack');
if (marqueeEl && marqueeTrack) {
  const MARQUEE_SPEED = 36; // px per second, matches original pace

  const setupMarquee = () => {
    const halves = marqueeTrack.querySelectorAll('.marquee-half');
    if (halves.length < 2) return;

    // reset each half back to a single base set before recalculating
    halves.forEach(half => {
      const sets = half.querySelectorAll('.marquee-set');
      sets.forEach((set, i) => { if (i > 0) set.remove(); });
    });

    const containerWidth = marqueeEl.clientWidth;
    const baseSet = halves[0].querySelector('.marquee-set');
    if (!baseSet) return;
    const setWidth = baseSet.getBoundingClientRect().width;
    if (!setWidth) return;

    const needed = Math.max(1, Math.ceil((containerWidth * 1.5) / setWidth));
    halves.forEach(half => {
      const first = half.querySelector('.marquee-set');
      for (let i = 1; i < needed; i++) {
        half.appendChild(first.cloneNode(true));
      }
    });

    const halfWidth = marqueeTrack.scrollWidth / 2;
    const duration = halfWidth / MARQUEE_SPEED;
    marqueeTrack.style.animationDuration = duration + 's';
  };

  setupMarquee();
  let marqueeResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(marqueeResizeTimer);
    marqueeResizeTimer = setTimeout(setupMarquee, 200);
  });
}

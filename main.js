/* ===================================================================
   NORVEX — Digital Systems / Creative Technology
   main.js — Interaction, Canvas Particles, Motion & Parallax
   =================================================================== */

const CONFIG = {
  email: "hello@norvex.dev",
  socials: {
    telegram: "https://t.me/NRXAdverb",
    github: "",
    instagram: "",
    youtube: ""
  }
};

/* --- Helpers --- */
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* --- Toast Notification System --- */
let toastTimeout = null;
function toast(message) {
  const el = $('#toast');
  if (!el) return;
  const msgEl = el.querySelector('#toastMsg');
  if (msgEl) {
    msgEl.textContent = message;
  } else {
    el.textContent = message;
  }
  el.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    el.classList.remove('show');
  }, 2600);
}

/* --- Lucide Icons Initializer --- */
function initIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    try {
      window.lucide.createIcons();
    } catch {
      // safe fallback
    }
  }
}

/* --- Preloader --- */
function initPreloader() {
  const loader = $('#loader');
  const fill = $('#loadFill');
  const pctEl = $('#loadPct');
  const msgEl = $('#loadMsg');

  if (!loader || prefersReduced()) {
    if (loader) loader.classList.add('done');
    document.body.classList.remove('is-loading');
    initReveal();
    return;
  }

  document.body.classList.add('is-loading');

  const messages = [
    { at: 0, text: "INITIALIZING" },
    { at: 35, text: "LOADING GLASS" },
    { at: 70, text: "LOCKING SIGNAL" },
    { at: 96, text: "READY" }
  ];

  let currentPct = 0;
  let targetPct = 88;
  const startTime = performance.now();
  const MIN_TIME = 1600;
  const MAX_TIME = 4200;
  let isDone = false;

  const updateProgress = () => {
    const elapsed = performance.now() - startTime;
    if (elapsed >= MIN_TIME && targetPct < 100) {
      targetPct = 100;
    }
    if (elapsed >= MAX_TIME) {
      targetPct = 100;
      currentPct = 100;
    }

    currentPct += (targetPct - currentPct) * 0.08;
    if (Math.abs(targetPct - currentPct) < 0.2 && targetPct === 100) {
      currentPct = 100;
    }

    const rounded = Math.min(100, Math.floor(currentPct));
    if (fill) fill.style.width = `${rounded}%`;
    if (pctEl) pctEl.textContent = `${rounded}%`;

    const activeMsg = messages.reduce((prev, curr) => (rounded >= curr.at ? curr : prev), messages[0]);
    if (msgEl) msgEl.textContent = activeMsg.text;

    if (currentPct >= 99.5 && !isDone) {
      isDone = true;
      if (fill) fill.style.width = '100%';
      if (pctEl) pctEl.textContent = '100%';
      if (msgEl) msgEl.textContent = "READY";

      setTimeout(() => {
        loader.classList.add('done');
        document.body.classList.remove('is-loading');
        setTimeout(() => {
          if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 800);
        initReveal();
      }, 350);
      return;
    }

    if (!isDone) {
      requestAnimationFrame(updateProgress);
    }
  };

  requestAnimationFrame(updateProgress);

  window.addEventListener('load', () => {
    const elapsed = performance.now() - startTime;
    if (elapsed >= MIN_TIME) {
      targetPct = 100;
    } else {
      setTimeout(() => {
        targetPct = 100;
      }, MIN_TIME - elapsed);
    }
  });
}

/* --- Reveal On Scroll Observer --- */
function initReveal() {
  const reveals = $$('.reveal');
  if (prefersReduced()) {
    reveals.forEach(el => el.classList.add('in'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = (index % 5) * 90;
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('in');
        obs.unobserve(el);

        // Clear delay after reveal so hover transitions aren't blocked
        setTimeout(() => {
          el.style.transitionDelay = '';
        }, 1300);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* --- Navigation & Active Tracking --- */
function initNavigation() {
  const nav = $('.nav');
  const toggle = $('#navToggle');
  const mobileMenu = $('#mobileMenu');
  const navLinks = $$('.nav-link');
  const mobileLinks = $$('.mobile-link');

  // Scrolled state
  const handleScroll = () => {
    if (!nav) return;
    if (window.scrollY > 24) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  const setMenu = (open) => {
    if (!mobileMenu || !toggle) return;
    if (open) {
      mobileMenu.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    } else {
      mobileMenu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  };

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileMenu && mobileMenu.classList.contains('open');
      setMenu(!isOpen);
    });
  }

  // Close on Escape or click outside
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  document.addEventListener('click', (e) => {
    if (mobileMenu && mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && !toggle.contains(e.target)) {
      setMenu(false);
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });

  // Active link IntersectionObserver
  const sections = ['#field', '#stack', '#about', '#contact'].map(id => $(id)).filter(Boolean);
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px'
  });

  sections.forEach(s => activeObserver.observe(s));
}

/* --- Crosshair Cursor with Comet Trail --- */
function initCursor() {
  if (!hasFinePointer() || prefersReduced()) return;

  const xh = $('#xh');
  const coordsEl = $('#xhCoords');
  const trailContainer = $('#xhTrail');
  if (!xh) return;

  const TRAIL_COUNT = 14;
  const trailDots = [];

  if (trailContainer) {
    trailContainer.innerHTML = '';
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const dot = document.createElement('div');
      dot.className = 'xh-trail-dot';
      const factor = (TRAIL_COUNT - i) / TRAIL_COUNT;
      dot.style.opacity = `${(factor * 0.45).toFixed(2)}`;
      dot.style.transform = 'translate(-50%, -50%) scale(' + (0.4 + factor * 0.6).toFixed(2) + ')';
      trailContainer.appendChild(dot);
      trailDots.push({ el: dot, x: -100, y: -100 });
    }
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let headX = mouseX;
  let headY = mouseY;
  let frameCount = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('mousedown', () => xh.classList.add('is-down'));
  window.addEventListener('mouseup', () => xh.classList.remove('is-down'));

  // Hover detection
  const interactiveSelector = 'a, button, input, [data-hover], .s-card, .fc, .orbit-chip, .mail-box';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      xh.classList.add('is-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      xh.classList.remove('is-hover');
    }
  });

  const renderCursor = () => {
    headX += (mouseX - headX) * 0.45;
    headY += (mouseY - headY) * 0.45;
    xh.style.transform = `translate(${headX}px, ${headY}px) translate(-50%, -50%)`;

    // Trail interpolation
    let prevX = headX;
    let prevY = headY;
    trailDots.forEach((dot, idx) => {
      const lerp = Math.max(0.08, 0.32 - idx * 0.012);
      dot.x += (prevX - dot.x) * lerp;
      dot.y += (prevY - dot.y) * lerp;
      dot.el.style.transform = `translate(${dot.x}px, ${dot.y}px) translate(-50%, -50%)`;
      prevX = dot.x;
      prevY = dot.y;
    });

    // Update coordinate readout every 6 frames
    frameCount++;
    if (frameCount % 6 === 0 && coordsEl) {
      const padX = String(Math.round(mouseX)).padStart(4, '0');
      const padY = String(Math.round(mouseY)).padStart(4, '0');
      coordsEl.textContent = `X:${padX} Y:${padY}`;

      if (mouseX > window.innerWidth - 140) {
        xh.classList.add('flipped');
      } else {
        xh.classList.remove('flipped');
      }
    }

    requestAnimationFrame(renderCursor);
  };

  requestAnimationFrame(renderCursor);
}

/* --- Magnetic Buttons --- */
function initMagnetic() {
  if (!hasFinePointer() || prefersReduced()) return;

  const magnetics = $$('.magnetic');
  magnetics.forEach(btn => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isHovered = false;
    let rafId = null;

    const tick = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      btn.style.translate = `${currentX.toFixed(2)}px ${currentY.toFixed(2)}px`;

      if (isHovered || Math.abs(currentX) > 0.05 || Math.abs(currentY) > 0.05) {
        rafId = requestAnimationFrame(tick);
      } else {
        btn.style.translate = '0px 0px';
        rafId = null;
      }
    };

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const factor = btn.classList.contains('btn-primary') ? 0.22 : 0.16;
      targetX = (e.clientX - cx) * factor;
      targetY = (e.clientY - cy) * factor;

      if (!isHovered) {
        isHovered = true;
        if (!rafId) rafId = requestAnimationFrame(tick);
      }
    });

    btn.addEventListener('mouseleave', () => {
      isHovered = false;
      targetX = 0;
      targetY = 0;
    });
  });
}

/* --- Hero 3D Stage Parallax --- */
function initHeroParallax() {
  const stage = $('#stage');
  const mainGlass = $('.main-glass', stage);
  if (!stage || !mainGlass || !hasFinePointer() || prefersReduced()) return;

  let targetRotX = 0;
  let targetRotY = 0;
  let currRotX = 0;
  let currRotY = 0;

  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    targetRotY = dx * 4.5;
    targetRotX = -dy * 3.5;
  });

  const renderParallax = () => {
    currRotX += (targetRotX - currRotX) * 0.04;
    currRotY += (targetRotY - currRotY) * 0.04;
    mainGlass.style.transform = `rotateX(${currRotX.toFixed(2)}deg) rotateY(${currRotY.toFixed(2)}deg)`;
    requestAnimationFrame(renderParallax);
  };

  requestAnimationFrame(renderParallax);
}

/* --- Orbital Field Parallax --- */
function initFieldParallax() {
  const fieldPanel = $('.field-panel');
  if (!fieldPanel || !hasFinePointer() || prefersReduced()) return;

  const chips = $$('.orbit-chip', fieldPanel);
  const core = $('.o-core', fieldPanel);
  if (!chips.length && !core) return;

  let targetX = 0;
  let targetY = 0;
  let currX = 0;
  let currY = 0;

  fieldPanel.addEventListener('mousemove', (e) => {
    const rect = fieldPanel.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    targetX = (e.clientX - cx) / (rect.width / 2);
    targetY = (e.clientY - cy) / (rect.height / 2);
  });

  fieldPanel.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  const renderField = () => {
    currX += (targetX - currX) * 0.05;
    currY += (targetY - currY) * 0.05;

    chips.forEach((chip, i) => {
      const mul = (i + 1) * 10;
      chip.style.transform = `translate(${currX * mul}px, ${currY * mul}px)`;
    });

    if (core) {
      core.style.transform = `translate(${currX * -14}px, ${currY * -14}px)`;
    }

    requestAnimationFrame(renderField);
  };

  requestAnimationFrame(renderField);
}

/* --- Socials & Copy Email --- */
function initActions() {
  // Social buttons
  $$('[data-social]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = btn.getAttribute('data-social');
      const url = CONFIG.socials[key];
      if (url && url.trim().length > 0) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        toast("URL not set. Edit CONFIG.socials");
      }
    });
  });

  // Copy email
  const copyBtn = $('#copyMail');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = CONFIG.email;
      let copied = false;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(email);
          copied = true;
        }
      } catch {
        copied = false;
      }

      if (!copied) {
        // Fallback for file:// or restricted iframe
        try {
          const ta = document.createElement('textarea');
          ta.value = email;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copied = true;
        } catch {
          copied = false;
        }
      }

      toast(`Email copied: ${email}`);
    });
  }

  // To Top Button
  const toTop = $('#toTop');
  if (toTop) {
    toTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: prefersReduced() ? 'auto' : 'smooth'
      });
    });
  }
}

/* --- Silk Drift Canvas Particles --- */
function initParticles() {
  const canvas = $('#particles');
  if (!canvas || prefersReduced()) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const isMobile = window.innerWidth <= 720;
  const count = isMobile ? 22 : 38;

  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.8 + 0.6,
    alpha: Math.random() * 0.5 + 0.2,
    vx: (Math.random() - 0.5) * 0.35 + 0.15,
    vy: (Math.random() - 0.5) * 0.35 - 0.2,
    phase: Math.random() * Math.PI * 2
  }));

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', handleResize, { passive: true });

  let isPaused = false;
  document.addEventListener('visibilitychange', () => {
    isPaused = document.hidden;
  });

  const heroSection = $('#hero');
  if (window.IntersectionObserver && heroSection) {
    const obs = new IntersectionObserver(([entry]) => {
      // Pause particles if user scrolls way down past top viewports to save GPU
      isPaused = !entry.isIntersecting && window.scrollY > 2500;
    }, { threshold: 0 });
    obs.observe(heroSection);
  }

  const animate = () => {
    if (!isPaused) {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.02;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 150, 130, ${currentAlpha.toFixed(3)})`;
        ctx.shadowColor = 'rgba(255, 46, 78, 0.4)';
        ctx.shadowBlur = 8;
        ctx.fill();
      });
    }

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

/* --- Stack Cards Interactive 3D Tilt & Glare --- */
function initStackCards() {
  const cards = $$('.s-card');
  if (!cards.length) return;

  cards.forEach(card => {
    let targetRotX = 0;
    let targetRotY = 0;
    let currRotX = 0;
    let currRotY = 0;
    let isHovered = false;
    let rafId = null;

    const renderCard = () => {
      currRotX += (targetRotX - currRotX) * 0.12;
      currRotY += (targetRotY - currRotY) * 0.12;

      card.style.transform = `perspective(1000px) rotateX(${currRotX.toFixed(2)}deg) rotateY(${currRotY.toFixed(2)}deg) translateY(${isHovered ? '-8px' : '0px'}) scale3d(${isHovered ? '1.025' : '1'}, ${isHovered ? '1.025' : '1'}, 1)`;

      if (isHovered || Math.abs(currRotX) > 0.05 || Math.abs(currRotY) > 0.05) {
        rafId = requestAnimationFrame(renderCard);
      } else {
        card.style.transform = '';
        rafId = null;
      }
    };

    card.addEventListener('mousemove', (e) => {
      if (!hasFinePointer() || prefersReduced()) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update glare coordinates
      card.style.setProperty('--glare-x', `${(x / rect.width * 100).toFixed(1)}%`);
      card.style.setProperty('--glare-y', `${(y / rect.height * 100).toFixed(1)}%`);

      // 3D rotation angles
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      targetRotX = -((y - cy) / cy) * 6.5;
      targetRotY = ((x - cx) / cx) * 6.5;

      if (!isHovered) {
        isHovered = true;
        if (!rafId) rafId = requestAnimationFrame(renderCard);
      }
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      targetRotX = 0;
      targetRotY = 0;
    });
  });
}

/* --- Initialization Entry Point --- */
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initPreloader();
  initNavigation();
  initCursor();
  initMagnetic();
  initHeroParallax();
  initFieldParallax();
  initStackCards();
  initActions();
  initParticles();
});

window.addEventListener('load', () => {
  initIcons();
});

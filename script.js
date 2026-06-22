/* =========================================
   LUMASMILE — SCRIPT.JS
   GSAP Animations + Particle System + UX
   ========================================= */

// ── Register GSAP Plugins ──
gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════
// 1. NAVBAR SCROLL EFFECT
// ═══════════════════════════════════════
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ═══════════════════════════════════════
// 2. HERO ENTRANCE ANIMATIONS (GSAP)
// ═══════════════════════════════════════
const heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });

heroTL
  .to('#heroBadge',     { opacity: 1, y: 0, duration: 0.7, delay: 0.3 })
  .to('#heroTitle',     { opacity: 1, y: 0, duration: 0.9 }, '-=0.4')
  .to('#heroSub',       { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
  .to('#heroCtaGroup',  { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
  .to('#heroStats',     { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
  .to('#scrollIndicator', { opacity: 1, duration: 0.6 }, '-=0.2');

// ═══════════════════════════════════════
// 3. HERO PARTICLE CANVAS — ANTIGRAVITY
// ═══════════════════════════════════════
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas.getContext('2d');
let particles = [];
let animFrameId;
let mouse = { x: -9999, y: -9999 };

function resizeCanvas() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});
canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x    = Math.random() * canvas.width;
    this.y    = Math.random() * canvas.height;
    this.size = Math.random() * 2.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.baseOpacity = this.opacity;
    this.hue  = Math.random() > 0.5 ? 210 : 190; // blue/cyan
    this.sat  = 80 + Math.random() * 20;
    this.lit  = 65 + Math.random() * 25;
    this.phase = Math.random() * Math.PI * 2;
    this.freq  = 0.005 + Math.random() * 0.005;
  }
  update(t) {
    // Antigravity: slight upward drift + wave
    this.x += this.speedX + Math.sin(t * this.freq + this.phase) * 0.3;
    this.y += this.speedY - 0.15;
    this.opacity = this.baseOpacity * (0.8 + 0.2 * Math.sin(t * 0.02 + this.phase));

    // Mouse repulsion — particles flee the cursor
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120) {
      const force = (120 - dist) / 120;
      this.x += (dx / dist) * force * 3.5;
      this.y += (dy / dist) * force * 3.5;
    }

    // Reset if off-screen
    if (this.x < -10 || this.x > canvas.width + 10 ||
        this.y < -10 || this.y > canvas.height + 10) {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 10;
      this.speedY = (Math.random() - 0.5) * 0.4;
    }
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = `hsl(${this.hue},${this.sat}%,${this.lit}%)`;
    ctx.shadowColor = `hsl(${this.hue},${this.sat}%,${this.lit}%)`;
    ctx.shadowBlur = this.size * 4;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Spawn particles
for (let i = 0; i < 130; i++) particles.push(new Particle());

let t = 0;
function animateParticles() {
  animFrameId = requestAnimationFrame(animateParticles);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  t++;
  particles.forEach(p => { p.update(t); p.draw(); });

  // Draw faint connecting lines between close particles
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 90) {
        ctx.save();
        ctx.globalAlpha = (1 - d / 90) * 0.10;
        ctx.strokeStyle = '#5ba3ff';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}
animateParticles();

// ═══════════════════════════════════════
// 4. ANTIGRAVITY BACKGROUND CANVAS
// ═══════════════════════════════════════
const agCanvas = document.getElementById('agCanvas');
if (agCanvas) {
  const agCtx = agCanvas.getContext('2d');
  let agOrbs = [];

  function resizeAg() {
    agCanvas.width  = agCanvas.offsetWidth;
    agCanvas.height = agCanvas.offsetHeight;
  }
  resizeAg();
  window.addEventListener('resize', resizeAg, { passive: true });

  class GravityOrb {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * agCanvas.width;
      this.y    = Math.random() * agCanvas.height;
      this.r    = Math.random() * 80 + 30;
      this.vx   = (Math.random() - 0.5) * 0.5;
      this.vy   = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.08 + 0.03;
      this.hue  = Math.random() > 0.5 ? 210 : 195;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -this.r) this.x = agCanvas.width + this.r;
      if (this.x > agCanvas.width + this.r) this.x = -this.r;
      if (this.y < -this.r) this.y = agCanvas.height + this.r;
      if (this.y > agCanvas.height + this.r) this.y = -this.r;
    }
    draw() {
      const g = agCtx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
      g.addColorStop(0, `hsla(${this.hue},80%,60%,${this.opacity})`);
      g.addColorStop(1, `hsla(${this.hue},80%,60%,0)`);
      agCtx.fillStyle = g;
      agCtx.beginPath();
      agCtx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      agCtx.fill();
    }
  }

  for (let i = 0; i < 8; i++) agOrbs.push(new GravityOrb());

  function animateAg() {
    requestAnimationFrame(animateAg);
    agCtx.clearRect(0, 0, agCanvas.width, agCanvas.height);
    agOrbs.forEach(o => { o.update(); o.draw(); });
  }
  animateAg();
}

// ═══════════════════════════════════════
// 5. SCROLL-TRIGGERED REVEAL ANIMATIONS
// ═══════════════════════════════════════
// Services cards
gsap.utils.toArray('.service-card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
    delay: i * 0.08,
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      once: true,
    }
  });
});

// Testimonials
gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
    delay: i * 0.12,
    scrollTrigger: {
      trigger: card,
      start: 'top 88%',
      once: true,
    }
  });
});

// Section headers
gsap.utils.toArray('.section-header').forEach(header => {
  gsap.from(header, {
    opacity: 0,
    y: 40,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: header,
      start: 'top 85%',
      once: true,
    }
  });
});

// About section text
gsap.from('.ag-text-col', {
  opacity: 0,
  x: -60,
  duration: 1,
  ease: 'power3.out',
  scrollTrigger: { trigger: '.ag-content', start: 'top 80%', once: true }
});
gsap.from('.ag-visual-col', {
  opacity: 0,
  x: 60,
  duration: 1,
  ease: 'power3.out',
  scrollTrigger: { trigger: '.ag-content', start: 'top 80%', once: true }
});

// Gallery items
gsap.utils.toArray('.gallery-item').forEach((item, i) => {
  gsap.from(item, {
    opacity: 0,
    scale: 0.95,
    duration: 0.7,
    delay: i * 0.1,
    ease: 'power3.out',
    scrollTrigger: { trigger: item, start: 'top 88%', once: true }
  });
});

// Booking form
gsap.from('.booking-form-col', {
  opacity: 0,
  y: 50,
  duration: 0.9,
  ease: 'power3.out',
  scrollTrigger: { trigger: '.booking-container', start: 'top 80%', once: true }
});
gsap.from('.booking-text-col', {
  opacity: 0,
  x: -50,
  duration: 0.9,
  ease: 'power3.out',
  scrollTrigger: { trigger: '.booking-container', start: 'top 80%', once: true }
});

// ═══════════════════════════════════════
// 6. PARALLAX TOOTH on TESTIMONIALS
// ═══════════════════════════════════════
const testimonialTooth = document.getElementById('testimonialTooth');
if (testimonialTooth) {
  gsap.to('.testimonial-tooth-wrap', {
    yPercent: -30,
    ease: 'none',
    scrollTrigger: {
      trigger: '.testimonials-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
    }
  });
}

// ═══════════════════════════════════════
// 7. PARALLAX HERO VIDEO
// ═══════════════════════════════════════
gsap.to('.hero-video', {
  yPercent: 20,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
  }
});

// ═══════════════════════════════════════
// 8. COUNTER ANIMATION (Stats)
// ═══════════════════════════════════════
function animateCounter(el, target, suffix = '') {
  const start = 0;
  const duration = 1800;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Observe stats
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-num');
      const targets = [15, 4800, 98];
      const suffixes = ['+', '+', '%'];
      nums.forEach((el, i) => animateCounter(el, targets[i], suffixes[i]));
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObserver.observe(statsEl);

// ═══════════════════════════════════════
// 9. SERVICE CARD MAGNETIC HOVER
// ═══════════════════════════════════════
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotX = -(y / rect.height) * 8;
    const rotY =  (x / rect.width)  * 8;
    card.style.transform = `translateY(-8px) scale(1.01) perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

    // Move glow to cursor
    const glow = card.querySelector('.service-card-glow');
    if (glow) {
      glow.style.left = `${e.clientX - rect.left - 150}px`;
      glow.style.top  = `${e.clientY - rect.top  - 150}px`;
      glow.style.width = '300px';
      glow.style.height = '300px';
      glow.style.opacity = '1';
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    const glow = card.querySelector('.service-card-glow');
    if (glow) {
      glow.style.left = '-50%';
      glow.style.top = '-50%';
      glow.style.width = '200%';
      glow.style.height = '200%';
      glow.style.opacity = '0';
    }
  });
});

// ═══════════════════════════════════════
// 10. BOOKING FORM — UX LOGIC
// ═══════════════════════════════════════
const bookingForm = document.getElementById('bookingForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn   = document.getElementById('submitBtn');
const submitText  = document.getElementById('submitText');
const btnLoader   = document.getElementById('btnLoader');

// Set min date to today
const dateInput = document.getElementById('apptDate');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
}

bookingForm?.addEventListener('submit', async e => {
  e.preventDefault();

  // Validate
  const requiredFields = bookingForm.querySelectorAll('[required]');
  let valid = true;
  requiredFields.forEach(field => {
    field.style.borderColor = '';
    if (!field.value.trim()) {
      field.style.borderColor = '#ef4444';
      field.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.20)';
      valid = false;
    }
  });
  if (!valid) {
    const firstInvalid = bookingForm.querySelector('[required]:invalid, [style*="ef4444"]');
    firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Loading state
  submitText.style.display = 'none';
  btnLoader.style.display  = 'block';
  submitBtn.disabled = true;

  // Simulate API call
  await new Promise(r => setTimeout(r, 1800));

  // Show success
  bookingForm.style.display = 'none';
  formSuccess.style.display = 'block';
  gsap.from(formSuccess, { opacity: 0, y: 30, duration: 0.7, ease: 'power3.out' });
  formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Input focus effects
document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(el => {
  el.addEventListener('focus', () => {
    el.style.borderColor = '';
    el.style.boxShadow = '';
  });
});

// ═══════════════════════════════════════
// 11. SMOOTH ACTIVE NAV LINK
// ═══════════════════════════════════════
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const activeA = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      activeA?.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ═══════════════════════════════════════
// 12. CURSOR TRAIL EFFECT (subtle)
// ═══════════════════════════════════════
const trail = [];
const TRAIL_COUNT = 6;
for (let i = 0; i < TRAIL_COUNT; i++) {
  const dot = document.createElement('div');
  dot.style.cssText = `
    position: fixed; width: ${8 - i}px; height: ${8 - i}px;
    background: rgba(26,120,242,${0.4 - i * 0.06});
    border-radius: 50%; pointer-events: none; z-index: 9999;
    transform: translate(-50%,-50%); transition: none;
    box-shadow: 0 0 ${8 - i}px rgba(26,120,242,0.5);
    opacity: 0;
  `;
  document.body.appendChild(dot);
  trail.push({ el: dot, x: 0, y: 0 });
}

let cursorX = 0, cursorY = 0;
let trailActive = false;

document.addEventListener('mousemove', e => {
  cursorX = e.clientX;
  cursorY = e.clientY;
  if (!trailActive) {
    trailActive = true;
    trail.forEach(t => { t.el.style.opacity = '1'; });
  }
});

function updateTrail() {
  trail.forEach((t, i) => {
    if (i === 0) {
      t.x += (cursorX - t.x) * 0.35;
      t.y += (cursorY - t.y) * 0.35;
    } else {
      t.x += (trail[i-1].x - t.x) * 0.5;
      t.y += (trail[i-1].y - t.y) * 0.5;
    }
    t.el.style.left = t.x + 'px';
    t.el.style.top  = t.y + 'px';
  });
  requestAnimationFrame(updateTrail);
}
updateTrail();

// ═══════════════════════════════════════
// 13. PAGE LOAD PROGRESS BAR
// ═══════════════════════════════════════
(function() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 3px; width: 0;
    background: linear-gradient(90deg, #1a78f2, #00c6ff);
    z-index: 9999; transition: width 0.3s ease;
    box-shadow: 0 0 10px rgba(0,198,255,0.6);
  `;
  document.body.prepend(bar);

  let prog = 0;
  const interval = setInterval(() => {
    prog += Math.random() * 15;
    if (prog > 90) prog = 90;
    bar.style.width = prog + '%';
  }, 200);

  window.addEventListener('load', () => {
    clearInterval(interval);
    bar.style.width = '100%';
    setTimeout(() => { bar.style.opacity = '0'; setTimeout(() => bar.remove(), 400); }, 300);
  });
})();

// ═══════════════════════════════════════
// 14. TESTIMONIALS AUTO-SCROLL hint
// ═══════════════════════════════════════
// Subtle pulse on featured testimonial
gsap.to('.featured-testimonial', {
  boxShadow: '0 0 40px rgba(26,120,242,0.25), 0 20px 60px rgba(0,0,0,0.35)',
  repeat: -1,
  yoyo: true,
  duration: 2.5,
  ease: 'sine.inOut',
});

// ═══════════════════════════════════════
// 15. SECTION BACKGROUND PARALLAX ORBS
// ═══════════════════════════════════════
gsap.to('.b-orb-1', {
  x: 60, y: 40,
  ease: 'none',
  scrollTrigger: { trigger: '.booking-section', start: 'top bottom', end: 'bottom top', scrub: 2 }
});
gsap.to('.b-orb-2', {
  x: -60, y: -40,
  ease: 'none',
  scrollTrigger: { trigger: '.booking-section', start: 'top bottom', end: 'bottom top', scrub: 2 }
});

console.log('%c🦷 LumaSmile Dental Studio', 'font-size:20px;color:#1a78f2;font-weight:bold;');
console.log('%cCrafted with precision & artistry.', 'color:#00c6ff;');

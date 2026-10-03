/* =========================================================
   Cup'O'Chino — Main JavaScript
   GSAP animations, scroll triggers, and interactions
   ========================================================= */

const hasGSAP = typeof window.gsap !== 'undefined';
const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canAnimate = hasGSAP && !prefersReducedMotion;

if (hasGSAP) {
  gsap.registerPlugin(
    ...(hasScrollTrigger ? [ScrollTrigger] : []),
    ...(window.ScrollToPlugin ? [ScrollToPlugin] : []),
    ...(window.SplitText ? [SplitText] : []),
    ...(window.MotionPathPlugin ? [MotionPathPlugin] : []),
    ...(window.DrawSVGPlugin ? [DrawSVGPlugin] : [])
  );
}

const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const saved = localStorage.getItem('cupochino-theme');
  if (saved === 'brown') {
    document.body.classList.add('theme-brown');
    toggle.setAttribute('aria-pressed', 'true');
    toggle.setAttribute('aria-label', 'Switch to olive theme');
  }

  toggle.addEventListener('click', () => {
    const isBrown = document.body.classList.toggle('theme-brown');
    localStorage.setItem('cupochino-theme', isBrown ? 'brown' : 'olive');
    toggle.setAttribute('aria-pressed', String(isBrown));
    toggle.setAttribute('aria-label', isBrown ? 'Switch to olive theme' : 'Switch to brown theme');
  });
}

/* ============================================================
   1. HERO - Letter-by-letter reveal with SplitText plus fallback
   ============================================================ */
function splitTextChars(el) {
  if (window.SplitText) {
    return SplitText.create(el, {
      type: 'words, chars',
      charsClass: 'char',
      aria: 'auto'
    }).chars;
  }
  const text = el.textContent;
  el.textContent = '';
  const chars = [];
  for (const ch of text) {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    span.style.display = 'inline-block';
    el.appendChild(span);
    chars.push(span);
  }
  return chars;
}

function initHero() {
  const title = document.getElementById('heroTitle');
  const chars = splitTextChars(title);

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.hero__eyebrow', { opacity: 0, y: 12, duration: 0.45, ease: 'power2.out' })
    .to('.hero__eyebrow', { opacity: 1, duration: 0.01 }, '<')
    .from(chars, {
      y: 38,
      opacity: 0,
      duration: 0.65,
      stagger: 0.025,
    }, '-=0.22')
    .from('#heroTagline', { y: 18, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.38')
    .to('#heroTagline', { opacity: 1, duration: 0.01 })
    .from('#heroCta', { y: 16, opacity: 0, duration: 0.55, ease: 'power3.out' }, '-=0.4')
    .to('#heroCta', { opacity: 1, duration: 0.01 })
    .from('.hero__scroll', { opacity: 0, y: 20, duration: 0.8 }, '-=0.3')
    .to('.hero__scroll', { opacity: 0.7, duration: 0.01 });

  // Bouncing scroll dot
  gsap.to('#scrollDot', { y: 16, repeat: -1, yoyo: true, duration: 0.9, ease: 'sine.inOut' });
}

/* ============================================================
   2. NAVIGATION — scroll background change + smooth scroll
   ============================================================ */
function initNav() {
  const navbar = document.getElementById('navbar');
  if (hasScrollTrigger && canAnimate) {
    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      toggleClass: { className: 'is-scrolled', targets: navbar },
    });
  } else {
    const syncNav = () => navbar.classList.toggle('is-scrolled', window.scrollY > 80);
    syncNav();
    window.addEventListener('scroll', syncNav, { passive: true });
  }

  // Smooth scroll for all in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      // close mobile overlay if open
      closeOverlay();
      if (canAnimate && window.ScrollToPlugin) {
        gsap.to(window, {
          duration: 1.0,
          scrollTo: { y: target, offsetY: 70, autoKill: false },
          ease: 'power2.inOut'
        });
      } else {
        const top = target.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('navOverlay');
  hamburger.addEventListener('click', () => {
    if (overlay.classList.contains('is-open')) {
      closeOverlay();
    } else {
      openOverlay();
    }
  });

  function openOverlay() {
    overlay.classList.add('is-open');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (canAnimate) {
      gsap.from(overlay.querySelectorAll('li'), {
        y: 30, opacity: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out', delay: 0.1
      });
    }
  }
  function closeOverlay() {
    overlay.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  window.closeOverlay = closeOverlay;
}

function bindMenuCards() {
  document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', () => {
      if (window.matchMedia('(hover: none)').matches) {
        card.classList.toggle('is-flipped');
      }
    });
  });
}

function bindNewsletterForm({ animated = false } = {}) {
  const form = document.getElementById('newsletterForm');
  const input = document.getElementById('newsletterEmail');
  const err = document.getElementById('newsletterError');
  const success = document.getElementById('newsletterSuccess');
  const successText = document.querySelector('.newsletter__success-text');
  if (!form || !input || !err || !success) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    err.textContent = '';
    const val = input.value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(val)) {
      err.textContent = 'Please enter a valid email address.';
      if (animated) gsap.fromTo(form, { x: 0 }, { x: -8, repeat: 5, yoyo: true, duration: 0.06 });
      return;
    }
    console.log('[Cup\'O\'Chino] Newsletter signup:', val);

    const showSuccess = () => {
      form.style.display = 'none';
      success.hidden = false;
      if (animated && successText) {
        const chars = splitTextChars(successText);
        gsap.from(chars, {
          opacity: 0, y: 20, stagger: 0.025, duration: 0.6, ease: 'back.out(1.7)'
        });
      }
    };

    if (animated) {
      gsap.to(form, {
        opacity: 0, y: -20, duration: 0.5, ease: 'power2.in',
        onComplete: showSuccess
      });
    } else {
      showSuccess();
    }
  });
}

function initStaticFallback() {
  document.querySelector('.journey__dot[data-stage="1"]')?.classList.add('active');
  document.querySelector('.journey__label[data-stage="1"]')?.classList.add('active');

  bindMenuCards();
  bindNewsletterForm();

  const items = document.querySelectorAll('.testimonial');
  const dots = document.querySelectorAll('.t-dot');
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = Number(dot.dataset.target);
      items.forEach((item, itemIdx) => item.classList.toggle('active', itemIdx === idx));
      dots.forEach(btn => btn.classList.toggle('active', btn === dot));
    });
  });
}

/* ============================================================
   3. JOURNEY ANIMATION — pinned scroll sequence
   ============================================================ */
function initJourney() {
  if (isMobile()) {
    // Initialise mobile fallback animations
    gsap.utils.toArray('.mob-step').forEach((step, i) => {
      gsap.from(step, {
        opacity: 0, y: 40, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: step, start: 'top 85%' }
      });
    });
    return;
  }

  const photoJourney = document.getElementById('journeyPhoto');
  if (photoJourney) {
    const stages = gsap.utils.toArray('.journey-photo__stage');
    const stageCount = stages.length;
    let activeStage = -1;

    function updatePhotoProgress(stageNum) {
      document.querySelectorAll('.journey__dot').forEach(d => {
        d.classList.toggle('active', parseInt(d.dataset.stage) === stageNum);
        d.classList.toggle('is-past', parseInt(d.dataset.stage) < stageNum);
      });
      document.querySelectorAll('.journey__label').forEach(l => {
        l.classList.toggle('active', parseInt(l.dataset.stage) === stageNum);
      });
    }

    function showPhotoStage(index) {
      if (index === activeStage) return;
      const previousStage = activeStage;
      activeStage = index;
      updatePhotoProgress(index + 1);

      stages.forEach((stage, stageIndex) => {
        const isActive = stageIndex === index;
        stage.classList.toggle('is-active', isActive);
        gsap.killTweensOf(stage);
        gsap.killTweensOf(stage.querySelectorAll('.journey-photo__copy > *, img'));

        if (!isActive) {
          if (stage.classList.contains('was-active')) {
            gsap.to(stage, {
              autoAlpha: 0,
              y: -24,
              scale: 0.985,
              duration: 0.7,
              ease: 'power2.inOut',
              pointerEvents: 'none'
            });
          } else {
            gsap.set(stage, { autoAlpha: 0, y: 46, scale: 0.985, pointerEvents: 'none' });
          }
          stage.classList.remove('was-active');
          return;
        }

        stage.classList.add('was-active');
        gsap.set(stage, { autoAlpha: 0, y: 54, scale: 0.985, pointerEvents: 'auto' });
        gsap.to(stage, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          ease: 'power3.out',
          delay: previousStage === -1 ? 0 : 0.12
        });
        gsap.fromTo(stage.querySelector('img'),
          { autoAlpha: 0, y: 76, scale: 0.94, rotate: -1.5 },
          { autoAlpha: 1, y: 0, scale: 1, rotate: 0, duration: 1.05, ease: 'power3.out', delay: 0.1 }
        );
        gsap.fromTo(stage.querySelectorAll('.journey-photo__copy > *'),
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.7, ease: 'power2.out', delay: 0.22 }
        );
      });
    }

    gsap.set(stages, { autoAlpha: 0, y: 0, scale: 1, pointerEvents: 'none' });
    showPhotoStage(0);

    ScrollTrigger.create({
      trigger: '#journey',
      start: 'top top',
      end: 'bottom bottom',
      pin: '#journey-canvas',
      pinSpacing: false,
      anticipatePin: 1,
      onUpdate: self => {
        const index = Math.min(stageCount - 1, Math.floor(self.progress * stageCount));
        showPhotoStage(index);
      },
      onEnter: () => showPhotoStage(0),
      onEnterBack: () => showPhotoStage(stageCount - 1),
    });

    return;
  }

  // Set initial state: stage 1 visible, others hidden
  gsap.set(['#stage2', '#stage3', '#stage4', '#stage5'], { opacity: 0, visibility: 'hidden' });
  gsap.set('#stage1', { opacity: 1, visibility: 'visible' });

  // Pin the canvas
  ScrollTrigger.create({
    trigger: '#journey',
    start: 'top top',
    end: 'bottom bottom',
    pin: '#journey-canvas',
    pinSpacing: false,
    anticipatePin: 1,
  });

  // ---- Update progress + labels by section ----
  function updateProgress(stageNum) {
    document.querySelectorAll('.journey__dot').forEach(d => {
      d.classList.toggle('active', parseInt(d.dataset.stage) === stageNum);
    });
    document.querySelectorAll('.journey__label').forEach(l => {
      l.classList.toggle('active', parseInt(l.dataset.stage) === stageNum);
    });
  }

  // Show stage 1 label by default
  updateProgress(1);

  // ---- Build stage triggers ----
  // The journey section is 600vh tall. Each stage = 100vh of scroll.
  const stageDuration = '+=100%';

  // -------- STAGE 1: BEAN POUR --------
  const rawBeans = gsap.utils.toArray('.raw-bean');
  // Set initial position: above the canvas
  rawBeans.forEach((bean, i) => {
    const tx = gsap.utils.random(-180, 180);
    const ry = gsap.utils.random(-180, 180);
    gsap.set(bean, {
      transformOrigin: 'center center',
      attr: { transform: `translate(${500 + tx} ${-50 + ry * 0.1})` }
    });
  });

  const stage1Tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#journey',
      start: 'top top',
      end: '20% top',
      scrub: 1,
      onEnter: () => updateProgress(1),
      onEnterBack: () => updateProgress(1),
    }
  });
  rawBeans.forEach((bean, i) => {
    const targetX = 500 + gsap.utils.random(-90, 90);
    const targetY = 460 + gsap.utils.random(-20, 30);
    stage1Tl.to(bean, {
      attr: { transform: `translate(${targetX} ${targetY}) rotate(${gsap.utils.random(-90, 270)})` },
      ease: 'power2.in',
      duration: 1,
    }, i * 0.08);
  });

  // -------- STAGE 2: ROASTING --------
  ScrollTrigger.create({
    trigger: '#journey',
    start: '17% top',
    end: '40% top',
    scrub: 1,
    onEnter: () => updateProgress(2),
    onEnterBack: () => updateProgress(2),
    onUpdate: self => {
      const prog = self.progress;
      gsap.to('#stage1', { opacity: 1 - prog, duration: 0.1, overwrite: 'auto' });
      gsap.to('#stage2', { opacity: prog, visibility: 'visible', duration: 0.1, overwrite: 'auto' });
      if (prog < 0.05) gsap.set('#stage2', { visibility: 'visible' });
      if (prog > 0.95) gsap.set('#stage1', { visibility: 'hidden' });

      // Bean colour shift: green -> brown
      const roastBeans = document.querySelectorAll('.roast-bean');
      const startCol = [74, 124, 63]; // #4A7C3F
      const endCol = [59, 31, 10];    // #3B1F0A
      const r = Math.round(startCol[0] + (endCol[0] - startCol[0]) * prog);
      const g = Math.round(startCol[1] + (endCol[1] - startCol[1]) * prog);
      const b = Math.round(startCol[2] + (endCol[2] - startCol[2]) * prog);
      roastBeans.forEach(rb => rb.setAttribute('fill', `rgb(${r},${g},${b})`));

      // Temp needle rotation
      const needleAngle = -90 + prog * 180;
      const needle = document.getElementById('tempNeedle');
      if (needle) needle.setAttribute('transform', `rotate(${needleAngle})`);
    }
  });

  // Continuous drum rotation while stage 2 visible
  const drumRotation = gsap.to('#drum-spin', {
    rotation: 360, transformOrigin: '50% 50%',
    repeat: -1, duration: 4, ease: 'none', paused: true
  });
  ScrollTrigger.create({
    trigger: '#journey',
    start: '15% top',
    end: '42% top',
    onEnter: () => drumRotation.play(),
    onEnterBack: () => drumRotation.play(),
    onLeave: () => drumRotation.pause(),
    onLeaveBack: () => drumRotation.pause(),
  });

  // Steam animation loop (always running)
  document.querySelectorAll('.steam').forEach((s, i) => {
    gsap.fromTo(s, { y: 20, opacity: 0 }, {
      y: -80, opacity: 0.7, duration: 2.2 + i * 0.3, repeat: -1,
      ease: 'power1.out', delay: i * 0.4,
      onRepeat: () => gsap.set(s, { y: 20, opacity: 0 })
    });
  });

  // -------- STAGE 3: GRINDING --------
  ScrollTrigger.create({
    trigger: '#journey',
    start: '38% top',
    end: '60% top',
    scrub: 1,
    onEnter: () => updateProgress(3),
    onEnterBack: () => updateProgress(3),
    onUpdate: self => {
      const prog = self.progress;
      gsap.to('#stage2', { opacity: 1 - prog, duration: 0.1, overwrite: 'auto' });
      gsap.to('#stage3', { opacity: prog, visibility: 'visible', duration: 0.1, overwrite: 'auto' });
      if (prog > 0.95) gsap.set('#stage2', { visibility: 'hidden' });
    }
  });

  // Continuous grinder spin
  const grinderSpin = gsap.to('#burrs-spin', {
    rotation: 360, transformOrigin: '50% 50%',
    repeat: -1, duration: 0.6, ease: 'none', paused: true
  });
  // Animate grounds falling continuously
  const groundsAnim = gsap.to('.ground', {
    y: 50, opacity: 0, duration: 1, stagger: { each: 0.15, repeat: -1 },
    ease: 'power1.in', repeat: -1, paused: true,
    onRepeat: () => gsap.set('.ground', { y: 0, opacity: 1 })
  });
  ScrollTrigger.create({
    trigger: '#journey',
    start: '40% top',
    end: '60% top',
    onEnter: () => { grinderSpin.play(); groundsAnim.play(); },
    onEnterBack: () => { grinderSpin.play(); groundsAnim.play(); },
    onLeave: () => { grinderSpin.pause(); groundsAnim.pause(); },
    onLeaveBack: () => { grinderSpin.pause(); groundsAnim.pause(); },
  });

  // -------- STAGE 4: TAMPING --------
  ScrollTrigger.create({
    trigger: '#journey',
    start: '58% top',
    end: '78% top',
    scrub: 1,
    onEnter: () => updateProgress(4),
    onEnterBack: () => updateProgress(4),
    onUpdate: self => {
      const prog = self.progress;
      gsap.to('#stage3', { opacity: 1 - prog, duration: 0.1, overwrite: 'auto' });
      gsap.to('#stage4', { opacity: prog, visibility: 'visible', duration: 0.1, overwrite: 'auto' });
      if (prog > 0.95) gsap.set('#stage3', { visibility: 'hidden' });

      // Tamper presses down then back slightly
      let tamperY = 0;
      if (prog < 0.6) tamperY = prog / 0.6 * 200; // press down to 200
      else tamperY = 200 - ((prog - 0.6) / 0.4) * 20; // ease back by 20
      const tamper = document.getElementById('tamper');
      if (tamper) tamper.setAttribute('transform', `translate(500 ${200 + tamperY})`);

      // Pressure arc progress (DrawSVG-style stroke-dasharray)
      const arc = document.getElementById('pressureArc');
      if (arc) {
        if (window.DrawSVGPlugin) {
          gsap.set(arc, { drawSVG: `${prog * 100}%` });
        } else {
          const len = arc.getTotalLength();
          arc.style.strokeDasharray = len;
          arc.style.strokeDashoffset = len * (1 - prog);
        }
      }
      // Pressure value text
      const pv = document.getElementById('pressureValue');
      if (pv) pv.textContent = Math.round(prog * 30) + 'lb';

      // Puck compresses slightly
      const puck = document.getElementById('coffeePuck');
      if (puck) {
        const ry = 8 - prog * 3;
        puck.setAttribute('ry', ry);
      }
    }
  });

  // -------- STAGE 5: EXTRACTION --------
  let espressoDropFlow = null;
  if (window.MotionPathPlugin) {
    espressoDropFlow = gsap.to('#espressoDrop', {
      motionPath: {
        path: '#espressoStream',
        align: '#espressoStream',
        alignOrigin: [0.5, 0.5]
      },
      duration: 0.7,
      ease: 'power1.in',
      repeat: -1,
      paused: true
    });
  }

  ScrollTrigger.create({
    trigger: '#journey',
    start: '76% top',
    end: 'bottom bottom',
    scrub: 1,
    onEnter: () => updateProgress(5),
    onEnterBack: () => updateProgress(5),
    onUpdate: self => {
      const prog = self.progress;
      gsap.to('#stage4', { opacity: 1 - prog, duration: 0.1, overwrite: 'auto' });
      gsap.to('#stage5', { opacity: prog, visibility: 'visible', duration: 0.1, overwrite: 'auto' });
      if (prog > 0.95) gsap.set('#stage4', { visibility: 'hidden' });

      // Machine light turns on
      const light = document.getElementById('machineLight');
      if (light) {
        if (prog > 0.15) light.setAttribute('fill', 'url(#lightOn)');
        else light.setAttribute('fill', '#3A3A3A');
      }

      // Espresso stream draw
      const stream = document.getElementById('espressoStream');
      if (stream) {
        const streamProg = Math.max(0, Math.min(1, (prog - 0.2) / 0.4));
        if (window.DrawSVGPlugin) {
          gsap.set(stream, { drawSVG: `${streamProg * 100}%` });
        } else {
          const len = stream.getTotalLength();
          stream.style.strokeDasharray = len;
          stream.style.strokeDashoffset = len * (1 - streamProg);
        }
        stream.style.opacity = streamProg;
      }
      if (espressoDropFlow) {
        const shouldPour = prog > 0.42;
        gsap.set('#espressoDrop', { opacity: shouldPour ? 1 : 0 });
        if (shouldPour) espressoDropFlow.play();
        else espressoDropFlow.pause(0);
      }

      // Cup fills
      const fillRect = document.getElementById('cupFill');
      if (fillRect) {
        const fillProg = Math.max(0, Math.min(1, (prog - 0.35) / 0.45));
        const maxFill = 48;
        const fillH = fillProg * maxFill;
        fillRect.setAttribute('y', 40 - fillH);
        fillRect.setAttribute('height', fillH);
      }
      // Crema appears
      const crema = document.getElementById('cremaTop');
      if (crema) {
        const cremaProg = Math.max(0, Math.min(1, (prog - 0.55) / 0.3));
        crema.setAttribute('opacity', cremaProg * 0.9);
        const cremaY = 40 - (Math.max(0, Math.min(1, (prog - 0.35) / 0.45)) * 48);
        crema.setAttribute('cy', cremaY);
      }

      // Completion text
      const complete = document.getElementById('stage5-complete');
      if (complete) {
        const tProg = Math.max(0, Math.min(1, (prog - 0.85) / 0.15));
        complete.setAttribute('opacity', tProg);
      }
    }
  });

  // Steam from cup (loop)
  ['#steam1', '#steam2', '#steam3'].forEach((id, i) => {
    const el = document.querySelector(id);
    if (!el) return;
    const len = el.getTotalLength();
    if (window.DrawSVGPlugin) {
      gsap.set(el, { drawSVG: '0%' });
    } else {
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
    }
    gsap.to(el, {
      ...(window.DrawSVGPlugin ? { drawSVG: '100%' } : { strokeDashoffset: 0 }),
      duration: 2, ease: 'power1.out',
      repeat: -1, delay: i * 0.5,
      onRepeat: () => {
        if (window.DrawSVGPlugin) gsap.set(el, { drawSVG: '0%' });
        else el.style.strokeDashoffset = len;
      }
    });
    gsap.to(el, {
      opacity: 0, duration: 2, repeat: -1, ease: 'power1.in', delay: i * 0.5 + 1
    });
  });
}

/* ============================================================
   4. ABOUT — text + steam loop
   ============================================================ */
function initAbout() {
  const heading = document.querySelector('.about__text .section__title');
  if (window.SplitText) {
    const splitHeading = SplitText.create(heading, {
      type: 'lines, words',
      mask: 'lines',
      aria: 'auto'
    });
    gsap.from(splitHeading.words, {
      yPercent: 100, opacity: 0, stagger: 0.045, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: heading, start: 'top 78%' }
    });
  } else {
    gsap.from(heading, {
      y: 40, opacity: 0, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: heading, start: 'top 78%' }
    });
  }
  gsap.from('.about__text .eyebrow, .about__p, .about__stats', {
    y: 40, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power2.out',
    scrollTrigger: { trigger: '.about__text', start: 'top 78%' }
  });
  gsap.from('.about__visual', {
    scale: 0.9, opacity: 0, duration: 1.2, ease: 'power2.out',
    scrollTrigger: { trigger: '.about__visual', start: 'top 75%' }
  });

  // About SVG steam loop
  ['#aboutSteam1', '#aboutSteam2', '#aboutSteam3'].forEach((id, i) => {
    const el = document.querySelector(id);
    if (!el) return;
    const len = el.getTotalLength();
    if (window.DrawSVGPlugin) {
      gsap.set(el, { drawSVG: '0%' });
    } else {
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
    }
    gsap.to(el, {
      ...(window.DrawSVGPlugin ? { drawSVG: '100%' } : { strokeDashoffset: 0 }),
      duration: 2.4, repeat: -1, ease: 'power1.out', delay: i * 0.6,
      onRepeat: () => {
        if (window.DrawSVGPlugin) gsap.set(el, { drawSVG: '0%' });
        else el.style.strokeDashoffset = len;
      }
    });
    gsap.to(el, {
      opacity: 0.1, duration: 2.4, repeat: -1, ease: 'power1.in', delay: i * 0.6 + 1.2,
      yoyo: false,
      onStart: () => gsap.set(el, { opacity: 0.5 })
    });
  });
}

/* ============================================================
   5. MENU — flashcards entrance + tap-to-flip on mobile
   ============================================================ */
function initMenu() {
  gsap.from('.menu__header > *', {
    y: 30, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.menu__header', start: 'top 80%' }
  });
  gsap.from('.menu-card', {
    opacity: 0, y: 60, stagger: 0.12, duration: 0.9, ease: 'power2.out',
    scrollTrigger: { trigger: '.menu__row', start: 'top 80%' }
  });

  // Tap to flip on touch devices
  bindMenuCards();
}

/* ============================================================
   6. PROCESS — Timeline reveal
   ============================================================ */
function initProcess() {
  gsap.from('.process__header > *', {
    y: 30, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.process__header', start: 'top 80%' }
  });
  document.querySelectorAll('.t-step').forEach(step => {
    const isLeft = step.classList.contains('t-step--left');
    gsap.from(step, {
      opacity: 0,
      x: isLeft ? -80 : 80,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: { trigger: step, start: 'top 80%' }
    });
  });
  // Animate the line height
  gsap.from('.timeline__line', {
    scaleY: 0, transformOrigin: 'top center', duration: 1.4, ease: 'power2.inOut',
    scrollTrigger: { trigger: '.timeline', start: 'top 75%' }
  });
}

/* ============================================================
   7. INFO — Cards stagger
   ============================================================ */
function initInfo() {
  gsap.from('.info-card', {
    opacity: 0, y: 60, stagger: 0.15, duration: 0.9, ease: 'power2.out',
    scrollTrigger: { trigger: '.info__row', start: 'top 80%' }
  });
}

/* ============================================================
   8. LOCATION — reveal
   ============================================================ */
function initLocation() {
  gsap.from('.location__header > *', {
    y: 30, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.location__header', start: 'top 80%' }
  });
  gsap.from('.location__map', {
    opacity: 0, x: -40, duration: 1, ease: 'power2.out',
    scrollTrigger: { trigger: '.location__grid', start: 'top 75%' }
  });
  gsap.from('.location__details > *', {
    opacity: 0, x: 40, stagger: 0.08, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.location__grid', start: 'top 75%' }
  });
}

/* ============================================================
   9. TESTIMONIALS — Auto-rotate carousel
   ============================================================ */
function initTestimonials() {
  const items = document.querySelectorAll('.testimonial');
  const dots = document.querySelectorAll('.t-dot');
  let current = 0;
  let timer = null;
  let pauseUntil = 0;

  function show(idx) {
    items.forEach(it => it.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    const prev = items[current];
    const next = items[idx];

    gsap.to(prev, {
      opacity: 0, y: -20, duration: 0.5, ease: 'power2.in',
      onComplete: () => { prev.style.pointerEvents = 'none'; }
    });
    gsap.fromTo(next, { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
      onStart: () => { next.classList.add('active'); next.style.pointerEvents = 'all'; }
    });
    dots[idx].classList.add('active');
    current = idx;
  }

  // Initial: show first
  gsap.set(items[0], { opacity: 1, y: 0 });
  items[0].classList.add('active');
  dots[0].classList.add('active');

  function tick() {
    if (Date.now() < pauseUntil) return;
    show((current + 1) % items.length);
  }
  timer = setInterval(tick, 4000);

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.target);
      if (idx !== current) show(idx);
      pauseUntil = Date.now() + 6000;
    });
  });

  // Entrance
  gsap.from('.testimonials .eyebrow, .testimonials .section__title', {
    y: 30, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.testimonials', start: 'top 75%' }
  });
}

/* ============================================================
   10. NEWSLETTER — Submit + success animation
   ============================================================ */
function initNewsletter() {
  bindNewsletterForm({ animated: true });

  gsap.from('.newsletter__wrap > *', {
    y: 30, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'power2.out',
    scrollTrigger: { trigger: '.newsletter', start: 'top 75%' }
  });
}

/* ============================================================
   11. FOOTER — reveal
   ============================================================ */
function initFooter() {
  gsap.from('.footer__col', {
    y: 40, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.footer', start: 'top 90%' }
  });
}

/* ============================================================
   BOOT
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNav();

  if (canAnimate && hasScrollTrigger) {
    initHero();
    initJourney();
    initAbout();
    initMenu();
    initProcess();
    initInfo();
    initLocation();
    initTestimonials();
    initNewsletter();
    initFooter();
  } else {
    initStaticFallback();
  }

  // Refresh ScrollTrigger after fonts load
  if (document.fonts && hasScrollTrigger) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
});

// Re-init journey on resize (mobile <-> desktop switch)
let resizeTimer;
window.addEventListener('resize', () => {
  if (!hasScrollTrigger) return;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 200);
});

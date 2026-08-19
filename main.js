// Force scroll to top on refresh to prevent Locomotive Scroll height bugs
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Locomotive Scroll & GSAP ScrollTrigger Integration
  let locoScroll = null;

  if (typeof LocomotiveScroll !== 'undefined' && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const scrollContainer = document.querySelector('[data-scroll-container]');

    if (scrollContainer) {
      locoScroll = new LocomotiveScroll({
        el: scrollContainer,
        smooth: true,
        multiplier: 1.0,
        touchMultiplier: 2.0
      });

      locoScroll.on('scroll', ScrollTrigger.update);

      ScrollTrigger.scrollerProxy(scrollContainer, {
        scrollTop(value) {
          return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
          return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
        pinType: scrollContainer.style.transform ? 'transform' : 'fixed'
      });

      ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
      ScrollTrigger.refresh();

      // Ensure layout recalculates after all images/fonts are fully loaded
      window.addEventListener('load', () => {
        locoScroll.update();
        ScrollTrigger.refresh();
      });

      // Ultimate fix for layout shifts: automatically update scroll on height changes
      if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(() => {
          if (locoScroll) locoScroll.update();
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        }).observe(scrollContainer);
      }

      // Initialize Dynamic Scroll Velocity Distortion Engine
      initScrollDistortion(locoScroll);
    }
  }

  // Dynamic Scroll Velocity Distortion Engine (Skew & Vertical Scale Warp)
  function initScrollDistortion(locoInstance) {
    if (typeof gsap === 'undefined') return;

    const sections = document.querySelectorAll('[data-scroll-section]');
    if (!sections.length) return;

    const skewSetters = [];
    const scaleSetters = [];

    sections.forEach((sec) => {
      gsap.set(sec, { transformOrigin: "center center", force3D: true });
      skewSetters.push(gsap.quickTo(sec, "skewY", { duration: 0.4, ease: "power2.out" }));
      scaleSetters.push(gsap.quickTo(sec, "scaleY", { duration: 0.4, ease: "power2.out" }));
    });

    let scrollTimeout = null;

    const applyDistortion = (speed) => {
      // Clamp skew to max +/- 1.8 deg for clean legibility
      const targetSkew = Math.max(-1.8, Math.min(1.8, speed * 0.12));
      // Subtle vertical elastic compression into frame
      const targetScale = 1 - Math.min(0.018, Math.abs(speed) * 0.001);

      skewSetters.forEach(setSkew => setSkew(targetSkew));
      scaleSetters.forEach(setScale => setScale(targetScale));

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        skewSetters.forEach(setSkew => setSkew(0));
        scaleSetters.forEach(setScale => setScale(1));
      }, 120);
    };

    if (locoInstance) {
      locoInstance.on('scroll', (args) => {
        const speed = args.speed || 0;
        applyDistortion(speed);
      });
    } else {
      let lastY = window.scrollY;
      let lastTime = Date.now();
      window.addEventListener('scroll', () => {
        const now = Date.now();
        const dt = Math.max(1, now - lastTime);
        const dy = window.scrollY - lastY;
        const speed = (dy / dt) * 16;
        lastY = window.scrollY;
        lastTime = now;
        applyDistortion(speed);
      }, { passive: true });
    }
  }

  // 2. Custom GSAP Cursor Dot & Expand on Hover
  const cursor = document.getElementById('custom-cursor');
  
  if (cursor && typeof gsap !== 'undefined') {
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power2.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power2.out' });

    window.addEventListener('mousemove', (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    });

    const bindHoverListeners = () => {
      const hoverableElements = document.querySelectorAll('.cursor-hover, a, button, .coverflow-card');
      hoverableElements.forEach((el) => {
        el.addEventListener('mouseenter', () => cursor.classList.add('active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
      });
    };
    bindHoverListeners();

  }

  // 3. Hover Reveal Cards & Looping Word Ticker Animations for Services List
  const servicesSection = document.getElementById('services');

  // 3.5 High-Precision Custom Video Loop (Trim last 0.3s)
  const webdevVideo = document.getElementById('webdev-video');
  if (webdevVideo) {
    const loopTrimVideo = () => {
      if (webdevVideo.duration && webdevVideo.currentTime >= webdevVideo.duration - 0.3) {
        webdevVideo.currentTime = 0;
      }
      requestAnimationFrame(loopTrimVideo);
    };
    webdevVideo.addEventListener('play', () => {
      requestAnimationFrame(loopTrimVideo);
    });
  }

  const serviceRows = document.querySelectorAll('.service-row');

  const isTouchMobile = () => window.innerWidth < 768 || ('ontouchstart' in window) || window.matchMedia('(hover: none)').matches;

  // Track global cursor coordinates for scroll-hover detection
  let lastMouseX = -1;
  let lastMouseY = -1;

  window.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  const allRevealContainers = [];
  let activeRow = null;
  let tickerIntervals = new Map();

  const hideAllReveals = (exceptContainer = null) => {
    allRevealContainers.forEach(({ container, video }) => {
      if (container !== exceptContainer) {
        gsap.to(container, {
          opacity: 0,
          scale: 0.95,
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto",
          onComplete: () => {
            if (video && container !== exceptContainer) {
              video.pause();
            }
          }
        });
      }
    });
  };

  const stopRowTicker = (row) => {
    if (tickerIntervals.has(row)) {
      clearInterval(tickerIntervals.get(row));
      tickerIntervals.delete(row);
    }
  };

  const startRowTicker = (row) => {
    stopRowTicker(row);

    const wordsLeft = row.dataset.wordsLeft ? JSON.parse(row.dataset.wordsLeft) : [];
    const wordsRight = row.dataset.wordsRight ? JSON.parse(row.dataset.wordsRight) : [];

    const leftWordEl = row.querySelector('.left-ticker .ticker-word');
    const rightWordEl = row.querySelector('.right-ticker .ticker-word');

    if (!leftWordEl || !rightWordEl || wordsLeft.length === 0 || wordsRight.length === 0) return;

    let idx = 0;

    const animateWordSwipe = (el, newText) => {
      if (typeof gsap === 'undefined') {
        el.textContent = newText;
        return;
      }

      gsap.to(el, {
        y: "-100%",
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          el.textContent = newText;
          gsap.set(el, { y: "100%", opacity: 0 });
          gsap.to(el, {
            y: "0%",
            opacity: 1,
            duration: 0.35,
            ease: "power2.out"
          });
        }
      });
    };

    const tickerCycle = () => {
      idx = (idx + 1) % wordsLeft.length;
      animateWordSwipe(leftWordEl, wordsLeft[idx]);
      animateWordSwipe(rightWordEl, wordsRight[idx % wordsRight.length]);
    };

    const timer = setInterval(tickerCycle, 1500);
    tickerIntervals.set(row, timer);
  };

  const updateCardPosition = (clientX = null, clientY = null) => {
    if (!activeRow || !activeRow._revealContainer || isTouchMobile()) return;
    const revealContainer = activeRow._revealContainer;
    const cardWidth = revealContainer.offsetWidth;
    const cardHeight = revealContainer.offsetHeight;

    let targetX;
    if (typeof clientX === 'number' && clientX >= 0) {
      targetX = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, clientX - cardWidth / 2));
      revealContainer._lastX = targetX;
    } else {
      targetX = revealContainer._lastX || (window.innerWidth - cardWidth) / 2;
    }

    let targetY;
    if (typeof clientY === 'number' && clientY >= 0) {
      targetY = Math.max(16, Math.min(window.innerHeight - cardHeight - 16, clientY - cardHeight / 2));
      revealContainer._lastY = targetY;
    } else {
      targetY = revealContainer._lastY || (window.innerHeight - cardHeight) / 2;
    }

    gsap.to(revealContainer, {
      x: targetX,
      y: targetY,
      duration: 0.15,
      ease: "power2.out",
      overwrite: "auto"
    });
  };

  const activateRow = (row, clientX, clientY) => {
    if (isTouchMobile() || !row) return;

    if (activeRow !== row) {
      if (activeRow) stopRowTicker(activeRow);
      activeRow = row;

      const revealContainer = row._revealContainer;
      hideAllReveals(revealContainer);
      startRowTicker(row);

      const video = revealContainer.querySelector('video');
      if (video) video.play().catch(() => {});

      gsap.to(revealContainer, { 
        opacity: 1, 
        scale: 1, 
        duration: 0.3, 
        ease: "power3.out",
        overwrite: "auto"
      });
    }

    updateCardPosition(clientX, clientY);
  };

  serviceRows.forEach(row => {
    const revealContainer = row.querySelector('.hover-reveal');
    if (!revealContainer || typeof gsap === 'undefined') return;

    const video = revealContainer.querySelector('video');

    row._revealContainer = revealContainer;
    document.body.appendChild(revealContainer);
    allRevealContainers.push({ container: revealContainer, video });

    row.addEventListener('mouseenter', (e) => {
      activateRow(row, e.clientX, e.clientY);
    });

    row.addEventListener('mousemove', (e) => {
      activateRow(row, e.clientX, e.clientY);
    });

    row.addEventListener('mouseleave', () => {
      // Don't instantly clear if scroll is currently placing cursor on another row
      if (lastMouseX >= 0 && lastMouseY >= 0) {
        const elUnderCursor = document.elementFromPoint(lastMouseX, lastMouseY);
        const hoveredRow = elUnderCursor ? elUnderCursor.closest('.service-row') : null;
        if (hoveredRow) {
          activateRow(hoveredRow, lastMouseX, lastMouseY);
          return;
        }
      }

      stopRowTicker(row);

      if (activeRow === row) {
        activeRow = null;
      }

      gsap.to(revealContainer, { 
        opacity: 0, 
        scale: 0.95, 
        duration: 0.2, 
        ease: "power2.out",
        overwrite: "auto",
        onComplete: () => {
          if (video) video.pause();
        }
      });
    });
  });

  // Handle continuous hover detection while scrolling
  const handleScrollHoverCheck = () => {
    if (isTouchMobile() || lastMouseX < 0 || lastMouseY < 0) return;

    const elUnderCursor = document.elementFromPoint(lastMouseX, lastMouseY);
    const rowUnderCursor = elUnderCursor ? elUnderCursor.closest('.service-row') : null;

    if (rowUnderCursor) {
      activateRow(rowUnderCursor, lastMouseX, lastMouseY);
    } else if (activeRow) {
      hideAllReveals();
      serviceRows.forEach(r => stopRowTicker(r));
      activeRow = null;
    }
  };

  window.addEventListener('scroll', handleScrollHoverCheck, { passive: true });
  if (locoScroll) {
    locoScroll.on('scroll', handleScrollHoverCheck);
  }

  if (servicesSection) {
    servicesSection.addEventListener('mouseleave', () => {
      hideAllReveals();
      serviceRows.forEach(r => stopRowTicker(r));
      activeRow = null;
    });
  }
  window.addEventListener('mouseleave', () => {
    hideAllReveals();
    serviceRows.forEach(r => stopRowTicker(r));
    activeRow = null;
  });

  // 4. GSAP 3D Coverflow Physics Translation (SELECTED BUILDS - 16:9 ASPECT RATIO)
  const init3DCoverflow = () => {
    const stage = document.getElementById('carousel-stage');
    if (!stage) return;

    const portfolioData = [
      {
        title: 'SUNBEAM BAGEL & COFFEE',
        image: './images/sunbeam-cover.png',
        subtext: 'Hospitality & Brand Architecture'
      },
      {
        title: 'EVER CLINIC',
        image: './images/ever-cover.png',
        subtext: 'Medical Aesthetics & UI/UX'
      },
      {
        title: 'YLEM TIMEPIECES',
        image: './images/ylem-cover.png',
        subtext: 'Precision 3D & Product'
      },
      {
        title: 'JOURNEY PORTFOLIO',
        image: './images/journey-cover.png',
        subtext: 'WebGL & Interactive Canvas'
      },
      {
        title: 'CRAV SMASH BURGER',
        image: './images/crav-cover.png',
        subtext: 'Vibrant E-Commerce Brand'
      }
    ];

    let active = 0;
    const n = portfolioData.length;
    const MAX_VISIBLE = 2;
    const DEPTH = 260;
    const SCALE_STEP = 0.15;
    const tilt = 12;
    const sideTilt = 6;
    const gap = 10;

    stage.innerHTML = '';

    const getDimensions = () => {
      const w = window.innerWidth;
      const isTablet = w >= 640 && w < 1024;
      
      let cardWidth;
      if (isTablet) {
        cardWidth = 560; // Keep tablet intact
      } else {
        cardWidth = 860; // Optimized larger size for PC/Laptop
      }
      const cardHeight = Math.round(cardWidth * (9 / 16));
      return { cardWidth, cardHeight };
    };

    const isMobile = window.innerWidth < 640;

    // Remove Slider / Coverflow on Mobile - Standard vertical layout
    if (isMobile) {
      stage.style.perspective = 'none';
      stage.style.minHeight = 'auto';
      stage.className = 'w-full flex flex-col gap-6 px-6 pb-12';
      stage.innerHTML = '';
      
      portfolioData.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'w-full aspect-video bg-[#0A0A0A] border border-[#222222] relative overflow-hidden shadow-xl';
        card.innerHTML = `
          <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover pointer-events-none" />
          <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(10,10,10,0.8)_100%)] shadow-[inset_0_0_60px_20px_rgba(10,10,10,0.7)]"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6 z-10 text-[#F5F5F3] pointer-events-none bg-gradient-to-t from-black/90 via-black/40 to-transparent" style="text-shadow: 0 4px 16px rgba(0,0,0,0.95);">
            <p class="font-mono-tech text-[10px] sm:text-xs uppercase tracking-widest text-[#CCCCCC] mb-0.5">${item.subtext}</p>
            <h3 class="font-heading font-black text-lg sm:text-2xl uppercase tracking-tighter text-[#F5F5F3]">${item.title}</h3>
          </div>
        `;
        stage.appendChild(card);
      });
      return; // Stop initialization of 3D coverflow
    }

    const { cardWidth, cardHeight } = getDimensions();

    const cards = portfolioData.map((item, i) => {
      const card = document.createElement('div');
      card.className = 'coverflow-card absolute rounded-none overflow-hidden bg-[#0A0A0A] border border-[#222222] cursor-pointer cursor-hover select-none shadow-2xl';
      card.style.width = `${cardWidth}px`;
      card.style.height = `${cardHeight}px`;
      card.style.transformStyle = 'preserve-3d';
      card.style.position = 'absolute';
      card.style.top = '50%';
      card.style.left = '50%';
      card.style.marginTop = `-${cardHeight / 2}px`;
      card.style.marginLeft = `-${cardWidth / 2}px`;

      card.innerHTML = `
        <div class="relative w-full h-full overflow-hidden bg-[#0A0A0A] flex items-center justify-center">
          <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover pointer-events-none" />
          <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(10,10,10,0.8)_100%)] shadow-[inset_0_0_60px_20px_rgba(10,10,10,0.7)]"></div>
          <div class="dim-overlay absolute inset-0 bg-black pointer-events-none transition-opacity duration-500" style="opacity: 0;"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6 z-10 text-[#F5F5F3] pointer-events-none bg-gradient-to-t from-black/90 via-black/40 to-transparent" style="text-shadow: 0 4px 16px rgba(0,0,0,0.95);">
            <p class="font-mono-tech text-[10px] sm:text-xs uppercase tracking-widest text-[#CCCCCC] mb-0.5">${item.subtext}</p>
            <h3 class="font-heading font-black text-lg sm:text-2xl uppercase tracking-tighter text-[#F5F5F3]">${item.title}</h3>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        if (active !== i) {
          active = i;
          updateCoverflow();
        }
      });

      stage.appendChild(card);
      return card;
    });

    const updateCoverflow = () => {
      cards.forEach((card, i) => {
        let rel = i - active;
        if (rel > n / 2) rel -= n;
        if (rel < -n / 2) rel += n;

        const ax = Math.abs(rel);
        const sc = Math.max(0.4, 1 - ax * SCALE_STEP);
        const tx = rel * (cardWidth * 0.55); // Dynamic gap based on card size
        const tz = -ax * DEPTH;
        const ry = -rel * tilt;
        const rz = rel * sideTilt;
        const isActive = rel === 0;

        const overlay = card.querySelector('.dim-overlay');
        if (overlay && typeof gsap !== 'undefined') {
          gsap.to(overlay, { opacity: isActive ? 0 : 0.6, duration: 0.6, ease: 'power2.out' });
        }

        card.style.zIndex = 100 - Math.round(ax * 10);
        card.style.visibility = ax > MAX_VISIBLE ? 'hidden' : 'visible';

        if (typeof gsap !== 'undefined') {
          gsap.to(card, {
            x: tx,
            z: tz,
            rotateY: ry,
            rotateZ: rz,
            scale: sc,
            duration: 0.6,
            ease: 'power2.out'
          });
        } else {
          card.style.transform = `translate3d(${tx}px, 0px, ${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`;
        }
      });
    };

    updateCoverflow();
    
    // Infinite looping logic
    let loopInterval = setInterval(() => {
      active = (active + 1) % n;
      updateCoverflow();
    }, 3000);

    stage.addEventListener('mouseenter', () => clearInterval(loopInterval));
    stage.addEventListener('mouseleave', () => {
      loopInterval = setInterval(() => {
        active = (active + 1) % n;
        updateCoverflow();
      }, 3000);
    });

    window.addEventListener('resize', () => {
      // Re-calculate dimensions but do not force a reload (prevents glitch loop on mobile scroll)
      if (window.innerWidth < 640) {
        return; // If it's already mobile, let CSS/layout handle it natively
      }
      
      const { cardWidth, cardHeight } = getDimensions();
      cards.forEach((card) => {
        card.style.width = `${cardWidth}px`;
        card.style.height = `${cardHeight}px`;
        card.style.marginTop = `-${cardHeight / 2}px`;
        card.style.marginLeft = `-${cardWidth / 2}px`;
      });
      updateCoverflow();
    });
  };

  init3DCoverflow();

  // 5. System Loader & Deferred Hero Animations
  const loader = document.getElementById('vel-loader');
  const loaderText = document.getElementById('vel-loader-text');
  const loaderProgress = document.getElementById('vel-loader-progress');

  const playHeroAnimations = () => {
    if (typeof gsap !== 'undefined') {
      gsap.from('#hero-title', {
        y: 40,
        opacity: 0,
        duration: 1.0,
        ease: 'power3.out',
        delay: 0.1
      });

      gsap.from('#hero-subheadline', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.4
      });
    }
  };

  if (loader && typeof gsap !== 'undefined') {
    if (locoScroll) locoScroll.stop();

    let progress = { value: 0 };
    gsap.to(progress, {
      value: 100,
      duration: 2.2,
      ease: "power2.inOut",
      onUpdate: () => {
        if(loaderText) loaderText.innerHTML = Math.round(progress.value) + '%';
        if(loaderProgress) loaderProgress.style.width = progress.value + '%';
      },
      onComplete: () => {
        gsap.to(loader, {
          yPercent: -100,
          duration: 1.2,
          ease: "expo.inOut",
          onComplete: () => {
            if (locoScroll) locoScroll.start();
            loader.remove();
            
            // Force recalculation of layout to prevent cut-offs at the bottom
            setTimeout(() => {
              if (locoScroll) locoScroll.update();
              if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            }, 300);

            playHeroAnimations();
          }
        });
      }
    });
  } else {
    playHeroAnimations();
  }

  // 6. Magnetic Button Hover Effect
  const magneticBtns = document.querySelectorAll('.magnetic-btn');

  magneticBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      if (typeof gsap !== 'undefined') {
        gsap.to(btn, {
          x: x * 0.35,
          y: y * 0.35,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });

    btn.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.3)'
        });
      }
    });
  });

  // 7. Copy Email to Clipboard
  const btnCopyEmail = document.getElementById('btn-copy-email');
  const copyStatus = document.getElementById('copy-status');

  if (btnCopyEmail) {
    btnCopyEmail.addEventListener('click', () => {
      const email = 'hello@vellumestudio.com.au';
      navigator.clipboard.writeText(email).then(() => {
        if (copyStatus) {
          copyStatus.classList.remove('hidden');
          setTimeout(() => copyStatus.classList.add('hidden'), 2500);
        }
      }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        if (copyStatus) {
          copyStatus.classList.remove('hidden');
          setTimeout(() => copyStatus.classList.add('hidden'), 2500);
        }
      });
    });
  }



  // 5. Header Scroll Effect: Transparent at top, solid dark block on scroll
  const headerNav = document.querySelector('.nav-blended');
  if (headerNav) {
    const handleHeaderScroll = (scrollPos) => {
      if (scrollPos > 40) {
        headerNav.classList.add('is-scrolled');
      } else {
        headerNav.classList.remove('is-scrolled');
      }
    };

    window.addEventListener('scroll', () => handleHeaderScroll(window.scrollY));

    if (locoScroll) {
      locoScroll.on('scroll', (args) => {
        handleHeaderScroll(args.scroll.y);
      });
    }
  }

  // 9. Back to Top Smooth Scroll
  const btnBackToTop = document.getElementById('btn-back-to-top');
  if (btnBackToTop) {
    btnBackToTop.addEventListener('click', () => {
      if (locoScroll) {
        locoScroll.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // 10. WebGL Liquid Distortion Hero Background (Desktop Only)
  function initHeroLiquidDistortion() {
    // Only execute on laptop/desktop devices
    if (window.innerWidth < 1024 || ('ontouchstart' in window)) return;

    const container = document.getElementById('hero-liquid-wrapper');
    const canvas = document.getElementById('hero-liquid-canvas');
    const heroSection = document.getElementById('hero-section');
    if (!container || !canvas) return;

    const imageSrc = "./images/Extreme_macro_close-up_of_a_202608051102.jpeg";
    const resolution = 10;
    const cursorSize = 20;
    const intensity = 65;

    // Try WebGL2 first, fallback to WebGL1
    let gl = canvas.getContext("webgl2", { alpha: true, antialias: false, depth: false });
    let isWebGL2 = true;

    if (!gl) {
      gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false }) || canvas.getContext("experimental-webgl");
      isWebGL2 = false;
    }

    if (!gl) return;

    let floatTexType = gl.FLOAT;
    let floatInternalFormat = isWebGL2 ? gl.RGBA16F : gl.RGBA;
    let floatFormat = gl.RGBA;

    if (isWebGL2) {
      gl.getExtension("EXT_color_buffer_float");
      gl.getExtension("OES_texture_float_linear");
    } else {
      const extFloat = gl.getExtension("OES_texture_float");
      const extLinear = gl.getExtension("OES_texture_float_linear");
      if (!extFloat || !extLinear) {
        // Fallback to UNSIGNED_BYTE if float textures aren't supported
        floatTexType = gl.UNSIGNED_BYTE;
        floatInternalFormat = gl.RGBA;
      }
    }

    gl.clearColor(0, 0, 0, 0);

    const cp = intensity / 100;
    const params = {
      cursorRadiusPx: cursorSize,
      cursorPower: 5 + ((cp - 0.1) * (50 - 5)) / (1 - 0.1),
      distortionPower: intensity / 100,
    };
    const overscanFactor = 1.2;
    const innerScale = 5 / 6;
    const pointer = {
      x: 0.5 * container.clientWidth,
      y: 0.5 * container.clientHeight,
      dx: 0,
      dy: 0,
      moved: false,
    };
    const res = { w: 0, h: 0 };
    let outputColor, velocity, divergence, pressure;
    let imageTexture = gl.createTexture();
    let imgRatio = 16 / 9;
    let isHovering = false;

    // Initialize 1x1 dummy black texture while image loads
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([10, 10, 10, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const VERT = `
precision highp float;
varying vec2 vUv;
attribute vec2 a_position;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 u_texel;

void main () {
  vUv = .5 * (a_position + 1.);
  vL = vUv - vec2(u_texel.x, 0.);
  vR = vUv + vec2(u_texel.x, 0.);
  vT = vUv + vec2(0., u_texel.y);
  vB = vUv - vec2(0., u_texel.y);
  gl_Position = vec4(a_position, 0., 1.);
}
`;

    const FRAG_ADVECT = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D u_velocity_texture;
uniform sampler2D u_input_texture;
uniform vec2 u_texel;
uniform vec2 u_output_textel;
uniform float u_dt;
uniform float u_dissipation;

vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
  vec2 st = uv / tsize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);
  vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
  vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
  vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
  vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void main () {
  vec2 coord = vUv - u_dt * bilerp(u_velocity_texture, vUv, u_texel).xy * u_texel;
  vec4 velocity = bilerp(u_input_texture, coord, u_output_textel);
  gl_FragColor = u_dissipation * velocity;
}
`;

    const FRAG_DIVERGENCE = `
precision highp float;
precision highp sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_velocity_texture;

void main () {
  float L = texture2D(u_velocity_texture, vL).x;
  float R = texture2D(u_velocity_texture, vR).x;
  float T = texture2D(u_velocity_texture, vT).y;
  float B = texture2D(u_velocity_texture, vB).y;
  float div = .25 * (R - L + T - B);
  gl_FragColor = vec4(div, 0., 0., 1.);
}
`;

    const FRAG_PRESSURE = `
precision highp float;
precision highp sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_pressure_texture;
uniform sampler2D u_divergence_texture;

void main () {
  float L = texture2D(u_pressure_texture, vL).x;
  float R = texture2D(u_pressure_texture, vR).x;
  float T = texture2D(u_pressure_texture, vT).x;
  float B = texture2D(u_pressure_texture, vB).x;
  float divergence = texture2D(u_divergence_texture, vUv).x;
  float pressure = (L + R + B + T - divergence) * .25;
  gl_FragColor = vec4(pressure, 0., 0., 1.);
}
`;

    const FRAG_GRAD_SUB = `
precision highp float;
precision highp sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_pressure_texture;
uniform sampler2D u_velocity_texture;

void main () {
  float L = texture2D(u_pressure_texture, vL).x;
  float R = texture2D(u_pressure_texture, vR).x;
  float T = texture2D(u_pressure_texture, vT).x;
  float B = texture2D(u_pressure_texture, vB).x;
  vec2 velocity = texture2D(u_velocity_texture, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0., 1.);
}
`;

    const FRAG_POINT = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D u_input_texture;
uniform float u_ratio;
uniform float u_img_ratio;
uniform vec3 u_point_value;
uniform vec2 u_point;
uniform float u_point_size;

void main () {
  vec2 p = vUv - u_point.xy;
  p.x *= u_ratio;
  vec3 splat = .6 * pow(2., -dot(p, p) / u_point_size) * u_point_value;
  vec3 base = texture2D(u_input_texture, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.);
}
`;

    const FRAG_OUTPUT = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform float u_ratio;
uniform float u_img_ratio;
uniform float u_disturb_power;
uniform sampler2D u_output_texture;
uniform sampler2D u_velocity_texture;
uniform sampler2D u_text_texture;
uniform vec2 u_point;
uniform float u_canvas_scale;
uniform float u_inner_scale;

vec2 get_img_uv() {
  vec2 uv = vUv - 0.5;
  uv *= u_canvas_scale;
  uv /= u_inner_scale;

  float containerAspect = u_ratio;
  float imageAspect = u_img_ratio;
  vec2 scale = vec2(1.0);
  if (containerAspect > imageAspect) {
    scale.y = imageAspect / containerAspect;
  } else {
    scale.x = containerAspect / imageAspect;
  }
  uv *= scale;
  return uv + 0.5;
}

vec2 get_frame_uv() {
  vec2 uv = vUv - 0.5;
  uv *= u_canvas_scale;
  uv /= u_inner_scale;
  return uv + 0.5;
}

float get_img_frame_alpha(vec2 uv, float img_frame_width) {
  float img_frame_alpha = smoothstep(0., img_frame_width, uv.x) * smoothstep(1., 1. - img_frame_width, uv.x);
  img_frame_alpha *= smoothstep(0., img_frame_width, uv.y) * smoothstep(1., 1. - img_frame_width, uv.y);
  return img_frame_alpha;
}

vec3 sample_image_smooth(vec2 uv) {
  vec2 uvc = clamp(uv, 0.0, 1.0);
  vec3 base = texture2D(u_text_texture, vec2(uvc.x, 1.0 - uvc.y)).rgb;

  float yBelow = step(uv.y, 0.0);
  float yAbove = step(1.0, uv.y);
  float xLeft = step(uv.x, 0.0);
  float xRight = step(1.0, uv.x);
  float outOfBounds = max(max(yBelow, yAbove), max(xLeft, xRight));

  if (outOfBounds > 0.0) {
    float d = 0.002;
    vec3 sum = vec3(0.0);
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x - d, 0.0, 1.0), 1.0 - clamp(uvc.y - d, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x, 0.0, 1.0), 1.0 - clamp(uvc.y - d, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x + d, 0.0, 1.0), 1.0 - clamp(uvc.y - d, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x - d, 0.0, 1.0), 1.0 - clamp(uvc.y, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x, 0.0, 1.0), 1.0 - clamp(uvc.y, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x + d, 0.0, 1.0), 1.0 - clamp(uvc.y, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x - d, 0.0, 1.0), 1.0 - clamp(uvc.y + d, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x, 0.0, 1.0), 1.0 - clamp(uvc.y + d, 0.0, 1.0))).rgb;
    sum += texture2D(u_text_texture, vec2(clamp(uvc.x + d, 0.0, 1.0), 1.0 - clamp(uvc.y + d, 0.0, 1.0))).rgb;
    base = sum / 9.0;
  }
  return base;
}

void main () {
  float offset = texture2D(u_output_texture, vUv).r;
  vec2 velocity = texture2D(u_velocity_texture, vUv).xy;
  velocity += .001;

  vec2 img_uv = get_img_uv();
  img_uv -= u_disturb_power * normalize(velocity) * offset;
  img_uv -= u_disturb_power * normalize(velocity) * offset;

  vec2 frame_uv = get_frame_uv();
  frame_uv -= u_disturb_power * normalize(velocity) * offset;

  vec3 img = sample_image_smooth(img_uv);
  float opacity = get_img_frame_alpha(frame_uv, .002);
  gl_FragColor = vec4(img * opacity, opacity);
}
`;

    function createShader(source, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader) || "Shader compile error";
        gl.deleteShader(shader);
        throw new Error(info);
      }
      return shader;
    }

    function createProgramFromSources(vsSource, fsSource) {
      const program = gl.createProgram();
      const vs = createShader(vsSource, gl.VERTEX_SHADER);
      const fs = createShader(fsSource, gl.FRAGMENT_SHADER);
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.bindAttribLocation(program, 0, "a_position");
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program) || "Program link error";
        throw new Error(info);
      }
      const uniforms = {};
      const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < uniformCount; i++) {
        const active = gl.getActiveUniform(program, i);
        if (!active) continue;
        uniforms[active.name] = gl.getUniformLocation(program, active.name);
      }
      return { program, uniforms };
    }

    function blit(target = null) {
      const vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
        gl.STATIC_DRAW
      );
      const ebo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array([0, 1, 2, 0, 2, 3]),
        gl.STATIC_DRAW
      );
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    function createFBO(w, h) {
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      
      if (isWebGL2) {
        gl.texImage2D(gl.TEXTURE_2D, 0, floatInternalFormat, w, h, 0, floatFormat, floatTexType, null);
      } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, floatTexType, null);
      }

      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
      );
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);

      return {
        fbo,
        width: w,
        height: h,
        attach(id) {
          gl.activeTexture(gl.TEXTURE0 + id);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          return id;
        },
      };
    }

    function createDoubleFBO(w, h) {
      let fbo1 = createFBO(w, h);
      let fbo2 = createFBO(w, h);
      return {
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        read: () => fbo1,
        write: () => fbo2,
        swap() {
          const tmp = fbo1;
          fbo1 = fbo2;
          fbo2 = tmp;
        },
      };
    }

    const splatProgram = createProgramFromSources(VERT, FRAG_POINT);
    const divergenceProgram = createProgramFromSources(VERT, FRAG_DIVERGENCE);
    const pressureProgram = createProgramFromSources(VERT, FRAG_PRESSURE);
    const gradientSubtractProgram = createProgramFromSources(VERT, FRAG_GRAD_SUB);
    const advectionProgram = createProgramFromSources(VERT, FRAG_ADVECT);
    const displayProgram = createProgramFromSources(VERT, FRAG_OUTPUT);

    resizeCanvas();
    initFBOs();
    setupEvents();
    render(0);
    loadImage(imageSrc);

    function initFBOs() {
      outputColor = createDoubleFBO(res.w, res.h);
      velocity = createDoubleFBO(res.w, res.h);
      divergence = createFBO(res.w, res.h);
      pressure = createDoubleFBO(res.w, res.h);
    }

    function updatePointerPosition(eX, eY) {
      pointer.moved = true;
      pointer.dx = 6 * (eX - pointer.x);
      pointer.dy = 6 * (eY - pointer.y);
      pointer.x = eX;
      pointer.y = eY;
    }

    function setupEvents() {
      const targetElement = heroSection || container;

      const onEnter = () => { isHovering = true; };
      const onLeave = () => { isHovering = false; pointer.moved = false; };
      const onClick = (e) => {
        const rect = container.getBoundingClientRect();
        updatePointerPosition(e.clientX - rect.left, e.clientY - rect.top);
      };
      const onMove = (e) => {
        const rect = container.getBoundingClientRect();
        updatePointerPosition(e.clientX - rect.left, e.clientY - rect.top);
      };
      const onResize = () => {
        resizeCanvas();
        initFBOs();
        if (imageTexture) gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      };

      targetElement.addEventListener("mouseenter", onEnter);
      targetElement.addEventListener("mouseleave", onLeave);
      targetElement.addEventListener("click", onClick);
      targetElement.addEventListener("mousemove", onMove);
      window.addEventListener("resize", onResize);
      
      if (typeof ResizeObserver !== 'undefined') {
        const resizeObserver = new ResizeObserver(() => onResize());
        resizeObserver.observe(container);
      }
    }

    function resizeCanvas() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(2, Math.round(width * overscanFactor * dpr));
      canvas.height = Math.max(2, Math.round(height * overscanFactor * dpr));
      const cssW = width * overscanFactor;
      const cssH = height * overscanFactor;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      const ratio = cssW / cssH;
      const baseResolution = 128 + ((resolution - 1) * (512 - 128)) / 9;
      res.w = Math.round(baseResolution * ratio);
      res.h = Math.round(baseResolution);
    }

    function getPointerUV() {
      const cssW = container.clientWidth * overscanFactor;
      const cssH = container.clientHeight * overscanFactor;
      const dx = 0.5 * (cssW - container.clientWidth);
      const dy = 0.5 * (cssH - container.clientHeight);
      const u = (pointer.x + dx) / cssW;
      const v = 1 - (pointer.y + dy) / cssH;
      return { u, v };
    }

    function loadImage(src) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imgRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
        gl.bindTexture(gl.TEXTURE_2D, imageTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          img
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      };
    }

    function render() {
      const dt = 1 / 60;
      if (pointer.moved) {
        pointer.moved = false;
        gl.useProgram(splatProgram.program);
        gl.uniform1i(
          splatProgram.uniforms.u_input_texture,
          velocity.read().attach(1)
        );
        gl.uniform1f(
          splatProgram.uniforms.u_ratio,
          container.clientWidth / Math.max(1, container.clientHeight)
        );
        const uv = getPointerUV();
        gl.uniform2f(splatProgram.uniforms.u_point, uv.u, uv.v);
        gl.uniform3f(
          splatProgram.uniforms.u_point_value,
          pointer.dx,
          -pointer.dy,
          0
        );
        const ch = Math.max(1, container.clientHeight);
        const rr = params.cursorRadiusPx / ch;
        gl.uniform1f(splatProgram.uniforms.u_point_size, rr * rr);
        blit(velocity.write());
        velocity.swap();
        gl.uniform1i(
          splatProgram.uniforms.u_input_texture,
          outputColor.read().attach(1)
        );
        gl.uniform3f(
          splatProgram.uniforms.u_point_value,
          params.cursorPower * 0.001,
          0,
          0
        );
        blit(outputColor.write());
        outputColor.swap();
      }
      gl.useProgram(divergenceProgram.program);
      gl.uniform2f(
        divergenceProgram.uniforms.u_texel,
        velocity.texelSizeX,
        velocity.texelSizeY
      );
      gl.uniform1i(
        divergenceProgram.uniforms.u_velocity_texture,
        velocity.read().attach(1)
      );
      blit(divergence);
      gl.useProgram(pressureProgram.program);
      gl.uniform2f(
        pressureProgram.uniforms.u_texel,
        velocity.texelSizeX,
        velocity.texelSizeY
      );
      gl.uniform1i(
        pressureProgram.uniforms.u_divergence_texture,
        divergence.attach(1)
      );
      for (let i = 0; i < 16; i++) {
        gl.uniform1i(
          pressureProgram.uniforms.u_pressure_texture,
          pressure.read().attach(2)
        );
        blit(pressure.write());
        pressure.swap();
      }
      gl.useProgram(gradientSubtractProgram.program);
      gl.uniform2f(
        gradientSubtractProgram.uniforms.u_texel,
        velocity.texelSizeX,
        velocity.texelSizeY
      );
      gl.uniform1i(
        gradientSubtractProgram.uniforms.u_pressure_texture,
        pressure.read().attach(1)
      );
      gl.uniform1i(
        gradientSubtractProgram.uniforms.u_velocity_texture,
        velocity.read().attach(2)
      );
      blit(velocity.write());
      velocity.swap();
      gl.useProgram(advectionProgram.program);
      gl.uniform2f(
        advectionProgram.uniforms.u_texel,
        velocity.texelSizeX,
        velocity.texelSizeY
      );
      gl.uniform2f(
        advectionProgram.uniforms.u_output_textel,
        velocity.texelSizeX,
        velocity.texelSizeY
      );
      gl.uniform1i(
        advectionProgram.uniforms.u_velocity_texture,
        velocity.read().attach(1)
      );
      gl.uniform1i(
        advectionProgram.uniforms.u_input_texture,
        velocity.read().attach(1)
      );
      gl.uniform1f(advectionProgram.uniforms.u_dt, dt);
      gl.uniform1f(advectionProgram.uniforms.u_dissipation, 0.97);
      blit(velocity.write());
      velocity.swap();
      gl.useProgram(advectionProgram.program);
      gl.uniform2f(
        advectionProgram.uniforms.u_output_textel,
        outputColor.texelSizeX,
        outputColor.texelSizeY
      );
      gl.uniform1i(
        advectionProgram.uniforms.u_input_texture,
        outputColor.read().attach(2)
      );
      gl.uniform1f(advectionProgram.uniforms.u_dt, 8 * dt);
      gl.uniform1f(advectionProgram.uniforms.u_dissipation, 0.98);
      blit(outputColor.write());
      outputColor.swap();
      gl.useProgram(displayProgram.program);
      const uv2 = getPointerUV();
      gl.uniform2f(displayProgram.uniforms.u_point, uv2.u, uv2.v);
      gl.uniform1i(
        displayProgram.uniforms.u_velocity_texture,
        velocity.read().attach(2)
      );
      gl.uniform1f(
        displayProgram.uniforms.u_ratio,
        container.clientWidth / Math.max(1, container.clientHeight)
      );
      gl.uniform1f(displayProgram.uniforms.u_img_ratio, imgRatio);
      gl.uniform1f(
        displayProgram.uniforms.u_disturb_power,
        params.distortionPower
      );
      gl.uniform1i(
        displayProgram.uniforms.u_output_texture,
        outputColor.read().attach(1)
      );
      gl.uniform1f(displayProgram.uniforms.u_canvas_scale, 1);
      gl.uniform1f(displayProgram.uniforms.u_inner_scale, innerScale);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.uniform1i(displayProgram.uniforms.u_text_texture, 0);

      blit();
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

      requestAnimationFrame(render);
    }
  }

  // initHeroLiquidDistortion();

  // 11. Dynamic CTA Word Slider (Random Letter Drop)
  const ctaSlider = document.getElementById('cta-word-slider');
  if (ctaSlider && typeof gsap !== 'undefined') {
    const words = ["LET'S TALK", "PING US", "CONNECT", "INQUIRE"];
    let currentWordIndex = 0;
    
    const createSpans = (word) => {
      ctaSlider.innerHTML = '';
      const spans = [];
      for (let i = 0; i < word.length; i++) {
        const span = document.createElement('span');
        span.textContent = word[i] === ' ' ? '\u00A0' : word[i];
        span.style.display = 'inline-block';
        span.style.willChange = 'transform, opacity';
        ctaSlider.appendChild(span);
        spans.push(span);
      }
      return spans;
    };
    
    let currentSpans = createSpans(words[currentWordIndex]);
    
    const animateNextWord = () => {
      const nextWordIndex = (currentWordIndex + 1) % words.length;
      const nextWord = words[nextWordIndex];
      
      gsap.to(currentSpans, {
        y: 60,
        opacity: 0,
        duration: 0.4,
        stagger: {
          amount: 0.2,
          from: "random"
        },
        ease: "power2.in",
        onComplete: () => {
          currentSpans = createSpans(nextWord);
          gsap.set(currentSpans, { y: -60, opacity: 0 });
          gsap.to(currentSpans, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: {
              amount: 0.3,
              from: "random"
            },
            ease: "back.out(1.5)"
          });
          currentWordIndex = nextWordIndex;
        }
      });
    };
    
    setInterval(animateNextWord, 3000);
  }

  // 11. FAQ Accordions Interactivity
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
    faqItems.forEach((item) => {
      const trigger = item.querySelector('.faq-trigger');
      const answer = item.querySelector('.faq-answer');
      const icon = item.querySelector('.faq-icon');

      if (trigger && answer) {
        trigger.addEventListener('click', () => {
          const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

          // Close all other open accordion items
          faqItems.forEach((otherItem) => {
            if (otherItem !== item) {
              const otherTrigger = otherItem.querySelector('.faq-trigger');
              const otherAnswer = otherItem.querySelector('.faq-answer');
              const otherIcon = otherItem.querySelector('.faq-icon');
              if (otherTrigger && otherAnswer) {
                otherTrigger.setAttribute('aria-expanded', 'false');
                otherAnswer.style.maxHeight = null;
                if (otherIcon) {
                  otherIcon.textContent = '+';
                  otherIcon.style.transform = 'rotate(0deg)';
                }
              }
            }
          });

          // Toggle current accordion item
          if (isExpanded) {
            trigger.setAttribute('aria-expanded', 'false');
            answer.style.maxHeight = null;
            if (icon) {
              icon.textContent = '+';
              icon.style.transform = 'rotate(0deg)';
            }
          } else {
            trigger.setAttribute('aria-expanded', 'true');
            answer.style.maxHeight = answer.scrollHeight + 'px';
            if (icon) {
              icon.textContent = '-';
              icon.style.transform = 'rotate(180deg)';
            }
          }

          // Recalculate Locomotive Scroll and GSAP ScrollTrigger after transition
          setTimeout(() => {
            if (locoScroll) locoScroll.update();
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
          }, 350);
        });
      }
    });
  }
});



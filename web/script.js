document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('aria-controls');
      tabButtons.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.remove('is-active');
        p.hidden = true;
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(targetId);
      panel.hidden = false;
      panel.classList.add('is-active');
    });
  });

  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.innerHTML = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.innerHTML = prefix + target.toFixed(decimals) + suffix;
    };
    if (prefersReducedMotion) {
      el.innerHTML = prefix + target.toFixed(decimals) + suffix;
    } else {
      requestAnimationFrame(step);
    }
  };
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => countObserver.observe(el));

  /* Static KPI (the "IA" tile) just needs to render once */
  document.querySelectorAll('[data-static]').forEach(el => {
    el.textContent = el.dataset.static;
  });

  const flowSvg = document.querySelector('.flow-diagram');
  if (flowSvg) {
    const nodesGroup = flowSvg.querySelector('.flow-nodes');
    const cx = 360, cy = 310, r = 230;
    const total = 6;
    for (let i = 0; i < total; i++) {
      const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('data-index', i);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', 26);
      circle.classList.add('flow-node-circle');
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', y + 5);
      label.setAttribute('text-anchor', 'middle');
      label.classList.add('flow-node-label');
      label.textContent = '0' + (i + 1);
      g.appendChild(circle);
      g.appendChild(label);
      nodesGroup.appendChild(g);
    }

    const nodeCircles = nodesGroup.querySelectorAll('.flow-node-circle');
    const flowListItems = document.querySelectorAll('.flow-list li');
    let activeIndex = 0;
    const setActive = (idx) => {
      nodeCircles.forEach((c, i) => c.classList.toggle('active', i === idx));
      flowListItems.forEach((li, i) => li.style.fontWeight = i === idx ? '700' : '400');
    };
    setActive(0);

    if (!prefersReducedMotion) {
      let cycleTimer = null;
      const startCycle = () => {
        if (cycleTimer) return;
        cycleTimer = setInterval(() => {
          activeIndex = (activeIndex + 1) % total;
          setActive(activeIndex);
        }, 1800);
      };
      const stopCycle = () => { clearInterval(cycleTimer); cycleTimer = null; };
      const flowObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) startCycle();
          else stopCycle();
        });
      }, { threshold: 0.3 });
      flowObserver.observe(flowSvg);
    }

    flowListItems.forEach((li, i) => {
      li.style.cursor = 'pointer';
      li.addEventListener('mouseenter', () => { activeIndex = i; setActive(i); });
    });
  }

  const chatSection = document.getElementById('chat-body');
  const botBubble = document.getElementById('bot-bubble');
  if (chatSection && botBubble) {
    let played = false;
    const playChat = () => {
      if (played) return;
      played = true;
      const message = 'Podría ser el sensor de presión de neumáticos. Revisá la presión y, si sigue prendida, agendá con un taller cercano.';
      setTimeout(() => {
        botBubble.innerHTML = '';
        botBubble.textContent = message;
      }, prefersReducedMotion ? 0 : 1400);
    };
    if (prefersReducedMotion) {
      playChat();
    } else {
      const chatObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            playChat();
            chatObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      chatObserver.observe(chatSection);
    }
  }

  const chartSvg = document.getElementById('line-chart');
  if (chartSvg) {
    const years = [0, 1, 2, 3, 4, 5];
    const preventivo = [0, 180, 340, 480, 610, 720];
    const reactivo = [0, 90, 260, 560, 980, 1500];

    const padLeft = 40, padRight = 20, padTop = 20, padBottom = 40;
    const width = 480 - padLeft - padRight;
    const height = 240 - padTop - padBottom;
    const maxVal = Math.max(...reactivo);

    const toPoints = (arr) => arr.map((v, i) => {
      const x = padLeft + (width * i) / (arr.length - 1);
      const y = padTop + height - (height * v) / maxVal;
      return `${x},${y}`;
    }).join(' ');

    const prevLine = chartSvg.querySelector('.line-preventivo');
    const reactLine = chartSvg.querySelector('.line-reactivo');

    const drawChart = () => {
      prevLine.setAttribute('points', toPoints(preventivo));
      reactLine.setAttribute('points', toPoints(reactivo));

      if (!prefersReducedMotion) {
        [prevLine, reactLine].forEach(line => {
          const length = line.getTotalLength();
          line.style.strokeDasharray = length;
          line.style.strokeDashoffset = length;
          line.getBoundingClientRect(); // force reflow
          line.style.transition = 'stroke-dashoffset 1.4s ease';
          requestAnimationFrame(() => { line.style.strokeDashoffset = '0'; });
        });
      }
    };

    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          drawChart();
          chartObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    chartObserver.observe(chartSvg);
  }

});

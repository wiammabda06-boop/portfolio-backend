
const API_URL = 'http://localhost:3001/send-email';


(function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');
  if (!cursor || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function track() {
    rx += (mx - rx) * .15;
    ry += (my - ry) * .15;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(track);
  })();

  const hoverEls = document.querySelectorAll('a, button, .btn, .project-card, .acard, .lang-card, .clink, .trait');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '16px';
      cursor.style.height = '16px';
      ring.style.width  = '54px';
      ring.style.height = '54px';
      ring.style.borderColor = 'var(--accent2)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '8px';
      cursor.style.height = '8px';
      ring.style.width  = '36px';
      ring.style.height = '36px';
      ring.style.borderColor = 'var(--accent)';
    });
  });
})();


(function initNav() {
  const nav     = document.getElementById('nav');
  const ham     = document.getElementById('hamburger');
  const mob     = document.getElementById('navMobile');
  const overlay = document.getElementById('navOverlay');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

 
  function openMenu()  { mob.classList.add('open');    overlay.classList.add('open'); }
  function closeMenu() { mob.classList.remove('open'); overlay.classList.remove('open'); }

  ham.addEventListener('click', () => mob.classList.contains('open') ? closeMenu() : openMenu());
  overlay.addEventListener('click', closeMenu);
  mob.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
})();


(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
})();


(function initSkillBars() {
  const fills = document.querySelectorAll('.sr-fill');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const row = e.target.closest('.skill-row');
        const pct = row ? row.dataset.pct : '0';
        e.target.style.width = pct + '%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  fills.forEach(f => obs.observe(f));
})();


(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;
    let current = '';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) current = sec.id;
    });
    links.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current ? 'var(--accent)' : '';
    });
  }, { passive: true });
})();


(function initParallax() {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        heroContent.style.transform = `translateY(${y * 0.18}px)`;
        heroContent.style.opacity = 1 - y / 600;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


(function initContactForm() {
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const btnText    = document.getElementById('btnText');
  const statusDiv  = document.getElementById('formStatus');

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

   
    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      showStatus('error', ' Please fill in all fields.');
      return;
    }
    if (!isValidEmail(email)) {
      showStatus('error', ' Please enter a valid email address.');
      return;
    }

    
    submitBtn.disabled = true;
    btnText.textContent = 'Sending…';
    submitBtn.querySelector('i').className = 'fa-solid fa-spinner fa-spin';
    hideStatus();

    try {
      const res = await fetch(API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, message })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showStatus('success', ' Message sent! Wiam will get back to you soon.');
        form.reset();
      } else {
        showStatus('error', data.message || ' Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Send error:', err);
      showStatus('error', ' Could not reach the server. Make sure it is running on port 3001.');
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Send Message';
      submitBtn.querySelector('i').className = 'fa-solid fa-paper-plane';
    }
  });

  function showStatus(type, msg) {
    statusDiv.textContent = msg;
    statusDiv.className = 'form-status ' + type;
  }
  function hideStatus() {
    statusDiv.className = 'form-status';
    statusDiv.textContent = '';
  }
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
})();


document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const id = this.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

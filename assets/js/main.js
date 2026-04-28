const glow = document.getElementById('cursorGlow');
if (glow) {
  document.addEventListener('mousemove', event => {
    glow.style.left = event.clientX + 'px';
    glow.style.top = event.clientY + 'px';
  });
}

const canvas = document.getElementById('universe');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const COLORS = ['#7c3aed', '#06b6d4', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#818cf8', '#2dd4bf'];
  let stars = [];
  let shards = [];
  let orbs = [];
  let particles = [];
  let frame = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < 220; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.2,
        alpha: Math.random() * 0.7 + 0.15,
        tw: Math.random() * 0.02 + 0.004,
        twOff: Math.random() * Math.PI * 2
      });
    }
  }

  function makeShard(x, y) {
    const points = [];
    const count = Math.floor(Math.random() * 4) + 3;
    const baseRadius = Math.random() * 90 + 30;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 1.1;
      const radius = baseRadius * (0.5 + Math.random() * 0.7);
      points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    }

    return {
      x: x ?? Math.random() * canvas.width,
      y: y ?? Math.random() * canvas.height,
      pts: points,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.18,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.004,
      alpha: Math.random() * 0.18 + 0.04,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shimmer: Math.random() * 0.008 + 0.002,
      shimOff: Math.random() * Math.PI * 2,
      life: 0,
      maxLife: 600 + Math.random() * 400
    };
  }

  function initShards() {
    shards = [];
    for (let i = 0; i < 28; i++) {
      shards.push(makeShard());
    }
  }

  function initOrbs() {
    orbs = [];
    const orbColors = [
      ['#7c3aed', '#818cf8'],
      ['#06b6d4', '#34d399'],
      ['#f472b6', '#fbbf24'],
      ['#f87171', '#f472b6']
    ];
    for (let i = 0; i < 5; i++) {
      const pair = orbColors[i % orbColors.length];
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 120 + Math.random() * 200,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.18,
        c1: pair[0],
        c2: pair[1],
        alpha: 0.06 + Math.random() * 0.07,
        pulse: Math.random() * 0.005,
        pulseOff: Math.random() * Math.PI * 2
      });
    }
  }

  function spawnParticle(x, y) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      r: Math.random() * 2.5 + 0.5,
      alpha: 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife: 60 + Math.random() * 40
    });
  }

  function initUniverse() {
    initStars();
    initShards();
    initOrbs();
  }

  function drawUniverse() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bg = ctx.createRadialGradient(canvas.width * 0.4, canvas.height * 0.3, 0, canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.85);
    bg.addColorStop(0, '#0f0a1a');
    bg.addColorStop(0.5, '#080b18');
    bg.addColorStop(1, '#030408');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    orbs.forEach(orb => {
      orb.x += orb.vx;
      orb.y += orb.vy;
      if (orb.x < -orb.r) orb.x = canvas.width + orb.r;
      if (orb.x > canvas.width + orb.r) orb.x = -orb.r;
      if (orb.y < -orb.r) orb.y = canvas.height + orb.r;
      if (orb.y > canvas.height + orb.r) orb.y = -orb.r;
      const pulsedRadius = orb.r * (1 + 0.08 * Math.sin(frame * orb.pulse + orb.pulseOff));
      const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, pulsedRadius);
      gradient.addColorStop(0, orb.c1 + Math.round(orb.alpha * 255).toString(16).padStart(2, '0'));
      gradient.addColorStop(0.5, orb.c2 + '18');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, pulsedRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    stars.forEach(star => {
      const alpha = star.alpha * (0.6 + 0.4 * Math.sin(frame * star.tw + star.twOff));
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    });

    shards.forEach((shard, index) => {
      shard.life++;
      if (shard.life > shard.maxLife) {
        shards[index] = makeShard();
        return;
      }
      shard.x += shard.vx;
      shard.y += shard.vy;
      shard.rot += shard.rotV;
      if (shard.x < -200) shard.x = canvas.width + 200;
      if (shard.x > canvas.width + 200) shard.x = -200;
      if (shard.y < -200) shard.y = canvas.height + 200;
      if (shard.y > canvas.height + 200) shard.y = -200;

      const fade = Math.min(1, shard.life / 60) * Math.min(1, (shard.maxLife - shard.life) / 80);
      const shimmerAlpha = shard.alpha * fade * (0.5 + 0.5 * Math.sin(frame * shard.shimmer + shard.shimOff));

      ctx.save();
      ctx.translate(shard.x, shard.y);
      ctx.rotate(shard.rot);
      ctx.beginPath();
      ctx.moveTo(shard.pts[0].x, shard.pts[0].y);
      shard.pts.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.closePath();

      const hex = shard.color;
      const red = parseInt(hex.slice(1, 3), 16);
      const green = parseInt(hex.slice(3, 5), 16);
      const blue = parseInt(hex.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${red},${green},${blue},${shimmerAlpha * 0.55})`;
      ctx.fill();

      const shineGradient = ctx.createLinearGradient(shard.pts[0].x, shard.pts[0].y, shard.pts[Math.floor(shard.pts.length / 2)].x, shard.pts[Math.floor(shard.pts.length / 2)].y);
      shineGradient.addColorStop(0, `rgba(255,255,255,${shimmerAlpha * 0.5})`);
      shineGradient.addColorStop(0.4, `rgba(255,255,255,${shimmerAlpha * 0.1})`);
      shineGradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = shineGradient;
      ctx.fill();

      ctx.strokeStyle = `rgba(${red},${green},${blue},${shimmerAlpha * 1.2})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(shard.pts[0].x * 0.3, shard.pts[0].y * 0.3, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${shimmerAlpha * 0.9})`;
      ctx.fill();
      ctx.restore();
    });

    particles = particles.filter(particle => particle.life < particle.maxLife);
    particles.forEach(particle => {
      particle.life++;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.97;
      particle.vy *= 0.97;
      const alpha = particle.alpha * (1 - particle.life / particle.maxLife);
      const hex = particle.color;
      const red = parseInt(hex.slice(1, 3), 16);
      const green = parseInt(hex.slice(3, 5), 16);
      const blue = parseInt(hex.slice(5, 7), 16);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r * (1 - particle.life / particle.maxLife), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${red},${green},${blue},${alpha})`;
      ctx.fill();
    });

    frame++;
    requestAnimationFrame(drawUniverse);
  }

  resize();
  initUniverse();
  drawUniverse();

  window.addEventListener('resize', () => {
    resize();
    initUniverse();
  });

  canvas.addEventListener('click', event => {
    for (let i = 0; i < 3; i++) {
      shards.push(makeShard(event.clientX + (Math.random() - 0.5) * 60, event.clientY + (Math.random() - 0.5) * 60));
    }
    for (let i = 0; i < 12; i++) {
      spawnParticle(event.clientX, event.clientY);
    }
  });
}

const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(element => observer.observe(element));

const skillSection = document.getElementById('skills');
if (skillSection) {
  const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-card').forEach(card => {
          const pct = card.dataset.skill;
          const bar = card.querySelector('.skill-bar');
          setTimeout(() => {
            if (bar) {
              bar.style.width = pct + '%';
            }
          }, 150 + Math.random() * 400);
        });
      }
    });
  }, { threshold: 0.2 });
  skillObserver.observe(skillSection);
}

function handleSubmit(event) {
  event.preventDefault();
  const button = event.target.querySelector('button[type=submit]');
  if (!button) {
    return;
  }

  const originalText = button.innerHTML;
  button.innerHTML = 'Message Sent!';
  button.style.background = 'linear-gradient(135deg, #34d399, #06b6d4)';

  setTimeout(() => {
    button.innerHTML = originalText;
    button.style.background = '';
    event.target.reset();
  }, 3000);
}

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', handleSubmit);
}

window.addEventListener('scroll', () => {
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];
  const scrollY = window.scrollY + 100;
  sections.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }
    if (scrollY >= element.offsetTop && scrollY < element.offsetTop + element.offsetHeight) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === '#' + id ? 'rgba(255,255,255,0.95)' : '';
      });
    }
  });
});

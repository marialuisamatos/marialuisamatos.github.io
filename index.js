// Lógica do Carrossel de Certificados
const carousel = document.querySelector('.carousel');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

if (carousel && prevBtn && nextBtn) {
  nextBtn.addEventListener('click', () => {
    // Rola para a direita o equivalente à largura de um card (aprox 300px)
    carousel.scrollBy({ left: 320, behavior: 'smooth' });
  });

  prevBtn.addEventListener('click', () => {
    // Rola para a esquerda
    carousel.scrollBy({ left: -320, behavior: 'smooth' });
  });
}

const elements = document.querySelectorAll(
  ".voluntariado-text, .voluntariado-images img"
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
    }
  });
}, {
  threshold: 0.2
});

elements.forEach(el => observer.observe(el));

const languageSection = document.querySelector('.idiomas-section');
const progressBars = document.querySelectorAll('.idiomas-section .language-progress');

if (languageSection && progressBars.length) {
  const languageObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        progressBars.forEach(bar => {
          const progress = bar.dataset.progress;
          bar.style.width = `${progress}%`;
        });
        languageSection.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  languageObserver.observe(languageSection);
}

/* Now Playing animations: visualizer bars, stars particles, and progress shimmer */
document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('now-playing');
  if (!section) return;

  const visualizer = section.querySelectorAll('.vbar');
  const progressFill = section.querySelector('.progress-fill');
  const playBtn = section.querySelector('.play-btn');
  const progressLeft = section.querySelector('.progress-left');

  // smoother visualizer using lerp + rAF (less jittery)
  const vCount = visualizer.length;
  // heights represented as normalized factors (0..1) to be applied via scaleY
  const curHeights = Array.from({ length: vCount }, () => 0.28);
  const targetHeights = Array.from({ length: vCount }, () => 0.28);

  function setTargets() {
    for (let i = 0; i < vCount; i++) {
      // generate slightly correlated targets for a more musical shape
      const base = 0.22 + Math.random() * 0.78; // normalized target between ~0.22 and 1.0
      const variance = (Math.sin(Date.now() / 600 + i) + 1) * 0.5; // subtle wave
      // combine base and variance, clamp to [0.08, 1]
      let t = base * (0.6 + variance * 0.8);
      t = Math.max(0.08, Math.min(1, t));
      targetHeights[i] = t;
    }
    // stagger the update interval a bit for organic feel
    const next = 200 + Math.random() * 300;
    setTimeout(setTargets, next);
  }

  function animateVisualizer() {
    for (let i = 0; i < vCount; i++) {
      // lerp towards target for smooth motion
      curHeights[i] += (targetHeights[i] - curHeights[i]) * 0.12;
      // apply with transform so DOM layout isn't affected
      visualizer[i].style.transform = 'scaleY(' + Math.max(0.06, curHeights[i]).toFixed(3) + ')';
    }
    requestAnimationFrame(animateVisualizer);
  }

  setTargets();
  animateVisualizer();

  // animate progress when visible
  let simulatedSeconds = 34; // fake current time
  const totalSeconds = 192; // 3:12

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const pct = progressFill.dataset.progress || '0';
        setTimeout(() => progressFill.style.width = pct + '%', 220);
      }
    });
  }, { threshold: 0.2 });
  obs.observe(section);

  // simulate timestamp increment
  let timerId = null;
  function startClock(){
    if (timerId) return;
    timerId = setInterval(() => {
      simulatedSeconds = Math.min(simulatedSeconds + 1, totalSeconds);
      const m = Math.floor(simulatedSeconds/60);
      const s = simulatedSeconds%60;
      if (progressLeft) progressLeft.textContent = m + ':' + String(s).padStart(2,'0');
      // move progress fill accordingly
      const percent = Math.round((simulatedSeconds/totalSeconds)*100);
      progressFill.style.width = percent + '%';
    }, 1000);
  }
  function stopClock(){ clearInterval(timerId); timerId = null }

  // play button toggle (fake playback)
  let playing = false;
  playBtn.addEventListener('click', () => {
    playing = !playing;
    playBtn.classList.toggle('playing', playing);
    playBtn.textContent = playing ? '▮▮' : '▶';
    if (playing) startClock(); else stopClock();
  });

  // spawn soft stars around section
  const starsWrap = section.querySelector('.section-stars');
  function spawnStar(){
    if (!starsWrap) return;
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left = (5 + Math.random()*90) + '%';
    s.style.top = (10 + Math.random()*65) + '%';
    const scale = 0.6 + Math.random()*1.2;
    s.style.transform = 'scale(' + scale + ')';
    s.style.opacity = (0.5 + Math.random()*0.6) + '';
    starsWrap.appendChild(s);
    const dur = 3000 + Math.random()*3600;
    s.animate([
      { transform: 'translateY(0) scale(' + scale + ')', opacity: s.style.opacity },
      { transform: 'translateY(-28px) scale(' + (scale*0.9) + ')', opacity: 0 }
    ], { duration: dur, easing: 'cubic-bezier(.2,.8,.2,1)' });
    setTimeout(()=> s.remove(), dur + 200);
  }
  setInterval(spawnStar, 700);

});

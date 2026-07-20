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
  const prevTrackBtn = section.querySelector('.prev-track');
  const nextTrackBtn = section.querySelector('.next-track');
  const progressLeft = section.querySelector('.progress-left');
  const progressRight = section.querySelector('.progress-right');
  const albumCover = section.querySelector('.album-cover');
  const metaTrack = section.querySelector('.meta-track');
  const metaStatus = section.querySelector('.meta-status');
  const lyricSnippet = section.querySelector('.lyric-snippet');

  const audio = document.getElementById('audio-player');
  if (!audio) return;

  // Playlist: use real audio files in `src/music/` if you want playback to work.
  // For now, the player degrades gracefully when those files are not available.
  const tracks = [
    { title: 'Mikrokosmos', artist: 'BTS', album: 'Map of the Soul: Persona', src: '', img: '/src/BTS - disco.png', phrase: 'Shine like the stars in a tiny mikrokosmos' },
    { title: 'Paradise', artist: 'BTS', album: "Love Yourself: 轉 'Tear'", src: '', img: '/src/BTS - Tear.png', phrase: 'Live your life. It\'s yours anyway.' },
    { title: 'Outro: Wings', artist: 'BTS', album: 'Wings', src: '', img: '/src/BTS - Wings.png', phrase: 'Dream, hope, forward, forward.' }
  ];

  let currentIndex = 0;

  function formatTime(sec) {
    if (!isFinite(sec) || sec == null) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + String(s).padStart(2, '0');
  }

  function setPlayButtonState(isPlaying) {
    if (!playBtn) return;
    playBtn.classList.toggle('playing', isPlaying);
    playBtn.textContent = isPlaying ? '▮▮' : '▶';
  }

  function loadTrack(i) {
    const t = tracks[i];
    if (!t) return;

    if (albumCover) albumCover.src = t.img || '/src/BTS - disco.png';
    if (metaTrack) metaTrack.textContent = `${t.artist} — ${t.title}`;
    if (lyricSnippet) lyricSnippet.textContent = t.phrase || lyricSnippet.textContent;

    if (t.src) {
      audio.src = t.src;
      if (metaStatus) metaStatus.textContent = lyricSnippet ? lyricSnippet.textContent : `Album: ${t.album}`;
      audio.load();
    } else {
      audio.removeAttribute('src');
      audio.load();
      if (metaStatus) metaStatus.textContent = `Album: ${t.album}`;
    }

    if (progressFill) progressFill.style.width = '0%';
    if (progressLeft) progressLeft.textContent = '0:00';
    if (progressRight) progressRight.textContent = '0:00';
  }

  function play() {
    if (!audio.src) {
      setPlayButtonState(false);
      if (metaStatus) metaStatus.textContent = `Album: ${tracks[currentIndex].album}`;
      return;
    }

    audio.play().then(() => {
      setPlayButtonState(true);
      // keep meta-status as lyric snippet while playing
    }).catch(err => console.warn('Playback error', err));
  }
  function pause() {
    audio.pause();
    setPlayButtonState(false);
    // keep meta-status unchanged (lyric snippet)
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (audio.paused) play(); else pause();
    });
  }

  if (prevTrackBtn) {
    prevTrackBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
      loadTrack(currentIndex);
      play();
    });
  }

  if (nextTrackBtn) {
    nextTrackBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % tracks.length;
      loadTrack(currentIndex);
      play();
    });
  }

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressLeft) progressLeft.textContent = formatTime(audio.currentTime);
    if (progressRight) progressRight.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('loadedmetadata', () => {
    if (progressRight) progressRight.textContent = formatTime(audio.duration);
    // leave meta-status as lyric snippet; update only duration display separately
  });

  audio.addEventListener('ended', () => {
    // advance to next track
    currentIndex = (currentIndex + 1) % tracks.length;
    loadTrack(currentIndex);
    play();
  });

  // smoother visualizer using lerp + rAF (kept from original)
  const vCount = visualizer.length;
  const curHeights = Array.from({ length: vCount }, () => 0.28);
  const targetHeights = Array.from({ length: vCount }, () => 0.28);

  function setTargets() {
    for (let i = 0; i < vCount; i++) {
      const base = 0.22 + Math.random() * 0.78;
      const variance = (Math.sin(Date.now() / 600 + i) + 1) * 0.5;
      let t = base * (0.6 + variance * 0.8);
      t = Math.max(0.08, Math.min(1, t));
      targetHeights[i] = t;
    }
    const next = 200 + Math.random() * 300;
    setTimeout(setTargets, next);
  }

  function animateVisualizer() {
    for (let i = 0; i < vCount; i++) {
      curHeights[i] += (targetHeights[i] - curHeights[i]) * 0.12;
      visualizer[i].style.transform = 'scaleY(' + Math.max(0.06, curHeights[i]).toFixed(3) + ')';
    }
    requestAnimationFrame(animateVisualizer);
  }

  setTargets();
  animateVisualizer();

  // spawn soft stars around section
  const starsWrap = section.querySelector('.section-stars');
  function spawnStar() {
    if (!starsWrap) return;
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left = (5 + Math.random() * 90) + '%';
    s.style.top = (10 + Math.random() * 65) + '%';
    const scale = 0.6 + Math.random() * 1.2;
    s.style.transform = 'scale(' + scale + ')';
    s.style.opacity = (0.5 + Math.random() * 0.6) + '';
    starsWrap.appendChild(s);
    const dur = 3000 + Math.random() * 3600;
    s.animate([
      { transform: 'translateY(0) scale(' + scale + ')', opacity: s.style.opacity },
      { transform: 'translateY(-28px) scale(' + (scale * 0.9) + ')', opacity: 0 }
    ], { duration: dur, easing: 'cubic-bezier(.2,.8,.2,1)' });
    setTimeout(() => s.remove(), dur + 200);
  }
  setInterval(spawnStar, 700);

  // initialize
  loadTrack(currentIndex);
});

/* ── Scroll Spy: highlight active nav link based on visible section ── */
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');
  const sections = [];

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const sectionId = href.substring(1);
    const section = document.getElementById(sectionId);
    if (section) {
      sections.push({ element: section, link: link });
    }
  });

  // Sections that are NOT in the nav — when visible, clear all highlights
  const nonNavSections = ['about', 'now-playing']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  function clearActive() {
    navLinks.forEach(l => l.classList.remove('active'));
  }

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // If it's a non-nav section (hero, music, hobbies), just clear all
        if (nonNavSections.includes(entry.target)) {
          clearActive();
          return;
        }
        clearActive();
        const match = sections.find(s => s.element === entry.target);
        if (match) match.link.classList.add('active');
      }
    });
  }, {
    root: null,
    rootMargin: '-20% 0px -50% 0px',
    threshold: 0
  });

  sections.forEach(s => spyObserver.observe(s.element));
  nonNavSections.forEach(s => spyObserver.observe(s));
});

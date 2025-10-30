const mario = document.getElementById('mario');
const plantaCarnivora = document.getElementById('plantaCarnivora');
const cronometroEl = document.getElementById('cronometro');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverText = document.getElementById('gameOverText'); // pega só uma vez

let segundos = 0;
let cronometroInterval;
let checkCollision;
let demoInterval;
let jogoAtivo = false;

function iniciarCronometro() {
  cronometroInterval = setInterval(() => {
    segundos++;
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    cronometroEl.innerText = `Tempo: ${String(minutos).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`;
  }, 1000);
}

function resetarJogo() {
  segundos = 0;
  cronometroEl.innerText = 'Tempo: 00:00';
  clearInterval(cronometroInterval);
  clearInterval(checkCollision);
  plantaCarnivora.style.animation = 'none';
  plantaCarnivora.offsetHeight; // força reflow
  plantaCarnivora.style.animation = 'moveplantaCarnivora 2s infinite linear';
  restartBtn.style.display = 'none';
  startBtn.style.display = 'inline-block';
  gameOverText.style.display = 'none'; // esconde o "Game Over" ao resetar
}

function iniciarJogo() {
  if (jogoAtivo) return;

  jogoAtivo = true;
  clearInterval(demoInterval);

  iniciarCronometro();
  plantaCarnivora.style.left = '100%';
  plantaCarnivora.style.animation = 'moveplantaCarnivora 2s infinite linear';

  checkCollision = setInterval(() => {
    const marioBottom = parseInt(window.getComputedStyle(mario).getPropertyValue('bottom'));
    const plantaCarnivoraLeft = parseInt(window.getComputedStyle(plantaCarnivora).getPropertyValue('left'));

    if (plantaCarnivoraLeft < 90 && plantaCarnivoraLeft > 50 && marioBottom < 40) {
      gameOverText.style.display = 'block';
      plantaCarnivora.style.animation = 'none';
      plantaCarnivora.style.left = plantaCarnivoraLeft + 'px';
      clearInterval(checkCollision);
      clearInterval(cronometroInterval);
      jogoAtivo = false;
      restartBtn.style.display = 'inline-block';
      startBtn.style.display = 'none';
    }
  }, 10);

  startBtn.style.display = 'none';
  restartBtn.style.display = 'none';
}

function reiniciarJogo() {
  resetarJogo();
  jogoAtivo = false;
  iniciarJogo();
}

function jump() {
  if (!jogoAtivo) return;
  if (!mario.classList.contains('jump')) {
    mario.classList.add('jump');
    setTimeout(() => {
      mario.classList.remove('jump');
    }, 500);
  }
}

function iniciarDemo() {
  plantaCarnivora.style.animation = 'moveplantaCarnivora 2s infinite linear';

  demoInterval = setInterval(() => {
    const plantaCarnivoraLeft = parseInt(window.getComputedStyle(plantaCarnivora).getPropertyValue('left'));
    const marioBottom = parseInt(window.getComputedStyle(mario).getPropertyValue('bottom'));

    if (plantaCarnivoraLeft < 150 && plantaCarnivoraLeft > 100 && marioBottom === 0) {
      mario.classList.add('jump');
      setTimeout(() => {
        mario.classList.remove('jump');
      }, 500);
    }
  }, 10);
}

document.addEventListener('keydown', (e) => {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && jogoAtivo) {
    jump();
  }
});

startBtn.addEventListener('click', iniciarJogo);
restartBtn.addEventListener('click', reiniciarJogo);

iniciarDemo();

const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes moveplantaCarnivora {
    0% { left: 100%; }
    100% { left: -40px; }
  }
`, styleSheet.cssRules.length);

// --- Permitir pulo em qualquer toque de tela (com prioridade máxima) ---

window.addEventListener('touchstart', (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (jogoAtivo && !mario.classList.contains('jump')) {
    jump();
  }
}, { passive: false, capture: true });

window.addEventListener('pointerdown', (e) => {
  if (jogoAtivo && !mario.classList.contains('jump')) {
    jump();
  }
});

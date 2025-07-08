const mario = document.getElementById('mario');
const cogumelo = document.getElementById('cogumelo');
const cronometroEl = document.getElementById('cronometro');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

let segundos = 0;
let cronometroInterval;
let checkCollision;
let demoInterval;
let jogoAtivo = false;

// ⏱️ Cronômetro
function iniciarCronometro() {
  cronometroInterval = setInterval(() => {
    segundos++;
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    cronometroEl.innerText = `Tempo: ${String(minutos).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`;
  }, 1000);
}

// 🧹 Resetar Jogo
function resetarJogo() {
  segundos = 0;
  cronometroEl.innerText = 'Tempo: 00:00';
  clearInterval(cronometroInterval);
  clearInterval(checkCollision);
  cogumelo.style.animation = 'none';
  cogumelo.offsetHeight;
  cogumelo.style.animation = 'moveCogumelo 2s infinite linear';
  restartBtn.style.display = 'none';
}

// 🎮 Iniciar Jogo Real
function iniciarJogo() {
  if (jogoAtivo) return;

  jogoAtivo = true;
  clearInterval(demoInterval); // Para a demonstração

  iniciarCronometro();
  cogumelo.style.left = '100%';
  cogumelo.style.animation = 'moveCogumelo 2s infinite linear';

  checkCollision = setInterval(() => {
    const marioBottom = parseInt(window.getComputedStyle(mario).getPropertyValue('bottom'));
    const cogumeloLeft = parseInt(window.getComputedStyle(cogumelo).getPropertyValue('left'));

    // ❌ NENHUM pulo automático no jogo!

    // Verifica colisão
    if (cogumeloLeft < 90 && cogumeloLeft > 50 && marioBottom < 40) {
      alert("Game Over!");
      cogumelo.style.animation = 'none';
      cogumelo.style.left = cogumeloLeft + 'px';
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

// 🔁 Reiniciar
function reiniciarJogo() {
  resetarJogo();
  jogoAtivo = false;
  startBtn.style.display = 'inline-block';
  restartBtn.style.display = 'none';
}

// ⬆️ Pulo manual
function jump() {
  if (!jogoAtivo) return;
  if (!mario.classList.contains('jump')) {
    mario.classList.add('jump');
    setTimeout(() => {
      mario.classList.remove('jump');
    }, 500);
  }
}

// 🕹️ Demonstração antes do jogo
function iniciarDemo() {
  cogumelo.style.animation = 'moveCogumelo 2s infinite linear';

  demoInterval = setInterval(() => {
    const cogumeloLeft = parseInt(window.getComputedStyle(cogumelo).getPropertyValue('left'));
    const marioBottom = parseInt(window.getComputedStyle(mario).getPropertyValue('bottom'));

    if (cogumeloLeft < 150 && cogumeloLeft > 100 && marioBottom === 0) {
      mario.classList.add('jump');
      setTimeout(() => {
        mario.classList.remove('jump');
      }, 500);
    }
  }, 10);
}

// 🎯 Tecla pressionada para pular no jogo
document.addEventListener('keydown', (e) => {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && jogoAtivo) {
    jump();
  }
});

startBtn.addEventListener('click', iniciarJogo);
restartBtn.addEventListener('click', reiniciarJogo);

// Iniciar demonstração ao carregar
iniciarDemo();

// Animação do cogumelo
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes moveCogumelo {
    0% { left: 100%; }
    100% { left: -40px; }
  }
`, styleSheet.cssRules.length);

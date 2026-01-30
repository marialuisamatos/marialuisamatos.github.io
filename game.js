const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 360;

const GRAVITY = 0.6;
const FRICTION = 0.8;

// VARIÁVEIS DE ESTADO E FASES 
let lives = 3;
let starsCount = 0;
let gameTime = 0; 
let currentLevel = 1;
const maxLevels = 3;
let isVictory = false; // Estado de vitória
let particles = [];    // Partículas para os confetes

// Definição da área do botão para detecção de clique
const restartBtn = { x: 350, y: 210, w: 200, h: 40 };

// Configuração das Fases
const levelConfigs = {
  1: { starsNeeded: 3, enemiesCount: 1, speedMult: 1 },
  2: { starsNeeded: 5, enemiesCount: 2, speedMult: 1.5 },
  3: { starsNeeded: 7, enemiesCount: 3, speedMult: 2 }
};

//  IMAGENS 
const playerImg = new Image(); playerImg.src = "src/game/player.png";
const blockImg = new Image();  blockImg.src = "src/game/bloco.png";
const bgImg = new Image();     bgImg.src = "src/game/fundo.png";
const starImg = new Image();   starImg.src = "src/game/star.png"; 
const enemyImg = new Image();  enemyImg.src = "src/game/inimigo.png";

// INPUT 
const keys = {};
addEventListener("keydown", e => keys[e.key] = true);
addEventListener("keyup", e => keys[e.key] = false);

// OBJETOS
const player = { x: 80, y: 258, w: 42, h: 42, vx: 0, vy: 0, speed: 4, jump: -12, grounded: false };

const blocks = [
  {x: 0, y: 300, w: 900, h: 100}, 
  {x: 220, y: 240, w: 60, h: 60},
  {x: 380, y: 200, w: 60, h: 60},
  {x: 540, y: 240, w: 60, h: 60},
  {x: 680, y: 190, w: 120, h: 60}
];

const hazards = [
  {x: 480, y: 280, w: 25, h: 20},
  {x: 750, y: 280, w: 25, h: 20}
];

let stars = [];
let enemies = [];

// LÓGICA DE CONFETES
function createConfetti() {
  particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 4 + 2,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 3 + 2
    });
  }
}

function updateConfetti() {
  for (let p of particles) {
    p.y += p.vy;
    p.x += p.vx;
    if (p.y > canvas.height) p.y = -20;
  }
}

// CLIQUE NO BOTÃO 
canvas.addEventListener("mousedown", function(e) {
  if (isVictory) {
    const rect = canvas.getBoundingClientRect();
    
    // Calcula a escala caso o CSS tenha diminuído o canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (mouseX >= restartBtn.x && mouseX <= restartBtn.x + restartBtn.w &&
        mouseY >= restartBtn.y && mouseY <= restartBtn.y + restartBtn.h) {
      isVictory = false;
      currentLevel = 1;
      starsCount = 0;
      lives = 3;
      setupLevel(1);
    }
  }
});

// LÓGICA DE FASES
function setupLevel(level) {
  if (level > maxLevels) {
    isVictory = true;
    createConfetti();
    return;
  }

  currentLevel = level;
  reset();

  stars = [];
  for (let i = 0; i < levelConfigs[level].starsNeeded; i++) {
    let rx = 100 + Math.random() * 700;
    let ry = 80 + Math.random() * 120;
    stars.push({ x: rx, y: ry, w: 50, h: 50, collected: false, baseY: ry });
  }

  enemies = [];
  for (let i = 0; i < levelConfigs[level].enemiesCount; i++) {
    enemies.push({
      x: 300 + (i * 150), y: 265, w: 35, h: 35, 
      speed: 1.5 * levelConfigs[level].speedMult, 
      dir: i % 2 === 0 ? 1 : -1, 
      alive: true
    });
  }
}

function collide(a,b){
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function reset(){
  player.x = 80; player.y = 258; player.vx = 0; player.vy = 0;
}

function physics(){
  if (isVictory) return; // Trava o jogo na tela de vitória

  gameTime += 0.05; 

  if(keys["ArrowRight"]) player.vx = player.speed;
  else if(keys["ArrowLeft"]) player.vx = -player.speed;
  else player.vx *= FRICTION;

  if(keys[" "] && player.grounded){ player.vy = player.jump; player.grounded = false; }

  player.vy += GRAVITY;
  player.x += player.vx;
  player.y += player.vy;

  if(player.x < 0) player.x = 0;
  if(player.x + player.w > canvas.width) player.x = canvas.width - player.w;

  player.grounded = false;
  for(const b of blocks){
    if(collide(player,b)){
      const prevBottom = player.y + player.h - player.vy;
      if(prevBottom <= b.y){ player.y = b.y - player.h; player.vy = 0; player.grounded = true; } 
      else if(player.y - player.vy >= b.y + b.h){ player.y = b.y + b.h; player.vy = 0; }
      else if(player.x < b.x){ player.x = b.x - player.w; player.vx = 0; } 
      else { player.x = b.x + b.w; player.vx = 0; }
    }
  }

  stars.forEach(s => {
    if(!s.collected){
      s.y = s.baseY + Math.sin(gameTime) * 10;
      if(collide(player, s)){ s.collected = true; starsCount++; }
    }
  });

  if (stars.length > 0 && stars.every(s => s.collected)) {
    setupLevel(currentLevel + 1);
  }

  enemies.forEach(e => {
    if(e.alive){
      e.x += e.speed * e.dir;
      for(let i = 1; i < blocks.length; i++) if(collide(e, blocks[i])){ e.dir *= -1; e.x += e.speed * e.dir; }
      for(const h of hazards) if(collide(e, h)){ e.dir *= -1; e.x += e.speed * e.dir; }

      if(collide(player, e)){
        if(player.vy > 0 && player.y + player.h < e.y + e.h / 2){ e.alive = false; player.vy = -8; } 
        else { lives--; if(lives <= 0){ alert("Game Over!"); lives = 3; starsCount = 0; setupLevel(1); } else { reset(); } }
      }
    }
  });

  if(player.y > canvas.height + 100){ lives--; if(lives <= 0){ alert("Game Over!"); lives = 3; starsCount = 0; setupLevel(1); } else { reset(); } }
  for(const h of hazards) if(collide(player,h)){ lives--; if(lives <= 0){ alert("Game Over!"); lives = 3; starsCount = 0; setupLevel(1); } else { reset(); } }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(bgImg.complete) ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  
  for(let i = 1; i < blocks.length; i++){ 
    const b = blocks[i];
    if(blockImg.complete) ctx.drawImage(blockImg, b.x, b.y, b.w, b.h);
  }
  
  stars.forEach(s => { if(!s.collected && starImg.complete) ctx.drawImage(starImg, s.x, s.y, s.w, s.h); });
  enemies.forEach(e => { if(e.alive && enemyImg.complete) ctx.drawImage(enemyImg, e.x, e.y, e.w, e.h); });

  ctx.fillStyle = "#ff1493";
  for(const h of hazards){
    ctx.beginPath(); ctx.moveTo(h.x, h.y + h.h); ctx.lineTo(h.x + h.w / 2, h.y); ctx.lineTo(h.x + h.w, h.y + h.h); ctx.fill();
  }

  if(playerImg.complete) ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);

  // Interface (Texto Branco para melhor contraste)
  ctx.fillStyle = "black";
  ctx.font = "bold 24px Arial";
  ctx.fillText("Vidas: " + lives, canvas.width - 120, 42);

  if(starImg.complete) ctx.drawImage(starImg, 15, 12, 40, 40); 
  ctx.fillText(starsCount, 60, 42);

  ctx.textAlign = "center";
  ctx.fillText("Fase " + currentLevel, canvas.width / 2, 42);
  ctx.textAlign = "left";

  // MENSAGEM DE VITÓRIA
  if (isVictory) {
    updateConfetti();
    for (let p of particles) {
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Modal de Vitória
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(canvas.width / 2 - 170, canvas.height / 2 - 80, 340, 160);
    ctx.strokeStyle = "#df3f8fff";
    ctx.lineWidth = 5;
    ctx.strokeRect(canvas.width / 2 - 170, canvas.height / 2 - 80, 340, 160);

    ctx.fillStyle = "#df3f8fff";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Você Ganhou!", canvas.width / 2, canvas.height / 2 - 20);

    // Botão Recomeçar
    ctx.fillStyle = "#df3f8fff";
    ctx.fillRect(restartBtn.x, restartBtn.y, restartBtn.w, restartBtn.h);
    ctx.fillStyle = "white";
    ctx.font = "bold 18px Arial";
    ctx.fillText("RECOMEÇAR", canvas.width / 2, restartBtn.y + 27);
    ctx.textAlign = "left";
  }
}

function loop(){ physics(); draw(); requestAnimationFrame(loop); }

setupLevel(1); 
loop();
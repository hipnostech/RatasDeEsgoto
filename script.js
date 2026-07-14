var canvas;
var stage;
var container;
var burstContainer;
var bursts = [];

var messages = [
  "Então seremos duas rata no esgoto.",
  "Quando falo com você me sinto tão leve quanto aquela música.",
  "Meu bem, vindo de você pra mim é a coisa mais especial existente, depois de você óbvio.",
  "Porque você merece muito mais e eu vou lembrar isso pra você sempre.",
  "Deveria ser pecado existir alguém como você. Eu sou a maior entre as pecadoras",
  "Saiba diferenciar um tapa SEU, pra um tapa qualquer.",
  "O amor habita nos mais inconcebíveis dos lugare",
  "Você é o meu plano.",
  "Meu Oceano é você, então facilite.",
  "Eu fico, eu te quero e eu quero ficar",
];
var msgIndex = 0;

function setVh() {
  document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
}

function heartCountForWidth(w) {
  return w < 700 ? 8 : 14;
}

function drawHeartPath(g, size) {
  var s = size / 16;
  g.moveTo(0, -12 * s).curveTo(1 * s, -20 * s, 8 * s, -20 * s).curveTo(16 * s, -20 * s, 16 * s, -10 * s).curveTo(16 * s, 0, 0, 12 * s);
  g.curveTo(-16 * s, 0, -16 * s, -10 * s).curveTo(-16 * s, -20 * s, -8 * s, -20 * s).curveTo(-1 * s, -20 * s, 0, -12 * s);
}

function makeFallingHeart() {
  var heart = new createjs.Shape();
  heart.graphics.beginFill(createjs.Graphics.getHSL(Math.random() * 30 - 45, 100, 50 + Math.random() * 30));
  drawHeartPath(heart.graphics, 16);
  heart.y = -100;
  return heart;
}

function resizeStage() {
  setVh();
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

var resizeTimeout;
function onResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(resizeStage, 150);
}

function nextMessage() {
  var el = document.getElementById("msgTitle");
  el.classList.add("fading");
  setTimeout(function () {
    msgIndex = (msgIndex + 1) % messages.length;
    el.innerHTML = messages[msgIndex];
    el.classList.remove("fading");
  }, 400);
}

function spawnBurst(x, y) {
  var count = 12 + Math.floor(Math.random() * 6);
  for (var i = 0; i < count; i++) {
    var heart = new createjs.Shape();
    heart.graphics.beginFill(createjs.Graphics.getHSL(340 + Math.random() * 40 - 20, 90, 60 + Math.random() * 25));
    drawHeartPath(heart.graphics, 10 + Math.random() * 8);
    heart.x = x;
    heart.y = y;
    var angle = Math.random() * Math.PI * 2;
    var speed = 1.5 + Math.random() * 4;
    burstContainer.addChild(heart);
    bursts.push({
      shape: heart,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 1,
      decay: 0.012 + Math.random() * 0.012,
    });
  }
}

function updateBursts() {
  for (var i = bursts.length - 1; i >= 0; i--) {
    var b = bursts[i];
    b.vy += 0.05;
    b.shape.x += b.vx;
    b.shape.y += b.vy;
    b.life -= b.decay;
    b.shape.alpha = Math.max(b.life, 0);
    b.shape.scaleX = b.shape.scaleY = 0.6 + b.life * 0.6;
    b.shape.rotation += b.vx * 2;
    if (b.life <= 0) {
      burstContainer.removeChild(b.shape);
      bursts.splice(i, 1);
    }
  }
}

function onTap(e) {
  var rect = canvas.getBoundingClientRect();
  var clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : rect.width / 2);
  var clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : rect.height / 2);
  var x = (clientX - rect.left) * (canvas.width / rect.width);
  var y = (clientY - rect.top) * (canvas.height / rect.height);
  spawnBurst(x, y);
  nextMessage();
  startMusic();
}

var bgMusic;
var musicToggle;

function updateMusicButton() {
  musicToggle.textContent = bgMusic.paused ? "🎵" : "🔊";
}

function startMusic() {
  if (!bgMusic.paused) return;
  bgMusic.play().then(updateMusicButton).catch(function () {});
}

function initMusic() {
  bgMusic = document.getElementById("bgMusic");
  musicToggle = document.getElementById("musicToggle");
  musicToggle.addEventListener("click", function () {
    if (bgMusic.paused) {
      bgMusic.play().then(updateMusicButton).catch(function () {});
    } else {
      bgMusic.pause();
      updateMusicButton();
    }
  });
  bgMusic.addEventListener("play", updateMusicButton);
  bgMusic.addEventListener("pause", updateMusicButton);
}

function init() {
  setVh();

  canvas = document.getElementById("testCanvas");
  stage = new createjs.Stage(canvas);
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  container = new createjs.Container();
  stage.addChild(container);

  burstContainer = new createjs.Container();
  stage.addChild(burstContainer);

  var heartCount = heartCountForWidth(canvas.width);
  for (var i = 0; i < heartCount; i++) {
    container.addChild(makeFallingHeart());
  }

  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.on("tick", tick);

  canvas.addEventListener("pointerdown", onTap, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);

  initMusic();
}

function tick(event) {
  var w = canvas.width;
  var h = canvas.height;
  var l = container.numChildren;

  // iterate through all the children and move them according to their velocity:
  for (var i = 0; i < l; i++) {
    var heart = container.getChildAt(i);
    if (heart.y < -50) {
      heart._x = Math.random() * w;
      heart.y = h * (1 + Math.random()) + 50;
      heart.perX = (1 + Math.random() * 2) * h;
      heart.offX = Math.random() * h;
      heart.ampX = heart.perX * 0.1 * (0.15 + Math.random());
      heart.velY = -Math.random() * 2 - 1;
      heart.scale = Math.random() * 2 + 1;
      heart._rotation = Math.random() * 40 - 20;
      heart.alpha = Math.random() * 0.75 + 0.05;
    }
    var int = ((heart.offX + heart.y) / heart.perX) * Math.PI * 2;
    heart.y += (heart.velY * heart.scaleX) / 2;
    heart.x = heart._x + Math.cos(int) * heart.ampX;
    heart.rotation = heart._rotation + Math.sin(int) * 30;
  }

  updateBursts();

  // draw the updates to stage:
  stage.update(event);
}

init();

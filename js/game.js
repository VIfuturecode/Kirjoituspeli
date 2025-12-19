/* DOM */
const gameScene = document.getElementById("game-scene");
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const inputText = document.getElementById("input-text");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");
const menuBtn = document.getElementById("menu-btn");
const pauseOverlay = document.getElementById("pause-overlay");
const gameoverOverlay = document.getElementById("gameover-overlay");
const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("final-score");
const livesDisplay = document.getElementById("lives");
const difficultyBadge = document.getElementById("difficulty-badge");
const difficultyCards = document.querySelectorAll(".difficulty-card");
const muteBtnGame = document.getElementById("mute-btn-game");

/* PELIN TILA  */
let gamePaused = false;
let gameOver = false;
let score = 0;
let lives = 3;
let maxLives = 3;
let selectedDifficulty = "easy";

/* SYDÄMET  */
function renderLives() {
  livesDisplay.innerHTML = "";
  for (let i = 0; i < maxLives; i++) {
    const h = document.createElement("span");
    h.textContent = "❤️";
    h.className = "heart";
    if (i >= lives) h.classList.add("empty");
    livesDisplay.appendChild(h);
  }
}

/* ALOITA PELI  */
function startGame(diff) {
  selectedDifficulty = diff;
  document.body.className = diff + "-bg";

  difficultyBadge.className = diff;
  difficultyBadge.textContent =
    diff === "easy" ? "HELPPO" :
    diff === "medium" ? "KESKITASO" : "VAIKEA";

  introScene.classList.add("hidden");
  menuScene.classList.add("hidden");
  gameScene.classList.remove("hidden");

  score = 0;
  scoreDisplay.textContent = score;

  if (diff === "easy") maxLives = 5;
  else if (diff === "medium") maxLives = 3;
  else maxLives = 2;

  lives = maxLives;
  renderLives();

  gamePaused = false;
  gameOver = false;

  pauseOverlay.classList.remove("active");
  gameoverOverlay.classList.remove("active");

  resizeCanvas();
  inputText.focus();
}

/* CANVAS */
function resizeCanvas() {
  const header = gameScene.querySelector("header");
  const footer = gameScene.querySelector("footer");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - header.offsetHeight - footer.offsetHeight;
}
window.addEventListener("resize", resizeCanvas);

/* PAUSE */
function togglePause() {
  gamePaused = !gamePaused;
  pauseOverlay.classList.toggle("active", gamePaused);
}
pauseBtn.onclick = togglePause;
resumeBtn.onclick = togglePause;

/*  INPUT */
inputText.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    if (inputText.value.trim()) {
      lives--;
      renderLives();
      inputText.value = "";

      if (lives <= 0) {
        gameOver = true;
        gameoverOverlay.classList.add("active");
        finalScoreDisplay.textContent = score;
      }
    }
  }
});

/*  LOOP */
function gameLoop() {
  if (!gamePaused && !gameOver && !gameScene.classList.contains("hidden")) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(gameLoop);
}
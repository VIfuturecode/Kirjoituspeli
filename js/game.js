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
var vaikeatsanat = [];
var helpotsanat = [];
//sanatlistaan on funktio joka ottaa tekstitiedostoista sanat ja 
// laittaa ne yläpuolella oleviin arraysiin
sanatlistaan();

/* PELIN TILA  */
let gamePaused = false;
let gameOver = false;
let score = 0;
let lives = 3;
let maxLives = 3;
let selectedDifficulty = "easy";

/* SANOJEN LIIKKUMINEN  */
class Word{
  constructor(text, x, y, speed){
    this.text = text;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.fontSize = 24;
    this.width = 100;
  }

  update() {
    this.y +=this.speed;
  }

  draw(ctx) {
    ctx.font = `bold ${this.fontSize}px Quicksand`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.textAlign = "center";
    ctx.fillText(this.text, this.x, this.y);
  }

  isOffScreen(canvasHeight) {
    return this.y > canvasHeight;  
  }

  contains(x, y) {
    return (
      x > this.x - 60 &&
      x < this.x + 60 &&
      y > this.y - 25 &&
      y < this.y + 15
    );
  }
}

let words = [];
let wordSpawnTimer = 0;
let wordSpawnRate = 180;

function spawnWord() {
  const randomWord = sana();
  if (randomWord && randomWord.trim() !== "") {
    const x = Math.random() * (canvas.width - 120) + 60;
    const y = -40;
    const speed = selectedDifficulty === "easy" ? 0.8 : 
                  selectedDifficulty === "medium" ? 1.2 : 
                                                    1.8;
    words.push(new Word(randomWord.toLowerCase(), x, y, speed));
  }
}

function updateWords() {
  for (let i = words.length - 1; i >= 0; i--) {
    words[i].update();
    
    if (words[i].isOffScreen(canvas.height)) {
      words.splice(i, 1);
      if (!gameOver) {
        lives--;
        renderLives();
        
        if (lives <= 0) {
          gameOver = true;
          gameoverOverlay.classList.add("active");
          finalScoreDisplay.textContent = score;
        }
      }
    }
  }
}

function drawWords(){
  for (let word of words) {
    word.draw(ctx);
  }
}

function checkWord(typedWord) {
  for (let i = 0; i < words.length; i++) {
    if (words[i].text === typedWord.toLowerCase().trim()) {
      words.splice(i, 1);
      score += selectedDifficulty === "easy" ? 10 : 
               selectedDifficulty === "medium" ? 20 : 30;
      scoreDisplay.textContent = score;
      return true;
    }
  }
  return false;
}

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
  // piilotta intro-napit
  skipBtn.classList.add("hidden");
  muteBtn.classList.add("hidden");
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

  if (diff === "easy") {
    maxLives = 5;
    wordSpawnRate = 150;
  } else if (diff === "medium") {
    maxLives = 3;
    wordSpawnRate = 110;
  } else {
    maxLives = 2;
    wordSpawnRate = 100;
  }

  lives = maxLives;
  renderLives();

  gamePaused = false;
  gameOver = false;
  words = [];
  wordSpawnTimer = wordSpawnRate - 20;

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
    const typedWord = inputText.value.trim();
    if (typedWord !== "") {
      const wordFound = checkWord(typedWord);
      if (!wordFound) {
        lives--;
        renderLives();

        if (lives <= 0) {
          gameOver = true;
          gameoverOverlay.classList.add("active");
          finalScoreDisplay.textContent = score;
        }
      }
      inputText.value = "";
    }
  }
});

/*  LOOP */
function gameLoop() {
  if (!gamePaused && !gameOver && !gameScene.classList.contains("hidden")) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    wordSpawnTimer++;
    if (wordSpawnTimer >= wordSpawnRate) {
      spawnWord();
      wordSpawnTimer = 0;
    }

    updateWords();
    drawWords();
  }
  requestAnimationFrame(gameLoop);
}

/* EVENTIT */
muteBtnGame.onclick = () => {
  isMuted = !isMuted;
  muteBtnGame.textContent = isMuted ? "Mykistetty" : "Ääni";
};

menuBtn.onclick = showMenu;
restartBtn.onclick = () => startGame(selectedDifficulty);
difficultyCards.forEach(c => c.onclick = () => startGame(c.dataset.difficulty));

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "p") {
    const active = document.activeElement;
    if (active !== inputText && !gameScene.classList.contains("hidden")) {
      e.preventDefault();
      togglePause();
    }
  }
});

/* START */
gameLoop();

//tämä funktio laittaa sanat listoihin vaikeat ja helpot sanat
function sanatlistaan(){
  fetch("helpot.txt")
    .then(r=>r.text())
    .then(text => {
      const lines = text.split(/\r?\n/)
      for(var i = 0; i < lines.length; i++){
        helpotsanat.push(lines[i])
      }
    })
  fetch("vaikeat.txt")
    .then(r=>r.text())
    .then(text => {
      const lines = text.split(/\r?\n/)
      for(var i = 0; i < lines.length; i++){
        vaikeatsanat.push(lines[i])
      } 
    })
}
//kutsumalla funktiota sana() se palauttaa satunnaisen sanan vaikeustason mukaan
function sana(){
  if(selectedDifficulty == "easy" || selectedDifficulty == "medium"){
    return helpotsanat[Math.floor(Math.random() * helpotsanat.length)];
  } else {
    return vaikeatsanat[Math.floor(Math.random() * vaikeatsanat.length)]
  }
}
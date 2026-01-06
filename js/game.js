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
const finalkomboDisplay = document.getElementById("final-kombo");
const livesDisplay = document.getElementById("lives");
const difficultyBadge = document.getElementById("difficulty-badge");
const difficultyCards = document.querySelectorAll(".difficulty-card");
const gamemodecards = document.querySelectorAll(".gamemode-card")
const muteBtnGame = document.getElementById("mute-btn-game");
const aika = document.getElementById("timer")
const kombo = document.getElementById("kombo")
var vaikeatsanat = [];
var helpotsanat = [];
//sanatlistaan on funktio joka ottaa tekstitiedostoista sanat ja 
// laittaa ne yläpuolella oleviin arraysiin
sanatlistaan();

/* PELIN TILA  */
let gamemode = "zen";
let gamePaused = false;
let gameOver = false;
let kombonyt = 0
let isoinkombo = 0
let score = 0;
let lives = 3;
let maxLives = 3;
let selectedDifficulty = "easy";
let skipIntro = false;
let closestword = ""

/* SANOJEN LIIKKUMINEN  */
class Word{
  constructor(text, x, y, speed){
    this.text = text;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.fontSize = 24;
    this.width = 100;
    this.highlight = false
    if(gamemode == "selviytymistila" || gamemode == "aikahaaste"){
      if(Math.random() < 0.05){
        console.log("red")
        this.red = true;
      }else{
        this.red = false
      }
    }

  }

  update() {
    this.y +=this.speed;
  }

  draw(ctx, highlight, red) {
    if(highlight == true){
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(180, 180, 180, 1)";
      ctx.fillRect(this.x - 25, this.y + 6, 50, 5);
    }
    if(red == true){
      ctx.fillStyle = "rgba(255, 0, 0, 0.9)";
    }else{
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    }
    ctx.textAlign = "center";
    ctx.font = `bold ${this.fontSize}px Quicksand`;
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
  // closestword tutkii mikä sana on lähimpänä pohjaa ja jos sitä ei ole asetettu, sana valitaan listasta.
  if(words.includes(closestword) != true){
      closestword.y = 0
  }
  for (let i = words.length - 1; i >= 0; i--) {
    words[i].update();
    if(closestword == ""){
      closestword = words[i]
    }else{
      if(words[i].y > closestword.y)
        closestword = words[i]
    }

    if (words[i].isOffScreen(canvas.height)) {
      //is red tutkii onko sanalle annettu red true vai false. Jos sana on punainen aiheutuu heti game over
      komboresetointi();
      if(words[i].red == true){
        gameoverscreen();
        clearing();
      }
      words.splice(i, 1);
      if (!gameOver && gamemode == "selviytymistila") {
        lives--;
        renderLives();
        if (lives <= 0 && gamemode == "selviytymistila") {
          gameoverscreen();
          clearing();
        }
      }
    }
  }
  if(closestword != ""){
      closestword.highlight = true;
    }
}

function drawWords(){
  for (let word of words) {
    word.draw(ctx, word.highlight, word.red);
  }
}

function checkWord(typedWord) {
  for (let i = 0; i < words.length; i++) {
    if (words[i].text === typedWord.toLowerCase().trim()) {
      words.splice(i, 1);
      score += selectedDifficulty === "easy" ? 10 : 
               selectedDifficulty === "medium" ? 20 : 30;         
      scoreDisplay.textContent = score;
      kombonyt += 1;
      kombo.innerHTML = "kombo" + " " + kombonyt;
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
  clearing();
  selectedDifficulty = diff;
  // piilotta intro-napit
  skipBtn.classList.add("hidden");
  muteBtn.classList.add("hidden");
  aika.style.display = "none";
  document.body.className = diff + "-bg";

  difficultyBadge.className = diff;
  difficultyBadge.textContent =
    diff === "easy" ? "HELPPO" :
    diff === "medium" ? "KESKITASO" : "VAIKEA";

  introScene.classList.add("hidden");
  menuScene.classList.add("hidden");
  gameScene.classList.remove("hidden");

  console.log("pelinaloitus")
  closestword = ""
  kombonyt = 0;
  isoinkombo = 0;
  score = 0;
  scoreDisplay.textContent = score;

  setdifficulty(selectedDifficulty);

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
      if(!wordFound){
        komboresetointi();
      if (!wordFound && gamemode == "selviytymistila") {
        lives--;
        renderLives();
      }
        if (lives <= 0 && gamemode == "selviytymistila") {
          gameoverscreen();
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

menuBtn.onclick = () => showMenu();
restartBtn.onclick = () => startGame(selectedDifficulty);
difficultyCards.forEach(c => c.onclick = () => startGame(c.dataset.difficulty));
gamemodecards.forEach(c => c.onclick = () => cardclicked(c.dataset.mode));

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
        helpotsanat.push(lines[i]);
      }
    })
  fetch("vaikeat.txt")
    .then(r=>r.text())
    .then(text => {
      const lines = text.split(/\r?\n/)
      for(var i = 0; i < lines.length; i++){
        vaikeatsanat.push(lines[i]);
      } 
    })
}
//kutsumalla funktiota sana() se palauttaa satunnaisen sanan vaikeustason mukaan
function sana(){
  if(selectedDifficulty == "easy" || selectedDifficulty == "medium"){
    return helpotsanat[Math.floor(Math.random() * helpotsanat.length)];
  } else {
    return vaikeatsanat[Math.floor(Math.random() * vaikeatsanat.length)];
  }
}

function cardclicked(m){
  gamemode = m;
  menuScene.classList.remove("hidden");
  gamemodescene.classList.add("hidden");
}
//ajastin luo aikahaasteeseen 60 sekunnin ajastimen yläpuolelle näyttöä sekä laskee itsestään 60 sekunttia kunnes aiheuttaa game over näytön
function ajastin(){
  var timer = 60
  currenttime = setInterval(function () {timer = timer -1, aika.innerHTML = timer}, 1000);
  peliajastin = setTimeout(function(){ 
      clearInterval(currenttime);
      gameOver = true;
      gameoverOverlay.classList.add("active");
      finalScoreDisplay.textContent = score;
      finalkomboDisplay.innerHTML = isoinkombo;
  }, 60000);
  
}

//clearing clearaa nyt kaikki intervallit ja timeoutit, sekä asettaa muutaman asian takaisin missä se alunperin oli
//try kohdassa koodi tarkistaa onko currentime, peliajastin ja nopeutusta olemassa
//jos niitä ei ole olemassa, niin kirjoittaa consoleen errorin mutta peli jatkuu
function clearing(){
  if(gamemode == "aikahaaste"){
    try{
      clearInterval(currenttime);
      clearTimeout(peliajastin);
    } catch(error) {
      console.log(error)
    }
  }else if(gamemode == "selviytymistila"){
    try{
      clearInterval(nopeutus);
    } catch(error) {
      console.log(error)
    }
  }
  console.log("restart")
  words = []
  wordSpawnRate = 180
  wordSpawnTimer = wordSpawnRate - 20;
  kombonyt = 0
  isoinkombo = 0
  kombo.innerHTML = "kombo" + " " + kombonyt;
  gameOver = true
}

//set difficulty katsoo pelin vaikeustason ja asettaa ne kun funktiota kutsutaan ja annetaan sille difficulty. 
function setdifficulty(diff){
  if(gamemode == "selviytymistila"){
    livesDisplay.style.display = "inline"
    wordSpawnRate = 300;
    nopeutus = setInterval(function () {wordSpawnRate -= 10; console.log(wordSpawnRate); if(wordSpawnRate == 40){clearInterval(nopeutus)}}, 10000);
    if (diff === "easy") {
      maxLives = 5;
    } else if (diff === "medium") {
      maxLives = 3;
    } else {
      maxLives = 2;
    };
  } 
  else if(gamemode == "zen"){
    livesDisplay.style.display = "none"
    if (diff === "easy") {
      wordSpawnRate = 150;
    } else if (diff === "medium") {
      wordSpawnRate = 110;
    } else {
      wordSpawnRate = 100;
    };
  } else if(gamemode == "aikahaaste"){
    if (diff === "easy") {
      wordSpawnRate = 150;
    } else if (diff === "medium") {
      wordSpawnRate = 110;
    } else {
      wordSpawnRate = 100;
    };
    livesDisplay.style.display = "none"
    aika.style.display = "inline"; 
    ajastin();
  }

}
//komboresetointi tekee kombon resetoinnin sekä näyttämisen ja isoimman kombon tallentamisen 
function komboresetointi(){
  if(kombonyt > isoinkombo){
    isoinkombo = kombonyt
  }
  kombonyt = 0;
  kombo.innerHTML = "kombo" + " " + kombonyt;  
}

//gameoverscreen funktio lopetaa pelin ja näyttää gameover näytön
function gameoverscreen(){
  gameoverOverlay.classList.add("active");
  finalScoreDisplay.textContent = score;
  finalkomboDisplay.innerHTML = isoinkombo;
  clearing();
}
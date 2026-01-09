/*MUSIIKKIN ASETUKSET */
const MUSIC_PATHS = {
  easy: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", //helppo taso
  medium: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", //keskitaso
  hard: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" //vaikea taso
};

let currentMusic = null;

//YLEINEN KLIKKAUSÄÄNI KÄYTTÖLIITTYMÄLLE
const clickSound = new Audio("sounds/click.mp3.wav");
const hoverSound = new Audio("sounds/click.mp3.wav");
const gameOverSound = new Audio("sounds/gameover.mp3.wav");
const bombSound = new Audio("sounds/bomb.mp3.wav");
const freezeSound = new Audio("sounds/freeze.mp3.wav");

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
const aika = document.getElementById("timer");
const kombo = document.getElementById("kombo");
const pomminappi = document.getElementById("bomb");
const freezenappi = document.getElementById("freeze");
var vaikeatsanat = [];
var helpotsanat = [];
//sanatlistaan on funktio joka ottaa tekstitiedostoista sanat ja 
// laittaa ne yläpuolella oleviin arraysiin
sanatlistaan();

/* PELIN TILA  */
let gamemode = "zen";
let gamePaused = false;
let gameOver = false;
let kombonyt = 0;
let isoinkombo = 0;
let score = 0;
let lives = 3;
let maxLives = 3;
let selectedDifficulty = "easy";
//let skipIntro = false; // On olemassa jo introssa
let closestword = "";
let pommikaytetty = false;
let freezekaytetty = false;
let currentlyfreezed = false;
let explosion = false;
let slowspawnrate = 5000;
let opacity = 1;  
let explosioncolor = `rgb(254, 213, 180, ${opacity})`;
let wordspawntimer;
let currenttime; //AJASTIMELLE

/*MUSIIKKITOIMINTO*/
function playMusic(difficulty) {
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
  }

  let musicKey = difficulty;
  if (!MUSIC_PATHS[musicKey]) musicKey = "easy";

  currentMusic = new Audio(MUSIC_PATHS[musicKey]);
  currentMusic.loop = true;
  currentMusic.volume = 0.5; 
  currentMusic.muted = typeof isMuted !== 'undefined' ? isMuted : false; 
    
  currentMusic.play().catch(e => console.log("Audio play failed:", e));
}

function stopMusic() {
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
  }
}

//KLIKKAUSÄÄNI FUNKTIO
function playClickSound() {
  if (typeof isMuted !== 'undefined' && isMuted) return;
  // Luodaan uusi Audio-olio joka kerta, jotta ääni voi soida päällekkäin ja varmasti alusta
  const sound = new Audio("sounds/click.mp3.wav");
  sound.volume = 0.3;
  sound.play().catch(e => console.log("Click sound failed:", e));
}

function playHoverSound() {
  if (typeof isMuted !== 'undefined' && isMuted) return;
  const sound = new Audio("sounds/click.mp3.wav");
  sound.volume = 0.1;
  sound.play().catch(e => console.log("Hover sound failed:", e));
}

/* SANOJEN LIIKKUMINEN  */
class Word{
  constructor(text, x, y, speed){
    this.originalspeed = speed
    this.text = text;
    this.x = x;
    this.y = y;
    if(currentlyfreezed == true){
      this.speed = 0.2
    }else{
      this.speed = speed;
    }
    this.fontSize = 24;
    this.width = 100;
    this.highlight = false
    if(gamemode == "selviytymistila" || gamemode == "aikahaaste"){
      if(Math.random() < 0.05){
        console.log("red")
        this.red = true;
      }else{
        this.red = false;
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
    }else if(currentlyfreezed == true){
      ctx.fillStyle = "rgba(171, 242, 255, 0.9)";
    }
    else{
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
let wordSpawnRate = 2000;//Oletuskirjoitusnopeus

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
    if(closestword && closestword.y) closestword.y = 0 //TARKISTAA, ONKO LÄHIN SANA OLEMASSA
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
  if(closestword != "" && typeof closestword === 'object'){
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
      if (kombonyt > isoinkombo) isoinkombo = kombonyt;//SEURAA MAXIMI KOMBON
      return true;
    }
  }
  return false;
}

//komboresetointi tekee kombon resetoinnin sekä näyttämisen ja isoimman kombon tallentamisen 
function komboresetointi(){
  if(kombonyt > isoinkombo) isoinkombo = kombonyt;
  kombonyt = 0;
  kombo.innerHTML = "kombo" + " " + kombonyt;  
}

//gameoverscreen funktio lopetaa pelin ja näyttää gameover näytön
function gameoverscreen(){
  gameOver = true;
  gameoverOverlay.classList.add("active");
  finalScoreDisplay.textContent = score;
  finalkomboDisplay.innerHTML = isoinkombo;
  stopMusic();

  if (typeof isMuted === 'undefined' || !isMuted) {
    if (gamemode === "zen") {
        // Peli ei päätyy eikä tule voittoja Zen tilassa, mutta jos kutsutaan:
        return;
    }

    const isWin = (gamemode === "aikahaaste" && score >= 100) || 
                  (gamemode === "selviytymistila" && score >= 500);

    if (isWin) {
        winSound.currentTime = 0;
        winSound.play().catch(e => {});
    } else {
        // Peli päätyy ääni
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(e => {});
    }
  }
}

function setdifficulty(diff) {
  document.body.className = diff + "-bg";
  difficultyBadge.className = diff;
  difficultyBadge.textContent = diff.toUpperCase();
}

// Tapahtumankuuntelijat hover-äänille korteille
difficultyCards.forEach(card => {
  card.addEventListener("mouseenter", playHoverSound);
});
gamemodecards.forEach(card => {
  card.addEventListener("mouseenter", playHoverSound);
});

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
  playClickSound();
  clearing();
  selectedDifficulty = diff;
  // piilotta intro-napit
  skipBtn.classList.add("hidden");
  muteBtn.classList.add("hidden");

  introScene.classList.add("hidden");
  menuScene.classList.add("hidden");
  gameScene.classList.remove("hidden");

  console.log("pelinaloitus")
  score = 0;
  scoreDisplay.textContent = score;
  kombonyt = 0;
  isoinkombo =0;
  kombo.innerHTML = "Kombo: 0";
  inputText.value = ""; //Nollataan tekstikenttä

  setdifficulty(selectedDifficulty);
  playMusic(selectedDifficulty);

  lives = maxLives;
  if (gamemode === "zen") {
    livesDisplay.innerHTML = ""; // Zen-tilassa ei elämiä
  } else {
    renderLives();
  }

  gamePaused = false;
  gameOver = false;

  pommikaytetty = false;
  freezekaytetty = false;
  pomminappi.classList.remove("hidden");
  freezenappi.classList.remove("hidden");

  if (gamemode == "aikahaaste") {
    ajastin();
  }

  wordtimer(wordSpawnRate);

  pauseOverlay.classList.remove("active");
  gameoverOverlay.classList.remove("active");

  resizeCanvas();
  inputText.focus();
}

/* CANVAS */
function resizeCanvas() {
  const header = gameScene.querySelector("header");
  const footer = gameScene.querySelector("footer");
  if (header && footer) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - header.offsetHeight - footer.offsetHeight;
  }
}
window.addEventListener("resize", resizeCanvas);

/* PAUSE */
function togglePause() {
  gamePaused = !gamePaused;
  pauseOverlay.classList.toggle("active", gamePaused);
  if (gamePaused) {
    if(currentMusic) currentMusic.pause();
  } else {
    if(currentMusic) currentMusic.play().catch(e => console.log(e));
  }
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
    updateWords();
    drawWords();
    if(currentlyfreezed == true){
      ctx.fillStyle = "rgba(131, 234, 252, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if(explosion == true){
      ctx.fillStyle = explosioncolor
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      opacity -= 0.01
      explosioncolor = `rgb(254, 213, 180, ${opacity})`
      if(opacity <= 0){
        explosion = false;
        opacity = 1;
        explosioncolor = `rgb(254, 213, 180, ${opacity})`;
      }
    }
  }
  requestAnimationFrame(gameLoop);
}

function wordtimer(sp){
  try { clearInterval(wordspawntimer); } catch(e){}
  wordspawntimer = setInterval(function () {
    if(gamePaused != true && !gameOver){
      spawnWord();
    }
  }, sp);
}

//bomb funktio laittaa explosion = true jolloin peli tietää tehdä näytön välähdyksen ja poistaa kaikki sanat listalta
function bomb(){
  if (gamePaused || gameOver || pommikaytetty) return;
  pommikaytetty = true;
  pomminappi.classList.add("hidden");//Piilota käytön jälkeen
  explosion = true
  words = []; // Tyhjennä kaikki sanat
  opacity = 1;
  if(typeof isMuted === 'undefined' || !isMuted) {
    bombSound.currentTime = 0;
    bombSound.play().catch(e => {});
  }
}

//freeze asettaa pelille hitaamman spawntimerin ja hidastaa jokaisen sanan nopeutta kunnes aika on ohi jolloin peli
//asettuu takaisin alkuperäiseen nopeuteen
function freeze(){
  if (gamePaused || gameOver || currentlyfreezed || freezekaytetty) return;
  freezekaytetty = true;
  freezenappi.classList.add("hidden");//Piilota käytön jälkeen
  currentlyfreezed = true;

  if (typeof isMuted === 'undefined' || !isMuted) {
    freezeSound.currentTime = 0;
    freezeSound.play().catch(e => {});
  }

  //Hidastaa olemassa olevia sanoja
  words.forEach(w => w.speed = 0.2);

  //Nollaa 5 sekunti kuluttua
  setTimeout(() => {
    currentlyfreezed = false;
    words.forEach(w => w.speed = w.originalspeed);
  }, 5000);
}

/* EVENTIT */
muteBtnGame.onclick = () => {
  if (typeof isMuted !== 'undefined') {
    isMuted = !isMuted;
    muteBtnGame.textContent = isMuted ? "Mykistetty" : "Ääni";
    if (currentMusic) currentMusic.muted = isMuted;
  }
};
pomminappi.onclick = () => bomb();
freezenappi.onclick = () => freeze();
menuBtn.onclick = () => {
  stopMusic();
  showMenu();
};
restartBtn.onclick = () => startGame(selectedDifficulty);
difficultyCards.forEach(c => {
  c.onclick = () => startGame(c.dataset.difficulty);
  c.onmouseenter = playHoverSound;
});
gamemodecards.forEach(c => {
  c.onclick = () => cardclicked(c.dataset.mode);
  c.onmouseenter = playHoverSound;
});

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "p") {
    const active = document.activeElement;
    if (active !== inputText && !gameScene.classList.contains("hidden")) {
      e.preventDefault();
      togglePause();
    }
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "b") {
    const active = document.activeElement;
    if (active !== inputText && !gameScene.classList.contains("hidden")) {
      bomb();
    }
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "f") {
    const active = document.activeElement;
    if (active !== inputText && !gameScene.classList.contains("hidden")) {
      freeze();
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
        if(lines[i].trim()) helpotsanat.push(lines[i].trim());
      }
    })
  fetch("vaikeat.txt")
    .then(r=>r.text())
    .then(text => {
      const lines = text.split(/\r?\n/)
      for(var i = 0; i < lines.length; i++){
        if(lines[i].trim()) vaikeatsanat.push(lines[i].trim());
      } 
    })
}
//kutsumalla funktiota sana() se palauttaa satunnaisen sanan vaikeustason mukaan
function sana(){
  if(selectedDifficulty == "easy" || selectedDifficulty == "medium"){
    if (helpotsanat.length === 0) return "loading";
    return helpotsanat[Math.floor(Math.random() * helpotsanat.length)];
  } else {
    if (vaikeatsanat.length === 0) return "loading";
    return vaikeatsanat[Math.floor(Math.random() * vaikeatsanat.length)];
  }
}

function cardclicked(m){
  playClickSound();
  gamemode = m;
  menuScene.classList.remove("hidden");
  gamemodescene.classList.add("hidden");
}
//ajastin luo aikahaasteeseen 60 sekunnin ajastimen yläpuolelle näyttöä sekä laskee itsestään 60 sekunttia kunnes aiheuttaa game over näytön
function ajastin(){
  var timer = 60
  aika.innerHTML = timer;
  try { clearInterval(currenttime); } catch(e){}

  currenttime = setInterval(function () {
    if(gamePaused != true && !gameOver){
      timer = timer - 1;
      aika.innerHTML = timer
    }
    if(timer <= 0){
      clearInterval(currenttime);
      gameoverscreen();
    }
  }, 1000);
}

//siistitty clearing funktio
function clearing(){
  if(gamemode == "aikahaaste"){
    try{
      clearInterval(currenttime);
    } catch(e) { console.log(e); }
  }

  try{
    clearInterval(wordspawntimer);
  }  catch(e) { console.log(e); }

  
  words = [];
  closestword = "";
  score = 0;
  lives = maxLives;
  kombo.innerHTML = "kombo: 0";
  aika.innerHTML = "";
  inputText.value = ""; //Nollataan tekstikenttä
}


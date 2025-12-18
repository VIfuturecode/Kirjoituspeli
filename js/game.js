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
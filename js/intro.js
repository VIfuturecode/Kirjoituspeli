/* HAHMOT  */
const characters = [
    { id: "wizard", name: "Velho Viisas", dialogue: "Tervetuloa seikkailuun!", avatar: "🧙", cssClass: "wizard" },
    { id: "knight", name: "Ritari Rohkea", dialogue: "Maailma on vaarassa...", avatar: "⚔️", cssClass: "knight" },
    { id: "sage", name: "Tietäjä", dialogue: "Valitse matkasi viisaasti.", avatar: "🔮", cssClass: "sage" }
  ];
  
  let currentCharacterIndex = 0;
  let isMuted = false;

/* DOM */
const introScene = document.getElementById("intro-scene");
const menuScene = document.getElementById("menu-scene");
const characterAvatar = document.getElementById("character-avatar");
const characterName = document.getElementById("character-name");
const dialogueText = document.getElementById("dialogue-text");
const progressDots = document.getElementById("progress-dots");
const skipBtn = document.getElementById("skip-btn");
const muteBtn = document.getElementById("mute-btn");
const replayBtn = document.getElementById("replay-btn");

/* KIMALLUS */
function createSparkles() {
  const container = document.getElementById("sparkles");
  for (let i = 0; i < 25; i++) {
    const s = document.createElement("div");
    s.className = "sparkle";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.animationDelay = Math.random() * 2 + "s";
    container.appendChild(s);
  }
}

/* EDISTYMIS PISTEET */
function initProgressDots() {
  progressDots.innerHTML = "";
  characters.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "dot" + (i === 0 ? " active" : "");
    progressDots.appendChild(dot);
  });
}

function updateProgressDots() {
  const dots = progressDots.querySelectorAll(".dot");
  dots.forEach((dot, i) => {
    dot.classList.remove("active", "completed");
    if (i === currentCharacterIndex) dot.classList.add("active");
    else if (i < currentCharacterIndex) dot.classList.add("completed");
  });
}

/* PUHE */
function speak(text) {
  if (isMuted || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fi-FI";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

/* TYPEWRITER */
function typeWriter(text, el, cb) {
  el.innerHTML = "";
  let i = 0;
  function t() {
    if (i < text.length) {
      el.innerHTML = text.slice(0, i + 1) + '<span class="cursor"></span>';
      i++;
      setTimeout(t, 60);
    } else {
      el.textContent = text;
      if (cb) cb();
    }
  }
  t();
}
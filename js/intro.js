/* HAHMOT  */
const characters = [
    { id: "wizard", name: "Velho Viisas", dialogue: "Tervetuloa seikkailuun!", avatar: "🧙", cssClass: "wizard", pitch: 0.7, rate: 0.85 },
    { id: "knight", name: "Ritari Rohkea", dialogue: "Maailma on vaarassa...", avatar: "⚔️", cssClass: "knight", pitch: 1.3, rate: 0.95 },
    { id: "sage", name: "Tietäjä", dialogue: "Valitse matkasi viisaasti.", avatar: "🔮", cssClass: "sage", pitch: 1.1, rate: 0.9}
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
function speak(text, character) {
  if (isMuted || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fi-FI";
  u.pitch = character.pitch || 1.0; 
  u.rate = character.rate || 0.9;
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

/* INTRO HAHMO  */
function showCharacter(i) {
  const c = characters[i];
  characterAvatar.textContent = c.avatar;
  characterAvatar.className = "avatar " + c.cssClass;
  characterName.textContent = c.name;

  setTimeout(() => speak(c.dialogue), 400);
  setTimeout(() => {
    typeWriter(c.dialogue, dialogueText, () => {
      setTimeout(() => {
        if (currentCharacterIndex < characters.length - 1) {
          currentCharacterIndex++;
          updateProgressDots();
          showCharacter(currentCharacterIndex);
        } else {
          showMenu();
        }
      }, 1200);
    });
  }, 500);
}

/* SCENET */
function showMenu() {
  introScene.classList.add("hidden");
  menuScene.classList.remove("hidden");
  skipBtn.classList.add("hidden");
  document.body.className = "intro-bg";
}

function showIntro() {
  currentCharacterIndex = 0;
  menuScene.classList.add("hidden");
  introScene.classList.remove("hidden");
  skipBtn.classList.remove("hidden");
  document.body.className = "intro-bg";
  updateProgressDots();
  showCharacter(0);
}

/* EVENTIT */
muteBtn.onclick = () => {
  isMuted = !isMuted;
  muteBtn.textContent = isMuted ? "Mykistetty" : "Ääni";
};
skipBtn.onclick = showMenu;
replayBtn.onclick = showIntro;

/* START */
createSparkles();
initProgressDots();
showCharacter(0);
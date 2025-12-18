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
  
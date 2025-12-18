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
  
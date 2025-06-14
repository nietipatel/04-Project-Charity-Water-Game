// main.js

window.onload = () => {
  const startButton = document.getElementById('start-button');
  const startScreen = document.getElementById('start-screen');
  const gameScreen = document.getElementById('game-screen');
  const gameOverScreen = document.getElementById('game-over-screen');
  const pauseButton = document.getElementById('pause-button');
  const muteButton = document.getElementById('mute-button');
  const finalScoreEl = document.getElementById('final-score');
  const cleanWaterFactEl = document.getElementById('clean-water-fact');
  const restartButton = document.getElementById('restart-button');
  const shareButton = document.getElementById('share-button');
  const infoLink = document.getElementById('info-link');

  let game;
  let isMuted = false;

  const facts = [
    "Over 2 billion people lack access to safe drinking water worldwide.",
    "Waterborne diseases cause 3.4 million deaths each year.",
    "Simple water filters can reduce contaminants by over 90%.",
    "Protecting water sources saves lives and ecosystems.",
  ];

  startScreen.classList.remove('hidden');
  gameScreen.style.display = 'none';
  gameOverScreen.classList.add('hidden');

  startButton.onclick = () => {
    startScreen.classList.add('hidden');
    gameScreen.style.display = 'flex';
    gameOverScreen.classList.add('hidden');

    game = new Game();
    game.start();
  };

  pauseButton.onclick = () => {
    if (game.isPaused) {
      game.resume();
      pauseButton.textContent = 'Pause';
    } else {
      game.pause();
      pauseButton.textContent = 'Resume';
    }
  };

  muteButton.onclick = () => {
    isMuted = !isMuted;
    muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
  };

  window.onGameOver = (score) => {
    finalScoreEl.textContent = `Your Score: ${score}`;
    cleanWaterFactEl.textContent = facts[Math.floor(Math.random() * facts.length)];

    gameOverScreen.classList.remove('hidden');
    gameScreen.style.display = 'none';
    startScreen.classList.add('hidden');
  };

  restartButton.onclick = () => {
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
  };

  shareButton.onclick = () => {
    alert('Share your score with friends!');
  };

  window.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'ArrowUp') && game && !game.isPaused) {
      e.preventDefault();
      game.droplet.jump();
    }
  });

  infoLink.onclick = (e) => {
    e.preventDefault();
    alert('Avoid pollution and dry zones, collect filters and coins to increase your score!');
  };
};

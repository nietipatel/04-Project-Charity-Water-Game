const startBtn = document.getElementById('start-button');
const restartBtn = document.getElementById('restart-button');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreDisplay = document.getElementById('score');
const finalScore = document.getElementById('final-score');

let game;

startBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  game = new Game();
  game.start();
});

restartBtn.addEventListener('click', () => {
  gameOverScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  game = new Game();
  game.start();
});

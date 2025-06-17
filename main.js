// main.js - AquaFlow charity: water game
// All logic merged here for compatibility with direct file opening

// --- Game Logic ---
const LEVELS = [
  { grid: [4, 4], speed: 1200 },
  { grid: [5, 5], speed: 900 },
  { grid: [6, 6], speed: 700 },
  { grid: [7, 7], speed: 500 }
];

let currentLevel = 0;
let score = 0;
let intervalId = null;
let gameState = 'start'; // start, playing, gameover, win
let pipeGrid = [];
const PIPE_TYPES = [
  { symbol: '┃', connects: ['up', 'down'] },
  { symbol: '━', connects: ['left', 'right'] },
  { symbol: '┏', connects: ['down', 'right'] },
  { symbol: '┓', connects: ['down', 'left'] },
  { symbol: '┗', connects: ['up', 'right'] },
  { symbol: '┛', connects: ['up', 'left'] }
];

// Helper to rotate pipe connections
function rotateConnects(connects, rotation) {
  const dirOrder = ['up', 'right', 'down', 'left'];
  return connects.map(dir => {
    let idx = dirOrder.indexOf(dir);
    return dirOrder[(idx + rotation / 90) % 4];
  });
}

const COLLECTIBLE = '💧';
const OBSTACLE = '☠️';
let isMuted = false;

function showStartScreen() {
  const container = document.getElementById('game-container');
  container.innerHTML = `
    <header>
      <img id="charitywater-logo" src="https://www.charitywater.org/images/logos/cw-logo--icon.svg" alt="charity: water logo" />
      <span style="font-size:1.5em;font-weight:bold;vertical-align:middle;">AquaFlow</span>
    </header>
    <p>Guide the water through the pipes!<br>Don’t let it leak!</p>
    <a class="info-link" href="https://www.charitywater.org/" target="_blank">Learn about charity: water</a>
    <br>
    <button class="button" id="start-btn">Start Game</button>
    <p style="font-size:0.9em;">Inspired by charity: water</p>
  `;
  document.getElementById('start-btn').onclick = () => startGame(0);
}

function startGame(levelIdx) {
  currentLevel = levelIdx;
  score = 0;
  gameState = 'playing';
  renderLevel();
  startWaterFlow();
}

function renderLevel() {
  const { grid } = LEVELS[currentLevel];
  const container = document.getElementById('game-container');
  container.innerHTML = `
    <header>
      <img id="charitywater-logo" src="https://www.charitywater.org/images/logos/cw-logo--icon.svg" alt="charity: water logo" />
      <span style="font-size:1.2em;font-weight:bold;vertical-align:middle;">AquaFlow</span>
      <a class="info-link" href="https://www.charitywater.org/" target="_blank" style="float:right;font-size:0.9em;">charity: water</a>
    </header>
    <div id="level">Level ${currentLevel + 1}</div>
    <div id="score">Score: <span id="score-val">0</span></div>
    <div id="pipe-grid"></div>
    <div id="progress-bar"><div id="progress"></div></div>
    <div id="message"></div>
    <button class="button" id="pause-btn" type="button">Pause</button>
    <button class="button" id="next-level-btn" type="button">Next Level</button>
  `;
  renderPipeGrid(grid[0], grid[1]);
  document.getElementById('pause-btn').onclick = pauseGame;
  const nextBtn = document.getElementById('next-level-btn');
  nextBtn.onclick = () => {
    if (currentLevel < LEVELS.length - 1) {
      currentLevel++;
      renderLevel();
      startWaterFlow();
    } else {
      showWinScreen();
    }
  };
  updateNextLevelButton();
}

function renderPipeGrid(rows, cols) {
  pipeGrid = [];
  const grid = document.getElementById('pipe-grid');
  grid.style.gridTemplateRows = `repeat(${rows}, 48px)`;
  grid.style.gridTemplateColumns = `repeat(${cols}, 48px)`;
  grid.innerHTML = '';
  const layout = LEVEL_LAYOUTS[currentLevel];
  for (let r = 0; r < rows; r++) {
    pipeGrid[r] = [];
    for (let c = 0; c < cols; c++) {
      let cellType = 'pipe';
      let typeIdx = 0;
      let rotation = 0;
      let symbol = PIPE_TYPES[typeIdx].symbol;
      if (layout && layout[r] && layout[r][c] !== undefined && layout[r][c] !== null) {
        if (layout[r][c] === 'start') {
          symbol = '🚰';
          cellType = 'start';
          typeIdx = 1;
          rotation = 0;
        } else if (layout[r][c] === 'end') {
          symbol = '🏁';
          cellType = 'end';
          typeIdx = 1;
          rotation = 0;
        } else {
          typeIdx = layout[r][c][0];
          rotation = layout[r][c][1];
          symbol = PIPE_TYPES[typeIdx].symbol;
        }
      } else {
        // Fill with a random dead-end pipe (not a skull)
        const deadEnds = [0, 1, 2, 3, 4, 5];
        typeIdx = deadEnds[Math.floor(Math.random() * deadEnds.length)];
        symbol = PIPE_TYPES[typeIdx].symbol;
        cellType = 'obstacle';
        rotation = Math.floor(Math.random() * 4) * 90;
      }
      const cell = document.createElement('div');
      cell.className = 'pipe-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.textContent = symbol;
      cell.style.transform = `rotate(${rotation}deg)`;
      cell.onclick = () => rotatePipe(cell);
      grid.appendChild(cell);
      pipeGrid[r][c] = { typeIdx, symbol, cellType, rotation };
    }
  }
  // Set start and end
  grid.children[0].textContent = '🚰';
  grid.children[0].style.transform = 'rotate(0deg)';
  pipeGrid[0][0] = { typeIdx: 1, symbol: '🚰', cellType: 'start', rotation: 0 };
  grid.children[grid.children.length - 1].textContent = '🏁';
  grid.children[grid.children.length - 1].style.transform = 'rotate(0deg)';
  pipeGrid[rows-1][cols-1] = { typeIdx: 1, symbol: '🏁', cellType: 'end', rotation: 0 };
}

function rotatePipe(cell) {
  const r = +cell.dataset.row, c = +cell.dataset.col;
  // Allow all cells (including obstacles) to rotate
  if (pipeGrid[r][c].cellType === 'start' || pipeGrid[r][c].cellType === 'end') return;
  pipeGrid[r][c].rotation = (pipeGrid[r][c].rotation + 90) % 360;
  cell.style.transform = `rotate(${pipeGrid[r][c].rotation}deg)`;
  updateNextLevelButton();
}

function updateNextLevelButton() {
  const nextBtn = document.getElementById('next-level-btn');
  const msg = document.getElementById('message');
  document.querySelectorAll('.path-correct, .path-incorrect').forEach(cell => {
    cell.classList.remove('path-correct', 'path-incorrect');
  });
  const rows = pipeGrid.length, cols = pipeGrid[0].length;
  const layout = LEVEL_LAYOUTS[currentLevel];
  let queue = [{ r: 0, c: 0, from: null, path: [] }];
  let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  let found = false;
  let lastPath = [];
  while (queue.length) {
    const { r, c, from, path } = queue.shift();
    if (visited[r][c]) continue;
    visited[r][c] = true;
    const cell = pipeGrid[r][c];
    const newPath = [...path, { r, c }];
    if (cell.cellType === 'obstacle') continue;
    if (cell.cellType === 'end') {
      found = true;
      lastPath = newPath;
      break;
    }
    let connects = [];
    if (cell.cellType === 'pipe' || cell.cellType === 'start') {
      connects = rotateConnects(PIPE_TYPES[cell.typeIdx].connects, cell.rotation);
    }
    for (const dir of connects) {
      let nr = r, nc = c, back = null;
      if (dir === 'up') { nr--; back = 'down'; }
      if (dir === 'down') { nr++; back = 'up'; }
      if (dir === 'left') { nc--; back = 'right'; }
      if (dir === 'right') { nc++; back = 'left'; }
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        const neighbor = pipeGrid[nr][nc];
        let neighborConnects = [];
        if (neighbor.cellType === 'pipe' || neighbor.cellType === 'end') {
          neighborConnects = rotateConnects(PIPE_TYPES[neighbor.typeIdx].connects, neighbor.rotation);
        }
        if (neighborConnects.includes(back) || neighbor.cellType === 'end') {
          queue.push({ r: nr, c: nc, from: dir, path: newPath });
        }
      }
    }
  }
  // Only require the path to be found (unique solution), not all solution cells
  if (found) {
    nextBtn.disabled = false;
    msg.textContent = 'Correct! You can go to the next level.';
    lastPath.forEach(({ r, c }) => {
      const domCell = document.querySelector(`.pipe-cell[data-row='${r}'][data-col='${c}']`);
      if (domCell) domCell.classList.add('path-correct');
    });
  } else {
    nextBtn.disabled = true;
    msg.textContent = 'Arrange the pipes to complete the path.';
    if (lastPath.length) {
      lastPath.forEach(({ r, c }) => {
        const domCell = document.querySelector(`.pipe-cell[data-row='${r}'][data-col='${c}']`);
        if (domCell) domCell.classList.add('path-incorrect');
      });
    }
  }
}

function testPath() {
  const result = canWaterFlowWithEffects();
  const msg = document.getElementById('message');
  const testBtn = document.getElementById('test-path-btn');
  let nextBtn = document.getElementById('next-level-btn');
  if (result.success) {
    msg.textContent = 'Correct! Click Next Level to continue.';
    if (intervalId) clearInterval(intervalId);
    if (testBtn) testBtn.style.display = 'none';
    if (!nextBtn) {
      nextBtn = document.createElement('button');
      nextBtn.className = 'button';
      nextBtn.id = 'next-level-btn';
      nextBtn.textContent = (currentLevel < LEVELS.length - 1) ? 'Next Level' : 'Finish';
      nextBtn.onclick = () => {
        if (currentLevel < LEVELS.length - 1) {
          currentLevel++;
          renderLevel();
          startWaterFlow();
        } else {
          showWinScreen();
        }
      };
      msg.parentNode.appendChild(nextBtn);
    } else {
      nextBtn.style.display = '';
    }
  } else {
    msg.textContent = 'Path is not complete. Try again!';
    if (nextBtn) nextBtn.style.display = 'none';
  }
}

function startWaterFlow() {
  const { speed } = LEVELS[currentLevel];
  let progress = 0;
  let collected = 0;
  intervalId = setInterval(() => {
    progress += 100 / 20;
    document.getElementById('progress').style.width = progress + '%';
    highlightWaterPath();
    // Check if water can flow from start to end and animate collectibles/obstacles
    const result = canWaterFlowWithEffects();
    if (result.success) {
      clearInterval(intervalId);
      // Instantly go to next level or win
      setTimeout(() => nextLevelOrWin(), 600); // short delay for feedback
      return;
    }
    if (!result.success) {
      clearInterval(intervalId);
      // Shake the grid on obstacle
      const grid = document.getElementById('pipe-grid');
      grid.classList.add('grid-shake');
      setTimeout(() => grid.classList.remove('grid-shake'), 400);
      gameOver();
      return;
    }
    // Update score for collectibles
    if (result.collected > collected) {
      score += (result.collected - collected) * 10;
      document.getElementById('score-val').textContent = score;
      collected = result.collected;
      showMilestone(score);
    }
    if (progress >= 100) {
      clearInterval(intervalId);
      nextLevelOrWin();
    }
  }, speed);
}

// --- Water facts for game over/win ---
const WATER_FACTS = [
  "1 in 10 people lack access to clean water.",
  "Women and girls spend 200 million hours every day collecting water.",
  "Every $1 invested in clean water can yield $4–$12 in economic returns.",
  "Unsafe water kills more people each year than all forms of violence, including war.",
  "Access to clean water can improve education, health, and income.",
  "More people have a mobile phone than a toilet.",
  "Clean water reduces water-borne diseases by up to 50%."
];

function getRandomFact() {
  return WATER_FACTS[Math.floor(Math.random() * WATER_FACTS.length)];
}

// --- Milestone feedback ---
function showMilestone(score) {
  const msg = document.getElementById('message');
  if (!msg) return;
  if (score >= 100 && score < 110) msg.textContent = 'Milestone: 100 points!';
  else if (score >= 200 && score < 210) msg.textContent = 'Milestone: 200 points!';
  else if (score >= 300 && score < 310) msg.textContent = 'Milestone: 300 points!';
  else msg.textContent = '';
}

// --- Animated water droplet on path ---
function highlightWaterPath() {
  document.querySelectorAll('.active-pipe').forEach(cell => cell.classList.remove('active-pipe', 'droplet'));
  const rows = pipeGrid.length, cols = pipeGrid[0].length;
  let queue = [{ r: 0, c: 0, from: null, path: [] }];
  let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  while (queue.length) {
    const { r, c, from, path } = queue.shift();
    if (visited[r][c]) continue;
    visited[r][c] = true;
    const cell = pipeGrid[r][c];
    const newPath = [...path, { r, c }];
    if (cell.cellType === 'obstacle') return;
    if (cell.cellType === 'end') {
      newPath.forEach(({ r, c }, i) => {
        const domCell = document.querySelector(`.pipe-cell[data-row='${r}'][data-col='${c}']`);
        if (domCell) {
          domCell.classList.add('active-pipe');
          if (i === newPath.length - 2) domCell.classList.add('droplet'); // droplet before end
        }
      });
      return;
    }
    let connects = [];
    if (cell.cellType === 'pipe' || cell.cellType === 'start') {
      connects = PIPE_TYPES[cell.typeIdx].connects;
    }
    for (const dir of connects) {
      let nr = r, nc = c, back = null;
      if (dir === 'up') { nr--; back = 'down'; }
      if (dir === 'down') { nr++; back = 'up'; }
      if (dir === 'left') { nc--; back = 'right'; }
      if (dir === 'right') { nc++; back = 'left'; }
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        const neighbor = pipeGrid[nr][nc];
        let neighborConnects = [];
        if (neighbor.cellType === 'pipe' || neighbor.cellType === 'end') {
          neighborConnects = PIPE_TYPES[neighbor.typeIdx].connects;
        }
        if (neighborConnects.includes(back) || neighbor.cellType === 'end') {
          queue.push({ r: nr, c: nc, from: dir, path: newPath });
        }
      }
    }
  }
}

// --- Share button logic ---
function addShareButton(container) {
  const shareBtn = document.createElement('button');
  shareBtn.className = 'button';
  shareBtn.textContent = 'Share';
  shareBtn.onclick = () => {
    const shareText = 'Try AquaFlow and learn about clean water! https://www.charitywater.org/';
    if (navigator.share) {
      navigator.share({ title: 'AquaFlow', text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Share link copied to clipboard!');
    }
  };
  container.appendChild(shareBtn);
}

// --- Update showWinScreen and gameOver to use random fact and share button ---
function showWinScreen() {
  gameState = 'win';
  const container = document.getElementById('game-container');
  container.innerHTML = `
    <header>
      <img id="charitywater-logo" src="https://www.charitywater.org/images/logos/cw-logo--icon.svg" alt="charity: water logo" />
      <span style="font-size:1.2em;font-weight:bold;vertical-align:middle;">AquaFlow</span>
      <a class="info-link" href="https://www.charitywater.org/" target="_blank" style="float:right;font-size:0.9em;">charity: water</a>
    </header>
    <h2>You Win!</h2>
    <div>Your Score: ${score}</div>
    <div style="margin:12px 0;">Did you know? ${getRandomFact()}</div>
    <button class="button" id="restart-btn">Restart</button>
  `;
  addShareButton(container);
  document.getElementById('restart-btn').onclick = () => showStartScreen();
  setupUI();
}

function gameOver() {
  gameState = 'gameover';
  if (intervalId) clearInterval(intervalId);
  const container = document.getElementById('game-container');
  container.innerHTML += `
    <div id="message">Game Over! Water was lost.</div>
    <div style="margin:12px 0;">Did you know? ${getRandomFact()}</div>
    <button class="button" id="retry-btn">Retry Level</button>
  `;
  addShareButton(container);
  document.getElementById('retry-btn').onclick = () => startGame(currentLevel);
  setupUI();
}

function pauseGame() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    document.getElementById('message').textContent = 'Paused. Click Test Path or Start to continue.';
  }
}

// --- Ensure mute button works on all screens ---
function setupUI() {
  // Mute button
  const muteBtn = document.getElementById('mute-btn');
  if (muteBtn) {
    muteBtn.onclick = () => {
      isMuted = !isMuted;
      muteBtn.textContent = isMuted ? '🔇' : '🔊';
    };
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
  }
  // Pause button
  const pauseBtn = document.getElementById('pause-btn');
  if (pauseBtn) pauseBtn.onclick = pauseGame;
  // Test Path button
  const testBtn = document.getElementById('test-path-btn');
  if (testBtn) testBtn.onclick = testPath;
  // Start button
  const startBtn = document.getElementById('start-btn');
  if (startBtn) startBtn.onclick = () => startGame(0);
  // Next Level button
  const nextBtn = document.getElementById('next-level-btn');
  if (nextBtn) nextBtn.onclick = () => startGame(currentLevel + 1);
  // Retry button
  const retryBtn = document.getElementById('retry-btn');
  if (retryBtn) retryBtn.onclick = () => startGame(currentLevel);
  // Restart button
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) restartBtn.onclick = () => showStartScreen();
}

// Patch all UI renders to call setupUI after rendering
const _renderLevel = renderLevel;
renderLevel = function() { _renderLevel.apply(this, arguments); setupUI(); };
const _showStartScreen = showStartScreen;
showStartScreen = function() { _showStartScreen.apply(this, arguments); setupUI(); };
const _showWinScreen = showWinScreen;
showWinScreen = function() { _showWinScreen.apply(this, arguments); setupUI(); };
const _gameOver = gameOver;
gameOver = function() { _gameOver.apply(this, arguments); setupUI(); };

document.addEventListener('DOMContentLoaded', () => {
  showStartScreen();
  setupUI();
});

// --- Predefined level layouts for unique solutions ---
const LEVEL_LAYOUTS = [
  // Level 1: 4x4 (fixed: unique rotatable path)
  [
    ['start', [1,0], [3,270], [1,0]],
    [null, null, [0,90], null],
    [null, null, [2,180], null],
    [null, null, [1,0], 'end']
  ],
  // Level 2: 5x5
  [
    ['start', [1,0], [1,0], [2,0], null],
    [null, null, [4,0], null, null],
    [null, null, [1,0], [2,0], [1,0]],
    [null, null, null, null, [1,0]],
    [null, null, null, null, 'end']
  ],
  // Level 3: 6x6
  [
    ['start', [1,0], [1,0], [2,0], null, null],
    [null, null, [4,0], null, null, null],
    [null, null, [1,0], [2,0], [1,0], null],
    [null, null, null, null, [1,0], null],
    [null, null, null, null, [1,0], [2,0]],
    [null, null, null, null, null, 'end']
  ],
  // Level 4: 7x7
  [
    ['start', [1,0], [1,0], [2,0], null, null, null],
    [null, null, [4,0], null, null, null, null],
    [null, null, [1,0], [2,0], [1,0], null, null],
    [null, null, null, null, [1,0], null, null],
    [null, null, null, null, [1,0], [2,0], [1,0]],
    [null, null, null, null, null, null, [1,0]],
    [null, null, null, null, null, null, 'end']
  ]
];

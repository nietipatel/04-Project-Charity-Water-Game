class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.bucket = new Bucket(this.canvas.width / 2 - 30, this.canvas.height - 60);
    this.droplets = [];
    this.score = 0;
    this.running = true;
    this.lastDropTime = 0;

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  start() {
    this.running = true;
    this.score = 0;
    this.droplets = [];
    this.lastDropTime = 0;
    this.loop();
  }

  handleKeyDown(e) {
    if (e.key === 'ArrowLeft') this.bucket.move(-20);
    if (e.key === 'ArrowRight') this.bucket.move(20);
  }

  loop(timestamp = 0) {
    if (!this.running) return;

    // Add new droplet
    if (timestamp - this.lastDropTime > 1000) {
      this.droplets.push(new Droplet(this.canvas));
      this.lastDropTime = timestamp;
    }

    // Update
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.bucket.draw(this.ctx);

    this.droplets.forEach((drop, index) => {
      drop.update();
      drop.draw(this.ctx);

      // Collision
      if (drop.hits(this.bucket)) {
        if (drop.isBad) {
          this.endGame();
        } else {
          this.score++;
          this.droplets.splice(index, 1);
        }
      } else if (drop.y > this.canvas.height) {
        this.droplets.splice(index, 1);
      }
    });

    // Score display
    scoreDisplay.textContent = `Score: ${this.score}`;

    requestAnimationFrame(this.loop.bind(this));
  }

  endGame() {
    this.running = false;
    document.getElementById('final-score').textContent = `Your Score: ${this.score}`;
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');
  }
}

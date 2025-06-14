// droplet.js

class Droplet {
  constructor(game) {
    this.game = game;
    this.width = 40;
    this.height = 40;
    this.x = 50;
    this.y = game.canvas.height - 60 - this.height; // start on ground
    this.velocityY = 0;
    this.gravity = 0.6;
    this.jumpStrength = -12;

    this.maxJumps = 2;    // allow double jump
    this.jumpsUsed = 0;
  }

  jump() {
    if (this.jumpsUsed < this.maxJumps) {
      this.velocityY = this.jumpStrength;
      this.jumpsUsed++;
    }
  }

  update(deltaTime) {
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    const groundLevel = this.game.canvas.height - 60 - this.height;

    if (this.y >= groundLevel) {
      this.y = groundLevel;
      this.velocityY = 0;
      this.jumpsUsed = 0; // reset jumps on ground
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#00BFFF'; // bright blue droplet
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width / 2,
      this.height / 2,
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}

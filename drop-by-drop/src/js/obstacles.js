// obstacles.js

class Obstacle {
  constructor(game, x, y, width, height, speed) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
  }

  update(deltaTime) {
    this.x -= this.speed * deltaTime * 0.1;

    if (this.x + this.width < 0) {
      this.game.removeObstacle(this);
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#8B0000'; // dark red for pollution obstacle
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  collidesWith(droplet) {
    return (
      droplet.x < this.x + this.width &&
      droplet.x + droplet.width > this.x &&
      droplet.y < this.y + this.height &&
      droplet.y + droplet.height > this.y
    );
  }
}

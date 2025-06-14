// game.js (update draw and spawnObstacle)

class Game {
  // ...existing constructor and methods...

  draw() {
    // Clear
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background (optional)
    this.ctx.fillStyle = '#a2d5f2';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground
    this.ctx.fillStyle = '#2E8B57'; // dark green ground
    this.ctx.fillRect(0, this.canvas.height - 60, this.canvas.width, 60);

    // Draw droplet
    this.droplet.draw(this.ctx);

    // Draw obstacles
    this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
  }

  spawnObstacle() {
    const width = 40;
    const height = 40 + Math.random() * 40; // 40-80px tall
    const y = this.canvas.height - 60 - height; // place on ground
    const speed = 0.3 + Math.random() * 0.2;

    const obstacle = new Obstacle(this, this.canvas.width, y, width, height, speed);
    this.obstacles.push(obstacle);
  }
}

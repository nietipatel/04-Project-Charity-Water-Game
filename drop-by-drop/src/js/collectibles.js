// collectibles.js

class Collectible {
  constructor(canvasWidth, canvasHeight) {
    this.width = 30;
    this.height = 30;
    this.x = canvasWidth + Math.random() * 300;
    this.y = canvasHeight - 40 - this.height - Math.random() * 100;
    this.speed = 3;
    this.type = Math.random() < 0.5 ? 'filter' : 'coin';
  }

  update() {
    this.x -= this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = this.type === 'filter' ? '#0f0' : 'yellow';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.type === 'filter' ? 'F' : 'C', this.x + this.width / 2, this.y + this.height / 1.5);
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

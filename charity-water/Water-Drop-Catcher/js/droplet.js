class Droplet {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * (canvas.width - 20);
    this.y = 0;
    this.size = 20;
    this.speed = 2 + Math.random() * 3;
    this.isBad = Math.random() < 0.2; // 20% chance of bad drop
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = this.isBad ? '#b71c1c' : '#2196f3'; // red for bad, blue for good
    ctx.beginPath();
    ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  hits(bucket) {
    return (
      this.y + this.size > bucket.y &&
      this.y < bucket.y + bucket.height &&
      this.x + this.size > bucket.x &&
      this.x < bucket.x + bucket.width
    );
  }
}

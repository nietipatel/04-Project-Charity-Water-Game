class Bucket {
  constructor(x, y) {
    this.width = 60;
    this.height = 30;
    this.x = x;
    this.y = y;
    this.color = '#fdd835'; // charity: water yellow
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  move(dx) {
    this.x += dx;
    // Boundaries
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > 400) this.x = 400 - this.width;
  }
}

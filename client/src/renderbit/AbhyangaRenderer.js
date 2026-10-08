export default class AbhyangaRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animationId = null;
  }
  start() {}
  stop() {}
  update() {}
  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}

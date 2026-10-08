export default class PoseRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }
  setFeedback(type) {}
  update() {}
  destroy() {}
}

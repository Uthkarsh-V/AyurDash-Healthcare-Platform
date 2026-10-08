export default class WatchFaceRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }
  setTime(hh, mm) {}
  setNextReminder(label) {}
  playNotification() {}
  update() {}
  destroy() {}
}

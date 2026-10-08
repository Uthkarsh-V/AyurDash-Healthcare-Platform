export default class PoseRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.time = 0;
    this.running = false;
    this.feedbackType = 'good';
    
    this.animate = this.animate.bind(this);
  }

  start() {
    this.running = true;
    this.canvas.width = 640;
    this.canvas.height = 480;
    
    // Overlay canvas on top of video element using CSS in the component
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    
    this.animate();
  }

  stop() {
    this.running = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  setFeedback(type) {
    this.feedbackType = type;
  }

  animate() {
    if (!this.running) return;
    this.time += 0.05;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    const cx = w / 2;
    const cy = h / 2 + Math.sin(this.time) * 15; // Body bobs up and down during massage
    
    // Status Colors: good = Green, warn = Yellow, danger = Red
    let color = '#2ecc71';
    if (this.feedbackType === 'warn') color = '#f1c40f';
    if (this.feedbackType === 'danger') color = '#e74c3c';

    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Simulate massage stroke motion reach
    const reachY = 80 + Math.sin(this.time * 1.5) * 60;
    const reachX = 40 + Math.cos(this.time * 1.5) * 20;

    // Torso/Spine
    ctx.beginPath();
    ctx.moveTo(cx, cy - 60);
    ctx.lineTo(cx, cy + 120);
    ctx.stroke();

    // Shoulders
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy - 60);
    ctx.lineTo(cx + 70, cy - 60);
    ctx.stroke();

    // Left Arm
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy - 60);
    ctx.lineTo(cx - reachX - 40, cy + reachY);
    ctx.stroke();

    // Right Arm
    ctx.beginPath();
    ctx.moveTo(cx + 70, cy - 60);
    ctx.lineTo(cx + reachX + 40, cy + reachY);
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(cx, cy - 110, 40, 0, Math.PI*2);
    ctx.stroke();
    
    // Draw tracking nodes
    const joints = [
      {x: cx, y: cy - 60}, {x: cx, y: cy + 120},
      {x: cx - 70, y: cy - 60}, {x: cx + 70, y: cy - 60},
      {x: cx - reachX - 40, y: cy + reachY}, {x: cx + reachX + 40, y: cy + reachY}
    ];
    
    ctx.fillStyle = '#fff';
    for (let j of joints) {
      ctx.beginPath();
      ctx.arc(j.x, j.y, 8, 0, Math.PI*2);
      ctx.fill();
    }

    requestAnimationFrame(this.animate);
  }

  destroy() {
    this.running = false;
  }
}

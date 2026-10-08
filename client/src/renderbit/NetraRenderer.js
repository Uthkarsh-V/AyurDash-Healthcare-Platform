export default class NetraRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.thickness = 2.5;
    this.temp = 37;
    this.nodes = [];
    this.time = 0;
    
    this.animate = this.animate.bind(this);
    this.animationId = requestAnimationFrame(this.animate);
  }

  update({ thickness, temp, nodes }) {
    this.thickness = thickness;
    this.temp = temp;
    this.nodes = nodes || [];
  }

  animate() {
    this.time += 0.05;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Draw face background
    ctx.fillStyle = '#f5cba7';
    ctx.fillRect(0, 0, w, h);
    
    const cx = w / 2;
    const cy = h / 2;
    
    // Draw Eye Base
    ctx.beginPath();
    ctx.moveTo(cx - 80, cy);
    ctx.quadraticCurveTo(cx, cy - 50, cx + 80, cy);
    ctx.quadraticCurveTo(cx, cy + 50, cx - 80, cy);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#a04000';
    ctx.stroke();
    
    // Iris
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#4a2311';
    ctx.fill();
    
    // Pupil
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();

    // Calculate Dough Ring dimensions (Thickness 1-5 cm mapped to pixels)
    const ringThick = this.thickness * 12;
    
    // Draw Dough Ring
    ctx.beginPath();
    ctx.ellipse(cx, cy, 130 + ringThick/2, 90 + ringThick/2, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#d4ac0d'; // Dough color
    ctx.lineWidth = ringThick;
    ctx.stroke();
    
    // Draw Medicated Oil (Inside the dough ring)
    // Color temp mapping: 30 (Yellow/Cool) -> 45 (Red/Hot)
    let r = Math.min(255, 180 + (this.temp - 30) * 5);
    let g = Math.max(50, 180 - (this.temp - 30) * 8);
    ctx.beginPath();
    ctx.ellipse(cx, cy, 130 - ringThick/4, 90 - ringThick/4, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r}, ${g}, 0, 0.65)`;
    ctx.fill();

    // Oil Ripples
    ctx.beginPath();
    ctx.ellipse(cx, cy, 70 + Math.sin(this.time)*10, 50 + Math.cos(this.time)*10, 0, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
    ctx.lineWidth = 3;
    ctx.stroke();

    this.animationId = requestAnimationFrame(this.animate);
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
  }
}

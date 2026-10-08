export default class MarmaRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.points = [
      { id: 'adhipati', name: 'Adhipati', type: 'Sadhya Pranahara', x: 0.5, y: 0.1, size: 0.5 },
      { id: 'sthapani', name: 'Sthapani', type: 'Vishalyaghna', x: 0.5, y: 0.15, size: 0.5 },
      { id: 'hridaya', name: 'Hridaya', type: 'Sadhya Pranahara', x: 0.5, y: 0.4, size: 1.0 },
      { id: 'nabhi', name: 'Nabhi', type: 'Sadhya Pranahara', x: 0.5, y: 0.55, size: 1.0 },
      { id: 'basti', name: 'Basti', type: 'Sadhya Pranahara', x: 0.5, y: 0.65, size: 1.0 },
      { id: 'kshipra', name: 'Kshipra', type: 'Kalantara Pranahara', x: 0.2, y: 0.6, size: 0.5 },
      { id: 'kshipra_r', name: 'Kshipra', type: 'Kalantara Pranahara', x: 0.8, y: 0.6, size: 0.5 },
      { id: 'gulpha', name: 'Gulpha', type: 'Rujakara', x: 0.4, y: 0.9, size: 2.0 },
      { id: 'gulpha_r', name: 'Gulpha', type: 'Rujakara', x: 0.6, y: 0.9, size: 2.0 },
    ];
    
    this.hoveredPoint = null;
    this.onSelect = null;
    this.time = 0;
    
    this.handleMove = this.handleMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.canvas.addEventListener('mousemove', this.handleMove);
    this.canvas.addEventListener('click', this.handleClick);
    
    this.animate = this.animate.bind(this);
    this.animationId = requestAnimationFrame(this.animate);
  }
  
  update({ onSelect }) {
    this.onSelect = onSelect;
  }
  
  getHit(x, y) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    for (let p of this.points) {
      const px = p.x * w;
      const py = p.y * h;
      const dist = Math.hypot(px - x, py - y);
      if (dist < 15) return p;
    }
    return null;
  }
  
  handleMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const hit = this.getHit(x, y);
    this.hoveredPoint = hit;
    this.canvas.style.cursor = hit ? 'pointer' : 'default';
  }
  
  handleClick(e) {
    if (this.hoveredPoint && this.onSelect) {
      this.onSelect(this.hoveredPoint);
    }
  }
  
  animate() {
    this.time += 0.05;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Draw simple silhouette (ellipse for head, rect for torso, lines for limbs)
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    
    // Head
    ctx.beginPath();
    ctx.ellipse(w/2, h*0.15, w*0.08, h*0.08, 0, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();
    // Torso
    ctx.beginPath();
    ctx.rect(w*0.35, h*0.25, w*0.3, h*0.35);
    ctx.fill(); ctx.stroke();
    // Arms
    ctx.beginPath();
    ctx.moveTo(w*0.35, h*0.3); ctx.lineTo(w*0.2, h*0.6);
    ctx.moveTo(w*0.65, h*0.3); ctx.lineTo(w*0.8, h*0.6);
    ctx.stroke();
    // Legs
    ctx.beginPath();
    ctx.moveTo(w*0.4, h*0.6); ctx.lineTo(w*0.4, h*0.9);
    ctx.moveTo(w*0.6, h*0.6); ctx.lineTo(w*0.6, h*0.9);
    ctx.stroke();
    
    // Draw points
    for (let p of this.points) {
      const px = p.x * w;
      const py = p.y * h;
      
      const isHovered = this.hoveredPoint === p;
      const pulse = isHovered ? Math.sin(this.time) * 4 : 0;
      
      let color = '#4DB8FF';
      if (p.type === 'Sadhya Pranahara') color = '#FF4D4D';
      else if (p.type === 'Kalantara Pranahara') color = '#FFA500';
      
      ctx.beginPath();
      ctx.arc(px, py, 6 + pulse, 0, Math.PI*2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      if (isHovered) {
        ctx.fillStyle = '#FFF';
        ctx.font = '14px sans-serif';
        ctx.fillText(p.name, px + 15, py + 5);
      }
    }
    
    this.animationId = requestAnimationFrame(this.animate);
  }
  
  destroy() {
    cancelAnimationFrame(this.animationId);
    this.canvas.removeEventListener('mousemove', this.handleMove);
    this.canvas.removeEventListener('click', this.handleClick);
  }
}

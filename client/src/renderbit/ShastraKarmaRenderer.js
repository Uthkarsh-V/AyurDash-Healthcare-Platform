export default class ShastraKarmaRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.karma = 'chedana';
    this.particles = [];
    this.cutLines = [];
    this.isDragging = false;
    
    // bind events
    this.handleDown = this.handleDown.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleUp = this.handleUp.bind(this);
    
    this.canvas.addEventListener('pointerdown', this.handleDown);
    this.canvas.addEventListener('pointermove', this.handleMove);
    this.canvas.addEventListener('pointerup', this.handleUp);
    this.canvas.addEventListener('pointercancel', this.handleUp);
    
    this.animate = this.animate.bind(this);
    this.animationId = requestAnimationFrame(this.animate);
  }
  
  update({ karma }) {
    if (this.karma !== karma) {
      this.cutLines = [];
      this.particles = [];
    }
    this.karma = karma;
  }
  
  handleDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    this.isDragging = true;
    if (this.karma === 'chedana' || this.karma === 'lekhana') {
      this.cutLines.push([{x, y}]);
    } else if (this.karma === 'bhedana' || this.karma === 'vyadhana') {
      // spawn particles simulating drainage or puncture
      for(let i=0; i<30; i++) {
        this.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          life: 1.0,
          color: this.karma === 'vyadhana' ? 'red' : '#4DB8FF'
        });
      }
    }
  }
  
  handleMove(e) {
    if (!this.isDragging) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    if (this.karma === 'chedana' || this.karma === 'lekhana') {
      const currentLine = this.cutLines[this.cutLines.length - 1];
      if (currentLine) currentLine.push({x, y});
    }
  }
  
  handleUp() {
    this.isDragging = false;
  }
  
  animate() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Draw base object
    const cx = w/2, cy = h/2;
    if (this.karma === 'chedana') {
      // Pumpkin / Ash Gourd
      ctx.fillStyle = '#E67E22';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 150, 100, 0, 0, Math.PI*2);
      ctx.fill();
      // add stalk
      ctx.fillStyle = '#27AE60';
      ctx.fillRect(cx - 10, cy - 120, 20, 25);
    } else if (this.karma === 'bhedana') {
      // Water bladder
      ctx.fillStyle = '#2980B9';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 100);
      ctx.bezierCurveTo(cx + 100, cy - 50, cx + 150, cy + 100, cx, cy + 150);
      ctx.bezierCurveTo(cx - 150, cy + 100, cx - 100, cy - 50, cx, cy - 100);
      ctx.fill();
    } else if (this.karma === 'vyadhana') {
      // Vein
      ctx.fillStyle = '#C0392B';
      ctx.fillRect(cx - 20, cy - 200, 40, 400);
    } else if (this.karma === 'lekhana') {
      // Hairy skin
      ctx.fillStyle = '#D35400';
      ctx.fillRect(cx - 150, cy - 100, 300, 200);
      ctx.fillStyle = '#F39C12';
      for(let i=0; i<80; i++) {
        // pseudo-random but static seed based on position
        let px = cx - 140 + (i * 13) % 280;
        let py = cy - 90 + (i * 7) % 180;
        ctx.fillRect(px, py, 2, 8);
      }
    }
    
    // Draw cuts
    if (this.karma === 'chedana' || this.karma === 'lekhana') {
      ctx.strokeStyle = this.karma === 'lekhana' ? 'rgba(255,255,255,0.7)' : '#2C3E50';
      ctx.lineWidth = this.karma === 'lekhana' ? 10 : 3;
      this.cutLines.forEach(line => {
        if (line.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        for(let i=1; i<line.length; i++) ctx.lineTo(line[i].x, line[i].y);
        ctx.stroke();
      });
    }
    
    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    
    this.animationId = requestAnimationFrame(this.animate);
  }
  
  destroy() {
    cancelAnimationFrame(this.animationId);
    this.canvas.removeEventListener('pointerdown', this.handleDown);
    this.canvas.removeEventListener('pointermove', this.handleMove);
    this.canvas.removeEventListener('pointerup', this.handleUp);
    this.canvas.removeEventListener('pointercancel', this.handleUp);
  }
}

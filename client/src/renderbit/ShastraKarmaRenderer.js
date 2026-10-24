// client/src/renderbit/ShastraKarmaRenderer.js
// Sushruta Ashta Vidha Shastra Karma Canvas Scene & Surgical Telemetry Engine

export default class ShastraKarmaRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.karma = 'chedana';
    this.particles = [];
    this.cutLines = [];
    this.strokeTelemetry = []; // array of { points: [{x, y, t}], startTime, endTime }
    this.punctureHits = []; // array of { x, y, distFromTarget, t }
    this.isDragging = false;
    this.showGuides = true;

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

  update({ karma, showGuides = true }) {
    if (this.karma !== karma) {
      this.reset();
    }
    this.karma = karma;
    this.showGuides = showGuides;
  }

  reset() {
    this.cutLines = [];
    this.particles = [];
    this.strokeTelemetry = [];
    this.punctureHits = [];
  }

  handleDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const now = performance.now();

    this.isDragging = true;

    if (this.karma === 'chedana' || this.karma === 'lekhana') {
      const newLine = [{ x, y, t: now }];
      this.cutLines.push(newLine);
      this.strokeTelemetry.push({ points: [{ x, y, t: now }], startTime: now });
    } else if (this.karma === 'bhedana' || this.karma === 'vyadhana') {
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2;
      const targetPoint = this.karma === 'bhedana' ? { x: cx, y: cy + 40 } : { x: cx, y: cy };
      const dist = Math.hypot(x - targetPoint.x, y - targetPoint.y);

      this.punctureHits.push({ x, y, dist, t: now });

      // Spawn drainage/blood fluid particles
      const count = this.karma === 'vyadhana' ? 24 : 36;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 + (this.karma === 'bhedana' ? 2 : 0),
          life: 1.0,
          color: this.karma === 'vyadhana' ? '#dc2626' : '#38bdf8'
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
    const now = performance.now();

    if (this.karma === 'chedana' || this.karma === 'lekhana') {
      const currentLine = this.cutLines[this.cutLines.length - 1];
      if (currentLine) {
        currentLine.push({ x, y, t: now });
      }
      const curTelemetry = this.strokeTelemetry[this.strokeTelemetry.length - 1];
      if (curTelemetry) {
        curTelemetry.points.push({ x, y, t: now });
      }
    }
  }

  handleUp() {
    if (this.isDragging && (this.karma === 'chedana' || this.karma === 'lekhana')) {
      const curTelemetry = this.strokeTelemetry[this.strokeTelemetry.length - 1];
      if (curTelemetry) {
        curTelemetry.endTime = performance.now();
      }
    }
    this.isDragging = false;
  }

  // ── Surgical Performance Assessment Engine ───────────────────
  evaluateKarma() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    if (this.karma === 'chedana') {
      // Ideal incision: Horizontal meridian across pumpkin (e.g. from x: 280 to 520, y: 300)
      if (this.cutLines.length === 0 || this.cutLines[0].length < 3) {
        return {
          hasAttempted: false,
          overallScore: 0,
          grade: 'No Incision Made',
          message: 'Please draw an incision line across the Pushpaphala (Ash Gourd).'
        };
      }

      const points = this.cutLines.flatMap(line => line);
      const startX = points[0].x;
      const endX = points[points.length - 1].x;
      const strokeLengthX = Math.abs(endX - startX);

      // 1. Linearity & Trajectory Precision (deviation from ideal horizontal axis y = cy)
      let sumYDev = 0;
      points.forEach(p => {
        sumYDev += Math.abs(p.y - cy);
      });
      const avgYDev = sumYDev / points.length;
      const precisionScore = Math.max(20, Math.min(100, Math.round(100 - (avgYDev * 1.8))));

      // 2. Tremor / Smoothness (high-frequency zig-zag jitter)
      let jitterCount = 0;
      for (let i = 2; i < points.length; i++) {
        const dy1 = points[i - 1].y - points[i - 2].y;
        const dy2 = points[i].y - points[i - 1].y;
        if ((dy1 > 1.5 && dy2 < -1.5) || (dy1 < -1.5 && dy2 > 1.5)) {
          jitterCount++;
        }
      }
      const stabilityScore = Math.max(25, Math.min(100, Math.round(100 - (jitterCount * 12))));

      // 3. Margin & Length Coverage (ideal 160-260px)
      let lengthScore = 100;
      if (strokeLengthX < 120) {
        lengthScore = Math.round((strokeLengthX / 120) * 80);
      } else if (strokeLengthX > 320) {
        lengthScore = 75; // over-extended outside surgical boundary
      }

      // 4. Cadence & Speed
      const durationMs = (points[points.length - 1].t || 0) - (points[0].t || 0);
      let cadenceScore = 90;
      if (durationMs < 300) {
        cadenceScore = 50; // too rushed / erratic
      } else if (durationMs > 4000) {
        cadenceScore = 70; // hesitant
      }

      const overall = Math.round((precisionScore * 0.35) + (stabilityScore * 0.35) + (lengthScore * 0.2) + (cadenceScore * 0.1));

      // Specific Diagnostic Suggestions for Improvisation
      const suggestions = [];
      if (avgYDev > 22) {
        suggestions.push({
          criterion: 'Trajectory Alignment (Langala-chedana)',
          issue: `Significant vertical drift detected (avg deviation ${Math.round(avgYDev)}px).`,
          fix: 'Anchor your hypothenar (ulnar palm) gently on the surface before initiating the cut. Keep your wrist rigid and pull from the elbow to create a true horizontal plane.',
          shastraRef: 'Sushruta Samhita Sutrasthana 25: "Tiryag riju cha shastrena vidhadhyat samahitam" (Incise evenly, straight or curved, with deep composure).'
        });
      }

      if (jitterCount >= 3) {
        suggestions.push({
          criterion: 'Hand Tremor & Blade Stability',
          issue: `Detected ${jitterCount} micro-directional reversals (finger tremor).`,
          fix: 'Adopt Sushruta\'s Vriddhipatra Tri-Finger Grip: Pinch the blade bolster between the index finger (Tarjani) and thumb (Angushtha) with the middle finger (Madhyama) resting along the spine for stabilization.',
          shastraRef: 'Sushruta Samhita Sutrasthana 8: Grip Vriddhipatra like a classical writing stylus (Lekhani).'
        });
      }

      if (strokeLengthX < 130) {
        suggestions.push({
          criterion: 'Surgical Margin Adequacy',
          issue: `Incision stroke was too short (${Math.round(strokeLengthX)}px), risking retention of internal pathology.`,
          fix: 'Commit to full continuous stroke across the marked meridian. A hesitant short cut creates ragged flaps (Arbuda-vrana).',
          shastraRef: 'Sushruta: Avoid Heena-chedana (under-excision).'
        });
      }

      if (durationMs < 350) {
        suggestions.push({
          criterion: 'Surgical Cadence (Asambhrama)',
          issue: 'Blade stroke was executed too hastily (<350ms).',
          fix: 'Pace your stroke steadily over 1.2 to 2.0 seconds. Swiftness without control leads to uncontrolled depth penetration into underlying visceral layers.',
          shastraRef: 'Sushruta: The master surgeon acts "Tanum-sama" (deliberately measured) without haste.'
        });
      }

      if (suggestions.length === 0) {
        suggestions.push({
          criterion: 'Mastery Level Achieved',
          issue: 'Clean, continuous, uniform excision without tremor or margin deviation.',
          fix: 'Maintain this muscle memory. You are ready to advance to Bhedana and multilayer simulated tissues.',
          shastraRef: 'Sushruta Samhita: "Shreshtha Karma" — Perfect surgical equilibrium.'
        });
      }

      return {
        hasAttempted: true,
        karma: 'Chedana (Excision)',
        object: 'Pushpaphala (Ash Gourd)',
        overallScore: overall,
        grade: overall >= 88 ? 'Shreshtha (Mastery)' : overall >= 74 ? 'Uttama (Proficient)' : overall >= 55 ? 'Madhyama (Developing)' : 'Heena (Needs Practice)',
        metrics: {
          precisionScore,
          stabilityScore,
          lengthScore,
          cadenceScore,
          strokeLengthPx: Math.round(strokeLengthX),
          durationMs: Math.round(durationMs),
          jitterCount
        },
        suggestions
      };
    }

    if (this.karma === 'bhedana') {
      // Incision & Drainage of Water Bladder (Basti)
      if (this.punctureHits.length === 0) {
        return {
          hasAttempted: false,
          overallScore: 0,
          grade: 'No Puncture Attempted',
          message: 'Tap or click on the Basti (bladder) to drain accumulated fluid.'
        };
      }

      const firstHit = this.punctureHits[0];
      const targetPoint = { x: cx, y: cy + 40 };
      const dist = Math.hypot(firstHit.x - targetPoint.x, firstHit.y - targetPoint.y);
      const precisionScore = Math.max(15, Math.min(100, Math.round(100 - (dist * 1.5))));
      const overall = precisionScore;

      const suggestions = [];
      if (dist > 35) {
        suggestions.push({
          criterion: 'Dependent Apex Puncture (Nirharana)',
          issue: `Puncture was ${Math.round(dist)}px away from the lowest gravity-dependent drainage pole.`,
          fix: 'Always puncture at the most dependent apex of a Vidradhi (abscess) so gravity naturally evacuates all purulent fluid without manual squeezing.',
          shastraRef: 'Sushruta Samhita Sutrasthana 25: "Adhas-sthitam bhedayet" (Incision must be positioned inferiorly for free discharge).'
        });
      } else {
        suggestions.push({
          criterion: 'Apex Drainage Accuracy',
          issue: 'Direct hit on dependent drainage axis.',
          fix: 'Fluid is escaping with optimal hydro-dynamic clearance. Practice single quick release without second puncture.',
          shastraRef: 'Sushruta: Bhedana requires decisive instant entry.'
        });
      }

      return {
        hasAttempted: true,
        karma: 'Bhedana (Incision & Drainage)',
        object: 'Basti / Druti (Fluid Bladder)',
        overallScore: overall,
        grade: overall >= 85 ? 'Uttama (Optimal Drainage)' : overall >= 60 ? 'Madhyama (Partial Drainage)' : 'Heena (Off Target)',
        metrics: {
          precisionScore,
          distFromTargetPx: Math.round(dist),
          punctureCount: this.punctureHits.length
        },
        suggestions
      };
    }

    if (this.karma === 'vyadhana') {
      // Venesection / Puncture of Sira
      if (this.punctureHits.length === 0) {
        return {
          hasAttempted: false,
          overallScore: 0,
          grade: 'No Venesection Attempted',
          message: 'Click on the red Sira (vein) to practice delicate venesection.'
        };
      }

      const firstHit = this.punctureHits[0];
      // Vascular line is at x = cx (400), with width 40 (380 to 420)
      const distFromCenterline = Math.abs(firstHit.x - cx);
      const precisionScore = Math.max(10, Math.min(100, Math.round(100 - (distFromCenterline * 4.2))));

      const suggestions = [];
      if (distFromCenterline > 18) {
        suggestions.push({
          criterion: 'Vascular Lumen Alignment',
          issue: `Blade missed the vascular core by ${Math.round(distFromCenterline)}px, puncturing adjacent tissue.`,
          fix: 'Palpate or visually trace the central axial lumen. Pierce strictly perpendicular or at 45° to the longitudinal axis with a Kutharika or Vrihimukha shastra.',
          shastraRef: 'Sushruta Samhita Sharirasthana 8: Avoid Parshva-vyadhana (lateral vein wall laceration).'
        });
      } else {
        suggestions.push({
          criterion: 'Centred Venesection',
          issue: 'Clean central vascular penetration achieved.',
          fix: 'Withdraw blade immediately after flash to prevent Dvi-khandita (transfixion of posterior wall).',
          shastraRef: 'Sushruta: "Yavamatram praveshayet" (Enter depth of single grain of barley).'
        });
      }

      return {
        hasAttempted: true,
        karma: 'Vyadhana (Puncturing / Sira Vedha)',
        object: 'Sira (Vascular Channel / Vein)',
        overallScore: precisionScore,
        grade: precisionScore >= 85 ? 'Uttama (Precise Venesection)' : precisionScore >= 60 ? 'Madhyama (Borderline Lumen)' : 'Heena (Missed Vascular Core)',
        metrics: {
          precisionScore,
          distFromLumenPx: Math.round(distFromCenterline),
          punctureCount: this.punctureHits.length
        },
        suggestions
      };
    }

    // Lekhana (Scraping)
    const pointsCount = this.cutLines.reduce((acc, l) => acc + l.length, 0);
    const strokeCount = this.cutLines.length;
    const coverageScore = Math.min(100, Math.round((pointsCount / 140) * 100));
    const overall = Math.max(20, Math.min(100, Math.round((coverageScore * 0.7) + (strokeCount >= 3 ? 30 : strokeCount * 10))));

    return {
      hasAttempted: pointsCount > 5,
      karma: 'Lekhana (Scraping)',
      object: 'Savyoma Charma (Hairy Skin)',
      overallScore: overall,
      grade: overall >= 80 ? 'Uttama (Uniform Debridement)' : 'Madhyama (Incomplete Scraping)',
      metrics: {
        coverageScore,
        strokeCount,
        pointsScraped: pointsCount
      },
      suggestions: [
        {
          criterion: 'Lekhana Superficiality & Angle',
          issue: strokeCount < 3 ? 'Too few scraping passes to clear superficial impurities.' : 'Adequate scraping motion executed.',
          fix: 'Hold Mandalagra blade at an acute 30° angle. Apply light, feather-like repetitive sweeps in unidirectional strokes without scraping backwards.',
          shastraRef: 'Sushruta Samhita: "Mandalagrena lekhayet" (Scrape with circular-edge blade without lacerating healthy dermis).'
        }
      ]
    };
  }

  animate() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // ── Background Surgical Cloth (Vastra) ──
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Subtle sterile grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // ── Authentic Proxy Objects ──
    if (this.karma === 'chedana') {
      // Pumpkin / Ash Gourd (Pushpaphala)
      ctx.save();
      // Outer shadow
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 24;

      const gourdGrad = ctx.createRadialGradient(cx - 30, cy - 20, 20, cx, cy, 160);
      gourdGrad.addColorStop(0, '#f97316');
      gourdGrad.addColorStop(0.7, '#ea580c');
      gourdGrad.addColorStop(1, '#9a3412');

      ctx.fillStyle = gourdGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 170, 115, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Rib segments on pumpkin
      ctx.strokeStyle = 'rgba(124, 45, 18, 0.4)';
      ctx.lineWidth = 2.5;
      for (let offset of [-110, -60, 0, 60, 110]) {
        ctx.beginPath();
        ctx.ellipse(cx + offset * 0.7, cy, Math.abs(offset) > 80 ? 40 : 70, 110, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Green Stalk (Vrinta)
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.roundRect(cx - 12, cy - 135, 24, 28, 4);
      ctx.fill();

      // Ideal Incision Meridian Guide (Dotted)
      if (this.showGuides) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(cx - 130, cy);
        ctx.lineTo(cx + 130, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TARGET INCISION AXIS (LANGALA-CHEDANA)', cx, cy - 12);
      }
      ctx.restore();
    } else if (this.karma === 'bhedana') {
      // Water Bladder / Abscess Simulator (Basti / Druti)
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 20;

      const bladderGrad = ctx.createRadialGradient(cx, cy - 20, 20, cx, cy + 40, 140);
      bladderGrad.addColorStop(0, '#60a5fa');
      bladderGrad.addColorStop(0.7, '#2563eb');
      bladderGrad.addColorStop(1, '#1e3a8a');

      ctx.fillStyle = bladderGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 110);
      ctx.bezierCurveTo(cx + 120, cy - 60, cx + 170, cy + 110, cx, cy + 150);
      ctx.bezierCurveTo(cx - 170, cy + 110, cx - 120, cy - 60, cx, cy - 110);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Translucent fluid highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.ellipse(cx - 30, cy - 20, 50, 70, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Optimal Drainage Point Target
      if (this.showGuides) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy + 40, 18, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('◎ OPTIMAL DRAINAGE APEX', cx, cy + 74);
      }
      ctx.restore();
    } else if (this.karma === 'vyadhana') {
      // Sira (Vascular Channel / Vein)
      ctx.save();
      // Arm/body flesh background
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(cx - 160, cy - 220, 320, 440);

      // Vein cylinder
      const veinGrad = ctx.createLinearGradient(cx - 24, 0, cx + 24, 0);
      veinGrad.addColorStop(0, '#7f1d1d');
      veinGrad.addColorStop(0.5, '#dc2626');
      veinGrad.addColorStop(1, '#7f1d1d');

      ctx.fillStyle = veinGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 24, cy - 220, 48, 440, 8);
      ctx.fill();

      // Pulsing lumen highlight
      ctx.strokeStyle = 'rgba(254, 202, 202, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 210);
      ctx.lineTo(cx, cy + 210);
      ctx.stroke();

      if (this.showGuides) {
        ctx.fillStyle = '#fef08a';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TARGET VASCULAR AXIS (SIRA LUMEN)', cx, cy - 230);
      }
      ctx.restore();
    } else if (this.karma === 'lekhana') {
      // Hairy skin (Savyoma charma)
      ctx.save();
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(cx - 170, cy - 120, 340, 240);

      // Hair follicles
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 90; i++) {
        let px = cx - 150 + ((i * 23) % 300);
        let py = cy - 100 + ((i * 17) % 200);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + 4, py + 12);
        ctx.stroke();
      }

      if (this.showGuides) {
        ctx.fillStyle = '#fef08a';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SURFACE SCRAPING ZONE (SWEEP HORIZONTALLY AT 30°)', cx, cy - 132);
      }
      ctx.restore();
    }

    // ── Render Incision Cuts ──
    if (this.karma === 'chedana' || this.karma === 'lekhana') {
      this.cutLines.forEach(line => {
        if (line.length < 2) return;
        ctx.save();
        ctx.strokeStyle = this.karma === 'lekhana' ? 'rgba(254, 240, 138, 0.85)' : '#1e293b';
        ctx.lineWidth = this.karma === 'lekhana' ? 12 : 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        for (let i = 1; i < line.length; i++) {
          ctx.lineTo(line[i].x, line[i].y);
        }
        ctx.stroke();

        // Inner incision gap highlight for realistic surgical depth
        if (this.karma === 'chedana') {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(line[0].x, line[0].y);
          for (let i = 1; i < line.length; i++) ctx.lineTo(line[i].x, line[i].y);
          ctx.stroke();
        }
        ctx.restore();
      });
    }

    // ── Render Puncture Entry Marks ──
    this.punctureHits.forEach(hit => {
      ctx.save();
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(hit.x, hit.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hit.x, hit.y, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // ── Render Drainage / Blood Particles ──
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.025;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
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

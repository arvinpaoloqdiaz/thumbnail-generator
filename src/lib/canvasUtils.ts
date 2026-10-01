export const PRESETS = {
  '16:9': { name: '16:9 Landscape', width: 1920, height: 1080 },
  '4:3': { name: '4:3 Standard', width: 1600, height: 1200 },
  '1:1': { name: '1:1 Square', width: 1080, height: 1080 },
  '9:16': { name: '9:16 Portrait', width: 1080, height: 1920 },
};

// Aspect ratio for individual bento cards / API window (independent of canvas size)
export const CARD_PRESETS: Record<string, { name: string; ratio: number }> = {
  '16:9':  { name: '16:9', ratio: 16 / 9 },
  '4:3':   { name: '4:3',  ratio: 4  / 3 },
  '3:2':   { name: '3:2',  ratio: 3  / 2 },
  '1:1':   { name: '1:1',  ratio: 1      },
  '2:3':   { name: '2:3',  ratio: 2  / 3 },
  '9:16':  { name: '9:16', ratio: 9  / 16 },
};

export const PATTERNS = [
  { id: 'none', name: 'None' },
  { id: 'dots', name: 'Dots' },
  { id: 'grid', name: 'Grid' },
  { id: 'crosshatch', name: 'Crosshatch' },
  { id: 'diagonal', name: 'Diagonal Lines' },
  { id: 'hexagon', name: 'Hexagons' },
  { id: 'waves', name: 'Waves' },
  { id: 'triangles', name: 'Triangles' },
];

export function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, bgTheme: string) {
  let grad = ctx.createLinearGradient(0, 0, w, h);
  if (bgTheme === 'green') {
    grad.addColorStop(0, '#a3e635');
    grad.addColorStop(1, '#4d7c0f');
  } else if (bgTheme === 'ocean') {
    grad.addColorStop(0, '#1d4ed8');
    grad.addColorStop(1, '#0f172a');
  } else if (bgTheme === 'sunset') {
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(1, '#9f1239');
  } else if (bgTheme === 'white') {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#f1f5f9');
  } else {
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#020617');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

export function drawPattern(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pattern: string,
  opacity: number
) {
  if (pattern === 'none' || opacity === 0) return;

  ctx.save();
  ctx.globalAlpha = opacity / 100;
  ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.lineWidth = 1;

  const size = 40; // grid spacing

  switch (pattern) {
    case 'dots': {
      for (let x = size / 2; x < w; x += size) {
        for (let y = size / 2; y < h; y += size) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case 'grid': {
      ctx.beginPath();
      for (let x = 0; x <= w; x += size) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y <= h; y += size) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
      break;
    }
    case 'crosshatch': {
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      // Diagonal in one direction
      for (let i = -h; i < w + h; i += size) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i + h, h);
      }
      // Diagonal other direction
      for (let i = -h; i < w + h; i += size) {
        ctx.moveTo(i, h);
        ctx.lineTo(i + h, 0);
      }
      ctx.stroke();
      break;
    }
    case 'diagonal': {
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = -h; i < w + h; i += size) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i + h, h);
      }
      ctx.stroke();
      break;
    }
    case 'hexagon': {
      const r = size / 2;
      const hexH = r * Math.sqrt(3);
      for (let row = 0; row * hexH < h + hexH; row++) {
        for (let col = 0; col * r * 1.5 < w + r; col++) {
          const cx = col * r * 1.5;
          const cy = row * hexH + (col % 2 === 1 ? hexH / 2 : 0);
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = cx + r * Math.cos(angle);
            const py = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    }
    case 'waves': {
      ctx.lineWidth = 1.5;
      const amplitude = size / 3;
      const freq = (2 * Math.PI) / size;
      for (let row = size; row < h + size; row += size) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const y = row + amplitude * Math.sin(freq * x);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
    }
    case 'triangles': {
      const triSize = size;
      for (let row = 0; row * triSize * 0.866 < h + triSize; row++) {
        for (let col = 0; col * triSize < w + triSize; col++) {
          const ox = col * triSize + (row % 2 === 0 ? 0 : triSize / 2);
          const oy = row * triSize * 0.866;
          // Upward triangle
          ctx.beginPath();
          ctx.moveTo(ox, oy + triSize * 0.866);
          ctx.lineTo(ox + triSize / 2, oy);
          ctx.lineTo(ox + triSize, oy + triSize * 0.866);
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawBentoWebpage(
  ctx: CanvasRenderingContext2D, 
  w: number, 
  h: number, 
  image: HTMLImageElement,
  options: { viewHeight: number, rotation: number, blur: number, scale: number, gap: number, edgeBlur: number, vignetteColor: 'black' | 'white', borderRadius: number }
) {
  const sourceWidth = image.width;
  const sourceViewHeight = options.viewHeight || 900; 
  const numSlices = Math.max(1, Math.floor(image.height / sourceViewHeight));

  // Card display dimensions — width from screenshot, height from viewHeight slider
  const cardW = sourceWidth * options.scale;
  const cardH = sourceViewHeight * options.scale;

  const startX = w / 2;
  const startY = h / 2;

  const cols = 5;
  const rows = 5;

  const globalRot = (options.rotation * Math.PI) / 180;

  let gridPoints: { c: number, r: number, dist: number }[] = [];
  for (let c = -Math.floor(cols/2); c <= Math.floor(cols/2); c++) {
    for (let r = -Math.floor(rows/2); r <= Math.floor(rows/2); r++) {
      gridPoints.push({ c, r, dist: c*c + r*r });
    }
  }
  gridPoints.sort((a, b) => b.dist - a.dist);

  let sliceIndexOffset = 0; 

  ctx.save();
  ctx.translate(startX, startY);
  ctx.rotate(globalRot);

  for (let point of gridPoints) {
    const { c, r } = point;
    const staggerY = (c % 2 !== 0) ? (cardH + options.gap) / 2 : 0;
    const dx = c * (cardW + options.gap);
    const dy = r * (cardH + options.gap) + staggerY;

    let sliceIndex = 0;
    if (c === 0 && r === 0) {
      sliceIndex = 0;
    } else {
      sliceIndexOffset++;
      sliceIndex = (sliceIndexOffset % (numSlices - 1 || 1)) + 1; 
      if (sliceIndex >= numSlices) sliceIndex = numSlices - 1;
    }

    ctx.save();
    ctx.translate(dx, dy);
    
    ctx.shadowColor = `rgba(0,0,0,${options.blur / 100})`;
    ctx.shadowBlur = options.blur;
    ctx.shadowOffsetY = 15;
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, options.borderRadius);
    ctx.fill();
    
    ctx.clip();
    ctx.shadowColor = 'transparent';
    
    ctx.drawImage(
      image,
      0, sliceIndex * sourceViewHeight, sourceWidth, sourceViewHeight,
      -cardW / 2, -cardH / 2, cardW, cardH
    );
    
    ctx.restore();
  }

  ctx.restore();

  if (options.edgeBlur > 0) {
    const cx = w / 2;
    const cy = h / 2;
    const maxRadius = Math.sqrt(cx * cx + cy * cy);
    const innerRadius = maxRadius * (1 - (options.edgeBlur / 100));
    const radialGradient = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, maxRadius);
    const rgb = options.vignetteColor === 'white' ? '255, 255, 255' : '0, 0, 0';
    radialGradient.addColorStop(0, `rgba(${rgb}, 0)`);
    radialGradient.addColorStop(1, `rgba(${rgb}, 1)`);
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, w, h);
  }
}

export function drawApiMockup(
  ctx: CanvasRenderingContext2D, 
  w: number, 
  h: number, 
  apiData: any,
  options: { rotation: number, scale: number, edgeBlur: number, vignetteColor: 'black' | 'white', textScale: number, borderRadius: number, cardAspect: number }
) {
  const pad = 80;
  // Window width uses a canvas-fraction base; height is derived from the chosen card aspect
  const baseW = (w - pad * 2) * options.scale;
  const fw = baseW;
  const fh = fw / options.cardAspect;
  
  const cx = w / 2;
  const cy = h / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((options.rotation * Math.PI) / 180);

  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 30;

  // Frame Base — smoother radius
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-fw/2, -fh/2, fw, fh, options.borderRadius);
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Clip to frame so content can't overflow
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(-fw/2, -fh/2, fw, fh, options.borderRadius);
  ctx.clip();

  // Header Bar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-fw/2, -fh/2, fw, 48);

  // Subtle header bottom border
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-fw/2, -fh/2 + 48);
  ctx.lineTo(fw/2, -fh/2 + 48);
  ctx.stroke();

  // Mac Dots
  const dotY = -fh/2 + 24;
  const dotColors = ['#ff5f56', '#ffbd2e', '#27c93f'];
  const dotPositions = [-fw/2 + 24, -fw/2 + 46, -fw/2 + 68];
  dotPositions.forEach((x, i) => {
    ctx.fillStyle = dotColors[i];
    ctx.beginPath();
    ctx.arc(x, dotY, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  // API Route Info
  ctx.fillStyle = '#10b981';
  ctx.font = `bold ${16 * options.textScale}px monospace`;
  const methodText = apiData.method;
  ctx.fillText(methodText, -fw/2 + 100, -fh/2 + 31);

  const methodWidth = ctx.measureText(methodText).width;
  ctx.fillStyle = '#94a3b8';
  ctx.font = `${14 * options.textScale}px monospace`;
  ctx.fillText(apiData.url, -fw/2 + 100 + methodWidth + 14, -fh/2 + 31);

  // Status Badge — auto-sized, clamped to inside header
  ctx.font = `bold ${12 * options.textScale}px monospace`;
  const statusWidth = ctx.measureText(apiData.status).width;
  const badgePadX = 14;
  const badgePadY = 6;
  const badgeW = statusWidth + badgePadX * 2;
  const badgeH = 12 * options.textScale + badgePadY * 2;
  const badgeX = fw/2 - badgeW - 16;
  const badgeY = -fh/2 + (48 - badgeH) / 2;

  const isError = apiData.status.startsWith('4') || apiData.status.startsWith('5');
  const badgeColor = isError ? '#ef4444' : '#10b981';
  
  ctx.fillStyle = isError ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)';
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
  ctx.fill();

  ctx.strokeStyle = isError ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
  ctx.stroke();

  ctx.fillStyle = badgeColor;
  ctx.fillText(apiData.status, badgeX + badgePadX, badgeY + badgeH - badgePadY - 1);

  // JSON Syntax Highlight body
  const json = apiData.json || '{\n  "status": "success"\n}';
  const lines = json.split('\n');
  
  ctx.font = `${16 * options.textScale}px monospace`;
  const codeStartY = -fh/2 + 48 + 40;
  const lineSpacing = 28 * options.textScale;
  
  lines.forEach((line: string, i: number) => {
    ctx.fillStyle = (line.includes('":')) 
      ? '#e06c75' 
      : (line.includes('true') || line.includes('false') || line.match(/^\s*[\d.]+/))
      ? '#d19a66'
      : (line.includes('"')) 
      ? '#98c379' 
      : '#abb2bf';
    ctx.fillText(line, -fw/2 + 40, codeStartY + (i * lineSpacing));
  });

  // Line number gutter
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(-fw/2, -fh/2 + 48, 30, fh - 48);
  ctx.font = `${10 * options.textScale}px monospace`;
  ctx.fillStyle = '#475569';
  lines.forEach((_: any, i: number) => {
    ctx.fillText(`${i + 1}`, -fw/2 + 8, codeStartY + (i * lineSpacing));
  });

  ctx.restore(); // restore clip

  ctx.restore(); // restore rotation/translate

  if (options.edgeBlur > 0) {
    const maxRadius = Math.sqrt(cx * cx + cy * cy);
    const innerRadius = maxRadius * (1 - (options.edgeBlur / 100));
    const radialGradient = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, maxRadius);
    const rgb = options.vignetteColor === 'white' ? '255, 255, 255' : '0, 0, 0';
    radialGradient.addColorStop(0, `rgba(${rgb}, 0)`);
    radialGradient.addColorStop(1, `rgba(${rgb}, 1)`);
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, w, h);
  }
}

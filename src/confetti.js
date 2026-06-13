/* confetti.js — lightweight canvas confetti burst for celebrations. */

const COLORS = ["#ff6b6b", "#ffd34e", "#4cd17d", "#4aa8ff", "#b06bff", "#ff8fc8"];

let canvas, gctx, raf = 0, pieces = [];

function resize() {
  if (!canvas) return;
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
}

export function initConfetti(el) {
  canvas = el;
  gctx = canvas.getContext("2d");
  resize();
  window.addEventListener("resize", resize);
}

export function burst(amount = 90) {
  if (!canvas) return;
  const W = canvas.width;
  for (let i = 0; i < amount; i++) {
    pieces.push({
      x: W * (0.3 + Math.random() * 0.4),
      y: -20 * devicePixelRatio,
      vx: (Math.random() - 0.5) * 10 * devicePixelRatio,
      vy: (Math.random() * 4 + 4) * devicePixelRatio,
      g: 0.18 * devicePixelRatio,
      size: (6 + Math.random() * 8) * devicePixelRatio,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      life: 120 + Math.random() * 40,
    });
  }
  if (!raf) loop();
}

function loop() {
  raf = requestAnimationFrame(loop);
  gctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces = pieces.filter((p) => p.life > 0 && p.y < canvas.height + 40);
  for (const p of pieces) {
    p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
    gctx.save();
    gctx.translate(p.x, p.y);
    gctx.rotate(p.rot);
    gctx.fillStyle = p.color;
    gctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    gctx.restore();
  }
  if (!pieces.length) { cancelAnimationFrame(raf); raf = 0; gctx.clearRect(0, 0, canvas.width, canvas.height); }
}

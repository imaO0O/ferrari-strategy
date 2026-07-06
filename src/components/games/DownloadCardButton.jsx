import { useState } from "react";

/* Генерация PNG-карточки рекорда 1080×1080 в стиле сайта — чистый canvas,
   шрифты берутся из уже загруженных на странице (Exo 2, Orbitron). */
async function makeResultCard({ label, value, unit, sub }) {
  await document.fonts.ready;
  const S = 1080;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d");

  // карбоновый фон с точечной текстурой
  ctx.fillStyle = "#0a0a0c";
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = "rgba(255,255,255,0.045)";
  for (let yy = 22; yy < S; yy += 44) {
    for (let xx = 22; xx < S; xx += 44) ctx.fillRect(xx, yy, 2, 2);
  }

  // красная косая плашка сверху
  ctx.fillStyle = "#ff2800";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(S, 0);
  ctx.lineTo(S, 30);
  ctx.lineTo(0, 72);
  ctx.closePath();
  ctx.fill();

  // стартовые огни
  const lights = 5;
  const r = 44;
  const gap = 38;
  const totalW = lights * r * 2 + (lights - 1) * gap;
  let lx = (S - totalW) / 2 + r;
  const ly = 260;
  for (let i = 0; i < lights; i++) {
    ctx.beginPath();
    ctx.fillStyle = "#16161b";
    ctx.arc(lx, ly, r + 12, 0, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "#ff2800";
    ctx.shadowColor = "#ff2800";
    ctx.shadowBlur = 34;
    ctx.arc(lx, ly, r, 0, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
    lx += r * 2 + gap;
  }

  ctx.textAlign = "center";
  // подпись
  ctx.fillStyle = "#8a8a93";
  ctx.font = "700 36px 'Exo 2', sans-serif";
  ctx.fillText(label.toUpperCase(), S / 2, 430);
  // значение
  ctx.fillStyle = "#ffd400";
  ctx.font = "900 180px 'Orbitron', 'Exo 2', sans-serif";
  ctx.fillText(String(value), S / 2, 640);
  if (unit) {
    ctx.fillStyle = "#8a8a93";
    ctx.font = "700 48px 'Exo 2', sans-serif";
    ctx.fillText(unit.toUpperCase(), S / 2, 715);
  }
  if (sub) {
    ctx.fillStyle = "#fafafa";
    ctx.font = "italic 900 42px 'Exo 2', sans-serif";
    ctx.fillText(sub, S / 2, 800);
  }

  // вордмарка
  ctx.font = "italic 900 56px 'Exo 2', sans-serif";
  ctx.textAlign = "left";
  const b1 = "FERRARI";
  const b2 = " STRATEGY";
  const w1 = ctx.measureText(b1).width;
  const w2 = ctx.measureText(b2).width;
  const bx = S / 2 - (w1 + w2) / 2;
  ctx.fillStyle = "#ff2800";
  ctx.fillText(b1, bx, 946);
  ctx.fillStyle = "#fafafa";
  ctx.fillText(b2, bx + w1, 946);

  // клетчатая полоса снизу
  const sq = 27;
  for (let i = 0; i <= S / sq; i++) {
    for (let j = 0; j < 2; j++) {
      ctx.fillStyle = (i + j) % 2 ? "#0a0a0c" : "#e8e8e8";
      ctx.fillRect(i * sq, S - sq * 2 + j * sq, sq, sq);
    }
  }

  return new Promise((resolve) => c.toBlob(resolve, "image/png"));
}

export default function DownloadCardButton({ card, className = "" }) {
  const [label, setLabel] = useState("Карточка PNG");

  const flash = (msg) => {
    setLabel(msg);
    setTimeout(() => setLabel("Карточка PNG"), 2000);
  };

  const onClick = async () => {
    try {
      const blob = await makeResultCard(card);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ferrari-strategy-record.png";
      a.click();
      URL.revokeObjectURL(url);
      flash("Сохранено ✓");
    } catch {
      flash("Не удалось");
    }
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-md border border-line px-4 py-2 text-xs font-black uppercase tracking-widest text-dim transition-colors hover:border-rosso/60 hover:text-white ${className}`}
    >
      {label}
    </button>
  );
}

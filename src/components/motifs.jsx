/* Фирменные мотивы разделов — декоративные элементы в hero каждой страницы,
   чтобы разделы различались с первого взгляда. Все чисто декоративные. */

const wrap = "pointer-events-none absolute right-0 top-24 hidden select-none md:block";

/* Гонки: клетчатый флаг, уходящий в перспективу */
export function CheckerMotif() {
  return (
    <div className={wrap} aria-hidden>
      <div
        className="checker h-40 w-72 opacity-25"
        style={{ transform: "skewY(-8deg) skewX(-12deg)", maskImage: "linear-gradient(to left, black, transparent)" }}
      />
    </div>
  );
}

/* Игры: пять стартовых огней */
export function LightsMotif() {
  return (
    <div className={`${wrap} opacity-30`} aria-hidden>
      <div className="rounded-xl border border-line bg-black/60 px-5 py-4">
        <div className="flex gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="h-8 w-8 rounded-full bg-rosso"
              style={{ animation: `pulse-light 2.4s ${i * 0.25}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* Телеметрия: осциллограмма */
export function WaveMotif() {
  return (
    <svg className={`${wrap} h-32 w-96 opacity-35`} viewBox="0 0 400 120" aria-hidden>
      <polyline
        points="0,60 30,60 45,20 60,100 75,40 90,80 105,60 150,60 165,30 180,90 195,60 260,60 275,15 290,105 305,55 320,70 335,60 400,60"
        fill="none"
        stroke="#ff2800"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <polyline
        points="0,60 30,60 45,20 60,100 75,40 90,80 105,60 150,60 165,30 180,90 195,60 260,60 275,15 290,105 305,55 320,70 335,60 400,60"
        fill="none"
        stroke="#ffd400"
        strokeWidth="1"
        opacity="0.5"
        transform="translate(6 8)"
      />
    </svg>
  );
}

/* Дашборд: спидометр */
export function GaugeMotif() {
  return (
    <svg className={`${wrap} h-40 w-64 opacity-30`} viewBox="0 0 200 120" aria-hidden>
      <path d="M20 110 A85 85 0 0 1 180 110" fill="none" stroke="#26262c" strokeWidth="10" strokeLinecap="round" />
      <path d="M20 110 A85 85 0 0 1 130 32" fill="none" stroke="#ff2800" strokeWidth="10" strokeLinecap="round" />
      <line x1="100" y1="110" x2="146" y2="48" stroke="#ffd400" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="110" r="7" fill="#ffd400" />
    </svg>
  );
}

/* Легенды: наклонные чемпионские плашки */
export function StripesMotif() {
  return (
    <div className={`${wrap} opacity-30`} aria-hidden>
      <div className="flex gap-3">
        {["#ffd400", "#ff2800", "#26262c"].map((c, i) => (
          <span
            key={c}
            className="-skew-x-12 rounded-sm"
            style={{ background: c, width: 26 - i * 6, height: 130 + i * 20 }}
          />
        ))}
      </div>
    </div>
  );
}

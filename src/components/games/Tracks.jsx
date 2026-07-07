import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, EASE } from "../ui";
import ShareButton from "./ShareButton";
import DownloadCardButton from "./DownloadCardButton";
import { TRACKS } from "../../data/tracks";

/* «Угадай трассу»: показываем реальный GPS-контур круга (данные OpenF1) —
   нужно узнать Гран-при. 10 раундов, варианты — 4. */

const ROUNDS = 10;
const BEST_KEY = "fs-tracks-best";

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const makeRounds = () =>
  shuffle(TRACKS)
    .slice(0, ROUNDS)
    .map((track) => ({
      track,
      options: shuffle([
        track,
        ...shuffle(TRACKS.filter((t) => t.id !== track.id)).slice(0, 3),
      ]),
    }));

const loadBest = () => {
  const n = Number(localStorage.getItem(BEST_KEY));
  return Number.isFinite(n) && n > 0 ? n : null;
};

const verdict = (score) => {
  if (score === ROUNDS) return "Штурман уровня чемпионата мира!";
  if (score >= 8) return "Отлично — трассы ты знаешь как свои пять поворотов.";
  if (score >= 5) return "Неплохо! Ещё пара сезонов у телевизора — и будет идеально.";
  return "Похоже, пора пересмотреть календарь сезона.";
};

export default function Tracks() {
  const [rounds, setRounds] = useState(makeRounds);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(loadBest);

  const round = rounds[idx];
  const isLast = idx === ROUNDS - 1;

  const pick = (id) => {
    if (picked != null) return;
    setPicked(id);
    if (id === round.track.id) setScore((s) => s + 1);
  };

  const next = () => {
    if (isLast) {
      setDone(true);
      if (best == null || score > best) {
        setBest(score);
        try {
          localStorage.setItem(BEST_KEY, String(score));
        } catch {
          /* приватный режим */
        }
      }
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
  };

  const restart = () => {
    setRounds(makeRounds());
    setIdx(0);
    setScore(0);
    setPicked(null);
    setDone(false);
  };

  const contour = useMemo(
    () => (
      <svg viewBox="0 0 1000 1000" className="mx-auto max-h-72 w-full md:max-h-80">
        <path d={round.track.path} fill="none" stroke="#26262c" strokeWidth={26} strokeLinejoin="round" />
        <path d={round.track.path} fill="none" stroke="#ff2800" strokeWidth={9} strokeLinejoin="round" />
      </svg>
    ),
    [round],
  );

  if (done) {
    return (
      <Reveal className="mx-auto max-w-2xl rounded-xl border border-line bg-panel p-8 text-center md:p-12">
        <p className="text-[10px] font-bold tracking-[0.4em] text-dim">РЕЗУЛЬТАТ</p>
        <p className="mt-4 font-digits text-7xl font-black text-giallo md:text-8xl">
          {score}
          <span className="text-3xl text-dim">/{ROUNDS}</span>
        </p>
        <p className="mt-4 text-xl font-bold">{verdict(score)}</p>
        {best != null && (
          <p className="mt-2 text-sm text-dim">
            Лучший результат: <span className="font-digits text-giallo">{best}/{ROUNDS}</span>
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={restart}
            className="rounded-md bg-rosso px-8 py-3 text-sm font-black uppercase tracking-widest transition-transform hover:scale-105"
          >
            Ещё раз
          </button>
          <ShareButton text={`Угадай трассу Ф1 по контуру: ${score}/${ROUNDS} 🗺️`} className="py-3" />
          <DownloadCardButton
            className="py-3"
            card={{
              label: "Угадай трассу",
              value: `${score}/${ROUNDS}`,
              sub: verdict(score),
            }}
          />
        </div>
      </Reveal>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between text-sm font-bold uppercase tracking-widest text-dim">
        <span>
          Трасса {idx + 1} из {ROUNDS}
        </span>
        <span className="font-digits text-giallo">Счёт: {score}</span>
      </div>
      <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-panel2">
        <motion.div
          className="h-full rounded-full bg-rosso"
          animate={{ width: `${((idx + (picked != null ? 1 : 0)) / ROUNDS) * 100}%` }}
          transition={{ duration: 0.4, ease: EASE }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="rounded-xl border border-line bg-panel p-6 md:p-8"
        >
          {contour}
          <p className="mt-2 text-center text-[10px] font-bold tracking-[0.35em] text-dim">
            РЕАЛЬНАЯ GPS-ТРАЕКТОРИЯ КРУГА · ДАННЫЕ OPENF1
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {round.options.map((opt) => {
              const isCorrect = picked != null && opt.id === round.track.id;
              const isWrongPick = picked === opt.id && opt.id !== round.track.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => pick(opt.id)}
                  disabled={picked != null}
                  className={`rounded-md border px-5 py-3.5 text-left font-bold transition-colors ${
                    isCorrect
                      ? "border-giallo bg-giallo/10 text-giallo"
                      : isWrongPick
                        ? "border-rosso bg-rosso/10 text-rosso"
                        : picked != null
                          ? "border-line bg-panel2/50 text-dim"
                          : "border-line bg-panel2/50 hover:border-rosso/60"
                  }`}
                >
                  {opt.gp}
                </button>
              );
            })}
          </div>

          {picked != null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <p className="text-sm text-dim">
                Это <span className="font-bold text-white">{round.track.gp}</span> —{" "}
                {round.track.circuit}.
              </p>
              <button
                onClick={next}
                className="mt-4 rounded-md bg-rosso px-6 py-3 text-sm font-black uppercase tracking-widest transition-transform hover:scale-105"
              >
                {isLast ? "Результат" : "Дальше →"}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

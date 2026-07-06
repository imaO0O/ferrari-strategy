import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, EASE } from "../ui";
import ShareButton from "./ShareButton";
import DownloadCardButton from "./DownloadCardButton";
import { QUIZ } from "../../data/quiz";

const BEST_KEY = "fs-quiz-best";

const loadBest = () => {
  const n = Number(localStorage.getItem(BEST_KEY));
  return Number.isFinite(n) && n > 0 ? n : null;
};

const verdict = (score, total) => {
  const ratio = score / total;
  if (ratio === 1) return "Il Commendatore! Безупречно. 🏆";
  if (ratio >= 0.75) return "Настоящий тифози — Маранелло гордится тобой!";
  if (ratio >= 0.5) return "Крепкий болельщик, но есть куда расти.";
  return "Пора пересмотреть «Историю» на этом сайте 😉";
};

export default function Quiz() {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(loadBest);

  const question = QUIZ[idx];
  const isLast = idx === QUIZ.length - 1;

  const pick = (i) => {
    if (picked != null) return;
    setPicked(i);
    if (i === question.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (isLast) {
      const finalScore = score;
      setDone(true);
      if (best == null || finalScore > best) {
        setBest(finalScore);
        try {
          localStorage.setItem(BEST_KEY, String(finalScore));
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
    setIdx(0);
    setScore(0);
    setPicked(null);
    setDone(false);
  };

  if (done) {
    return (
      <Reveal className="mx-auto max-w-2xl rounded-xl border border-line bg-panel p-8 text-center md:p-12">
        <p className="text-[10px] font-bold tracking-[0.4em] text-dim">РЕЗУЛЬТАТ</p>
        <p className="mt-4 font-digits text-7xl font-black text-giallo md:text-8xl">
          {score}<span className="text-3xl text-dim">/{QUIZ.length}</span>
        </p>
        <p className="mt-4 text-xl font-bold">{verdict(score, QUIZ.length)}</p>
        {best != null && (
          <p className="mt-2 text-sm text-dim">
            Лучший результат: <span className="font-digits text-giallo">{best}/{QUIZ.length}</span>
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={restart}
            className="rounded-md bg-rosso px-8 py-3 text-sm font-black uppercase tracking-widest transition-transform hover:scale-105"
          >
            Пройти ещё раз
          </button>
          <ShareButton text={`Викторина о Ferrari: ${score}/${QUIZ.length} 🏎️`} className="py-3" />
          <DownloadCardButton
            className="py-3"
            card={{
              label: "Викторина о Ferrari",
              value: `${score}/${QUIZ.length}`,
              sub: verdict(score, QUIZ.length).replace(/ ?[🏆😉]+$/u, ""),
            }}
          />
        </div>
      </Reveal>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* прогресс */}
      <div className="mb-6 flex items-center justify-between text-sm font-bold uppercase tracking-widest text-dim">
        <span>
          Вопрос {idx + 1} из {QUIZ.length}
        </span>
        <span className="font-digits text-giallo">Счёт: {score}</span>
      </div>
      <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-panel2">
        <motion.div
          className="h-full rounded-full bg-rosso"
          animate={{ width: `${((idx + (picked != null ? 1 : 0)) / QUIZ.length) * 100}%` }}
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
          <h2 className="text-2xl font-black italic leading-tight md:text-3xl">{question.q}</h2>

          <div className="mt-6 grid gap-3">
            {question.options.map((opt, i) => {
              const isCorrect = picked != null && i === question.correct;
              const isWrongPick = picked === i && i !== question.correct;
              return (
                <button
                  key={opt}
                  onClick={() => pick(i)}
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
                  {opt}
                </button>
              );
            })}
          </div>

          {picked != null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <p className="text-sm leading-relaxed text-dim">{question.note}</p>
              <button
                onClick={next}
                className="mt-5 rounded-md bg-rosso px-6 py-3 text-sm font-black uppercase tracking-widest transition-transform hover:scale-105"
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

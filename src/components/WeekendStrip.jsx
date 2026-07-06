import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWeekend, sessionRu, untilRu } from "../lib/useWeekend";
import { circuitGpRu } from "../lib/i18n";

/* Тонкая полоса под навбаром в дни гоночного уик-энда:
   что за сессия следующая и сколько до неё осталось (местное время). */
export default function WeekendStrip() {
  const weekend = useWeekend();
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!weekend) return null;
  const { live, next, circuit } = weekend;

  return (
    <Link
      to="/dashboard"
      className="fixed inset-x-0 top-16 z-40 block bg-giallo py-1.5 text-center text-[11px] font-black uppercase tracking-[0.2em] text-carbon transition-colors hover:bg-white"
    >
      🏁 {circuitGpRu(circuit)}{" "}
      {live ? (
        <>
          · <span className="animate-pulse text-rosso">● LIVE</span> {sessionRu(live.session_name)}
        </>
      ) : (
        next && (
          <>
            · {sessionRu(next.session_name)}{" "}
            {new Date(next.date_start).toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            · {untilRu(next.date_start)}
          </>
        )
      )}
    </Link>
  );
}

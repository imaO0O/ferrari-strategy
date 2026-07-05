import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="checker h-2.5 opacity-70" />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="text-2xl font-black uppercase italic tracking-tight">
            <span className="text-rosso">Ferrari</span> Strategy
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-dim">
            Неофициальный некоммерческий фан-проект, сделанный из любви к
            Формуле-1 и Скудерии. Не связан с Ferrari&nbsp;S.p.A. и
            Formula&nbsp;One&nbsp;Group и не одобрен ими.
          </p>
        </div>
        <div>
          <p className="mb-3 font-digits text-[10px] tracking-[0.35em] text-rosso">РАЗДЕЛЫ</p>
          <ul className="space-y-2 text-sm font-bold uppercase tracking-wider">
            <li><Link className="transition-colors hover:text-rosso" to="/">Скудерия</Link></li>
            <li><Link className="transition-colors hover:text-rosso" to="/dashboard">Дашборд</Link></li>
            <li><Link className="transition-colors hover:text-rosso" to="/races">Гонки</Link></li>
            <li><Link className="transition-colors hover:text-rosso" to="/telemetry">Телеметрия</Link></li>
            <li><Link className="transition-colors hover:text-rosso" to="/games">Игры</Link></li>
            <li><Link className="transition-colors hover:text-rosso" to="/legends">Легенды</Link></li>
            <li><Link className="transition-colors hover:text-rosso" to="/heritage">История</Link></li>
            <li><Link className="transition-colors hover:text-rosso" to="/credits">Источники</Link></li>
            <li className="text-dim/50">Прогнозы — скоро</li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-digits text-[10px] tracking-[0.35em] text-rosso">ИСТОЧНИКИ</p>
          <p className="text-sm leading-relaxed text-dim">
            Фотографии встроены с{" "}
            <a
              className="text-white underline decoration-rosso underline-offset-4"
              href="https://commons.wikimedia.org"
              target="_blank"
              rel="noreferrer"
            >
              Wikimedia Commons
            </a>{" "}
            и распространяются под их свободными лицензиями — каждый снимок,
            автор и лицензия перечислены на странице{" "}
            <Link to="/credits" className="text-white underline decoration-rosso underline-offset-4">
              Источники
            </Link>
            . Живые данные —{" "}
            <a
              className="text-white underline decoration-rosso underline-offset-4"
              href="https://jolpi.ca"
              target="_blank"
              rel="noreferrer"
            >
              Jolpica F1 API
            </a>
            .
          </p>
        </div>
      </div>
      <div className="border-t border-line/60 py-4 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-dim/60">
        Forza Ferrari · {new Date().getFullYear()} · Сделано фанатом для фанатов
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="checker h-2.5 opacity-70" />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="text-2xl font-black uppercase italic tracking-tight">
            <span className="text-rosso">Rosso</span> Corsa
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-dim">
            An unofficial, non-commercial fan project made with passion for
            Formula&nbsp;1 and the Scuderia. Not affiliated with, endorsed or
            sponsored by Ferrari&nbsp;S.p.A. or Formula&nbsp;One&nbsp;Group.
          </p>
        </div>
        <div>
          <p className="mb-3 font-digits text-[10px] tracking-[0.35em] text-rosso">SECTIONS</p>
          <ul className="space-y-2 text-sm font-bold uppercase tracking-wider">
            <li><Link className="transition-colors hover:text-rosso" to="/">Scuderia</Link></li>
            <li><Link className="transition-colors hover:text-rosso" to="/heritage">Heritage</Link></li>
            <li><Link className="transition-colors hover:text-rosso" to="/credits">Credits &amp; sources</Link></li>
            <li className="text-dim/50">Dashboard · Racing · Game — soon</li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-digits text-[10px] tracking-[0.35em] text-rosso">SOURCES</p>
          <p className="text-sm leading-relaxed text-dim">
            Photographs are hotlinked from{" "}
            <a
              className="text-white underline decoration-rosso underline-offset-4"
              href="https://commons.wikimedia.org"
              target="_blank"
              rel="noreferrer"
            >
              Wikimedia Commons
            </a>{" "}
            under their respective free licenses — every image, author and
            license is listed on the <Link to="/credits" className="text-white underline decoration-rosso underline-offset-4">Credits</Link> page.
            Live data by the{" "}
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
      <div className="border-t border-line/60 py-4 text-center font-digits text-[10px] tracking-[0.3em] text-dim/60">
        FORZA FERRARI · EST. 2026 · MADE BY A FAN, FOR FANS
      </div>
    </footer>
  );
}

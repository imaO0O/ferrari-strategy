import { Link } from "react-router-dom";
import PageWrap from "../components/PageWrap";
import { Reveal, KineticTitle } from "../components/ui";
import { TractorSvg } from "../components/EmptyState";
import { usePageMeta } from "../lib/usePageMeta";

export default function NotFound() {
  usePageMeta("Страница не найдена", "Такой страницы нет — вернись на трассу.");

  return (
    <PageWrap>
      <section className="mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-5 pt-24 text-center">
        <Reveal>
          <p className="font-digits text-[8rem] font-black leading-none text-outline-rosso md:text-[12rem]">
            404
          </p>
        </Reveal>
        <h1 className="mt-2 text-4xl font-black uppercase italic tracking-tight md:text-6xl">
          <KineticTitle text="УШЁЛ В ГРАВИЙ" />
        </h1>
        <Reveal delay={0.4}>
          <p className="mt-4 max-w-md text-dim">
            Такой страницы не существует — похоже, поворот был левее. Эвакуатор уже выехал.
          </p>
        </Reveal>
        <Reveal delay={0.5}>
          <TractorSvg className="mt-8 h-28 w-44" />
        </Reveal>
        <Reveal delay={0.6}>
          <Link
            to="/"
            className="mt-8 inline-block rounded-md bg-rosso px-8 py-3 text-sm font-black uppercase tracking-widest transition-transform hover:scale-105"
          >
            Назад в боксы →
          </Link>
        </Reveal>
      </section>
    </PageWrap>
  );
}

import PageWrap from "../components/PageWrap";
import { Reveal, SectionTitle } from "../components/ui";
import { usePageMeta } from "../lib/usePageMeta";

const link = "underline decoration-rosso underline-offset-4";

export default function About() {
  usePageMeta(
    "О проекте",
    "Ferrari Strategy — некоммерческий фан-проект о Формуле-1: кто делает, зачем и что дальше.",
  );

  return (
    <PageWrap>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 md:pt-40">
        <SectionTitle kicker="CHI SIAMO" title="О проекте" className="mb-10" />

        <div className="max-w-3xl space-y-8">
          <Reveal>
            <h2 className="mb-3 text-xl font-black uppercase italic">Что это</h2>
            <p className="leading-relaxed text-neutral-200">
              Ferrari Strategy — некоммерческий фан-проект о Формуле-1 глазами тифози:
              живая статистика сезона, браузерная телеметрия с реплеями гонок, история
              Скудерии с 1947 года и мини-игры. Всё бесплатно, без регистрации и без
              рекламы. Сайт не связан с Ferrari S.p.A. или Formula One Group.
            </p>
          </Reveal>

          <Reveal>
            <h2 className="mb-3 text-xl font-black uppercase italic">Кто делает</h2>
            <p className="leading-relaxed text-neutral-200">
              Проект придуман и разрабатывается{" "}
              <a className={link} href="https://github.com/imaO0O" target="_blank" rel="noreferrer">
                imaO0O
              </a>
              . Исходный код полностью открыт:{" "}
              <a
                className={link}
                href="https://github.com/imaO0O/ferrari-strategy"
                target="_blank"
                rel="noreferrer"
              >
                github.com/imaO0O/ferrari-strategy
              </a>
              . Стек: React, Vite, Tailwind CSS, Three.js; данные — открытые API Jolpica и
              OpenF1, фотографии — Wikimedia Commons (полная атрибуция на странице{" "}
              <a className={link} href="/credits">
                «Источники»
              </a>
              ).
            </p>
          </Reveal>

          <Reveal>
            <h2 className="mb-3 text-xl font-black uppercase italic">Что дальше</h2>
            <ul className="list-inside list-disc space-y-1.5 leading-relaxed text-neutral-200 marker:text-rosso">
              <li>Расширение live-режима в гоночные уик-энды: интервалы, шины, карта в реальном времени.</li>
              <li>Сравнение пилотов и команд между сезонами.</li>
              <li>Английская версия интерфейса.</li>
              <li>Больше материалов об истории Скудерии: инженеры, командиры, культовые гонки.</li>
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="mb-3 text-xl font-black uppercase italic">Нашли ошибку?</h2>
            <p className="leading-relaxed text-neutral-200">
              Опечатка, неверная цифра или что-то сломалось — напишите в{" "}
              <a
                className={link}
                href="https://github.com/imaO0O/ferrari-strategy/issues"
                target="_blank"
                rel="noreferrer"
              >
                GitHub Issues
              </a>
              . Это лучший способ сделать проект точнее.
            </p>
          </Reveal>

          <Reveal>
            <h2 className="mb-3 text-xl font-black uppercase italic">Приватность</h2>
            <p className="leading-relaxed text-neutral-200">
              Сайт не использует куки, трекеры и рекламу и не собирает персональные данные.
              Рекорды игр, прогнозы и «мой пилот» хранятся только в вашем браузере
              (localStorage) и никуда не отправляются.
            </p>
          </Reveal>
        </div>
      </section>
    </PageWrap>
  );
}

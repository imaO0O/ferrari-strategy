import { useEffect, useState } from "react";
import PageWrap from "../components/PageWrap";
import { Reveal, SectionTitle } from "../components/ui";
import { IMAGES, commonsFile, commonsPage } from "../lib/images";

const stripHtml = (html) =>
  new DOMParser().parseFromString(html ?? "", "text/html").body.textContent?.trim() ?? "";

/* Автор и лицензия каждого снимка загружаются напрямую из API Commons,
   чтобы атрибуция всегда совпадала с первоисточником. */
function useCommonsMeta() {
  const [meta, setMeta] = useState(null);
  useEffect(() => {
    let alive = true;
    const titles = IMAGES.map((i) => "File:" + i.file).join("|");
    const url =
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*" +
      "&prop=imageinfo&iiprop=extmetadata%7Curl&iiurlwidth=320&titles=" +
      encodeURIComponent(titles);
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const byTitle = {};
        for (const page of Object.values(d?.query?.pages ?? {})) {
          const ii = page.imageinfo?.[0];
          if (!ii) continue;
          byTitle[page.title.replace(/^File:/, "")] = {
            author: stripHtml(ii.extmetadata?.Artist?.value) || "Автор не указан",
            license: ii.extmetadata?.LicenseShortName?.value ?? "См. страницу файла",
            page: ii.descriptionurl,
            thumb: ii.thumburl,
          };
        }
        setMeta(byTitle);
      })
      .catch(() => alive && setMeta({}));
    return () => {
      alive = false;
    };
  }, []);
  return meta;
}

export default function Credits() {
  const meta = useCommonsMeta();

  return (
    <PageWrap>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 md:pt-40">
        <SectionTitle kicker="TRASPARENZA" title="Источники" className="mb-10" />

        <Reveal className="max-w-3xl space-y-4 leading-relaxed text-neutral-200">
          <p>
            <strong className="text-white">Ferrari Strategy</strong> — неофициальный{" "}
            <strong className="text-white">некоммерческий фан-проект</strong>, созданный ради
            обучения и из любви к гонкам. Он не связан с Ferrari S.p.A., Formula One Group,
            FIA или какой-либо командой Формулы-1 и не одобрен ими. «Ferrari», «Formula 1» и
            связанные знаки — товарные знаки их правообладателей.
          </p>
          <p>
            <span className="text-white">Фотографии.</span> Все снимки встроены с{" "}
            <a className="underline decoration-rosso underline-offset-4" href="https://commons.wikimedia.org" target="_blank" rel="noreferrer">
              Wikimedia Commons
            </a>{" "}
            и остаются под своими свободными лицензиями (CC&nbsp;BY, CC&nbsp;BY-SA,
            общественное достояние и другие). Авторы и лицензии ниже загружаются напрямую из
            API Commons. Ни один снимок не выдаётся за собственную работу проекта.
          </p>
          <p>
            <span className="text-white">Данные.</span> Положение в чемпионате, результаты и
            календарь гонок предоставляет бесплатный{" "}
            <a className="underline decoration-rosso underline-offset-4" href="https://jolpi.ca" target="_blank" rel="noreferrer">
              Jolpica F1 API
            </a>{" "}
            (преемник Ergast). Шрифты —{" "}
            <a className="underline decoration-rosso underline-offset-4" href="https://fonts.google.com" target="_blank" rel="noreferrer">
              Google Fonts
            </a>{" "}
            (Exo 2, Orbitron).
          </p>
          <p>
            <span className="text-white">3D.</span> Болид на главном экране — процедурная
            стилизованная модель, собранная из примитивов Three.js (React Three Fiber)
            специально для этого проекта. Сторонние 3D-ассеты не используются; модель не
            воспроизводит реальную ливрею или конструкцию какой-либо команды.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {IMAGES.map((img, i) => {
            const m = meta?.[img.file];
            return (
              <Reveal key={img.file} delay={(i % 3) * 0.07}>
                <a
                  href={m?.page ?? commonsPage(img.file)}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex h-full gap-4 rounded-xl border border-line bg-panel p-4 transition-colors hover:border-rosso/50"
                >
                  <img
                    src={m?.thumb ?? commonsFile(img.file, 320)}
                    alt={img.label}
                    loading="lazy"
                    className="h-20 w-24 shrink-0 rounded-md object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{img.label}</span>
                    <span className="mt-1 block truncate text-xs text-dim">
                      {meta == null ? "Загружаем автора…" : m?.author ?? "См. страницу файла"}
                    </span>
                    <span className="mt-1 inline-block rounded-sm bg-panel2 px-1.5 py-0.5 font-digits text-[9px] tracking-wider text-giallo">
                      {meta == null ? "…" : m?.license ?? "ЛИЦЕНЗИЯ НА COMMONS"}
                    </span>
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-dim">
          Вы автор одной из фотографий и хотите изменить атрибуцию или убрать снимок?
          Каноническая атрибуция — на странице файла на Commons; эта страница зеркалит её
          автоматически.
        </p>
      </section>
    </PageWrap>
  );
}

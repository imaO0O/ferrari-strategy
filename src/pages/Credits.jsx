import { useEffect, useState } from "react";
import PageWrap from "../components/PageWrap";
import { Reveal, SectionTitle } from "../components/ui";
import { IMAGES, commonsFile, commonsPage } from "../lib/images";

const stripHtml = (html) =>
  new DOMParser().parseFromString(html ?? "", "text/html").body.textContent?.trim() ?? "";

/* Fetch author + license for every image straight from the Commons API,
   so attribution always matches the source file. */
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
            author: stripHtml(ii.extmetadata?.Artist?.value) || "Unknown author",
            license: ii.extmetadata?.LicenseShortName?.value ?? "See file page",
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
        <SectionTitle kicker="TRASPARENZA" title="Credits & sources" className="mb-10" />

        <Reveal className="max-w-3xl space-y-4 leading-relaxed text-neutral-200">
          <p>
            <strong className="text-white">Rosso Corsa</strong> is an unofficial,{" "}
            <strong className="text-white">non-commercial fan project</strong> built for learning
            and for the love of racing. It is not affiliated with, endorsed or sponsored by
            Ferrari S.p.A., Formula One Group, the FIA or any Formula 1 team. “Ferrari”,
            “Formula 1” and related marks are trademarks of their respective owners.
          </p>
          <p>
            <span className="text-white">Photography.</span> All photographs are embedded from{" "}
            <a className="underline decoration-rosso underline-offset-4" href="https://commons.wikimedia.org" target="_blank" rel="noreferrer">
              Wikimedia Commons
            </a>{" "}
            and remain under their original free licenses (CC&nbsp;BY, CC&nbsp;BY-SA, public
            domain and similar). Authors and licenses below are loaded live from the Commons API.
            No image is claimed as this project&apos;s own work.
          </p>
          <p>
            <span className="text-white">Data.</span> Championship standings, results and the
            race calendar come from the free{" "}
            <a className="underline decoration-rosso underline-offset-4" href="https://jolpi.ca" target="_blank" rel="noreferrer">
              Jolpica F1 API
            </a>{" "}
            (successor of the Ergast API). Fonts by{" "}
            <a className="underline decoration-rosso underline-offset-4" href="https://fonts.google.com" target="_blank" rel="noreferrer">
              Google Fonts
            </a>{" "}
            (Titillium Web, Orbitron).
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
                      {meta == null ? "Loading author…" : m?.author ?? "See file page"}
                    </span>
                    <span className="mt-1 inline-block rounded-sm bg-panel2 px-1.5 py-0.5 font-digits text-[9px] tracking-wider text-giallo">
                      {meta == null ? "…" : m?.license ?? "LICENSE ON COMMONS"}
                    </span>
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-dim">
          Are you an author of one of these photographs and want it credited differently or
          removed? Open the file page on Commons for canonical attribution — this page mirrors it
          automatically.
        </p>
      </section>
    </PageWrap>
  );
}

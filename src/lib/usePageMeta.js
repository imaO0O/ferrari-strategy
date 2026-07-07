import { useEffect } from "react";

/* Уникальные title и description для каждой страницы — для поисковиков
   и красивых вкладок браузера. */
export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = `${title} | Ferrari Strategy`;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    }
    // canonical для поисковиков
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = window.location.origin + window.location.pathname;
  }, [title, description]);
}

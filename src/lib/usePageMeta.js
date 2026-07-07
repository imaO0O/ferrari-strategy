import { useEffect } from "react";

/* Уникальные title и description для каждой страницы — для поисковиков
   и красивых вкладок браузера. */
export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = `${title} | Ferrari Strategy`;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    }
  }, [title, description]);
}

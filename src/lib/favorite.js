import { useEffect, useState } from "react";

/* «Мой пилот»: любимый пилот хранится в браузере и подсвечивается
   в зачётах, результатах, реплее и на графиках. */

const KEY = "fs-fav-driver";

export function loadFav() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function useFavDriver() {
  const [fav, setFav] = useState(loadFav);

  useEffect(() => {
    const onChange = () => setFav(loadFav());
    window.addEventListener("fs-fav-changed", onChange);
    return () => window.removeEventListener("fs-fav-changed", onChange);
  }, []);

  const toggle = (driver) => {
    const next = fav?.id === driver.id ? null : driver;
    try {
      if (next) localStorage.setItem(KEY, JSON.stringify(next));
      else localStorage.removeItem(KEY);
    } catch {
      /* приватный режим */
    }
    setFav(next);
    window.dispatchEvent(new Event("fs-fav-changed"));
  };

  return [fav, toggle];
}

/* Совпадение по номеру или трёхбуквенному коду (для данных OpenF1) */
export const isFavOpenF1 = (fav, { number, acronym } = {}) =>
  Boolean(fav && ((fav.number != null && +fav.number === +number) || fav.code === acronym));

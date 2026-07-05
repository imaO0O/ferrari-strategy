# Ferrari Strategy 🏎️

**Разработка: [imaO0O](https://github.com/imaO0O)**

Неофициальный некоммерческий фан-сайт о Формуле-1 в стиле Ferrari.
Живая статистика сезона, интерактивная история Скудерии с 1947 года и
3D-болид на главном экране.

**Дисклеймер:** проект не связан с Ferrari S.p.A., Formula One Group или FIA
и не одобрен ими. Все товарные знаки принадлежат их правообладателям.
Фотографии — Wikimedia Commons (авторы и лицензии — на странице «Источники»),
данные — [Jolpica F1 API](https://jolpi.ca).

## Запуск

Нужен установленный [Node.js](https://nodejs.org) (18+).

```bash
npm install     # один раз — установить зависимости
npm run dev     # запустить сайт для разработки
```

После `npm run dev` открой в браузере адрес, который покажет Vite —
обычно **http://localhost:5173**. Изменения в коде подхватываются сразу,
перезапускать ничего не нужно. Остановить сервер — `Ctrl+C` в терминале.

Продакшен-сборка:

```bash
npm run build    # собрать оптимизированную версию в папку dist/
npm run preview  # локально посмотреть собранную версию
```

## Технологии

| Слой | Что используется |
|---|---|
| Каркас | React 18 + Vite 6 |
| Стили | Tailwind CSS v4 (токены в `src/styles/index.css`) |
| Анимации | Framer Motion, Lenis (плавный скролл) |
| 3D | Three.js + React Three Fiber + drei (процедурный болид, без сторонних ассетов) |
| Данные | Jolpica F1 API (бесплатно, без ключей), кэш в localStorage |
| Фото | Wikimedia Commons (hotlink через Special:FilePath) |
| Шрифты | Exo 2 (кириллица) + Orbitron — Google Fonts |

## Структура

```
src/
  pages/        Скудерия (главная), История, Источники
  components/   UI-примитивы, анимации, 3D-сцена (three/Hero3D.jsx)
  lib/          api.js (Jolpica), images.js (реестр фото Commons), i18n.js (русские названия)
  data/         heritage.js — таймлайн истории Ferrari
```

## Деплой (бесплатно)

Проект статический — подходит [Vercel](https://vercel.com) или GitHub Pages:
импортируй репозиторий в Vercel, фреймворк определится автоматически
(`vite`), команда сборки `npm run build`, папка `dist`.

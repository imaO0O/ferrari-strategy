/* Подпись под блоками статистики: источник данных и свежесть. */
export default function DataNote({ source = "Jolpica F1 API", updatedAt, className = "" }) {
  let ago = null;
  if (updatedAt) {
    const min = Math.floor((Date.now() - updatedAt) / 60_000);
    ago = min < 1 ? "только что" : min < 60 ? `${min} мин назад` : `${Math.floor(min / 60)} ч назад`;
  }
  return (
    <p className={`mt-5 text-right font-digits text-[10px] tracking-[0.2em] text-dim/70 ${className}`}>
      ДАННЫЕ: {source.toUpperCase()}
      {ago && ` · ОБНОВЛЕНО ${ago.toUpperCase()}`}
    </p>
  );
}

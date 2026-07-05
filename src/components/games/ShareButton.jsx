import { useState } from "react";

/* «Поделиться результатом»: системный диалог шеринга,
   а без него — копирование в буфер обмена */
export default function ShareButton({ text, className = "" }) {
  const [label, setLabel] = useState("Поделиться");

  const flash = (msg) => {
    setLabel(msg);
    setTimeout(() => setLabel("Поделиться"), 2000);
  };

  const onClick = async () => {
    const payload = `${text}\nFerrari Strategy — фан-хаб Формулы-1`;
    if (navigator.share) {
      try {
        await navigator.share({ text: payload });
      } catch {
        /* пользователь закрыл диалог — это не ошибка */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(payload);
      flash("Скопировано ✓");
    } catch {
      flash("Не удалось");
    }
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-md border border-line px-4 py-2 text-xs font-black uppercase tracking-widest text-dim transition-colors hover:border-rosso/60 hover:text-white ${className}`}
    >
      {label}
    </button>
  );
}

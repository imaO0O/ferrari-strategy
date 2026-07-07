/* Единое пустое/ошибочное состояние с фирменным мини-трактором. */

export function TractorSvg({ className = "h-24 w-36" }) {
  return (
    <svg viewBox="0 0 180 110" className={className} aria-hidden>
      {/* корпус */}
      <rect x="52" y="38" width="60" height="26" rx="4" fill="#c81800" />
      <rect x="100" y="20" width="26" height="30" rx="4" fill="#c81800" />
      <rect x="104" y="26" width="18" height="12" rx="2" fill="#0b0b0f" />
      {/* труба и маячок */}
      <rect x="60" y="18" width="7" height="22" rx="2" fill="#0b0b0f" />
      <rect x="112" y="12" width="10" height="8" rx="2" fill="#ffd400" />
      {/* колёса */}
      <circle cx="132" cy="78" r="26" fill="#0b0b0f" />
      <circle cx="132" cy="78" r="13" fill="#1c1c22" />
      <circle cx="132" cy="78" r="5" fill="#ffd400" />
      <circle cx="62" cy="86" r="16" fill="#0b0b0f" />
      <circle cx="62" cy="86" r="8" fill="#1c1c22" />
      <circle cx="62" cy="86" r="3.5" fill="#ffd400" />
      {/* фара */}
      <rect x="46" y="44" width="8" height="8" rx="2" fill="#ffd400" />
    </svg>
  );
}

export default function EmptyState({ title, note, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-line bg-panel px-6 py-12 text-center">
      <TractorSvg className="h-20 w-32 opacity-80" />
      <p className="mt-5 text-lg font-black uppercase italic">{title}</p>
      {note && <p className="mt-2 max-w-md text-sm leading-relaxed text-dim">{note}</p>}
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-6 rounded-md bg-rosso px-6 py-2.5 text-sm font-black uppercase tracking-widest transition-transform hover:scale-105"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

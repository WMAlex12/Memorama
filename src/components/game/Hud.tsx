interface HudProps {
  level: number;
  score: number;
  streak: number;
  bestStreak: number;
  moves: number;
}

export function Hud({ level, score, streak, bestStreak, moves }: HudProps) {
  return (
    <div className="mx-auto mb-6 flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl bg-white/80 px-4 py-3 text-sm shadow-sm sm:text-base">
      <Stat label="Nivel" value={level} />
      <Stat label="Puntaje" value={score} />
      <Stat label="Racha" value={streak} highlight={streak > 0} />
      <Stat label="Mejor racha" value={bestStreak} />
      <Stat label="Movimientos" value={moves} />
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`font-bold ${highlight ? 'text-orange-500' : 'text-slate-800'}`}>{value}</div>
    </div>
  );
}

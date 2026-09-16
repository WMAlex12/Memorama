interface LevelCompleteModalProps {
  level: number;
  score: number;
  onContinue: () => void;
}

export function LevelCompleteModal({ level, score, onContinue }: LevelCompleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="text-4xl">🎉</div>
        <h2 className="mt-2 text-xl font-bold text-slate-800">¡Nivel {level} completado!</h2>
        <p className="mt-1 text-slate-500">Puntaje total: {score}</p>
        <button
          type="button"
          onClick={onContinue}
          className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
        >
          Siguiente nivel
        </button>
      </div>
    </div>
  );
}

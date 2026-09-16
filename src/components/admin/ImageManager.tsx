import { useRef, useState } from 'react';
import { useImages } from '../../hooks/useImages';

export function ImageManager() {
  const { images, loading, addImage, removeImage, resetDefaults } = useImages();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        await addImage(file);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Imágenes del juego</h1>
          <p className="text-sm text-slate-500">
            {images.length} imagen{images.length === 1 ? '' : 'es'} disponibles. Se necesitan al menos 2 para jugar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => resetDefaults()}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100"
        >
          Restaurar imágenes de prueba
        </button>
      </div>

      <label className="mb-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-8 text-center transition hover:border-indigo-400">
        <span className="text-sm font-medium text-slate-600">
          {uploading ? 'Subiendo...' : 'Haz clic para elegir imágenes o arrástralas aquí'}
        </span>
        <span className="mt-1 text-xs text-slate-400">PNG, JPG o SVG</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {loading ? (
        <p className="text-sm text-slate-400">Cargando imágenes...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white">
              <img src={img.url} alt={img.name} className="aspect-square w-full object-cover" />
              <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                <span className="truncate text-xs text-slate-600">{img.name}</span>
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                  aria-label={`Quitar ${img.name}`}
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

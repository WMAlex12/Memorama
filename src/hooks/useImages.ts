import { useCallback, useEffect, useState } from 'react';
import { supabaseImageRepository as repo } from '../lib/images/supabaseImageRepository';
import type { GameImage } from '../lib/images/types';

export function useImages() {
  const [images, setImages] = useState<GameImage[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setImages(await repo.list());
  }, []);

  useEffect(() => {
    (async () => {
      await repo.ensureSeeded();
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const addImage = useCallback(
    async (file: File) => {
      await repo.add(file);
      await refresh();
    },
    [refresh],
  );

  const removeImage = useCallback(
    async (id: string) => {
      await repo.remove(id);
      await refresh();
    },
    [refresh],
  );

  const resetDefaults = useCallback(async () => {
    await repo.resetToDefaults();
    await refresh();
  }, [refresh]);

  return { images, loading, addImage, removeImage, resetDefaults };
}

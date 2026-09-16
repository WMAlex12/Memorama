import { get, set } from 'idb-keyval';
import type { ImageRepository, StoredImage } from './types';
import { createSeedImages } from './seedImages';

const STORE_KEY = 'memorama:images';
const SEEDED_FLAG_KEY = 'memorama:seeded';

interface StoredRecord {
  id: string;
  name: string;
  blob: Blob;
  createdAt: number;
}

async function readAll(): Promise<StoredRecord[]> {
  return (await get<StoredRecord[]>(STORE_KEY)) ?? [];
}

async function writeAll(images: StoredRecord[]): Promise<void> {
  await set(STORE_KEY, images);
}

function toStoredImage(record: StoredRecord): StoredImage {
  return { id: record.id, name: record.name, url: URL.createObjectURL(record.blob), createdAt: record.createdAt };
}

/**
 * Local-only fallback backed by IndexedDB (via idb-keyval) — no longer the
 * active repository (see supabaseImageRepository), kept as a reference/dev
 * fallback for when Supabase isn't configured. Same ImageRepository shape,
 * so swapping which one `useImages` uses is a one-line change.
 */
export const localImageRepository: ImageRepository = {
  async ensureSeeded() {
    const alreadySeeded = await get<boolean>(SEEDED_FLAG_KEY);
    if (alreadySeeded) return;
    const existing = await readAll();
    if (existing.length === 0) {
      const now = Date.now();
      await writeAll(createSeedImages().map((seed, index) => ({ ...seed, createdAt: now + index })));
    }
    await set(SEEDED_FLAG_KEY, true);
  },

  async list() {
    const images = await readAll();
    return images.sort((a, b) => a.createdAt - b.createdAt).map(toStoredImage);
  },

  async add(file: File) {
    const images = await readAll();
    const record: StoredRecord = {
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      blob: file,
      createdAt: Date.now(),
    };
    await writeAll([...images, record]);
    return toStoredImage(record);
  },

  async remove(id: string) {
    const images = await readAll();
    await writeAll(images.filter((img) => img.id !== id));
  },

  async resetToDefaults() {
    const now = Date.now();
    await writeAll(createSeedImages().map((seed, index) => ({ ...seed, createdAt: now + index })));
  },
};

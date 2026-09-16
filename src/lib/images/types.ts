export interface StoredImage {
  id: string;
  name: string;
  /** Ready-to-render URL — a Supabase Storage public URL, or a local object URL. */
  url: string;
  createdAt: number;
}

export type GameImage = StoredImage;

export interface ImageRepository {
  /** Populates default sample images the first time the app runs. No-op afterward. */
  ensureSeeded(): Promise<void>;
  list(): Promise<StoredImage[]>;
  add(file: File): Promise<StoredImage>;
  remove(id: string): Promise<void>;
  resetToDefaults(): Promise<void>;
}

import { IMAGE_BUCKET, IMAGES_TABLE, supabase } from '../supabase/client';
import type { ImageRepository, StoredImage } from './types';
import { createSeedImages } from './seedImages';

interface ImageRow {
  id: string;
  name: string;
  storage_path: string;
  created_at: string;
}

function publicUrlFor(path: string): string {
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

function toStoredImage(row: ImageRow): StoredImage {
  return {
    id: row.id,
    name: row.name,
    url: publicUrlFor(row.storage_path),
    createdAt: new Date(row.created_at).getTime(),
  };
}

/**
 * Supabase-backed repository: images live in Storage (bucket `game-images`)
 * with metadata in the `images` table. Reading the list works for anyone
 * (anon RLS policy); adding/removing requires an authenticated session (the
 * admin), enforced by RLS on both the table and the storage bucket — see
 * supabase/migrations/0001_init.sql.
 */
export const supabaseImageRepository: ImageRepository = {
  async ensureSeeded() {
    const { count, error } = await supabase.from(IMAGES_TABLE).select('*', { count: 'exact', head: true });
    if (error) throw error;
    if (count && count > 0) return;
    // Seeding writes to Storage/the table, which RLS only allows for a
    // signed-in admin. For an anonymous visitor this simply no-ops — the
    // game just waits until the admin logs in and seeds or uploads images.
    try {
      await this.resetToDefaults();
    } catch {
      // not authenticated — nothing to do here
    }
  },

  async list() {
    const { data, error } = await supabase
      .from(IMAGES_TABLE)
      .select('id, name, storage_path, created_at')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as ImageRow[]).map(toStoredImage);
  },

  async add(file: File) {
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file);
    if (uploadError) throw uploadError;

    const name = file.name.replace(/\.[^/.]+$/, '');
    const { data, error } = await supabase
      .from(IMAGES_TABLE)
      .insert({ name, storage_path: path })
      .select('id, name, storage_path, created_at')
      .single();
    if (error) throw error;
    return toStoredImage(data as ImageRow);
  },

  async remove(id: string) {
    const { data: row, error: fetchError } = await supabase
      .from(IMAGES_TABLE)
      .select('storage_path')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    const { error: deleteError } = await supabase.from(IMAGES_TABLE).delete().eq('id', id);
    if (deleteError) throw deleteError;

    if (row) {
      await supabase.storage.from(IMAGE_BUCKET).remove([row.storage_path]);
    }
  },

  async resetToDefaults() {
    const { data: existing, error: fetchError } = await supabase.from(IMAGES_TABLE).select('id, storage_path');
    if (fetchError) throw fetchError;

    if (existing && existing.length > 0) {
      await supabase.storage.from(IMAGE_BUCKET).remove(existing.map((row) => row.storage_path));
      const { error: deleteError } = await supabase
        .from(IMAGES_TABLE)
        .delete()
        .in('id', existing.map((row) => row.id));
      if (deleteError) throw deleteError;
    }

    for (const seed of createSeedImages()) {
      const path = `${seed.id}.svg`;
      const { error: uploadError } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, seed.blob, { contentType: 'image/svg+xml', upsert: true });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from(IMAGES_TABLE)
        .insert({ name: seed.name, storage_path: path });
      if (insertError) throw insertError;
    }
  },
};

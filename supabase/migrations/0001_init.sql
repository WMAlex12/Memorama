-- Memorama: tabla de imágenes + bucket de Storage + políticas de seguridad.
-- Ejecutar una sola vez en el SQL Editor de tu proyecto de Supabase.

-- 1) Tabla de metadatos de las imágenes del juego
create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

alter table public.images enable row level security;

-- Cualquier visitante (incluso sin sesión) puede leer la lista de imágenes,
-- para poder jugar sin necesidad de iniciar sesión.
drop policy if exists "images_public_read" on public.images;
create policy "images_public_read"
  on public.images for select
  to anon, authenticated
  using (true);

-- Solo un usuario autenticado (el admin) puede agregar o quitar imágenes.
drop policy if exists "images_authenticated_insert" on public.images;
create policy "images_authenticated_insert"
  on public.images for insert
  to authenticated
  with check (true);

drop policy if exists "images_authenticated_delete" on public.images;
create policy "images_authenticated_delete"
  on public.images for delete
  to authenticated
  using (true);

-- 2) Bucket de Storage público para los archivos de imagen
insert into storage.buckets (id, name, public)
values ('game-images', 'game-images', true)
on conflict (id) do nothing;

-- Cualquiera puede leer los archivos (para que el juego cargue las imágenes)
drop policy if exists "game_images_public_read" on storage.objects;
create policy "game_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'game-images');

-- Solo un usuario autenticado (el admin) puede subir o borrar archivos
drop policy if exists "game_images_authenticated_insert" on storage.objects;
create policy "game_images_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'game-images');

drop policy if exists "game_images_authenticated_delete" on storage.objects;
create policy "game_images_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'game-images');

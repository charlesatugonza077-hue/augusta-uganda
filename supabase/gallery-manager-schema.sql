create extension if not exists pgcrypto;

grant usage on schema public to anon, authenticated;

create table if not exists public.gallery_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.is_gallery_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.gallery_admins a
    where a.user_id = auth.uid()
      and lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text not null unique,
  public_url text,
  media_type text not null check (media_type in ('image', 'video')),
  category text not null check (
    category in (
      'photography', 'videography', 'photo-editing', 'video-editing',
      'content-media', 'home-cleaning', 'laundry', 'wardrobe', 'events', 'general'
    )
  ),
  title text,
  description text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.gallery_items alter column public_url drop not null;

grant select on table public.gallery_items to anon, authenticated;
grant insert, update, delete on table public.gallery_items to authenticated;
grant select on table public.gallery_admins to authenticated;

alter table public.gallery_admins enable row level security;
alter table public.gallery_items enable row level security;

drop policy if exists "Admins read admin roster" on public.gallery_admins;
create policy "Admins read admin roster"
on public.gallery_admins for select to authenticated
using (public.is_gallery_admin());

drop policy if exists "Admins read all gallery records" on public.gallery_items;
create policy "Admins read all gallery records"
on public.gallery_items for select to authenticated
using (public.is_gallery_admin());

drop policy if exists "Visitors read published gallery records" on public.gallery_items;
create policy "Visitors read published gallery records"
on public.gallery_items for select to anon, authenticated
using (is_published = true);

drop policy if exists "Admins insert gallery records" on public.gallery_items;
create policy "Admins insert gallery records"
on public.gallery_items for insert to authenticated
with check (public.is_gallery_admin());

drop policy if exists "Admins update gallery records" on public.gallery_items;
create policy "Admins update gallery records"
on public.gallery_items for update to authenticated
using (public.is_gallery_admin())
with check (public.is_gallery_admin());

drop policy if exists "Admins delete gallery records" on public.gallery_items;
create policy "Admins delete gallery records"
on public.gallery_items for delete to authenticated
using (public.is_gallery_admin());

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'augusta-media',
  'augusta-media',
  false,
  52428800,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Visitors view Augusta portfolio files" on storage.objects;
drop policy if exists "Published media and administrators can read Augusta files" on storage.objects;
create policy "Published media and administrators can read Augusta files"
on storage.objects for select to anon, authenticated
using (
  bucket_id = 'augusta-media'
  and (
    public.is_gallery_admin()
    or exists (
      select 1
      from public.gallery_items i
      where i.storage_path = name
        and i.is_published = true
    )
  )
);

drop policy if exists "Admins upload Augusta portfolio files" on storage.objects;
create policy "Admins upload Augusta portfolio files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'augusta-media'
  and public.is_gallery_admin()
);

drop policy if exists "Admins update Augusta portfolio files" on storage.objects;
create policy "Admins update Augusta portfolio files"
on storage.objects for update to authenticated
using (
  bucket_id = 'augusta-media'
  and public.is_gallery_admin()
)
with check (
  bucket_id = 'augusta-media'
  and public.is_gallery_admin()
);

drop policy if exists "Admins delete Augusta portfolio files" on storage.objects;
create policy "Admins delete Augusta portfolio files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'augusta-media'
  and public.is_gallery_admin()
);

-- Create the administrator in Supabase Authentication first, then register
-- that account by running this statement with its actual Auth user ID and email:
-- insert into public.gallery_admins(user_id, email)
-- values ('AUTH-USER-UUID', 'admin@example.com');

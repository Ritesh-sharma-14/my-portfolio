create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  slug text not null unique check (length(btrim(slug)) > 0),
  excerpt text not null default '',
  category text not null default 'Learning',
  content text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;
alter table public.blog_admins enable row level security;

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
grant select on public.blog_admins to authenticated;

drop policy if exists "Published posts are visible to everyone" on public.blog_posts;
create policy "Published posts are visible to everyone"
  on public.blog_posts for select
  using (
    published
    or exists (
      select 1 from public.blog_admins
      where user_id = (select auth.uid())
    )
  );

drop policy if exists "Admins can create posts" on public.blog_posts;
create policy "Admins can create posts"
  on public.blog_posts for insert to authenticated
  with check (
    exists (
      select 1 from public.blog_admins
      where user_id = (select auth.uid())
    )
  );

drop policy if exists "Admins can update posts" on public.blog_posts;
create policy "Admins can update posts"
  on public.blog_posts for update to authenticated
  using (
    exists (
      select 1 from public.blog_admins
      where user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.blog_admins
      where user_id = (select auth.uid())
    )
  );

drop policy if exists "Admins can delete posts" on public.blog_posts;
create policy "Admins can delete posts"
  on public.blog_posts for delete to authenticated
  using (
    exists (
      select 1 from public.blog_admins
      where user_id = (select auth.uid())
    )
  );

drop policy if exists "Admins can verify their own access" on public.blog_admins;
create policy "Admins can verify their own access"
  on public.blog_admins for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.set_blog_post_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_blog_post_updated_at on public.blog_posts;
create trigger set_blog_post_updated_at
  before update on public.blog_posts
  for each row execute function public.set_blog_post_updated_at();

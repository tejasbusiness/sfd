-- ============================================================================
-- 0015_blog_posts.sql
-- Purpose: Blog/Insights content (docs/02, docs/06) — optional per spec, not
--          previously built ("no content/schema need identified yet",
--          docs/roadmap.md Phase 2). Building the schema + admin CRUD now as
--          part of Phase 4's Content Management module; public-facing
--          /blog pages are a separate, not-yet-built piece (marketing site,
--          Phase 2 scope) — this migration only unblocks admin authoring.
--          Follows the same pattern as 0002_content_tables.sql: public read
--          when published, admin write.
-- Depends on: 0001 (public.is_admin(), public.is_staff())
-- Rollback: drop table public.blog_posts;
-- ============================================================================

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text not null default '',
  cover_image_url text,
  seo_title text,
  seo_description text,
  author_id uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.blog_posts is 'Blog/Insights content (docs/02, optional/SEO-driven). body is plain text/markdown for now — no rich-text editor built yet. published_at is set explicitly (not just created_at) so a post can be authored ahead of its public appearance date.';

create index if not exists blog_posts_is_published_idx on public.blog_posts (is_published);
create index if not exists blog_posts_published_at_idx on public.blog_posts (published_at);

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;
create trigger set_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts_select_published" on public.blog_posts;
create policy "blog_posts_select_published"
  on public.blog_posts for select
  using (is_published = true or public.is_staff());

drop policy if exists "blog_posts_write_admin" on public.blog_posts;
create policy "blog_posts_write_admin"
  on public.blog_posts for all
  using (public.is_admin())
  with check (public.is_admin());

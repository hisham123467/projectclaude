create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'customer' check (role in ('customer','admin','staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  hero_image text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price_pkr integer not null check (price_pkr >= 0),
  sale_price_pkr integer check (sale_price_pkr is null or sale_price_pkr >= 0),
  sku text unique,
  category text,
  gender text check (gender is null or gender in ('men','women','unisex')),
  collection_id uuid references public.collections(id) on delete set null,
  material text,
  fit text,
  care text,
  shipping_info text,
  featured boolean not null default false,
  new_arrival boolean not null default false,
  best_seller boolean not null default false,
  on_sale boolean not null default false,
  hidden boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  type text not null default 'image' check (type in ('image','video','model_3d')),
  url text not null,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  color_name text not null,
  color_hex text,
  sku text unique,
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  unique(product_id,size,color_name)
);

create table if not exists public.size_guides (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  chest_cm numeric,
  length_cm numeric,
  shoulder_cm numeric,
  sleeve_cm numeric,
  unique(product_id,size)
);

create table if not exists public.wishlist_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  status text not null default 'pending' check (status in ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  payment_status text not null default 'pending',
  shipping_status text not null default 'pending',
  subtotal_pkr integer not null default 0 check (subtotal_pkr >= 0),
  discount_pkr integer not null default 0 check (discount_pkr >= 0),
  total_pkr integer not null default 0 check (total_pkr >= 0),
  shipping_address jsonb not null default '{}'::jsonb,
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  size text,
  color_name text,
  quantity integer not null check (quantity > 0),
  unit_price_pkr integer not null check (unit_price_pkr >= 0)
);

create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  kind text not null check (kind in ('percentage','fixed')),
  value numeric not null check (value >= 0),
  minimum_order_pkr integer default 0,
  expires_at timestamptz,
  usage_limit integer,
  used_count integer not null default 0,
  active boolean not null default true,
  rules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.homepage_sections (
  key text primary key,
  content jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.journal_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text not null default '',
  cover_image text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','staff')
  );
$$;

alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.product_variants enable row level security;
alter table public.size_guides enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.discounts enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.journal_articles enable row level security;

create policy "profiles own read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles own update" on public.profiles for update using (id = auth.uid() or public.is_admin());

create policy "collections public read" on public.collections for select using (published or public.is_admin());
create policy "products public read" on public.products for select using ((published and not hidden) or public.is_admin());
create policy "media public read" on public.product_media for select using (
  exists(select 1 from public.products p where p.id=product_id and p.published and not p.hidden) or public.is_admin()
);
create policy "variants public read" on public.product_variants for select using (
  exists(select 1 from public.products p where p.id=product_id and p.published and not p.hidden) or public.is_admin()
);
create policy "size guide public read" on public.size_guides for select using (
  exists(select 1 from public.products p where p.id=product_id and p.published and not p.hidden) or public.is_admin()
);

create policy "wishlist own all" on public.wishlist_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "orders own read" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "orders own insert" on public.orders for insert with check (user_id = auth.uid() or user_id is null);
create policy "order items own read" on public.order_items for select using (
  exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin()))
);

create policy "homepage public read" on public.homepage_sections for select using (enabled or public.is_admin());
create policy "journal public read" on public.journal_articles for select using (published or public.is_admin());

create policy "admin collections" on public.collections for all using (public.is_admin()) with check (public.is_admin());
create policy "admin products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admin media" on public.product_media for all using (public.is_admin()) with check (public.is_admin());
create policy "admin variants" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());
create policy "admin size guides" on public.size_guides for all using (public.is_admin()) with check (public.is_admin());
create policy "admin orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "admin order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admin discounts" on public.discounts for all using (public.is_admin()) with check (public.is_admin());
create policy "admin homepage" on public.homepage_sections for all using (public.is_admin()) with check (public.is_admin());
create policy "admin journal" on public.journal_articles for all using (public.is_admin()) with check (public.is_admin());
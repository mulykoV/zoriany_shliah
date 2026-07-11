-- ============================================
-- Схема бази для "Зоряного шляху"
-- Виконати цілком у Supabase → SQL Editor → New query
-- ============================================

-- 1. Пункти вішліста
create table wishlist_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  needed_amount numeric not null default 0,   -- 0 = не про гроші, просто "застовпити річ"
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 2. Внески/бронювання (групове бронювання = кілька рядків на один item_id)
create table wishlist_contributors (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references wishlist_items(id) on delete cascade,
  contributor_name text not null,
  amount numeric default 0,       -- скільки саме ця людина вносить (0 якщо просто "я в частці")
  message text,                   -- необов'язковий привітальний коментар
  created_at timestamptz default now()
);

-- 3. RSVP підтвердження приходу
create table rsvp (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  plus_one boolean default false,
  comment text,
  favorite_year text,             -- "яку зірку ти пам'ятаєш найкраще" — та сама фішка з ідеї
  created_at timestamptz default now()
);

-- ============================================
-- Row Level Security: гості можуть читати й додавати,
-- але не можуть редагувати чи видаляти чужі записи
-- ============================================

alter table wishlist_items enable row level security;
alter table wishlist_contributors enable row level security;
alter table rsvp enable row level security;

-- Читати може будь-хто (сайт публічний для друзів)
create policy "public read wishlist_items" on wishlist_items
  for select using (true);

create policy "public read wishlist_contributors" on wishlist_contributors
  for select using (true);

create policy "public read rsvp" on rsvp
  for select using (true);

-- Додавати записи може будь-хто (без окремого логіну для гостей)
create policy "public insert wishlist_contributors" on wishlist_contributors
  for insert with check (true);

create policy "public insert rsvp" on rsvp
  for insert with check (true);

-- wishlist_items редагуєш тільки ти вручну через Table Editor —
-- звідси insert-політики для гостей немає навмисно

-- ============================================
-- Приклад наповнення (заміни на свої реальні пункти)
-- ============================================
insert into wishlist_items (name, description, needed_amount, sort_order) values
  ('Платівка гурту, який ми всі любимо', null, 1500, 1),
  ('Вечеря у ресторані на двох', null, 2000, 2),
  ('Книга віршів Ліни Костенко (рідкісне видання)', null, 900, 3),
  ('Похід у планетарій великою компанією', null, 3000, 4);

-- Cloudflare D1 schema for VidimoSe Partner Console (faza 2)

CREATE TABLE IF NOT EXISTS playrooms (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  opening_hours_json TEXT NOT NULL,
  slot_duration_minutes INTEGER NOT NULL,
  cleanup_buffer_minutes INTEGER NOT NULL,
  max_parallel_events INTEGER NOT NULL,
  default_deposit_amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS birthday_packages (
  id TEXT PRIMARY KEY,
  playroom_id TEXT NOT NULL REFERENCES playrooms(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  base_price REAL NOT NULL,
  included_children INTEGER NOT NULL,
  extra_child_price REAL NOT NULL,
  includes_animator INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS booking_addons (
  id TEXT PRIMARY KEY,
  playroom_id TEXT NOT NULL REFERENCES playrooms(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS animators (
  id TEXT PRIMARY KEY,
  playroom_id TEXT NOT NULL REFERENCES playrooms(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  skills_json TEXT NOT NULL,
  available_days_json TEXT NOT NULL,
  max_events_per_day INTEGER NOT NULL,
  hourly_rate REAL NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  playroom_id TEXT NOT NULL REFERENCES playrooms(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  name TEXT NOT NULL,
  birth_date TEXT NOT NULL DEFAULT '',
  allergies TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS birthday_reservations (
  id TEXT PRIMARY KEY,
  playroom_id TEXT NOT NULL REFERENCES playrooms(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  package_id TEXT NOT NULL REFERENCES birthday_packages(id),
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL,
  children_count INTEGER NOT NULL,
  theme TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  internal_notes TEXT NOT NULL DEFAULT '',
  total_price REAL NOT NULL,
  deposit_amount REAL NOT NULL,
  deposit_paid INTEGER NOT NULL DEFAULT 0,
  checklist_json TEXT NOT NULL,
  animator_arrival_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reservation_addons (
  reservation_id TEXT NOT NULL REFERENCES birthday_reservations(id),
  addon_id TEXT NOT NULL REFERENCES booking_addons(id),
  PRIMARY KEY (reservation_id, addon_id)
);

CREATE TABLE IF NOT EXISTS reservation_animators (
  reservation_id TEXT NOT NULL REFERENCES birthday_reservations(id),
  animator_id TEXT NOT NULL REFERENCES animators(id),
  PRIMARY KEY (reservation_id, animator_id)
);

CREATE TABLE IF NOT EXISTS partner_users (
  id TEXT PRIMARY KEY,
  playroom_id TEXT NOT NULL REFERENCES playrooms(id),
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  animator_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_reservations_playroom_date ON birthday_reservations(playroom_id, date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON birthday_reservations(status);

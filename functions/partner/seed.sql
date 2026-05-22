-- Demo seed: igraonica Jogica (sinkronizirano s src/partner/data/mock/seed.ts)

INSERT OR REPLACE INTO playrooms (
  id, owner_id, name, slug, address, city, phone, email,
  opening_hours_json, slot_duration_minutes, cleanup_buffer_minutes,
  max_parallel_events, default_deposit_amount, currency, created_at, updated_at
) VALUES (
  'playroom_jogica',
  'user_owner_1',
  'Jogica',
  'jogica-zagreb',
  'Vojakovačka ulica 39, Gajevo',
  'Zagreb',
  '+385 91 514 1926',
  'info@jogica.com.hr',
  '{"mon":{"open":"09:00","close":"20:00"},"tue":{"open":"09:00","close":"20:00"},"wed":{"open":"09:00","close":"20:00"},"thu":{"open":"09:00","close":"20:00"},"fri":{"open":"09:00","close":"21:00"},"sat":{"open":"08:00","close":"21:00"},"sun":{"open":"09:00","close":"19:00"}}',
  120,
  30,
  2,
  50,
  'EUR',
  datetime('now'),
  datetime('now')
);

INSERT OR REPLACE INTO partner_users (id, playroom_id, role, name, email, animator_id) VALUES
  ('user_owner_1', 'playroom_jogica', 'owner', 'Ana Horvat', 'ana@jogica.com.hr', NULL),
  ('user_animator_1', 'playroom_jogica', 'animator', 'Marko Ivić', 'marko@jogica.com.hr', 'animator_marko');

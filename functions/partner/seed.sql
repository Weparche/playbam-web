-- Demo seed: PlayBam partner konzola (sinkronizirano s src/partner/data/mock/seed.ts)

DELETE FROM reservation_animators;
DELETE FROM reservation_addons;
DELETE FROM birthday_reservations;
DELETE FROM children;
DELETE FROM customers;
DELETE FROM animators;
DELETE FROM booking_addons;
DELETE FROM birthday_packages;
DELETE FROM partner_users;
DELETE FROM playrooms;

INSERT INTO playrooms (
  id, owner_id, name, slug, address, city, phone, email,
  opening_hours_json, slot_duration_minutes, cleanup_buffer_minutes,
  max_parallel_events, default_deposit_amount, currency, created_at, updated_at
) VALUES (
  'playroom_jogica',
  'user_owner_1',
  'PlayBam',
  'playbam-zagreb',
  'Vojakovačka ulica 39, Gajevo',
  'Zagreb',
  '+385 91 514 1926',
  'partner@playbam.hr',
  '{"mon":{"open":"09:00","close":"20:00"},"tue":{"open":"09:00","close":"20:00"},"wed":{"open":"09:00","close":"20:00"},"thu":{"open":"09:00","close":"20:00"},"fri":{"open":"09:00","close":"21:00"},"sat":{"open":"08:00","close":"21:00"},"sun":{"open":"09:00","close":"19:00"}}',
  120,
  30,
  2,
  50,
  'EUR',
  datetime('now'),
  datetime('now')
);

INSERT INTO partner_users (id, playroom_id, role, name, email, animator_id) VALUES
  ('user_owner_1', 'playroom_jogica', 'owner', 'Ana Horvat', 'ana@playbam.hr', NULL),
  ('user_animator_1', 'playroom_jogica', 'animator', 'Marko Ivić', 'marko@playbam.hr', 'animator_marko');

INSERT INTO birthday_packages (id, playroom_id, name, description, duration_minutes, base_price, included_children, extra_child_price, includes_animator, is_active, sort_order) VALUES
  ('pkg_mini', 'playroom_jogica', 'Basic Party', '2h igranje, 2 animatora, pizza, torta, snacks, sokovi, fotografije', 120, 250, 15, 12, 0, 1, 1),
  ('pkg_standard', 'playroom_jogica', 'Sport / Disco Party', '2h igranje, tematski program, DJ oprema / sportske igre, pizza, torta', 120, 270, 15, 10, 1, 1, 2),
  ('pkg_premium', 'playroom_jogica', 'Themed Party', '2h igranje, tematska dekoracija, animatori, pizza, torta, face painting', 120, 330, 15, 8, 1, 1, 3);

INSERT INTO booking_addons (id, playroom_id, name, description, price, is_active, category) VALUES
  ('addon_torta', 'playroom_jogica', 'Torta', 'Dekorirana rođendanska torta', 45, 1, 'Hrana'),
  ('addon_facepaint', 'playroom_jogica', 'Face painting', 'Profesionalno bojanje lica', 60, 1, 'Zabava'),
  ('addon_foto', 'playroom_jogica', 'Foto kutak', 'Rekviziti + 20 digitalnih fotografija', 55, 1, 'Foto'),
  ('addon_pinata', 'playroom_jogica', 'Pinjata', 'Tematska pinjata s bonbonima', 35, 1, 'Zabava'),
  ('addon_pizza', 'playroom_jogica', 'Pizza paket', '8 komada miješane pizze', 70, 1, 'Hrana'),
  ('addon_baloni', 'playroom_jogica', 'Balon dekor', 'Arka od balona u odabranoj boji', 40, 1, 'Dekoracija');

INSERT INTO animators (id, playroom_id, name, phone, email, skills_json, available_days_json, max_events_per_day, hourly_rate, is_active) VALUES
  ('animator_marko', 'playroom_jogica', 'Marko Ivić', '+385 98 111 2222', 'marko@playbam.hr', '["igre","pjesme","face paint"]', '["sat","sun"]', 2, 15, 1),
  ('animator_petra', 'playroom_jogica', 'Petra Novak', '+385 99 333 4444', 'petra@playbam.hr', '["ples","craft","storytelling"]', '["fri","sat","sun"]', 3, 14, 1),
  ('animator_luka', 'playroom_jogica', 'Luka Marić', '+385 91 555 6666', 'luka@playbam.hr', '["sport","igre","magic"]', '["wed","sat"]', 2, 13, 1),
  ('animator_sara', 'playroom_jogica', 'Sara Bilić', '+385 92 777 8888', 'sara@playbam.hr', '["glazba","ples","igre"]', '["thu","fri","sat","sun"]', 2, 15, 1);

INSERT INTO customers (id, playroom_id, full_name, phone, email, notes) VALUES
  ('cust_1', 'playroom_jogica', 'Ivana Kovač', '+385 91 100 2001', 'ivana.kovac@gmail.com', 'Preferira jutarnje termine'),
  ('cust_2', 'playroom_jogica', 'Maja Perić', '+385 98 200 3002', 'maja.peric@gmail.com', ''),
  ('cust_3', 'playroom_jogica', 'Tomislav Jurić', '+385 99 300 4003', 'tjuric@gmail.com', 'Često kasni 10 min'),
  ('cust_4', 'playroom_jogica', 'Kristina Božić', '+385 95 400 5004', 'kristina.bozic@gmail.com', ''),
  ('cust_5', 'playroom_jogica', 'Davor Šimić', '+385 91 500 6005', 'davor.simic@gmail.com', '');

INSERT INTO children (id, customer_id, name, birth_date, allergies, notes) VALUES
  ('child_1', 'cust_1', 'Luka', '2018-03-14', '', ''),
  ('child_2', 'cust_2', 'Nika', '2017-07-22', 'laktoza', 'Bez mliječnih proizvoda'),
  ('child_3', 'cust_3', 'Filip', '2019-11-05', '', ''),
  ('child_4a', 'cust_4', 'Ema', '2016-01-18', '', ''),
  ('child_4b', 'cust_4', 'Noa', '2018-09-30', 'orašasti plodovi', 'Strogo bez kikirikija'),
  ('child_5', 'cust_5', 'Roko', '2020-04-12', '', '');

INSERT INTO birthday_reservations (
  id, playroom_id, customer_id, package_id, date, start_time, end_time, status,
  child_name, child_age, children_count, theme, notes, internal_notes,
  total_price, deposit_amount, deposit_paid, checklist_json, animator_arrival_status,
  created_at, updated_at
) VALUES
  ('res_today_1', 'playroom_jogica', 'cust_1', 'pkg_standard', date('now'), '14:00', '16:00', 'animator_assigned',
   'Luka', 8, 12, 'Superheroji', 'Donijeti tortu iz pekare', 'Provjeriti parking za goste',
   270, 50, 1, '{"spaceReady":false,"decorationReady":false,"foodConfirmed":false,"childrenCountConfirmed":false,"allergiesChecked":false,"animatorConfirmed":true,"paymentChecked":true}', 'pending',
   datetime('now'), datetime('now')),
  ('res_today_2', 'playroom_jogica', 'cust_2', 'pkg_mini', date('now'), '17:00', '19:00', 'waiting_deposit',
   'Nika', 9, 10, 'Unicorni', 'Alergija na laktozu', '',
   250, 50, 0, '{"spaceReady":false,"decorationReady":false,"foodConfirmed":false,"childrenCountConfirmed":false,"allergiesChecked":false,"animatorConfirmed":false,"paymentChecked":false}', 'pending',
   datetime('now'), datetime('now')),
  ('res_tomorrow_1', 'playroom_jogica', 'cust_3', 'pkg_premium', date('now', '+1 day'), '11:00', '14:00', 'confirmed',
   'Filip', 6, 14, 'Dinosauri', '', 'Premium paket — rezervirati animatora',
   455, 50, 1, '{"spaceReady":false,"decorationReady":false,"foodConfirmed":false,"childrenCountConfirmed":false,"allergiesChecked":false,"animatorConfirmed":false,"paymentChecked":true}', 'pending',
   datetime('now'), datetime('now')),
  ('res_pending_1', 'playroom_jogica', 'cust_4', 'pkg_standard', date('now', '+7 days'), '15:00', '17:00', 'pending_confirmation',
   'Ema', 10, 13, 'Frozen', 'Traže dodatni stol za odrasle', '',
   270, 50, 0, '{"spaceReady":false,"decorationReady":false,"foodConfirmed":false,"childrenCountConfirmed":false,"allergiesChecked":false,"animatorConfirmed":false,"paymentChecked":false}', 'pending',
   datetime('now'), datetime('now')),
  ('res_week_1', 'playroom_jogica', 'cust_5', 'pkg_mini', date('now', '+3 days'), '16:00', '18:00', 'deposit_paid',
   'Roko', 5, 8, 'Autići', '', '',
   250, 50, 1, '{"spaceReady":false,"decorationReady":false,"foodConfirmed":false,"childrenCountConfirmed":false,"allergiesChecked":false,"animatorConfirmed":false,"paymentChecked":true}', 'pending',
   datetime('now'), datetime('now'));

INSERT INTO reservation_addons (reservation_id, addon_id) VALUES
  ('res_today_1', 'addon_baloni'),
  ('res_today_2', 'addon_torta'),
  ('res_tomorrow_1', 'addon_foto'),
  ('res_tomorrow_1', 'addon_pizza'),
  ('res_week_1', 'addon_pinata');

INSERT INTO reservation_animators (reservation_id, animator_id) VALUES
  ('res_today_1', 'animator_marko'),
  ('res_week_1', 'animator_petra');

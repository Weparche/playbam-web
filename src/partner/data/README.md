# Partner Console — data layer

Frontend koristi `PartnerRepository` interface. MVP implementacija: `mockPartnerRepository` (localStorage).

## Faza 2: Cloudflare D1 + Pages Functions

Partner podaci **ne idu na VPS** `playbam.sqlite`. API rute:

- `GET/PATCH /api/partner/playroom`
- `GET/POST/PATCH/DELETE /api/partner/reservations`
- `GET/POST/PATCH/DELETE /api/partner/packages`
- `GET/POST/PATCH/DELETE /api/partner/addons`
- `GET/POST/PATCH/DELETE /api/partner/animators`
- `GET/POST/PATCH/DELETE /api/partner/customers`
- `GET /api/partner/availability?date=YYYY-MM-DD`

Zamjena na frontendu: `apiPartnerRepository.ts` + `VITE_PARTNER_DATA_SOURCE=api`.

Schema: vidi `playbam-web/functions/partner/schema.sql`.

### D1 setup (Cloudflare)

1. Binding u `wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "PARTNER_DB"
   database_name = "vidimose-partner"
   database_id = "6e8da476-2662-4975-8679-feae3018b806"
   ```
2. Migracija + seed:
   ```bash
   npx wrangler d1 execute vidimose-partner --remote --file=functions/partner/schema.sql
   npx wrangler d1 execute vidimose-partner --remote --file=functions/partner/seed.sql
   ```
3. Push + redeploy Pages da se binding aktivira.

**Napomena:** Partner Console UI (`/partner/*`) koristi mock u pregledniku. API je na `/api/partner/*` — ne dira SPA rute.

Implementirane rute: `GET /api/partner`, `playroom`, `packages`, `addons`, `animators`, `customers`, `reservations`, `availability`, `bootstrap`; `PATCH playroom`, `PATCH reservations/:id`.

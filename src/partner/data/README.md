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

Typescript tipovi u `src/partner/types/index.ts` su API contract.

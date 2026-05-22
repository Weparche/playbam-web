import type { PartnerRepository } from './partnerRepository'

/** Faza 2: zamjena mock repozitorija s Cloudflare D1 API pozivima. */
export function createApiPartnerRepository(): PartnerRepository {
  throw new Error('apiPartnerRepository nije implementiran — koristi mock u MVP-u.')
}

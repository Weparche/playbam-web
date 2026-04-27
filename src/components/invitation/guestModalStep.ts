import type { MembershipRequest } from '../../lib/invitationApi'

export type GuestModalStep = 'login' | 'profile' | 'request' | 'waiting'

export function getGuestModalStep(
  invitation: { id: string } | null,
  isHost: boolean,
  hasPrivateAccess: boolean,
  user: { email: string } | null,
  hasFamilyProfile: boolean,
  membershipRequest: MembershipRequest | null,
): GuestModalStep | null {
  if (!invitation || isHost || hasPrivateAccess) {
    return null
  }
  if (!user) {
    return 'login'
  }
  if (!hasFamilyProfile) {
    return 'profile'
  }
  if (membershipRequest?.status === 'pending') {
    return 'waiting'
  }
  return 'request'
}

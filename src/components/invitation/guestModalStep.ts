export type GuestModalStep = 'login' | 'profile'

export function getGuestModalStep(
  invitation: { id: string } | null,
  isHost: boolean,
  hasPrivateAccess: boolean,
  user: { email: string } | null,
  hasFamilyProfile: boolean,
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
  return null
}

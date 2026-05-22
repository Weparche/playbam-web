import { Navigate } from 'react-router-dom'

import { usePartnerAuth } from '../../context/PartnerAuthContext'

export default function PartnerOwnerGate({ children }: { children: React.ReactNode }) {
  const { isAnimator } = usePartnerAuth()
  if (isAnimator) {
    return <Navigate to="/partner" replace />
  }
  return children
}

import { Suspense } from 'react'
import PortalClient from './portal-client'

export default function CustomerPortalPage({ params }: { params: { token: string } }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PortalClient token={params.token} />
    </Suspense>
  )
}

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { EnhancedConversationalInterface } from '../../../components/workspace/EnhancedConversationalInterface'

export default function Workspace() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading SAM AI...</div>
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <EnhancedConversationalInterface />
    </div>
  )
}
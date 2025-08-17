'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (session) {
    return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to SAM AI</h1>
          <p className="text-slate-300">
            Agentic Sales AI Platform for LinkedIn automation and lead generation
          </p>
        </div>
        <div className="space-y-4">
          <button 
            onClick={() => signIn('google')}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Sign in with Google
          </button>
          <button 
            onClick={() => signIn('linkedin')}
            className="w-full px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-md transition-colors"
          >
            Sign in with LinkedIn
          </button>
          <div className="mt-6 pt-4 border-t border-slate-600">
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              🚀 Demo Access (Skip Authentication)
            </button>
            <div className="text-center text-slate-400 text-sm mt-2">
              For testing purposes - configure OAuth above for production
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Temporarily disable auth requirement for demo
  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/')
  //   }
  // }, [status, router])

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Allow demo access without session
  // if (!session) {
  //   return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>
  // }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">SAM AI Dashboard</h1>
          <button 
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Sign Out
          </button>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl mb-4">Hello! I'm SAM, your AI sales agent.</h2>
          <p className="text-slate-300 mb-4">
            Let's have a conversation about your sales goals and I'll help you achieve them.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 bg-purple-900/20 border border-purple-700 rounded">
              <h3 className="text-purple-400 font-semibold">🤖 SAM AI Capabilities:</h3>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>Natural conversation interface for sales tasks</li>
                <li>Connected to your email, LinkedIn via Unipile</li>
                <li>Automated workflows via N8N integration</li>
                <li>Multi-tenant workspace management</li>
                <li>AI-powered sales intelligence</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-900/20 border border-blue-700 rounded">
              <h3 className="text-blue-400 font-semibold">💬 Ready to Start:</h3>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>Click below to start chatting with SAM</li>
                <li>Ask about prospects, campaigns, or strategy</li>
                <li>Get help with sales automation</li>
                <li>Manage your sales pipeline</li>
              </ul>
              <button 
                onClick={() => router.push('/workspace')}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                Start Conversation with SAM →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
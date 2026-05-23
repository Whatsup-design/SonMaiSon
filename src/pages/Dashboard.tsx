import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Navigate } from 'react-router-dom'

export const Dashboard: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <Button variant="outline" onClick={logout}>Log out</Button>
        </header>

        <main className="grid gap-6 md:grid-cols-2">
          <div className="p-8 bg-white rounded-2xl shadow-[0_4px_6px_-4px_rgba(0,0,0,0.02)] border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Welcome!</h2>
            <p className="text-slate-500 mb-6">
              You are successfully authenticated. Your user details are below:
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>

          <div className="p-8 bg-white rounded-2xl shadow-[0_4px_6px_-4px_rgba(0,0,0,0.02)] border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Getting Started</h2>
            <p className="text-slate-500">
              This is a protected route. Only authenticated users with a valid token can see this page.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (data.session && data.session.user) {
          // Normalize the Supabase session/user to our AuthContext format
          const normalizedSession = {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            tokenType: data.session.token_type,
            expiresIn: data.session.expires_in,
            expiresAt: data.session.expires_at || 0,
          }
          
          const normalizedUser = {
            id: data.session.user.id,
            email: data.session.user.email || '',
          }

          setSession(normalizedSession, normalizedUser)
          navigate('/dashboard', { replace: true })
        } else {
          // If no session is found, they might be accessing this route directly
          navigate('/login', { replace: true })
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to authenticate'
        setError(errorMsg)
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [navigate, setSession])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 max-w-md text-center">
          <p className="font-medium mb-2">Authentication Error</p>
          <p className="text-sm">{error}</p>
          <p className="text-sm mt-4">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <svg className="animate-spin h-8 w-8 text-slate-900 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-slate-600 font-medium">Completing authentication...</p>
    </div>
  )
}

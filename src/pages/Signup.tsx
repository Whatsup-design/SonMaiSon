import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { SignupForm } from '../components/auth/SignupForm'
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton'
import { useAuth } from '../hooks/useAuth'

export const Signup: React.FC = () => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-[400px] bg-white p-8 rounded-[24px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Create an account</h1>
        <p className="text-slate-500 mb-8 text-center">Enter your details to get started.</p>
        
        <SignupForm />
        
        <div className="relative w-full my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative bg-white px-4 text-sm text-slate-400">
            Or
          </div>
        </div>
        
        <GoogleLoginButton />
        
        <p className="mt-8 text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-slate-900 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

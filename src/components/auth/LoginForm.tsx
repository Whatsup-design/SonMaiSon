import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { ApiError } from '../../lib/api'

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        const collected: string[] = []

        // Collect field-level validation errors
        if (Array.isArray(err.response.error?.details)) {
          err.response.error.details.forEach(detail => {
            collected.push(detail.message)
          })
        }

        // Map specific error codes to user-friendly messages
        if (err.response.error?.code === 'AUTH_INVALID_CREDENTIALS') {
          collected.push('Invalid email or password.')
        } else if (err.response.error?.code === 'RATE_LIMIT_EXCEEDED') {
          collected.push('Too many attempts. Please try again later.')
        }

        // Fallback to the generic server message
        if (collected.length === 0) {
          collected.push(err.message || 'An error occurred during login.')
        }

        setErrors(collected)
      } else {
        setErrors(['An unexpected error occurred. Please try again.'])
      }
    }
  }

  const hasErrors = errors.length > 0

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        hasError={hasErrors}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hasError={hasErrors}
        required
      />

      <Button type="submit" isLoading={isLoading} className="mt-2">
        Sign in
      </Button>

      {hasErrors && (
        <div className="flex flex-col gap-1 p-3 rounded-xl bg-red-50 border border-red-100 animate-[fadeIn_0.2s_ease-out]">
          {errors.map((msg, i) => (
            <p key={i} className="text-sm font-medium text-red-500">
              {msg}
            </p>
          ))}
        </div>
      )}
    </form>
  )
}

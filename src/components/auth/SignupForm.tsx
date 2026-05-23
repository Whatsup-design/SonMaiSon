import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { ApiError } from '../../lib/api'

const USERNAME_REGEX = /^[A-Za-z0-9_]+$/

export const SignupForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { signup, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setSuccessMessage(null)

    // Client-side username validation
    if (!USERNAME_REGEX.test(username)) {
      setErrors(['Username can only contain letters (A-Z, a-z), numbers (0-9), and underscores (_).'])
      return
    }

    try {
      const response = await signup({ email, password, username })
      if (response.session) {
        navigate('/dashboard')
      } else {
        setSuccessMessage('Signup successful! Please check your email to verify your account.')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const collected: string[] = []

        // Collect field-level validation errors
        if (Array.isArray(err.response.error?.details)) {
          err.response.error.details.forEach(detail => {
            collected.push(detail.message)
          })
        }

        // Handle specific error codes
        if (err.response.error?.code === 'AUTH_SIGNUP_FAILED' || err.message.toLowerCase().includes('already exist')) {
          collected.push('An account with this email already exists. Please sign in instead.')
        } else if (err.response.error?.code === 'RATE_LIMIT_EXCEEDED') {
          collected.push('Too many attempts. Please try again later.')
        }

        // Fallback to the generic server message
        if (collected.length === 0) {
          collected.push(err.message || 'An error occurred during signup.')
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
      {successMessage && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-100 animate-[fadeIn_0.2s_ease-out]">
          <p className="text-sm font-medium text-green-600">{successMessage}</p>
        </div>
      )}

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
        label="Username"
        type="text"
        placeholder="johndoe"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
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
        Create account
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

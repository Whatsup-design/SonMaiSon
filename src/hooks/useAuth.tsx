import React, { createContext, useContext, useState } from 'react'
import { fetchApi } from '../lib/api'

export interface User {
  id: string
  email: string
}

export interface Session {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  expiresAt: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: Record<string, string>) => Promise<void>
  signup: (data: Record<string, string>) => Promise<{ session: Session | null }>
  logout: () => Promise<void>
  continueWithGoogle: () => Promise<void>
  setSession: (session: Session, user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token') || null
  })
  const [isLoading, setIsLoading] = useState(false)

  const setSession = (session: Session, newUser: User) => {
    setToken(session.accessToken)
    setUser(newUser)
    localStorage.setItem('auth_token', session.accessToken)
    localStorage.setItem('auth_user', JSON.stringify(newUser))
  }

  const clearSession = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  const login = async (credentials: Record<string, string>) => {
    setIsLoading(true)
    try {
      const response = await fetchApi<{ data: { user: User; session: Session } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
      setSession(response.data.session, response.data.user)
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (data: Record<string, string>) => {
    setIsLoading(true)
    try {
      const response = await fetchApi<{ data: { user: User; session: Session | null } }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (response.data.session) {
        setSession(response.data.session, response.data.user)
      }
      return { session: response.data.session }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      if (token) {
        await fetchApi('/auth/logout', {
          method: 'POST',
          token,
        })
      }
    } finally {
      clearSession()
      setIsLoading(false)
    }
  }

  const continueWithGoogle = async () => {
    setIsLoading(true)
    try {
      const response = await fetchApi<{ data: { url: string } }>('/auth/oauth/google', {
        method: 'GET',
      })
      if (response.data?.url) {
        window.location.href = response.data.url
      }
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    signup,
    logout,
    continueWithGoogle,
    setSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

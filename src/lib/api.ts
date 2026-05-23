export interface ApiErrorDetail {
  field: string
  message: string
}

export interface ApiErrorResponse {
  success: false
  message: string
  error?: {
    code: string
    details?: ApiErrorDetail[]
  }
}

export class ApiError extends Error {
  public response: ApiErrorResponse

  constructor(response: ApiErrorResponse) {
    super(response.message)
    this.name = 'ApiError'
    this.response = response
  }
}

interface FetchOptions extends RequestInit {
  token?: string | null
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers, ...restOptions } = options

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...restOptions,
  })

  let data
  try {
    data = await response.json()
  } catch {
    // If not JSON, but not ok, throw a generic error
    if (!response.ok) {
      throw new ApiError({
        success: false,
        message: 'An unexpected error occurred.',
        error: {
          code: 'INTERNAL_SERVER_ERROR'
        }
      })
    }
    return null as unknown as T
  }

  if (!response.ok || data.success === false) {
    throw new ApiError(data as ApiErrorResponse)
  }

  return data as T
}

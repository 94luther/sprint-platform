import type {
  AuthResult,
  CatalogResponse,
  CreateOrderPayload,
  Order,
  OpsState
} from './types'

const API_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
  code?: string
  status: number
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = options
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  })

  if (!res.ok) {
    let body: { code?: string; message?: string } = {}
    try {
      body = await res.json()
    } catch {
      // no body, that is fine
    }
    throw new ApiError(
      body.message || `Something went wrong talking to Sprint (${res.status}).`,
      res.status,
      body.code
    )
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export function login(phone: string, pin: string): Promise<AuthResult> {
  return request<AuthResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, pin })
  })
}

export function getCatalog(): Promise<CatalogResponse> {
  return request<CatalogResponse>('/catalog')
}

export function createOrder(
  token: string,
  idempotencyKey: string,
  payload: CreateOrderPayload
): Promise<Order> {
  return request<Order>('/orders', {
    method: 'POST',
    token,
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payload)
  })
}

export function getOrder(token: string, orderId: string): Promise<Order> {
  return request<Order>(`/orders/${orderId}`, { token })
}

export function getOpsState(token: string): Promise<OpsState> {
  return request<OpsState>('/ops/state', { token })
}

export function newIdempotencyKey(): string {
  if ('randomUUID' in crypto) return crypto.randomUUID()
  return `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

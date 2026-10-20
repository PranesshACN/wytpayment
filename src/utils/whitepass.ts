import { api } from '../api/base'

export const WYTPASS_CLIENT_ID =
  import.meta.env.VITE_WYTPASS_CLIENT_ID ||
  import.meta.env.VITE_WHITEPASS_CLIENT_ID ||
  'wn_live_860820ebf3f7a303c101540e2ac80345'

export const WYTPASS_REDIRECT_URI =
  import.meta.env.VITE_WYTPASS_REDIRECT_URI ||
  import.meta.env.VITE_WHITEPASS_REDIRECT_URI ||
  'http://localhost:5173/api/auth/callback/whitenet'

export const WYTPASS_AUTH_URL =
  import.meta.env.VITE_WYTPASS_AUTH_URL ||
  import.meta.env.VITE_WHITEPASS_AUTH_URL ||
  'https://wytnet.com/oauth/authorize'

// Backward-compatibility aliases
export const WHITEPASS_CLIENT_ID = WYTPASS_CLIENT_ID
export const WHITEPASS_REDIRECT_URI = WYTPASS_REDIRECT_URI
export const WHITEPASS_AUTH_URL = WYTPASS_AUTH_URL

/**
 * Base64URL encoding helper compliant with RFC 7636
 */
function base64UrlEncode(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Generates a high-entropy cryptographic random string for PKCE and State
 */
function generateRandomString(length: number = 64): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length]
  }
  return result
}

/**
 * Initiates WytPass Centralized Identity Authorization Code Flow with PKCE (S256)
 */
export async function signInWithWhitePass(customRedirectUri?: string): Promise<void> {
  const verifier = generateRandomString(64)
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const challenge = base64UrlEncode(hash)

  const state = generateRandomString(32)

  // Persist PKCE verifier and state securely across redirect
  sessionStorage.setItem('pkce_verifier', verifier)
  sessionStorage.setItem('oauth_state', state)
  localStorage.setItem('pkce_verifier', verifier)
  localStorage.setItem('oauth_state', state)

  const redirectUri = customRedirectUri || WYTPASS_REDIRECT_URI

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: WYTPASS_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'openid profile email',
    state: state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  window.location.href = `${WYTPASS_AUTH_URL}?${params.toString()}`
}

/**
 * Safely parse JWT payload string
 */
export function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export interface WytPassTokenResponse {
  access_token: string
  token_type?: string
  expires_in?: number
  id_token?: string
  refresh_token?: string
  user?: any
  [key: string]: any
}

/**
 * Handles the OAuth Callback, exchanging authorization code for session tokens
 * via the backend proxy (keeps client_secret strictly on backend, eliminates CORS).
 */
export async function handleWhitePassCallback(
  code: string,
  state?: string | null,
  redirectUriOverride?: string
): Promise<WytPassTokenResponse> {
  const storedState = sessionStorage.getItem('oauth_state') || localStorage.getItem('oauth_state')
  if (state && storedState && state !== storedState) {
    throw new Error('OAuth state verification failed. Possible CSRF attempt.')
  }

  const verifier = sessionStorage.getItem('pkce_verifier') || localStorage.getItem('pkce_verifier') || ''
  const redirectUri = redirectUriOverride || WYTPASS_REDIRECT_URI

  let tokens: WytPassTokenResponse

  try {
    const resp = await api.post('/api/auth/sso-exchange', {
      code: code,
      code_verifier: verifier,
      redirect_uri: redirectUri,
    })
    tokens = resp.data
  } catch (err: any) {
    const detail = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Token exchange failed'
    throw new Error(`WytPass OAuth token exchange failed: ${detail}`)
  } finally {
    // Cleanup transient OAuth credentials
    sessionStorage.removeItem('pkce_verifier')
    sessionStorage.removeItem('oauth_state')
    localStorage.removeItem('pkce_verifier')
    localStorage.removeItem('oauth_state')
  }

  // Store tokens and user in local session
  if (tokens.access_token) {
    localStorage.setItem('saas_token', tokens.access_token)
  }
  if (tokens.user) {
    localStorage.setItem('saas_user', JSON.stringify(tokens.user))
  } else {
    // Infer identity from id_token or access_token claims
    const claims = parseJwt(tokens.id_token || tokens.access_token) || {}
    const user = {
      id: claims.sub || 'wn_usr_unknown',
      sub: claims.sub,
      email: claims.email || '',
      name: claims.name || claims.preferred_username || 'User',
      subscription_status: 'none',
      created_at: new Date().toISOString(),
    }
    localStorage.setItem('saas_user', JSON.stringify(user))
  }

  return tokens
}

/**
 * Logs out of current session and revokes tokens
 */
export async function logoutUser(): Promise<void> {
  try {
    await api.post('/api/auth/logout')
  } catch (err) {
    console.warn('Logout API error:', err)
  } finally {
    localStorage.removeItem('saas_token')
    localStorage.removeItem('saas_user')
    window.location.href = '/login'
  }
}

import { api } from '../api/base'

export const WHITEPASS_CLIENT_ID =
  import.meta.env.VITE_WHITEPASS_CLIENT_ID || 'wp_8395a0c9f08544833de2'
export const WHITEPASS_CLIENT_SECRET =
  import.meta.env.VITE_WHITEPASS_CLIENT_SECRET || 'wps_c4bb2a36d2c1bfce9a62abd2a7dfd1bae1c5f0a7'
export const WHITEPASS_REDIRECT_URI =
  import.meta.env.VITE_WHITEPASS_REDIRECT_URI || 'https://wytpayment.vercel.app/callback'
export const WHITEPASS_AUTH_URL =
  import.meta.env.VITE_WHITEPASS_AUTH_URL || 'https://test.wytnet.com/oauth/authorize'
export const WHITEPASS_TOKEN_URL =
  import.meta.env.VITE_WHITEPASS_TOKEN_URL || 'https://test.api.wytnet.com/oauth/token'

/**
 * Initiates WhitePass SSO Authorization Code Flow with PKCE
 */
export async function signInWithWhitePass(): Promise<void> {
  const verifier = crypto.randomUUID() + crypto.randomUUID()
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const challenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  localStorage.setItem('pkce_verifier', verifier)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: WHITEPASS_CLIENT_ID,
    redirect_uri: WHITEPASS_REDIRECT_URI,
    scope: 'openid profile email',
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  window.location.href = `${WHITEPASS_AUTH_URL}?${params.toString()}`
}

/**
 * Helper to safely decode a JWT payload string
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
  } catch (e) {
    return null
  }
}

export interface WhitePassTokenResponse {
  access_token: string
  token_type?: string
  expires_in?: number
  id_token?: string
  refresh_token?: string
  scope?: string
  [key: string]: any
}

/**
 * Handles the OAuth Callback, exchanging authorization code for access tokens
 */
export async function handleWhitePassCallback(code: string): Promise<WhitePassTokenResponse> {
  const verifier = localStorage.getItem('pkce_verifier') || ''

  // Attempt POST to WhitePass token endpoint
  let response = await fetch(WHITEPASS_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: WHITEPASS_CLIENT_ID,
      client_secret: WHITEPASS_CLIENT_SECRET,
      code_verifier: verifier,
      redirect_uri: WHITEPASS_REDIRECT_URI,
    }),
  })

  // Fallback check if token URL path needs trailing/double slashes as specified in guide
  if (!response.ok && WHITEPASS_TOKEN_URL.endsWith('/oauth/token')) {
    const doubleSlashUrl = WHITEPASS_TOKEN_URL.replace('/oauth/token', '//oauth/token')
    const retryResp = await fetch(doubleSlashUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: WHITEPASS_CLIENT_ID,
        client_secret: WHITEPASS_CLIENT_SECRET,
        code_verifier: verifier,
        redirect_uri: WHITEPASS_REDIRECT_URI,
      }),
    })
    if (retryResp.ok) {
      response = retryResp
    }
  }

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to exchange authorization code: ${response.status} ${errorText}`)
  }

  const tokens: WhitePassTokenResponse = await response.json()
  localStorage.setItem('access_token', tokens.access_token)
  if (tokens.id_token) {
    localStorage.setItem('id_token', tokens.id_token)
  }

  // Extract user identity from ID token or access token payload
  const tokenPayload = parseJwt(tokens.id_token || tokens.access_token) || {}
  const email = tokenPayload.email || tokenPayload.sub || `user_${Date.now()}@whitepass.sso`
  const name = tokenPayload.name || tokenPayload.preferred_username || email.split('@')[0]
  const ssoId = tokenPayload.sub || tokens.access_token.substring(0, 16)

  // Synchronize user session with backend
  try {
    const backendResp = await api.post('/api/auth/sso-login', {
      email,
      name,
      sso_id: ssoId,
      access_token: tokens.access_token,
    })

    if (backendResp.data && backendResp.data.access_token) {
      localStorage.setItem('saas_token', backendResp.data.access_token)
      localStorage.setItem('saas_user', JSON.stringify(backendResp.data.user))
    }
  } catch (err) {
    console.warn('Backend SSO sync fallback to local session:', err)
    // Fallback if backend service is unreachable
    const fallbackUser = {
      id: ssoId,
      email,
      name,
      subscription_status: 'none',
      created_at: new Date().toISOString(),
    }
    localStorage.setItem('saas_token', tokens.access_token)
    localStorage.setItem('saas_user', JSON.stringify(fallbackUser))
  }

  return tokens
}

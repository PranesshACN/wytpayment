import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { handleWhitePassCallback } from '../utils/whitepass'
import { ShieldCheck, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'

export const Callback: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const oauthError = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (oauthError) {
        setErrorMsg(errorDescription || `OAuth Error: ${oauthError}`)
        setLoading(false)
        return
      }

      if (!code) {
        setErrorMsg('Authorization code not found in callback URL.')
        setLoading(false)
        return
      }

      try {
        await handleWhitePassCallback(code, state)
        navigate('/', { replace: true })
      } catch (err: any) {
        console.error('WytPass SSO Callback Error:', err)
        setErrorMsg(err.message || 'Failed to complete WytPass SSO login.')
        setLoading(false)
      }
    }

    processCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 selection:bg-indigo-500 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-8 flex flex-col items-center gap-6 text-center relative z-10">
        {loading ? (
          <>
            <div className="h-16 w-16 bg-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-2xl animate-pulse shadow-lg shadow-indigo-500/20">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Authenticating with WytPass</h2>
              <p className="text-sm text-slate-400">
                Exchanging PKCE authorization code for secure access tokens...
              </p>
            </div>
          </>
        ) : errorMsg ? (
          <>
            <div className="h-16 w-16 bg-rose-500/20 text-rose-400 flex items-center justify-center rounded-2xl shadow-lg shadow-rose-500/20">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
              <p className="text-sm text-rose-400 font-medium mb-4">{errorMsg}</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Login
            </button>
          </>
        ) : (
          <>
            <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-2xl shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Authentication Successful</h2>
              <p className="text-sm text-slate-400">Redirecting to your dashboard...</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

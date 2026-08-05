import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { handleWhitePassCallback } from '../utils/whitepass'
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react'

export const Callback: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code')
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
        await handleWhitePassCallback(code)
        navigate('/', { replace: true })
      } catch (err: any) {
        console.error('WhitePass SSO Callback Error:', err)
        setErrorMsg(err.message || 'Failed to complete WhitePass SSO login.')
        setLoading(false)
      }
    }

    processCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 flex flex-col items-center gap-6 text-center">
        {loading ? (
          <>
            <div className="h-16 w-16 bg-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-2xl animate-pulse">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Authenticating with WytePass</h2>
              <p className="text-sm text-slate-400">
                Exchanging authorization code for secure access tokens...
              </p>
            </div>
          </>
        ) : errorMsg ? (
          <>
            <div className="h-16 w-16 bg-rose-500/20 text-rose-400 flex items-center justify-center rounded-2xl">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
              <p className="text-sm text-rose-400 font-medium mb-4">{errorMsg}</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Return to Login
            </button>
          </>
        ) : (
          <>
            <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-2xl">
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

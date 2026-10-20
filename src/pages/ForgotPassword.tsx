import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { api } from '../api/base'
import { Mail, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react'

export const ForgotPassword: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const onSubmit = async (data: any) => {
    setLoading(true)
    setErrorMsg('')
    try {
      await api.post('/api/auth/forgot-password', {
        email: data.email
      })
      setSubmittedEmail(data.email)
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.message || 'Failed to request password reset'
      setErrorMsg(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 selection:bg-indigo-500 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-8 flex flex-col gap-6 relative z-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-14 w-14 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-indigo-500/25">
            <KeyRound className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight mt-2">Reset Password</h2>
          <p className="text-sm text-slate-400">
            Enter your email to receive recovery instructions from WytNet
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {submittedEmail ? (
          <div className="flex flex-col gap-5 text-center">
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col items-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white mb-1">Check Your Inbox</h3>
                <p className="text-xs text-slate-300">
                  We've requested a password reset token for <strong className="text-white">{submittedEmail}</strong>. Follow the instructions sent to your email.
                </p>
              </div>
            </div>

            <Link
              to="/reset-password"
              className="py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all"
            >
              Have a reset token? Enter it here
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                  {...register('email', { required: 'Email address is required' })}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-rose-400 font-semibold">{errors.email.message as string}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-200 flex justify-center items-center gap-2 mt-2 active:scale-[0.99]"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send Reset Instructions'
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

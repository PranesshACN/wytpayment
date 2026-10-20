import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/base'
import { KeyRound, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react'

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
  const initialToken = searchParams.get('token') || ''
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      token: initialToken,
      new_password: '',
      confirm_password: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const newPassword = watch('new_password')

  const onSubmit = async (data: any) => {
    setLoading(true)
    setErrorMsg('')
    try {
      await api.post('/api/auth/reset-password', {
        token: data.token,
        new_password: data.new_password,
        confirm_password: data.confirm_password
      })
      setSuccess(true)
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.message || 'Password reset failed. Invalid or expired token.'
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
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight mt-2">Set New Password</h2>
          <p className="text-sm text-slate-400">Enter your WytNet reset token and new password</p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {success ? (
          <div className="flex flex-col gap-5 text-center">
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col items-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white mb-1">Password Changed</h3>
                <p className="text-xs text-slate-300">
                  Your password has been securely updated with WytNet Identity. You can now log in with your new credentials.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reset Token</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Paste reset token here"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm font-mono"
                  {...register('token', { required: 'Reset token is required' })}
                />
              </div>
              {errors.token && (
                <span className="text-xs text-rose-400 font-semibold">{errors.token.message as string}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                  {...register('new_password', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />
              </div>
              {errors.new_password && (
                <span className="text-xs text-rose-400 font-semibold">{errors.new_password.message as string}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                  {...register('confirm_password', {
                    required: 'Confirm password is required',
                    validate: (value) => value === newPassword || 'Passwords do not match'
                  })}
                />
              </div>
              {errors.confirm_password && (
                <span className="text-xs text-rose-400 font-semibold">{errors.confirm_password.message as string}</span>
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
                'Update Password'
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

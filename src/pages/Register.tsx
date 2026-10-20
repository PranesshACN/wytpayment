import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/base'
import { KeyRound, Mail, User, Phone, Shield, ArrowRight } from 'lucide-react'
import { signInWithWhitePass } from '../utils/whitepass'

export const Register: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const [loading, setLoading] = useState(false)
  const [ssoLoading, setSsoLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()

  const password = watch('password')

  const onSubmit = async (data: any) => {
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await api.post('/api/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || ''
      })
      setSuccessMsg('Account registered successfully with WytNet! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.message || 'Registration failed. Try again.'
      setErrorMsg(detail)
    } finally {
      setLoading(false)
    }
  }

  const handleSsoClick = async () => {
    setSsoLoading(true)
    setErrorMsg('')
    try {
      await signInWithWhitePass()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize WytPass SSO')
      setSsoLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 selection:bg-indigo-500 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-8 flex flex-col gap-6 relative z-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-14 w-14 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-indigo-500/25">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight mt-2">Create Account</h2>
          <p className="text-sm text-slate-400">Join with WytPass or register your centralized account</p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-medium">
            {successMsg}
          </div>
        )}

        {/* Continue with WytPass SSO */}
        <button
          type="button"
          onClick={handleSsoClick}
          disabled={ssoLoading}
          className="w-full py-3.5 bg-gradient-to-r from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 border border-slate-700 hover:border-indigo-500/50 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3 group active:scale-[0.99]"
        >
          {ssoLoading ? (
            <div className="h-5 w-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <div className="h-6 w-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-4 w-4 text-indigo-400" />
              </div>
              <span>Sign up with WytPass</span>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-indigo-400 transition-all ml-auto" />
            </>
          )}
        </button>

        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-900 px-3 text-xs text-slate-500 font-semibold uppercase tracking-wider absolute">
            Or register with credentials
          </span>
        </div>

        {/* Custom Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Jane Doe"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            {errors.name && (
              <span className="text-xs text-rose-400 font-semibold">{errors.name.message as string}</span>
            )}
          </div>

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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Phone Number <span className="text-slate-600 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                {...register('phone')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
              />
            </div>
            {errors.password && (
              <span className="text-xs text-rose-400 font-semibold">{errors.password.message as string}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                {...register('confirmPassword', {
                  required: 'Confirm password is required',
                  validate: (value) => value === password || 'Passwords do not match'
                })}
              />
            </div>
            {errors.confirmPassword && (
              <span className="text-xs text-rose-400 font-semibold">{errors.confirmPassword.message as string}</span>
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
              'Create WytNet Account'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-slate-400 border-t border-slate-800/80 pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/base'
import { KeyRound, Mail, Wallet, Shield } from 'lucide-react'
import { signInWithWhitePass } from '../utils/whitepass'

export const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (data: any) => {
    setLoading(true)
    setErrorMsg('')
    try {
      const resp = await api.post('/api/auth/login', data)
      localStorage.setItem('saas_token', resp.data.access_token)
      localStorage.setItem('saas_user', JSON.stringify(resp.data.user))
      navigate('/')
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 bg-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-xl">
            <Wallet className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-2">Welcome Back</h2>
          <p className="text-sm text-slate-400">Log in to manage your subscription</p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={() => signInWithWhitePass()}
          className="w-full py-3.5 bg-slate-700 hover:bg-slate-650 border border-slate-600 text-white font-bold rounded-xl shadow-md hover:border-slate-500 transition-all flex items-center justify-center gap-3"
        >
          <Shield className="h-5 w-5 text-emerald-400" />
          <span>Sign in with WytPass SSO</span>
        </button>

        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-slate-700 w-full"></div>
          <span className="bg-slate-800 px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider absolute">
            Or continue with email
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                {...register('email', { required: 'Email address is required' })}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-rose-400 font-semibold">{errors.email.message as string}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                {...register('password', { required: 'Password is required' })}
              />
            </div>
            {errors.password && (
              <span className="text-xs text-rose-400 font-semibold">{errors.password.message as string}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/35 transition-all duration-200 flex justify-center items-center gap-2 mt-2"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-slate-400 border-t border-slate-700/50 pt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}


import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/base'
import { CheckCircle2, AlertCircle, Calendar, ShieldCheck, Zap } from 'lucide-react'

export const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const resp = await api.get('/api/auth/me')
        setUser(resp.data)
        // Refresh local cache of the user
        localStorage.setItem('saas_user', JSON.stringify(resp.data))
      } catch (err) {
        console.error('Failed to reload profile', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isActive = user?.subscription_status === 'active'

  return (
    <div className="flex flex-col gap-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscription Status Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Subscription Status</span>
            <span className="text-xl font-bold flex items-center gap-2 mt-1">
              {isActive ? (
                <>
                  <CheckCircle2 className="text-emerald-500 h-6 w-6" />
                  <span className="text-emerald-600">Active</span>
                </>
              ) : (
                <>
                  <AlertCircle className="text-amber-500 h-6 w-6" />
                  <span className="text-amber-600">No Active Plan</span>
                </>
              )}
            </span>
          </div>
          <div className={`p-3.5 rounded-xl ${isActive ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Current Tier</span>
            <span className="text-xl font-bold text-slate-800 mt-1">
              {isActive ? user.plan?.name : 'None'}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Zap className="h-6 w-6" />
          </div>
        </div>

        {/* Renewal Date Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Expiration Date</span>
            <span className="text-xl font-bold text-slate-800 mt-1">
              {user?.renewal_date ? new Date(user.renewal_date).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-100 text-slate-600">
            <Calendar className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main SaaS panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Your SaaS Console</h3>
          <p className="text-sm text-slate-500 mt-1">Access features unlocked by your current active plan.</p>
        </div>

        {isActive ? (
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-150 flex flex-col gap-4">
            <span className="text-sm text-slate-700 font-bold">Unlocking Premium features of {user.plan?.name} Plan:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.plan?.features?.map((f: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12 gap-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <h4 className="font-bold text-slate-700">Ready to unlock premium options?</h4>
            <p className="text-sm text-slate-500 max-w-sm">Choose from Starter, Professional, or Enterprise pricing tiers to upgrade and start using live SaaS utilities.</p>
            <Link
              to="/pricing"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md transition-all text-sm"
            >
              View Pricing Tiers
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

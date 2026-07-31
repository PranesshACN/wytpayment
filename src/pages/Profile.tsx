import React from 'react'

export const Profile: React.FC = () => {
  const userJson = localStorage.getItem('saas_user')
  const user = userJson ? JSON.parse(userJson) : { name: 'User', email: '', subscription_status: 'none' }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm max-w-2xl flex flex-col gap-6">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
        <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-2xl">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">{user.name}</h3>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-xl border border-slate-150">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Account ID</span>
          <span className="text-sm font-semibold text-slate-800 truncate mt-1">{user.id || 'N/A'}</span>
        </div>
        <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-xl border border-slate-150">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Access tier</span>
          <span className="text-sm font-semibold text-slate-800 mt-1 capitalize">{user.subscription_status}</span>
        </div>
      </div>
    </div>
  )
}

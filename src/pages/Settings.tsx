import React from 'react'
import { Info, Settings } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const paymentApiUrl = import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:8000'

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm max-w-3xl flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Integration Configuration</h3>
          <p className="text-sm text-slate-500">Inspect the environment variables mapped by this client application.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 border border-slate-150 rounded-xl p-5 bg-slate-50/50">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Local Backend URL (VITE_API_URL)</span>
          <span className="text-sm font-mono text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-lg mt-1 select-all">
            {apiUrl}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">WhiteNet Payment Base URL (VITE_PAYMENT_API_URL)</span>
          <span className="text-sm font-mono text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-lg mt-1 select-all">
            {paymentApiUrl}
          </span>
        </div>
      </div>

      <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 rounded-xl flex gap-3 text-sm leading-relaxed">
        <Info className="h-5 w-5 flex-shrink-0 mt-0.5 text-indigo-500" />
        <div>
          <strong className="font-bold block">Testing WhiteNet live gateway:</strong>
          <p className="mt-1">
            To switch from Mock mode to real payments verification, stop the backend server, open <code>backend/.env</code>, fill in the <code>CLIENT_ID</code>, <code>CLIENT_SECRET</code>, and <code>APP_ID</code> parameters you obtained from your WhiteNet portal's <strong>Payment Integration</strong> dashboard, and reload the server.
          </p>
        </div>
      </div>
    </div>
  )
}

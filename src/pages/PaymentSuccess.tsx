import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/base'
import { CheckCircle2, ChevronRight, Loader2, Sparkles } from 'lucide-react'

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('whitenet_order_id')
  const [statusData, setStatusData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    let pollCount = 0

    const checkStatus = async () => {
      if (!orderId) {
        setLoading(false)
        return
      }
      try {
        const resp = await api.get(`/api/purchases/status/${orderId}`)
        setStatusData(resp.data)
        const currentStatus = (resp.data.status || '').toLowerCase()
        if ((currentStatus === 'pending' || currentStatus === 'processing') && pollCount < 5) {
          pollCount++
          timer = setTimeout(checkStatus, 2000)
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to confirm payment status', err)
        setLoading(false)
      }
    }
    checkStatus()

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-600 mt-3">Confirming payment with WhiteNet...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 flex flex-col items-center text-center gap-6">
        <div className="relative">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full animate-bounce">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Payment Successful</h2>
          <p className="text-sm text-slate-500">Your account subscription is now upgraded and active.</p>
        </div>

        {statusData && (
          <div className="w-full bg-slate-50 rounded-2xl p-5 border border-slate-150 flex flex-col gap-3 text-left">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Order Reference</span>
              <span className="font-mono text-xs font-bold text-slate-700">{statusData.whitenet_order_id}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-slate-250/20 pt-2.5">
              <span className="text-slate-500 font-medium">Amount Unlocked</span>
              <span className="font-extrabold text-slate-800">₹{statusData.amount}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-slate-250/20 pt-2.5">
              <span className="text-slate-500 font-medium">Plan Status</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                {statusData.status}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full mt-2">
          <Link
            to="/"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5 transition-all"
          >
            Go to Console
            <ChevronRight className="h-4 w-4" />
          </Link>
          
          <Link
            to="/history"
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
          >
            View Transactions
          </Link>
        </div>
      </div>
    </div>
  )
}

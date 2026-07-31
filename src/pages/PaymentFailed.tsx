import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, ChevronLeft } from 'lucide-react'

export const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('whitenet_order_id') || 'N/A'

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 flex flex-col items-center text-center gap-6">
        
        <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
          <AlertCircle className="h-10 w-10" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Payment Declined</h2>
          <p className="text-sm text-slate-500">Your bank or payment gateway rejected the checkout transaction.</p>
        </div>

        <div className="w-full bg-slate-50 rounded-2xl p-5 border border-slate-150 flex flex-col gap-3 text-left">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Order Reference</span>
            <span className="font-mono text-xs font-bold text-rose-500 break-all">{orderId}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-slate-250/20 pt-2.5">
            <span className="text-slate-500 font-medium">Status</span>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase">
              Failed
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full mt-2">
          <Link
            to="/pricing"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5 transition-all"
          >
            Retry Checkout
          </Link>
          
          <Link
            to="/"
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

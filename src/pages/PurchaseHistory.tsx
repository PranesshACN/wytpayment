import React, { useEffect, useState } from 'react'
import { api } from '../api/base'
import { Calendar, CreditCard, ShoppingBag } from 'lucide-react'

export const PurchaseHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const resp = await api.get('/api/purchases/history')
        setHistory(resp.data)
      } catch (err) {
        console.error('Failed to load transaction history', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Billing History</h3>
          <p className="text-sm text-slate-500">Track orders and check statuses processed under WhiteNet merchant APIs.</p>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="overflow-x-auto border border-slate-150 rounded-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-150">
                <th className="p-4">Order ID</th>
                <th className="p-4">SaaS Tier</th>
                <th className="p-4">Price paid</th>
                <th className="p-4">Status</th>
                <th className="p-4">Order Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono text-xs font-bold text-slate-700">{purchase.whitenet_order_id || 'Pending Link'}</td>
                  <td className="p-4 font-bold text-slate-800">{purchase.plan?.name}</td>
                  <td className="p-4 font-semibold text-slate-800">₹{purchase.amount}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        purchase.status === 'paid'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                          : purchase.status === 'failed'
                          ? 'text-rose-700 bg-rose-50 border-rose-100'
                          : 'text-amber-700 bg-amber-50 border-amber-100'
                      }`}
                    >
                      {purchase.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {new Date(purchase.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <CreditCard className="h-10 w-10 text-slate-300" />
          <h4 className="font-bold text-slate-700 mt-3">No orders recorded</h4>
          <p className="text-sm text-slate-500 max-w-xs mt-1">Subscriptions purchased under pricing plans will be logged here instantly.</p>
        </div>
      )}
    </div>
  )
}

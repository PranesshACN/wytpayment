import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Wallet, ShieldAlert, CheckCircle, XCircle } from 'lucide-react'
import { api } from '../api/base'

export const MockCheckout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [plans, setPlans] = useState<any[]>([])
  
  const orderId = location.state?.orderId || "wn_ord_mock_default"
  const planId = location.state?.planId || 1

  const [loadingPlans, setLoadingPlans] = useState(true)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const resp = await api.get('/api/plans')
        setPlans(resp.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingPlans(false)
      }
    }
    fetchPlans()
  }, [])

  if (loadingPlans) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const plan = plans.find(p => p.id === planId) || { name: 'Starter Plan', price: 100.0 }

  const handleSimulatePayment = async (success: boolean) => {
    setVerifying(true)
    try {
      if (success) {
        // Send payment_success webhook event to update database status
        await api.post('/api/purchases/whitenet-webhook', {
          whitenet_order_id: orderId,
          event: 'payment_success',
          payment_id: `pay_mock_${Date.now()}`,
          payment_method: 'UPI'
        })
        navigate(`/payment-success?whitenet_order_id=${orderId}`)
      } else {
        // Send payment_failed webhook event
        await api.post('/api/purchases/whitenet-webhook', {
          whitenet_order_id: orderId,
          event: 'payment_failed',
          payment_id: `pay_mock_${Date.now()}`,
          payment_method: 'UPI'
        })
        navigate(`/payment-failed?whitenet_order_id=${orderId}`)
      }
    } catch (err) {
      console.error('Mock simulation failed', err)
      alert('Webhook simulation failed to update database status.')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
            <Wallet className="h-4 w-4" />
            WhiteNet Payment Sandbox
          </div>
          <h2 className="text-xl font-bold tracking-tight mt-2">Hosted Checkout Simulation</h2>
          <p className="text-xs text-slate-400">Review purchase details and simulate client callbacks</p>
        </div>

        {/* Order Details */}
        <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm border-b border-slate-850 pb-2">
            <span className="text-slate-500 font-medium">Plan Selected</span>
            <span className="font-bold">{plan.name}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-slate-850 pb-2">
            <span className="text-slate-500 font-medium">Order Reference</span>
            <span className="font-mono text-xs text-slate-400 break-all">{orderId}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Transaction Amount</span>
            <span className="text-lg font-extrabold text-indigo-400">₹{plan.price.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-400 text-xs leading-normal">
          <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Developer notice:</strong> This hosted page is a mock simulation loaded because live integration variables are empty.
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={() => handleSimulatePayment(true)}
            disabled={verifying}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl flex justify-center items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/15"
          >
            {verifying ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Simulate Payment Success
              </>
            )}
          </button>
          
          <button
            onClick={() => handleSimulatePayment(false)}
            disabled={verifying}
            className="w-full py-3.5 bg-rose-600/15 hover:bg-rose-600/25 border border-rose-600/30 font-bold rounded-xl flex justify-center items-center gap-2 transition-all cursor-pointer text-rose-400"
          >
            <XCircle className="h-5 w-5" />
            Simulate Payment Failure
          </button>
        </div>
      </div>
    </div>
  )
}

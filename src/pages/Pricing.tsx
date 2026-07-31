import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/base'
import { Check, CreditCard } from 'lucide-react'

export const Pricing: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasingId, setPurchasingId] = useState<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const resp = await api.get('/api/plans')
        setPlans(resp.data)
      } catch (err) {
        console.error('Failed to load plans', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const handleSubscribe = async (planId: number) => {
    setPurchasingId(planId)
    try {
      const resp = await api.post('/api/purchases/checkout', { plan_id: planId })
      const { checkout_url, mock_checkout, whitenet_order_id } = resp.data
      
      if (mock_checkout) {
        // Reroute internally to the mock checkout page
        navigate(checkout_url, { state: { orderId: whitenet_order_id, planId } })
      } else {
        // Redirect to actual live WhiteNet Hosted Checkout Gateway
        window.location.href = checkout_url
      }
    } catch (err) {
      console.error('Purchase creation failed', err)
      alert('Could not initiate checkout process.')
    } finally {
      setPurchasingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
        <h3 className="text-2xl font-bold text-slate-800">Select a Plan</h3>
        <p className="text-sm text-slate-500">Upgrade your account instantly with WhiteNet centralized payments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col justify-between relative hover:border-indigo-500 transition-all ${
              plan.id === 2 ? 'ring-2 ring-indigo-600 ring-offset-2' : ''
            }`}
          >
            {plan.id === 2 && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Popular
              </span>
            )}
            
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="text-lg font-bold text-slate-800">{plan.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1 py-2 border-y border-slate-100">
                <span className="text-3xl font-extrabold text-slate-800">₹{plan.price}</span>
                <span className="text-sm text-slate-500">/ month</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {plan.features?.map((feat: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={purchasingId !== null}
              className={`w-full py-3 rounded-xl font-bold transition-all mt-8 flex justify-center items-center gap-2 ${
                plan.id === 2
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {purchasingId === plan.id ? (
                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Buy Now
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

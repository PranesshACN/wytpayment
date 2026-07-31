import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Callback } from './pages/Callback'
import { Dashboard } from './pages/Dashboard'
import { Pricing } from './pages/Pricing'
import { PurchaseHistory } from './pages/PurchaseHistory'
import { MockCheckout } from './pages/MockCheckout'
import { PaymentSuccess } from './pages/PaymentSuccess'
import { PaymentFailed } from './pages/PaymentFailed'
import { Profile } from './pages/Profile'
import { SettingsPage } from './pages/Settings'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/callback" element={<Callback />} />


        {/* Mock checkout gateway screen */}
        <Route path="/mock-checkout/:token" element={<MockCheckout />} />

        {/* Redirect checkout callbacks */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />

        {/* Protected SaaS application console routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ProtectedRoute>
              <Layout>
                <Pricing />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout>
                <PurchaseHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App

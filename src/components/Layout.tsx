import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, CreditCard, History, User, Settings, LogOut, Wallet } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const userJson = localStorage.getItem('saas_user')
  const user = userJson ? JSON.parse(userJson) : { name: 'User', email: '' }

  const handleLogout = () => {
    localStorage.removeItem('saas_token')
    localStorage.removeItem('saas_user')
    navigate('/login')
  }

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Pricing Plans', path: '/pricing', icon: CreditCard },
    { name: 'Purchase History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Developer Settings', path: '/settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shadow-xl">
        <div>
          {/* Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <Wallet className="h-8 w-8 text-indigo-400" />
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              SaaS Demo
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-bold text-rose-400 hover:text-white hover:bg-rose-600/20 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">
            {menuItems.find((item) => item.path === location.pathname)?.name || 'Demo App'}
          </h2>
        </header>
        <div className="p-8 max-w-7xl w-full mx-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}

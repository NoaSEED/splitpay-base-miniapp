import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Wallet, Users, Plus, Home, Twitter } from 'lucide-react'
import WalletConnect from './WalletConnect'
import DebtNotification from './DebtNotification'
import PaymentNotifications from './PaymentNotifications'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-50 to-base-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-base-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-base-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-base-900">SplitPay</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-base-100 text-base-700' 
                    : 'text-gray-600 hover:text-base-700 hover:bg-base-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/create-group"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/create-group') 
                    ? 'bg-base-100 text-base-700' 
                    : 'text-gray-600 hover:text-base-700 hover:bg-base-50'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Crear Grupo</span>
              </Link>
            </nav>

            {/* Wallet Connect */}
            <div className="flex items-center space-x-4">
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Notifications */}
      <DebtNotification />
      <PaymentNotifications />

           {/* Footer */}
           <footer className="bg-gradient-to-r from-base-50 to-base-100 border-t border-base-200 mt-auto">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
               <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                 <div className="flex items-center space-x-2 text-sm text-gray-600">
                   <Wallet className="w-4 h-4" />
                   <span>Powered by Base Network</span>
                 </div>
                 
                 <div className="flex items-center space-x-4 text-sm text-gray-600">
                   <span>© 2024 SplitPay</span>
                   <span>•</span>
                   <span>Gastos Compartidos en Base</span>
                 </div>

                 {/* Creator Info - Delicate Design */}
                 <div className="flex items-center space-x-2">
                   <span className="text-sm text-gray-400">Creado por</span>
                   <a
                     href="https://x.com/SeedsPuntoEth"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="group flex items-center space-x-2 px-3 py-1.5 bg-white/50 hover:bg-white/80 border border-gray-200/50 hover:border-blue-300/50 rounded-full transition-all duration-300 hover:shadow-sm backdrop-blur-sm"
                   >
                     <div className="w-5 h-5 bg-gray-600 group-hover:bg-blue-500 rounded-full flex items-center justify-center transition-all duration-300">
                       <Twitter className="w-3 h-3 text-white" />
                     </div>
                     <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">Noa</span>
                     <span className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">@SeedsPuntoEth</span>
                   </a>
                 </div>
               </div>
               
               {/* Additional Info */}
               <div className="mt-4 pt-4 border-t border-base-200">
                 <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 space-y-2 md:space-y-0">
                   <div className="flex items-center space-x-4">
                     <span>🔒 Transacciones seguras en Base</span>
                     <span>•</span>
                     <span>💎 USDC como moneda estable</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <span>Hecho con ❤️ para la comunidad Base</span>
                   </div>
                 </div>
               </div>
             </div>
           </footer>
    </div>
  )
}

export default Layout

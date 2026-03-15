import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from './utils';
import { useProperty } from './lib/PropertyContext';
import { useAuth } from './lib/AuthContext';
import {
  Home,
  MessageCircle,
  Wrench,
  Book,
  ChevronDown,
  Sparkles,
  Building2,
  Plus,
  Check,
  Users,
  Settings,
  TrendingUp,
  Plug,
  LogOut
} from 'lucide-react';

// Property Selector Dropdown
const PropertySelector = ({ currentProperty, allProperties, onSwitch }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            {currentProperty?.name || 'My Home'}
          </p>
          <p className="text-xs text-gray-500 leading-tight">
            {currentProperty?.address || 'Complete setup'}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
            >
              {allProperties.map((prop) => (
                <button
                  key={prop.id || prop.address}
                  onClick={() => {
                    if (prop.id && onSwitch) onSwitch(prop.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                    prop.id === currentProperty?.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    prop.id === currentProperty?.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <Building2 className={`w-4 h-4 ${
                      prop.id === currentProperty?.id ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{prop.name || 'My Home'}</p>
                    <p className="text-xs text-gray-500 truncate">{prop.address || 'No address'}</p>
                  </div>
                  {prop.id === currentProperty?.id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
              <div className="border-t border-gray-100">
                <Link
                  to={createPageUrl('Onboarding')}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-500"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Add Property</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { activeProperty, allProperties, switchProperty } = useProperty();
  const { logout, user } = useAuth();

  const currentProperty = activeProperty
    ? {
        ...activeProperty,
        name: activeProperty.address
          ? activeProperty.address.split(',')[0]
          : activeProperty.name || 'My Home',
      }
    : { name: 'My Home', address: 'Complete setup' };

  // Determine which page is active
  const pathName = location.pathname.replace('/', '') || 'HomeBase';

  // Don't show layout on onboarding
  if (pathName === 'Onboarding') {
    return <>{children}</>;
  }

  const navItems = [
    { id: 'HomeBase', icon: Home, label: 'Home' },
    { id: 'HomeBaseManual', icon: Book, label: 'Manual' },
    { id: 'Projects', icon: Wrench, label: 'Projects' },
    { id: 'Insights', icon: TrendingUp, label: 'Insights' },
    { id: 'Integrations', icon: Plug, label: 'Integrations' },
    { id: 'ContactsAccounts', icon: Users, label: 'Contacts' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: Property Selector */}
          <PropertySelector
            currentProperty={currentProperty}
            allProperties={allProperties}
            onSwitch={switchProperty}
          />

          {/* Center: Navigation Tabs */}
          <nav className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={createPageUrl(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  pathName === item.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2">
            <Link
              to={createPageUrl('AskAI')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                pathName === 'AskAI'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Ask</span>
            </Link>
            <Link
              to={createPageUrl('Admin')}
              className={`p-2 rounded-xl transition-all ${
                pathName === 'Admin'
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Admin"
            >
              <Settings className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            {user && (
              <button
                onClick={() => logout()}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14">
        {children}
      </main>

      {/* Floating Ask AI Bubble - visible on non-AskAI pages */}
      {pathName !== 'AskAI' && (
        <Link
          to={createPageUrl('AskAI')}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all z-50"
          title="Ask HomeBase AI"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </Link>
      )}
    </div>
  );
}

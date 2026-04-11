import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from './utils';
import { useProperty } from './lib/PropertyContext';
import { useAuth } from './lib/AuthContext';
import { HomeBaseLogo } from './components/HomeBaseLogo';
import {
  Home,
  MessageCircle,
  Wrench,
  Book,
  ChevronDown,
  Building2,
  Plus,
  Check,
  Users,
  Settings,
  TrendingUp,
  Plug,
  LogOut
} from 'lucide-react';

const PropertySelector = ({ currentProperty, allProperties, onSwitch }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/60 transition-colors"
      >
        <div className="w-8 h-8 bg-hb-teal rounded-lg flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" strokeWidth={1.5} />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-semibold text-hb-navy leading-tight">
            {currentProperty?.name || 'My Home'}
          </p>
          <p className="text-xs text-hb-slate leading-tight">
            {currentProperty?.address || 'Set up your property'}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-hb-slate transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-hb-teal-50 transition-colors text-left ${
                    prop.id === currentProperty?.id ? 'bg-hb-teal-50' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    prop.id === currentProperty?.id ? 'bg-hb-teal' : 'bg-gray-200'
                  }`}>
                    <Building2 className={`w-4 h-4 ${
                      prop.id === currentProperty?.id ? 'text-white' : 'text-gray-500'
                    }`} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-hb-navy truncate">{prop.name || 'My Home'}</p>
                    <p className="text-xs text-hb-slate truncate">{prop.address || 'No address'}</p>
                  </div>
                  {prop.id === currentProperty?.id && (
                    <Check className="w-4 h-4 text-hb-teal" />
                  )}
                </button>
              ))}
              <div className="border-t border-gray-100">
                <Link
                  to={createPageUrl('Onboarding')}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-hb-teal-50 transition-colors text-hb-slate"
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
    : { name: 'My Home', address: 'Set up your property' };

  const pathName = location.pathname.replace('/', '') || 'HomeBase';

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
    <div className="min-h-screen bg-hb-warm">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: Logo + Property */}
          <div className="flex items-center gap-1">
            <Link to="/" className="text-hb-teal mr-1 flex items-center">
              <HomeBaseLogo size={32} animate={false} />
            </Link>
            <PropertySelector
              currentProperty={currentProperty}
              allProperties={allProperties}
              onSwitch={switchProperty}
            />
          </div>

          {/* Center: Nav */}
          <nav className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={createPageUrl(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  pathName === item.id
                    ? 'bg-white text-hb-teal shadow-sm'
                    : 'text-hb-slate hover:text-hb-navy'
                }`}
              >
                <item.icon className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            <Link
              to={createPageUrl('AskAI')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                pathName === 'AskAI'
                  ? 'bg-hb-teal text-white'
                  : 'bg-hb-teal-50 text-hb-teal-600 hover:bg-hb-teal-100'
              }`}
            >
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Ask Homer</span>
            </Link>
            <Link
              to={createPageUrl('Admin')}
              className={`p-2 rounded-xl transition-all ${
                pathName === 'Admin'
                  ? 'bg-gray-200 text-hb-navy'
                  : 'text-hb-slate hover:text-hb-navy hover:bg-gray-100'
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            {user && (
              <button
                onClick={() => logout()}
                className="p-2 rounded-xl text-hb-slate hover:text-hb-navy hover:bg-gray-100 transition-all"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-14">
        {children}
      </main>

      {/* Floating Ask Homer button */}
      {pathName !== 'AskAI' && (
        <Link
          to={createPageUrl('AskAI')}
          className="fixed bottom-6 right-6 w-14 h-14 bg-hb-teal rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all z-50"
          title="Ask Homer"
        >
          <MessageCircle className="w-6 h-6 text-white" strokeWidth={1.5} />
        </Link>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { getHomeData } from './lib/homeDataStore';
import {
  Home,
  MessageCircle,
  Grid3X3,
  AlertTriangle,
  Wrench,
  Book,
  ChevronDown,
  ChevronRight,
  Send,
  Loader2,
  X,
  Sparkles,
  MapPin,
  Building2,
  Plus,
  Check
} from 'lucide-react';

// Floating Ask AI Panel
const FloatingAskAI = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const homeData = getHomeData();

  const homeContext = `
You are HomeBase AI, an intelligent assistant for a homeowner.
You have complete knowledge of their home and can answer questions about it.

HOME DATA:
- Address: ${homeData.property?.address || 'Not set'}, ${homeData.property?.city || ''}, ${homeData.property?.state || ''}
- Year Built: ${homeData.property?.yearBuilt || 'Unknown'}
- Square Feet: ${homeData.property?.sqft || 'Unknown'}
- Bedrooms: ${homeData.property?.bedrooms || 'Unknown'}, Bathrooms: ${homeData.property?.bathrooms || 'Unknown'}

SMART HOME:
- WiFi: ${homeData.smartHome?.wifi?.networkName || 'Not set'}
- Door Locks: ${homeData.smartHome?.doorLocks?.map(l => l.location + ': ' + l.code).join(', ') || 'Not set'}

EMERGENCY:
- Water Shutoff: ${homeData.emergency?.waterShutoff?.location || 'Not set'} - ${homeData.emergency?.waterShutoff?.instructions || ''}
- Gas Shutoff: ${homeData.emergency?.gasShutoff?.location || 'Not set'} - ${homeData.emergency?.gasShutoff?.instructions || ''}
- Electrical Panel: ${homeData.emergency?.electricalPanel?.location || 'Not set'} - ${homeData.emergency?.electricalPanel?.instructions || ''}

When answering: Be helpful, conversational, and provide specific details from the home data. If asked about something not in the data, say so politely.
`;

  const handleSendMessage = async (text) => {
    const question = text || inputValue;
    if (!question.trim() || isLoading) return;

    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${homeContext}\n\nUser Question: ${question}\n\nProvide a helpful, accurate answer based on the home data above.`,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    'Where is the water shutoff?',
    'What\'s the WiFi password?',
    'When was the roof replaced?',
    'What paint is on the walls?',
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-20 right-6 w-[400px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[100] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h3 className="text-white font-semibold text-sm">Ask HomeBase</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[340px]">
          {messages.length === 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 tracking-widest uppercase text-center mb-3">
                Quick Questions
              </p>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md'
                } px-4 py-2.5 max-w-[85%] text-sm`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-md">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100">
          <div className="bg-gray-50 rounded-full flex items-center p-1.5 border border-gray-200">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about your home..."
              className="flex-1 px-3 py-1.5 bg-transparent outline-none text-gray-700 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Property Selector Dropdown
const PropertySelector = ({ currentProperty, allProperties }) => {
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
        <div className="text-left">
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            {currentProperty.name || 'My Home'}
          </p>
          <p className="text-xs text-gray-500 leading-tight">
            {currentProperty.address || 'Add address in setup'}
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
              {allProperties.map((prop, i) => (
                <button
                  key={i}
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                    prop.address === currentProperty.address ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    prop.address === currentProperty.address
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }`}>
                    <Building2 className={`w-4 h-4 ${
                      prop.address === currentProperty.address ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{prop.name}</p>
                    <p className="text-xs text-gray-500 truncate">{prop.address}</p>
                  </div>
                  {prop.address === currentProperty.address && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
              <div className="border-t border-gray-100">
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-500">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Add Property</span>
                </button>
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
  const [askAIOpen, setAskAIOpen] = useState(false);
  const homeData = getHomeData();

  const currentProperty = {
    name: homeData.property?.address
      ? `${homeData.property.address.split(',')[0]}`
      : 'My Home',
    address: homeData.property?.address
      ? `${homeData.property.address}, ${homeData.property.city || ''} ${homeData.property.state || ''}`
      : 'Set up your property',
  };

  const allProperties = [currentProperty];

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
          />

          {/* Center: Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={createPageUrl(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathName === item.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4" strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAskAIOpen(!askAIOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                askAIOpen
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14">
        {children}
      </main>

      {/* Floating Ask AI Panel */}
      <FloatingAskAI isOpen={askAIOpen} onClose={() => setAskAIOpen(false)} />
    </div>
  );
}

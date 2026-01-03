import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { 
  Home, 
  MessageCircle, 
  Grid3X3, 
  AlertTriangle,
  Wifi,
  Key,
  Trash2,
  Wind,
  Mic,
  Send,
  MapPin,
  ChevronRight,
  Book,
  ShoppingCart,
  Droplets,
  Flame,
  Zap,
  Phone,
  ArrowLeft,
  Ruler,
  Palette,
  Refrigerator,
  X,
  Loader2
} from 'lucide-react';

// Navigation Component
const Navigation = ({ activeView, setActiveView, isEmergency }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Vitals' },
    { id: 'assistant', icon: MessageCircle, label: 'Ask' },
    { id: 'rooms', icon: Grid3X3, label: 'Rooms' },
    { id: 'emergency', icon: AlertTriangle, label: 'Emergency' },
  ];

  return (
    <nav className={`fixed left-0 top-0 bottom-0 w-64 ${isEmergency ? 'bg-slate-900 border-slate-700' : 'bg-white/95 backdrop-blur-xl border-gray-100'} border-r z-50 flex flex-col`}>
      <div className="p-6 border-b border-gray-100">
        <h1 className={`text-xl font-light tracking-tight mb-1 ${isEmergency ? 'text-white' : 'text-gray-900'}`}>
          HOMEBASE
        </h1>
        <p className={`text-xs ${isEmergency ? 'text-slate-400' : 'text-gray-500'}`}>
          Quick Access
        </p>
      </div>

      <div className="flex-1 p-4 space-y-2">
        {/* Link to Full Manual */}
        <Link
          to={createPageUrl('HomeBaseManual')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isEmergency 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
          }`}
        >
          <Book className="w-5 h-5" strokeWidth={1.5} />
          <div className="flex-1">
            <span className="font-semibold text-sm block">Full Manual</span>
            <span className="text-xs opacity-90">3D Model & Complete Docs</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </Link>

        <div className={`my-4 border-t ${isEmergency ? 'border-slate-700' : 'border-gray-200'}`} />

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeView === item.id 
                ? isEmergency 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-blue-50 text-blue-600'
                : isEmergency 
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' 
                  : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5" strokeWidth={1.5} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// Health Score Ring Component
const HealthScoreRing = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const circumference = 2 * Math.PI * 88;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative w-52 h-52 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r="88"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
        />
        <motion.circle
          cx="100"
          cy="100"
          r="88"
          fill="none"
          stroke="#2563EB"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className="text-5xl font-light text-gray-900 tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {animatedScore}%
        </motion.span>
        <span className="text-sm font-medium text-gray-400 tracking-widest uppercase mt-1">Healthy</span>
      </div>
    </div>
  );
};

// Quick Info Card Component
const QuickInfoCard = ({ icon: Icon, title, primary, secondary, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 hover:shadow-md transition-shadow duration-300"
  >
    <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center mb-4`}>
      <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
    </div>
    <p className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-1">{title}</p>
    <p className="text-lg font-semibold text-gray-900 tracking-tight">{primary}</p>
    {secondary && <p className="text-sm text-gray-500 mt-0.5">{secondary}</p>}
  </motion.div>
);

// Dashboard View
const DashboardView = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <div className="px-6 pt-16 pb-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-light text-gray-900 tracking-tight mb-4">
          Your Complete Home Manual
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Every detail about The Miller Residence in one comprehensive digital manual
        </p>
      </motion.div>

      {/* Hero CTA Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <Link
          to={createPageUrl('HomeBaseManual')}
          className="block bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 duration-300"
        >
          <div className="flex items-start gap-6 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
              <Book className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-white mb-2">Open Full Manual</h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Interactive 3D floor plan, complete room specs, appliance warranties, emergency shutoffs, and all home documentation
              </p>
            </div>
            <ChevronRight className="w-8 h-8 text-white/80" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-white/90 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="font-semibold text-lg">100%</p>
              <p className="text-xs text-white/70">Complete</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="font-semibold text-lg">84</p>
              <p className="text-xs text-white/70">Data Points</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="font-semibold text-lg">3D</p>
              <p className="text-xs text-white/70">Floor Plan</p>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Quick Access Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4 text-center">Quick Access</h3>
        <div className="grid grid-cols-2 gap-4">
          <QuickInfoCard
            icon={Wifi}
            title="WiFi"
            primary="Redwood_Mesh"
            secondary="GiantTrees26!"
            color="bg-blue-600"
            delay={0.5}
          />
          <QuickInfoCard
            icon={Key}
            title="Access"
            primary="4821#"
            secondary="Front Door"
            color="bg-emerald-500"
            delay={0.6}
          />
        </div>
      </motion.div>
    </div>
  </div>
);

// AI Assistant View
const AssistantView = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const homeContext = `
You are HomeBase AI, an intelligent assistant for The Miller Residence in Mill Valley, CA. 
You have complete knowledge of this home and can answer questions about it.

HOME SPECIFICATIONS:
- Year Built: 1987
- Total Square Feet: 2,847 sq ft
- Lot Size: 0.31 acres
- Bedrooms: 4, Bathrooms: 3.5
- Stories: 2

ROOMS & DIMENSIONS:
- Kitchen: 16'4" × 18'2" (297 sq ft), Ceiling: 9'6", Windows: 2 casement (Milgard Tuscany), Flooring: White Oak 7" wide plank
- Living Room: 18' × 22'
- Master Bedroom: 16' × 18'
- Bedroom 2: 12' × 14'
- Bedroom 3: 12' × 14'
- Bathroom: 8' × 10'
- Dining Room: 12' × 14'

PAINT COLORS:
- Walls: Benjamin Moore "Chantilly Lace" (OC-65)
- Trim: Benjamin Moore "White Dove" (OC-17)
- Accent/Cabinets: Farrow & Ball "Hague Blue" (No. 30)

WINDOWS:
Kitchen Windows: 2× Casement, Milgard Tuscany Series
- Rough Opening: 36"w × 48"h
- Daylight Opening: 32"w × 44"h

APPLIANCES:
- Refrigerator: Sub-Zero BI-42U (Installed March 2021, Warranty until March 2026)
- Dishwasher: Bosch 800 Series SHPM88Z75N
- Range: Wolf 36" Dual Fuel DF366 (Installed January 2022)

MECHANICAL SYSTEMS:
- Water Heater: Rheem Performance Platinum 50 Gallon (2023)
- HVAC: Nest Learning Thermostat (Hallway, Main Floor)
- Electrical Panel: 200A Main Panel, 16 Circuit Breakers, Located in Garage

EMERGENCY SHUTOFFS:
- Water Main: Front Yard, Blue Lid, Turn clockwise to close
- Gas Main: North Wall, Wrench attached, Turn perpendicular to pipe
- Electrical Panel: Garage Panel A, Main breaker top left

SMART HOME:
- WiFi: Redwood_Mesh_Pro (Password: TreeHouse2026!)
- Front Door: Yale Assure Lock (Code: 4821#)
- Garage: LiftMaster Opener (Code: 8900)
- Security: ADT Pulse, Control Panel at Kitchen Entrance

EXTERIOR:
- Roof: GAF Timberline Asphalt Shingle (Installed 2018)
- Gutters: Seamless Aluminum 5", French Drain System
- Irrigation: Hunter X-Core Controller (4 zones, Controller in Garage)

LANDSCAPE:
- Coast Redwood (3) - Front Yard, 65-70 ft tall, Planted 1987
- Japanese Maple (2) - Back Yard, 12-15 ft tall, Planted 2015

When answering questions:
1. Be helpful and conversational
2. For window blind measurements, use the rough opening dimensions (subtract 1/4" for clearance)
3. Provide specific details from the home data
4. If asked about something not in the data, say so politely
5. For measurements, be precise and include both imperial and metric when helpful
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

      const assistantMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    'Where is the water shutoff?',
    'What paint is on the walls?',
    'What size blinds do I need for the kitchen windows?',
    'When was the roof replaced?'
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <div className="px-6 pt-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-sm font-medium text-gray-400 tracking-widest uppercase mb-2">AI Assistant</p>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Ask HomeBase</h1>
        </motion.div>

        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <MessageCircle className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-gray-500 text-center mb-8">
              Ask me anything about your home
            </p>
            
            <div className="space-y-3 w-full max-w-lg">
              <p className="text-xs font-medium text-gray-400 tracking-widest uppercase text-center mb-4">Suggested Questions</p>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="w-full text-left px-5 py-4 bg-white rounded-2xl text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6 max-w-2xl">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-3xl rounded-br-lg'
                    : 'bg-white text-gray-800 rounded-3xl rounded-bl-lg shadow-sm border border-gray-100'
                } px-5 py-3 max-w-[85%]`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white px-5 py-3 rounded-3xl rounded-bl-lg shadow-sm border border-gray-100">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Input Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 rounded-full flex items-center p-2 border border-gray-200">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about your home..."
              className="flex-1 px-4 py-2 bg-transparent outline-none text-gray-700"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Room Detail View
const RoomDetailView = () => (
  <div className="min-h-screen bg-[#F9F9F9]">
    <div className="px-6 pt-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-sm font-medium text-gray-400 tracking-widest uppercase mb-2">Room Detail</p>
        <h1 className="text-3xl font-light text-gray-900 tracking-tight">Kitchen</h1>
      </motion.div>

      {/* Room Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-slate-100 to-slate-200 aspect-video"
      >
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
          alt="Kitchen"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-gray-700">
          360° View
        </div>
      </motion.div>

      {/* Specs Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <h2 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          Specifications
        </h2>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Ceiling Height</p>
              <p className="text-xl font-semibold text-gray-900">9' 6"</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Dimensions</p>
              <p className="text-xl font-semibold text-gray-900">14' × 18'</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Square Footage</p>
              <p className="text-xl font-semibold text-gray-900">252 sq ft</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Windows</p>
              <p className="text-xl font-semibold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Colors Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h2 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Paint Colors
        </h2>
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F5F5F0] border border-gray-200" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Wall Paint</p>
              <p className="text-sm text-gray-500">Benjamin Moore "Chantilly Lace"</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0B3142]" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Cabinet Paint</p>
              <p className="text-sm text-gray-500">Farrow & Ball "Hague Blue"</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
        </div>
      </motion.div>

      {/* Appliances Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
          <Refrigerator className="w-4 h-4" />
          Appliances
        </h2>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Refrigerator className="w-7 h-7 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Refrigerator</p>
              <p className="text-sm text-gray-500">Sub-Zero Classic BI-42U</p>
              <p className="text-xs text-gray-400 mt-1">Installed 2021 · Warranty Active</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition-colors">
              <Book className="w-4 h-4" />
              <span className="text-sm font-medium">Manual</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium">Order Filter</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

// Emergency View
const EmergencyView = () => {
  const emergencyItems = [
    {
      icon: Droplets,
      title: 'Water Main Shutoff',
      location: 'Front Yard',
      detail: 'Blue Lid · Turn Clockwise',
      color: 'bg-blue-500',
    },
    {
      icon: Flame,
      title: 'Gas Shutoff',
      location: 'Left Side of House',
      detail: 'Wrench Attached',
      color: 'bg-orange-500',
    },
    {
      icon: Zap,
      title: 'Electrical Panel',
      location: 'Garage',
      detail: 'Panel A · Main Breaker Top Left',
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-sm font-medium text-red-500 tracking-widest uppercase">Emergency Mode</p>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Critical Shutoffs</h1>
        </motion.div>

        {/* Emergency Call Button */}
        <motion.a
          href="tel:911"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl mb-8 transition-colors"
        >
          <Phone className="w-5 h-5" />
          <span className="font-semibold">Call 911</span>
        </motion.a>

        {/* Emergency Items */}
        <div className="space-y-4">
          {emergencyItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-slate-800 rounded-3xl p-6 border border-slate-700"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-slate-300">{item.location}</p>
                  <p className="text-sm text-slate-500 mt-1">{item.detail}</p>
                </div>
              </div>
              <button className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl transition-colors">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Show Location</span>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Additional Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <h2 className="text-xs font-medium text-slate-500 tracking-widest uppercase mb-4">Emergency Contacts</h2>
          <div className="space-y-3">
            {[
              { name: 'Plumber', company: 'ABC Plumbing', phone: '(555) 123-4567' },
              { name: 'Electrician', company: 'Bright Spark Electric', phone: '(555) 234-5678' },
              { name: 'HVAC', company: 'Cool Air Services', phone: '(555) 345-6789' },
            ].map((contact, i) => (
              <a
                key={i}
                href={`tel:${contact.phone.replace(/\D/g, '')}`}
                className="flex items-center justify-between bg-slate-800 rounded-2xl p-4 border border-slate-700"
              >
                <div>
                  <p className="font-medium text-white">{contact.name}</p>
                  <p className="text-sm text-slate-400">{contact.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 text-sm">{contact.phone}</p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Main App Component
export default function HomeBase() {
  const [activeView, setActiveView] = useState('dashboard');
  const isEmergency = activeView === 'emergency';

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'assistant':
        return <AssistantView />;
      case 'rooms':
        return <RoomDetailView />;
      case 'emergency':
        return <EmergencyView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className={`min-h-screen ${isEmergency ? 'bg-slate-900' : 'bg-[#F9F9F9]'}`}>
      <Navigation activeView={activeView} setActiveView={setActiveView} isEmergency={isEmergency} />
      <div className="ml-64">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X
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
    <nav className={`fixed bottom-0 left-0 right-0 ${isEmergency ? 'bg-slate-900 border-slate-700' : 'bg-white/80 backdrop-blur-xl border-gray-100'} border-t z-50`}>
      <div className="max-w-lg mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${
                activeView === item.id 
                  ? isEmergency 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-blue-50 text-blue-600'
                  : isEmergency 
                    ? 'text-slate-400 hover:text-slate-200' 
                    : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-xs font-medium tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
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
  <div className="min-h-screen bg-[#F9F9F9] pb-28">
    <div className="px-6 pt-14 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <p className="text-sm font-medium text-gray-400 tracking-widest uppercase mb-2">Welcome Home</p>
        <h1 className="text-3xl font-light text-gray-900 tracking-tight">Smith Family</h1>
      </motion.div>

      <div className="mb-12">
        <HealthScoreRing score={98} />
        <motion.p 
          className="text-center text-sm text-gray-400 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          All systems operating normally
        </motion.p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <QuickInfoCard
          icon={Wifi}
          title="WiFi"
          primary="Redwood_Mesh"
          secondary="GiantTrees26!"
          color="bg-blue-600"
          delay={0.2}
        />
        <QuickInfoCard
          icon={Key}
          title="Access"
          primary="4821#"
          secondary="Front Door"
          color="bg-emerald-500"
          delay={0.3}
        />
        <QuickInfoCard
          icon={Trash2}
          title="Trash Day"
          primary="Tuesday"
          secondary="Recycling + Green"
          color="bg-amber-500"
          delay={0.4}
        />
        <QuickInfoCard
          icon={Wind}
          title="HVAC Filter"
          primary="Replace Soon"
          secondary="In 2 weeks"
          color="bg-purple-500"
          delay={0.5}
        />
      </div>
    </div>
  </div>
);

// AI Assistant View
const AssistantView = () => {
  const [showChat, setShowChat] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleAsk = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setShowChat(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-28">
      <div className="px-6 pt-14">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-sm font-medium text-gray-400 tracking-widest uppercase mb-2">AI Assistant</p>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Ask HomeBase</h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showChat ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.button
                onClick={handleAsk}
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isListening 
                    ? 'bg-blue-600 shadow-xl shadow-blue-200' 
                    : 'bg-white shadow-lg hover:shadow-xl border border-gray-100'
                }`}
                animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: isListening ? Infinity : 0, duration: 1.5 }}
              >
                <Mic className={`w-10 h-10 ${isListening ? 'text-white' : 'text-gray-400'}`} strokeWidth={1.5} />
              </motion.button>
              <p className="text-gray-400 mt-8 text-center">
                {isListening ? 'Listening...' : 'Tap to ask a question'}
              </p>
              
              <div className="mt-12 space-y-3 w-full max-w-sm">
                <p className="text-xs font-medium text-gray-400 tracking-widest uppercase text-center mb-4">Suggested</p>
                {['Where is the water shutoff?', 'What paint is on the walls?', 'When was the roof replaced?'].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setShowChat(true)}
                    className="w-full text-left px-5 py-4 bg-white rounded-2xl text-gray-600 hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white px-5 py-3 rounded-3xl rounded-br-lg max-w-[80%]">
                  <p>Where is the water shutoff?</p>
                </div>
              </div>

              {/* Bot Response */}
              <div className="flex justify-start">
                <div className="bg-white px-5 py-4 rounded-3xl rounded-bl-lg max-w-[85%] shadow-sm border border-gray-100">
                  <p className="text-gray-800 mb-4">
                    The <strong>Main Water Shutoff</strong> is located in your <strong>Front Yard</strong>, marked with a blue lid.
                  </p>
                  
                  {/* Map Placeholder */}
                  <div className="relative bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-6 mb-4">
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <Droplets className="w-8 h-8 text-white" />
                        </div>
                        <motion.div
                          className="absolute -inset-2 border-2 border-blue-400 rounded-full"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-4">Front Yard · Blue Lid</p>
                  </div>

                  <button className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                    <MapPin className="w-4 h-4" />
                    View on Property Map
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Input Bar */}
              <div className="fixed bottom-24 left-0 right-0 px-6">
                <div className="max-w-lg mx-auto bg-white rounded-full shadow-lg border border-gray-100 flex items-center p-2">
                  <input
                    type="text"
                    placeholder="Ask another question..."
                    className="flex-1 px-4 py-2 bg-transparent outline-none text-gray-700"
                  />
                  <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Room Detail View
const RoomDetailView = () => (
  <div className="min-h-screen bg-[#F9F9F9] pb-28">
    <div className="px-6 pt-14">
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
    <div className="min-h-screen bg-slate-900 pb-28">
      <div className="px-6 pt-14">
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
      <Navigation activeView={activeView} setActiveView={setActiveView} isEmergency={isEmergency} />
    </div>
  );
}
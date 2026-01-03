import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Layout,
  Palette,
  Wrench,
  Building2,
  AlertTriangle,
  Search,
  Copy,
  Check,
  Wifi,
  Key,
  Calendar,
  Ruler,
  Droplets,
  Flame,
  Zap,
  MapPin,
  Info,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Activity,
  Gauge,
  Wind,
  Trees,
  Sparkles,
  Settings,
  Target,
  CircleDot,
  Box,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import HouseModel3D from '../components/house/HouseModel3D';
import AddInfoModal from '../components/house/AddInfoModal';

// Copy to Clipboard Component
const CopyButton = ({ text, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-600" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

// Data Card Component
const DataCard = ({ icon: Icon, label, value, note, copyValue, children }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
    <div className="flex items-start gap-3 mb-3">
      {Icon && (
        <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-4.5 h-4.5 text-gray-600" strokeWidth={1.5} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-1">{label}</p>
        <p className="text-lg font-semibold text-gray-900 tracking-tight">{value}</p>
        {note && <p className="text-sm text-gray-500 mt-0.5">{note}</p>}
      </div>
      {copyValue && <CopyButton text={copyValue} label={label} />}
    </div>
    {children}
  </div>
);

// Specification Row Component
const SpecRow = ({ label, value, sublabel }) => (
  <div className="py-3 border-b border-gray-100 last:border-0">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
      <p className="text-sm text-gray-600 font-mono">{value}</p>
    </div>
  </div>
);

// Main Application
export default function HomeBaseManual() {
  const [activeChapter, setActiveChapter] = useState('vitals');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showAddInfoModal, setShowAddInfoModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const contentRef = useRef(null);

  // Completion tracking for each section
  const completionData = {
    vitals: { completed: 4, total: 6, percentage: 67 },
    spaces: { completed: 8, total: 12, percentage: 67 },
    aesthetics: { completed: 5, total: 8, percentage: 63 },
    mechanical: { completed: 6, total: 10, percentage: 60 },
    exterior: { completed: 4, total: 7, percentage: 57 },
    appliances: { completed: 3, total: 8, percentage: 38 },
    systems: { completed: 5, total: 9, percentage: 56 },
    landscape: { completed: 2, total: 6, percentage: 33 },
    emergency: { completed: 6, total: 6, percentage: 100 },
  };

  const totalCompleted = Object.values(completionData).reduce((sum, item) => sum + item.completed, 0);
  const totalItems = Object.values(completionData).reduce((sum, item) => sum + item.total, 0);
  const overallCompletion = Math.round((totalCompleted / totalItems) * 100);

  const chapters = [
    { id: 'model3d', label: '3D Model', icon: Box },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'spaces', label: 'Spaces', icon: Layout },
    { id: 'aesthetics', label: 'Aesthetics', icon: Palette },
    { id: 'mechanical', label: 'Mechanical Systems', icon: Wrench },
    { id: 'appliances', label: 'Appliances', icon: Settings },
    { id: 'exterior', label: 'Exterior', icon: Building2 },
    { id: 'landscape', label: 'Landscape', icon: Trees },
    { id: 'systems', label: 'Smart Systems', icon: Zap },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
  ];

  // Handle chapter navigation
  const scrollToChapter = (chapterId) => {
    const element = document.getElementById(`chapter-${chapterId}`);
    if (element) {
      const offset = 100;
      const elementPosition = element.offsetTop - offset;
      contentRef.current?.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      });
      setActiveChapter(chapterId);
      setSidebarOpen(false);
    }
  };

  // Handle scroll spy
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const scrollPosition = contentRef.current.scrollTop + 200;
      
      for (const chapter of chapters) {
        const element = document.getElementById(`chapter-${chapter.id}`);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveChapter(chapter.id);
        }
      }
    };

    const ref = contentRef.current;
    ref?.addEventListener('scroll', handleScroll);
    return () => ref?.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle dark mode for emergency section
  useEffect(() => {
    if (activeChapter === 'emergency') {
      setDarkMode(true);
    } else {
      setDarkMode(false);
    }
  }, [activeChapter]);

  // Handle room click from 3D model
  const handleRoomClick = (roomData) => {
    toast.success(`Navigating to ${roomData.name}`);
    scrollToChapter(roomData.section);
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-[#F9F9F9]'}`}>
      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 ${
          darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'
        } border-r transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h1 className={`text-2xl font-light tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                HOMEBASE
              </h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <p className={`text-xs font-medium tracking-widest uppercase mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                Property
              </p>
              <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>The Miller Residence</p>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Mill Valley, CA</p>
            </div>

            {/* Overall Completion */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Manual Completion</span>
                <span className="text-lg font-semibold text-gray-900">{overallCompletion}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallCompletion}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">{totalCompleted} of {totalItems} items documented</p>
            </div>
          </div>

          {/* Table of Contents */}
          <nav className="flex-1 overflow-y-auto p-4">
            <p className={`text-xs font-medium tracking-widest uppercase mb-4 px-4 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
              Table of Contents
            </p>
            <div className="space-y-1">
              {chapters.map((chapter) => {
                const completion = completionData[chapter.id];
                return (
                  <button
                    key={chapter.id}
                    onClick={() => scrollToChapter(chapter.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeChapter === chapter.id
                        ? darkMode
                          ? 'bg-slate-800 text-white'
                          : 'bg-blue-50 text-blue-600'
                        : darkMode
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <chapter.icon className="w-4.5 h-4.5" strokeWidth={1.5} />
                    <div className="flex-1">
                      <span className="font-medium text-sm">{chapter.label}</span>
                      {completion && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                completion.percentage === 100
                                  ? 'bg-green-500'
                                  : completion.percentage >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-orange-500'
                              }`}
                              style={{ width: `${completion.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{completion.percentage}%</span>
                        </div>
                      )}
                    </div>
                    {activeChapter === chapter.id && (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className={`p-6 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
            <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
              Last Updated: December 2024
            </p>
            <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'} mt-1`}>
              Data Version: 2024.1
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className={`${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'} border-b px-6 py-4 flex items-center justify-between`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`lg:hidden ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 flex justify-end gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className={`flex items-center gap-3 px-4 py-2 ${
                darkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-50 text-gray-600'
              } rounded-xl hover:bg-gray-100 transition-colors`}
            >
              <Search className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Ask HomeBase...</span>
              <kbd className="hidden md:inline-flex items-center px-2 py-0.5 text-xs bg-white border border-gray-200 rounded">
                ⌘K
              </kbd>
            </button>
            <button
              onClick={() => {
                setSelectedSection(activeChapter);
                setShowAddInfoModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <Info className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Add Info</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main
          ref={contentRef}
          className={`flex-1 overflow-y-auto ${darkMode ? 'bg-slate-900' : 'bg-[#F9F9F9]'}`}
        >
          <div className="max-w-5xl mx-auto px-6 py-12 space-y-20">
            {/* CHAPTER 0: 3D MODEL */}
            <section id="chapter-model3d" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Box className={`w-6 h-6 ${darkMode ? 'text-slate-300' : 'text-gray-900'}`} />
                  <div>
                    <h2 className={`text-3xl font-light tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Interactive 3D Model
                    </h2>
                    <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      Explore the digital twin of The Miller Residence
                    </p>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} rounded-3xl overflow-hidden border shadow-lg`}>
                  <div className="h-[600px] lg:h-[700px]">
                    <HouseModel3D onRoomClick={handleRoomClick} darkMode={darkMode} />
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                  {[
                    { name: 'Kitchen', color: 'bg-blue-600' },
                    { name: 'Living Room', color: 'bg-green-600' },
                    { name: 'Master Bedroom', color: 'bg-purple-600' },
                    { name: 'Garage', color: 'bg-slate-600' },
                    { name: 'Dining Room', color: 'bg-amber-600' },
                    { name: 'Bedroom 2', color: 'bg-pink-600' },
                  ].map((room) => (
                    <div
                      key={room.name}
                      className={`flex items-center gap-3 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-3 border ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}
                    >
                      <div className={`w-4 h-4 ${room.color} rounded`} />
                      <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {room.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* CHAPTER 1: VITALS */}
            <section id="chapter-vitals" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Activity className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <div>
                    <h2 className={`text-3xl font-light tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      System Vitals
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        All Systems Healthy
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataCard
                    icon={Wifi}
                    label="Network"
                    value="Redwood_Mesh_Pro"
                    note="Password: TreeHouse2026!"
                    copyValue="TreeHouse2026!"
                  >
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Source: Manual Entry</span>
                      </div>
                    </div>
                  </DataCard>

                  <DataCard icon={Key} label="Front Door Access" value="Yale Assure Lock" note="Code: 4821#">
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <CopyButton text="4821#" label="Door Code" />
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Source: Smart Lock App</span>
                      </div>
                    </div>
                  </DataCard>

                  <DataCard icon={Key} label="Garage Access" value="LiftMaster Opener" note="Code: 8900">
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <CopyButton text="8900" label="Garage Code" />
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span>Source: Owner Manual</span>
                      </div>
                    </div>
                  </DataCard>

                  <DataCard icon={Calendar} label="Service Schedule" value="Recurring Services">
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Trash Collection</span>
                        <span className="font-medium text-gray-900">Tuesday</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Gardener</span>
                        <span className="font-medium text-gray-900">Thursday</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Pool Service</span>
                        <span className="font-medium text-gray-900">Friday</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Source: HOA Schedule</span>
                      </div>
                    </div>
                  </DataCard>
                </div>
              </motion.div>
            </section>

            {/* CHAPTER 1.5: PROPERTY DETAILS */}
            <section id="chapter-property" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Home className={`w-6 h-6 ${darkMode ? 'text-slate-300' : 'text-gray-900'}`} />
                  <h2 className={`text-3xl font-light tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Property Overview
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4">
                      Property Information
                    </h3>
                    <div className="space-y-3">
                      <SpecRow label="Year Built" value="1987" />
                      <SpecRow label="Total Square Feet" value="2,847 sq ft" />
                      <SpecRow label="Lot Size" value="0.31 acres (13,504 sq ft)" />
                      <SpecRow label="Bedrooms" value="4" />
                      <SpecRow label="Bathrooms" value="3.5" />
                      <SpecRow label="Stories" value="2" />
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Source: County Records & Appraisal</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4">
                      Property Tax & Legal
                    </h3>
                    <div className="space-y-3">
                      <SpecRow label="Parcel Number" value="046-231-18" />
                      <SpecRow label="Property Tax" value="$12,847/year" />
                      <SpecRow label="Last Sale Date" value="June 2019" />
                      <SpecRow label="Last Sale Price" value="$1,850,000" />
                      <SpecRow label="Zoning" value="R-1 (Single Family)" />
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Source: Public Records</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* CHAPTER 2: SPACES */}
            <section id="chapter-spaces" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Layout className={`w-6 h-6 ${darkMode ? 'text-slate-300' : 'text-gray-900'}`} />
                  <h2 className={`text-3xl font-light tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Room Specifications
                  </h2>
                </div>

                {/* Kitchen Detail */}
                <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
                  {/* Hero Image */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80"
                      alt="Kitchen"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2">
                      <p className="text-sm font-semibold text-gray-900">Kitchen</p>
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    {/* Dimensions */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Ruler className="w-4.5 h-4.5 text-gray-600" />
                        <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase">
                          Dimensions
                        </h3>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <SpecRow label="Floor Plan" value={`16' 4" × 18' 2"`} sublabel="Measured wall-to-wall" />
                        <SpecRow label="Ceiling Height" value={`9' 6"`} sublabel="Standard height" />
                        <SpecRow label="Square Footage" value="~297 sq ft" sublabel="Calculated area" />
                        <SpecRow label="Data Source" value="LiDAR Scan" sublabel="Accuracy: ±0.5 inch" />
                      </div>
                    </div>

                    {/* Windows */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-4.5 h-4.5 text-gray-600" />
                        <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase">
                          Windows
                        </h3>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <SpecRow label="Type" value="2× Casement" sublabel="Milgard Tuscany Series" />
                        <SpecRow label="Rough Opening" value={`36"w × 48"h`} sublabel="Frame dimensions" />
                        <SpecRow label="Daylight Opening" value={`32"w × 44"h`} sublabel="Visible glass" />
                      </div>
                    </div>

                    {/* Flooring */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4.5 h-4.5 text-gray-600" />
                        <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase">
                          Flooring
                        </h3>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <SpecRow label="Material" value="White Oak" sublabel="Engineered hardwood" />
                        <SpecRow label="Plank Width" value={`7"`} sublabel="Wide plank style" />
                        <SpecRow label="Finish" value="Matte" sublabel="Low-sheen protective coating" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* CHAPTER 3: AESTHETICS */}
            <section id="chapter-aesthetics" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Palette className={`w-6 h-6 ${darkMode ? 'text-slate-300' : 'text-gray-900'}`} />
                  <h2 className={`text-3xl font-light tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Paint & Finishes
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Paint Schedule */}
                  <div className="bg-white rounded-3xl p-8 border border-gray-100">
                    <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-6">
                      Paint Schedule
                    </h3>
                    <div className="space-y-4">
                      {/* Walls */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-16 h-16 rounded-xl bg-[#F5F5F0] border-2 border-gray-200 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Wall Color</p>
                          <p className="text-base font-semibold text-gray-900 mt-0.5">
                            Benjamin Moore "Chantilly Lace"
                          </p>
                          <p className="text-xs text-gray-500 mt-1">OC-65 · Pure White</p>
                        </div>
                      </div>

                      {/* Trim */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-16 h-16 rounded-xl bg-[#F3F2ED] border-2 border-gray-200 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Trim & Molding</p>
                          <p className="text-base font-semibold text-gray-900 mt-0.5">
                            Benjamin Moore "White Dove"
                          </p>
                          <p className="text-xs text-gray-500 mt-1">OC-17 · Soft White</p>
                        </div>
                      </div>

                      {/* Accent */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-16 h-16 rounded-xl bg-[#0B3142] border-2 border-gray-200 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Accent Color</p>
                          <p className="text-base font-semibold text-gray-900 mt-0.5">
                            Farrow & Ball "Hague Blue"
                          </p>
                          <p className="text-xs text-gray-500 mt-1">No. 30 · Deep Navy</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hardware & Materials */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Settings className="w-4.5 h-4.5 text-gray-600" />
                        <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase">
                          Cabinet Hardware
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <SpecRow label="Brand" value="Rejuvenation" />
                        <SpecRow label="Finish" value="Unlacquered Brass" />
                        <SpecRow label="Centers" value={`4"`} />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4.5 h-4.5 text-gray-600" />
                        <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase">
                          Backsplash
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <SpecRow label="Manufacturer" value="Fireclay Tile" />
                        <SpecRow label="Size" value={`3" × 6" Subway`} />
                        <SpecRow label="Color" value="Oyster White" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* CHAPTER 4: APPLIANCES */}
            <section id="chapter-appliances" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Settings className={`w-6 h-6 ${darkMode ? 'text-slate-300' : 'text-gray-900'}`} />
                  <h2 className={`text-3xl font-light tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Appliances & Equipment
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Refrigerator */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Settings className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Refrigerator</h3>
                        <p className="text-gray-600">Sub-Zero BI-42U Built-In</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-600 font-medium">Active Warranty</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Model</p>
                        <p className="font-medium text-gray-900">BI-42UFD/S/TH</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Installed</p>
                        <p className="font-medium text-gray-900">March 2021</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Warranty Until</p>
                        <p className="font-medium text-gray-900">March 2026</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Serial Number</p>
                        <p className="font-medium text-gray-900 font-mono text-xs">20210312847</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Source: Purchase Receipt & Warranty Card</span>
                    </div>
                  </div>

                  {/* Dishwasher */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center">
                        <Droplets className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Dishwasher</h3>
                        <p className="text-gray-600">Bosch 800 Series</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-yellow-600 font-medium">No Warranty Info</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Model</p>
                        <p className="font-medium text-gray-900">SHPM88Z75N</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Installed</p>
                        <p className="font-medium text-gray-900">Approx. 2020</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Finish</p>
                        <p className="font-medium text-gray-900">Stainless Steel</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Noise Level</p>
                        <p className="font-medium text-gray-900">42 dB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span>Source: Visual Inspection (Missing documentation)</span>
                    </div>
                  </div>

                  {/* Range/Oven */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                        <Flame className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Range & Oven</h3>
                        <p className="text-gray-600">Wolf 36" Dual Fuel Range</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-600 font-medium">Under Warranty</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Model</p>
                        <p className="font-medium text-gray-900">DF366</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Installed</p>
                        <p className="font-medium text-gray-900">January 2022</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">BTU Rating</p>
                        <p className="font-medium text-gray-900">20,000 BTU</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fuel Type</p>
                        <p className="font-medium text-gray-900">Gas + Electric</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Source: Purchase Invoice & Installation Photos</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* CHAPTER 5: MECHANICAL */}
            <section id="chapter-mechanical" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Wrench className={`w-6 h-6 ${darkMode ? 'text-slate-300' : 'text-gray-900'}`} />
                  <h2 className={`text-3xl font-light tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Mechanical Systems
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Water Heater */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Droplets className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Water Heater</h3>
                        <p className="text-gray-600 mb-3">Rheem Performance Platinum · 50 Gallon</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Installed</p>
                            <p className="font-medium text-gray-900">2023</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Serial Number</p>
                            <p className="font-mono text-gray-900">A492194</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>Source: Installation Invoice</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plumbing */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Droplets className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Plumbing Material</h3>
                        <p className="text-gray-600 mb-3">Copper Type L</p>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Water Meter Location</span>
                            <MapPin className="w-4 h-4 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            Front Curb · 4ft from driveway
                          </p>
                          <p className="text-xs text-gray-500 font-mono mt-1">
                            GPS: 37.9000° N, -122.5000° W
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gas Line */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Flame className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Gas Service</h3>
                        <p className="text-gray-600 mb-3">Main shutoff on North Wall</p>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-gray-900 font-medium">Seismic Valve Installed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Internet/Fiber */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Wifi className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Fiber Internet</h3>
                        <p className="text-gray-600 mb-3">ONT Entry Point</p>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm font-medium text-gray-900">
                            Master Closet · Shelf B
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Optical Network Terminal location
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* CHAPTER 6: LANDSCAPE */}
            <section id="chapter-landscape" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Trees className={`w-6 h-6 ${darkMode ? 'text-slate-300' : 'text-gray-900'}`} />
                  <h2 className={`text-3xl font-light tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Landscape & Plants
                  </h2>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                  <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4">
                    Tree Inventory
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Trees className="w-5 h-5 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Coast Redwood (3)</h4>
                        <p className="text-sm text-gray-600 mt-1">Front Yard · Planted 1987</p>
                        <p className="text-xs text-gray-500 mt-1">Height: 65-70 ft · Health: Excellent</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-yellow-600">Needs Documentation</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Trees className="w-5 h-5 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Japanese Maple (2)</h4>
                        <p className="text-sm text-gray-600 mt-1">Back Yard · Planted 2015</p>
                        <p className="text-xs text-gray-500 mt-1">Height: 12-15 ft · Health: Good</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-yellow-600">Missing Photos</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span>Source: Partial - Needs arborist report</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* CHAPTER 7: EXTERIOR */}
            <section id="chapter-exterior" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Building2 className={`w-6 h-6 ${darkMode ? 'text-slate-300' : 'text-gray-900'}`} />
                  <h2 className={`text-3xl font-light tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Exterior Envelope
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4">
                      Gutters & Drainage
                    </h3>
                    <div className="space-y-3">
                      <SpecRow label="Gutter Type" value={`Seamless Aluminum (5")`} />
                      <SpecRow label="Downspouts" value="French Drain System" />
                      <SpecRow label="Drainage" value="Exits to street" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4">
                      Roofing
                    </h3>
                    <div className="space-y-3">
                      <SpecRow label="Material" value="Asphalt Shingle" />
                      <SpecRow label="Brand" value="GAF Timberline" />
                      <SpecRow label="Installed" value="2018" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-100 md:col-span-2">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Trees className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Irrigation System</h3>
                        <p className="text-gray-600 mb-4">Hunter X-Core Controller</p>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 mb-1">Zone 1</p>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="font-medium text-gray-900">Active</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Zone 2</p>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="font-medium text-gray-900">Active</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Zone 3</p>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="font-medium text-gray-900">Active</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Zone 4</p>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="font-medium text-gray-900">Active</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-3">
                            Controller Location: Garage Wall
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* CHAPTER 8: SMART SYSTEMS */}
            <section id="chapter-systems" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Zap className={`w-6 h-6 ${darkMode ? 'text-slate-300' : 'text-gray-900'}`} />
                  <h2 className={`text-3xl font-light tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Smart Home Systems
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Security System</h3>
                    <div className="space-y-3">
                      <SpecRow label="Provider" value="ADT Pulse" />
                      <SpecRow label="Control Panel" value="Kitchen Entrance" />
                      <SpecRow label="Master Code" value="****" sublabel="Contact owner for code" />
                      <SpecRow label="Monitoring" value="24/7 Active" />
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Source: Security Contract</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Smart Thermostat</h3>
                    <div className="space-y-3">
                      <SpecRow label="Brand" value="Nest Learning Thermostat" />
                      <SpecRow label="Location" value="Hallway, Main Floor" />
                      <SpecRow label="WiFi Connected" value="Yes" />
                      <SpecRow label="App Control" value="Nest App" />
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Source: Installation Record</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* CHAPTER 9: EMERGENCY */}
            <section id="chapter-emergency" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <div>
                      <h2 className="text-3xl font-light tracking-tight text-white">
                        Emergency Shutoffs
                      </h2>
                      <p className="text-red-400 text-sm mt-1">Critical system access points</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Call */}
                <a
                  href="tel:911"
                  className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl mb-8 transition-colors font-semibold"
                >
                  <Phone className="w-5 h-5" />
                  Emergency: Call 911
                </a>

                {/* Shutoff Points */}
                <div className="space-y-4">
                  {/* Water Main */}
                  <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Droplets className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">Water Main Shutoff</h3>
                        <p className="text-slate-300 mb-2">Front Yard · Blue Lid</p>
                        <p className="text-sm text-slate-400">
                          Turn valve clockwise to close. Located near street curb.
                        </p>
                        <button className="mt-4 flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl transition-colors text-sm">
                          <MapPin className="w-4 h-4" />
                          Show Location
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Gas Shutoff */}
                  <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Flame className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">Gas Main Shutoff</h3>
                        <p className="text-slate-300 mb-2">North Wall · Wrench Attached</p>
                        <p className="text-sm text-slate-400">
                          Turn valve perpendicular to pipe. Wrench stored on chain.
                        </p>
                        <button className="mt-4 flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl transition-colors text-sm">
                          <MapPin className="w-4 h-4" />
                          Show Location
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Electrical Panel */}
                  <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Zap className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">Electrical Panel</h3>
                        <p className="text-slate-300 mb-2">Garage · Panel A</p>
                        <p className="text-sm text-slate-400">
                          Main breaker located top left. Flip down to disconnect.
                        </p>
                        <button className="mt-4 flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl transition-colors text-sm">
                          <MapPin className="w-4 h-4" />
                          Show Location
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="mt-8">
                  <h3 className="text-xs font-medium text-slate-500 tracking-widest uppercase mb-4">
                    Emergency Service Providers
                  </h3>
                  <div className="space-y-3">
                    {[
                      { service: 'Plumber', company: 'Mill Valley Plumbing', phone: '(415) 555-0123' },
                      { service: 'Electrician', company: 'Bay Electric Services', phone: '(415) 555-0456' },
                      { service: 'HVAC', company: 'Climate Control Pro', phone: '(415) 555-0789' },
                    ].map((contact, i) => (
                      <a
                        key={i}
                        href={`tel:${contact.phone.replace(/\D/g, '')}`}
                        className="flex items-center justify-between bg-slate-800 rounded-2xl p-4 border border-slate-700 hover:bg-slate-750 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-white">{contact.service}</p>
                          <p className="text-sm text-slate-400">{contact.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-400 text-sm font-mono">{contact.phone}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>
          </div>
        </main>
      </div>

      {/* Add Info Modal */}
      <AddInfoModal
        isOpen={showAddInfoModal}
        onClose={() => setShowAddInfoModal(false)}
        section={selectedSection}
      />

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-32 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 p-6 border-b border-gray-100">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ask HomeBase anything..."
                  className="flex-1 text-lg outline-none text-gray-900 placeholder:text-gray-400"
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-3 px-2">
                  Popular Queries
                </p>
                <div className="space-y-1">
                  {[
                    'Where is the water shutoff?',
                    'What paint color is on the walls?',
                    'When was the roof installed?',
                    'What is the WiFi password?',
                  ].map((query, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl text-gray-700 transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
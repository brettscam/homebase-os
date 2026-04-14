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
import FuseBoxDiagram from '../components/house/FuseBoxDiagram';
import { useProperty } from '@/lib/PropertyContext';
import { systemsArrayToLegacy } from '@/lib/supabaseDataStore';

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
  const { activeProperty, homeData: supaData, refreshProperties } = useProperty();
  const [activeChapter, setActiveChapter] = useState('model3d');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showAddInfoModal, setShowAddInfoModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const contentRef = useRef(null);

  // Build real data references
  const property = activeProperty || {};
  const rooms = supaData?.rooms || [];
  const appliances = supaData?.appliances || [];
  const systems = supaData?.systems || [];
  const legacySystems = systemsArrayToLegacy(systems);
  const paintRecords = supaData?.paintRecords || [];
  const emergencyInfo = supaData?.emergencyInfo || [];
  const smartHome = supaData?.smartHome || [];
  const exterior = supaData?.exterior || [];
  const contacts = supaData?.contacts || [];
  const documents = supaData?.documents || [];

  // Dynamic completion tracking
  const completionData = {
    vitals: { completed: smartHome.length > 0 ? smartHome.length : 0, total: 4, percentage: Math.min(100, Math.round((smartHome.length / 4) * 100)) },
    spaces: { completed: rooms.length, total: Math.max(rooms.length, 1), percentage: rooms.length > 0 ? 100 : 0 },
    aesthetics: { completed: paintRecords.length, total: Math.max(paintRecords.length, 1), percentage: paintRecords.length > 0 ? 100 : 0 },
    mechanical: { completed: systems.length, total: 4, percentage: Math.min(100, Math.round((systems.length / 4) * 100)) },
    exterior: { completed: exterior.length, total: 3, percentage: Math.min(100, Math.round((exterior.length / 3) * 100)) },
    appliances: { completed: appliances.length, total: Math.max(appliances.length, 1), percentage: appliances.length > 0 ? 100 : 0 },
    systems: { completed: systems.length, total: Math.max(systems.length, 1), percentage: systems.length > 0 ? 100 : 0 },
    landscape: { completed: 0, total: 1, percentage: 0 },
    documents: { completed: documents.length, total: Math.max(documents.length, 1), percentage: documents.length > 0 ? 100 : 0 },
    emergency: { completed: emergencyInfo.length, total: 3, percentage: Math.min(100, Math.round((emergencyInfo.length / 3) * 100)) },
  };

  const totalCompleted = Object.values(completionData).reduce((sum, item) => sum + item.completed, 0);
  const totalItems = Object.values(completionData).reduce((sum, item) => sum + item.total, 0);
  const overallCompletion = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  const chapters = [
    { id: 'vitals', label: 'Property Overview', icon: Activity },
    { id: 'model3d', label: '3D Floor Plan', icon: Box },
    { id: 'spaces', label: 'Rooms & Spaces', icon: Layout },
    { id: 'appliances', label: 'Appliances', icon: Settings },
    { id: 'mechanical', label: 'Mechanical', icon: Wrench },
    { id: 'systems', label: 'Smart Systems', icon: Zap },
    { id: 'aesthetics', label: 'Paint & Finishes', icon: Palette },
    { id: 'exterior', label: 'Exterior', icon: Building2 },
    { id: 'landscape', label: 'Landscape', icon: Trees },
    { id: 'documents', label: 'Documents', icon: Info },
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
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-[#F9F9F9]'}`}>
      {/* Chapter Navigation Strip */}
      <div className={`sticky top-[3.5rem] z-30 ${darkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-gray-100'} backdrop-blur-xl border-b`}>
        <div className="flex items-center gap-2 px-4 py-2">
          {/* Completion Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg mr-2 ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
            <div className="w-6 h-6 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke={darkMode ? '#334155' : '#e5e7eb'} strokeWidth="2" />
                <circle cx="12" cy="12" r="10" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"
                  strokeDasharray={`${overallCompletion * 0.628} 62.8`}
                />
              </svg>
            </div>
            <span className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{overallCompletion}%</span>
          </div>

          {/* Scrollable Chapter Tabs */}
          <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => scrollToChapter(chapter.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeChapter === chapter.id
                    ? darkMode
                      ? 'bg-slate-700 text-white'
                      : 'bg-blue-50 text-blue-600'
                    : darkMode
                    ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <chapter.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{chapter.label}</span>
              </button>
            ))}
          </div>

          {/* Add Info Button */}
          <button
            onClick={() => {
              setSelectedSection(activeChapter);
              setShowAddInfoModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs font-medium ml-2"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Info</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <main
        ref={contentRef}
        className={`${darkMode ? 'bg-slate-900' : 'bg-[#F9F9F9]'}`}
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
                      Interactive Property Map
                    </h2>
                    <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      Aerial view of property with emergency shutoff locations
                    </p>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} rounded-3xl overflow-hidden border shadow-lg`}>
                  <div className="h-[600px] lg:h-[700px]">
                    <HouseModel3D
                      onRoomClick={handleRoomClick}
                      darkMode={darkMode}
                      property={property}
                      rooms={rooms}
                      emergencyInfo={emergencyInfo}
                      systems={systems}
                    />
                  </div>
                </div>

                {/* Emergency Legend */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                  {(() => {
                    const legendItems = [
                      { name: 'Water Shutoff', color: 'bg-blue-500' },
                      { name: 'Gas Shutoff', color: 'bg-orange-500' },
                      { name: 'Electrical Panel', color: 'bg-yellow-500' },
                      { name: 'Water Heater', color: 'bg-cyan-500' },
                    ];
                    return legendItems.map((item) => {
                      const info = emergencyInfo.find(e => e.type?.toLowerCase().includes(item.name.split(' ')[0].toLowerCase()));
                      const desc = info?.location || 'Location not set';
                      return (
                        <div
                          key={item.name}
                          className={`flex items-center gap-3 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-3 border ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}
                        >
                          <div className={`w-4 h-4 ${item.color} rounded-full`} />
                          <div>
                            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.name}
                            </span>
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{desc}</p>
                          </div>
                        </div>
                      );
                    });
                  })()}
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
                  {(() => {
                    const wifiDevice = smartHome.find(d => d.type === 'wifi' || d.name?.toLowerCase().includes('wifi'));
                    const wifiName = wifiDevice?.data?.network_name || wifiDevice?.name || 'Not set';
                    const wifiPass = wifiDevice?.data?.password || '';
                    return (
                      <DataCard
                        icon={Wifi}
                        label="Network"
                        value={wifiName}
                        note={wifiPass ? `Password: ${wifiPass}` : 'Add in settings'}
                        copyValue={wifiPass}
                      >
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className={`w-2 h-2 ${wifiDevice ? 'bg-green-500' : 'bg-gray-300'} rounded-full`} />
                            <span>{wifiDevice ? 'Source: Manual Entry' : 'Not configured'}</span>
                          </div>
                        </div>
                      </DataCard>
                    );
                  })()}

                  {(() => {
                    const lockDevice = smartHome.find(d => d.type === 'door_lock' || d.name?.toLowerCase().includes('lock') || d.name?.toLowerCase().includes('door'));
                    const lockName = lockDevice?.data?.brand ? `${lockDevice.data.brand} ${lockDevice.data.model || ''}`.trim() : lockDevice?.name || 'Not set';
                    const lockCode = lockDevice?.data?.code || '';
                    return (
                      <DataCard icon={Key} label="Front Door Access" value={lockName} note={lockCode ? `Code: ${lockCode}` : 'Add in settings'}>
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          {lockCode && <CopyButton text={lockCode} label="Door Code" />}
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className={`w-2 h-2 ${lockDevice ? 'bg-green-500' : 'bg-gray-300'} rounded-full`} />
                            <span>{lockDevice ? 'Source: Smart Lock App' : 'Not configured'}</span>
                          </div>
                        </div>
                      </DataCard>
                    );
                  })()}

                  {(() => {
                    const garageDevice = smartHome.find(d => d.type === 'garage' || d.name?.toLowerCase().includes('garage'));
                    const garageName = garageDevice?.data?.brand ? `${garageDevice.data.brand} Opener` : garageDevice?.name || 'Not set';
                    const garageCode = garageDevice?.data?.code || '';
                    return (
                      <DataCard icon={Key} label="Garage Access" value={garageName} note={garageCode ? `Code: ${garageCode}` : 'Add in settings'}>
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          {garageCode && <CopyButton text={garageCode} label="Garage Code" />}
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className={`w-2 h-2 ${garageDevice ? 'bg-yellow-500' : 'bg-gray-300'} rounded-full`} />
                            <span>{garageDevice ? 'Source: Owner Manual' : 'Not configured'}</span>
                          </div>
                        </div>
                      </DataCard>
                    );
                  })()}

                  <DataCard icon={Calendar} label="Contacts & Services" value={`${contacts.length} contact${contacts.length !== 1 ? 's' : ''} saved`}>
                    <div className="mt-3 space-y-2">
                      {contacts.length === 0 ? (
                        <p className="text-sm text-gray-400">No service contacts yet. Add them on the Contacts page.</p>
                      ) : (
                        contacts.slice(0, 3).map(c => (
                          <div key={c.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{c.name}</span>
                            <span className="font-medium text-gray-900">{c.trade || c.company || ''}</span>
                          </div>
                        ))
                      )}
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
                      <SpecRow label="Address" value={property.address || 'Not set'} />
                      <SpecRow label="Year Built" value={property.year_built || 'Not set'} />
                      <SpecRow label="Total Square Feet" value={property.sqft ? `${property.sqft} sq ft` : 'Not set'} />
                      <SpecRow label="Lot Size" value={property.lot_size || 'Not set'} />
                      <SpecRow label="Bedrooms" value={property.bedrooms || 'Not set'} />
                      <SpecRow label="Bathrooms" value={property.bathrooms || 'Not set'} />
                      <SpecRow label="Stories" value={property.stories || 'Not set'} />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4">
                      Location
                    </h3>
                    <div className="space-y-3">
                      <SpecRow label="City" value={property.city || 'Not set'} />
                      <SpecRow label="State" value={property.state || 'Not set'} />
                      <SpecRow label="ZIP" value={property.zip || 'Not set'} />
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
                    Rooms & Spaces
                  </h2>
                </div>

                {rooms.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                    <Layout className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-hb-navy font-medium mb-1">No rooms added yet</p>
                    <p className="text-sm text-gray-500">Add rooms during onboarding or use Homer to process a floor plan.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rooms.map((room) => (
                      <div key={room.id} className="bg-white rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-hb-teal-50 flex items-center justify-center">
                            <Home className="w-5 h-5 text-hb-teal" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                            <p className="text-xs text-gray-500">
                              {[room.type, room.floor && `Floor ${room.floor}`, room.sqft && `${room.sqft} sq ft`].filter(Boolean).join(' \u00B7 ') || 'No details yet'}
                            </p>
                          </div>
                        </div>
                        {room.notes && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-600">{room.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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

                {paintRecords.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                    <Palette className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-hb-navy font-medium mb-1">No paint records yet</p>
                    <p className="text-sm text-gray-500">Add paint colors and finishes to track them here.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-8 border border-gray-100">
                    <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-6">
                      Paint Schedule
                    </h3>
                    <div className="space-y-4">
                      {paintRecords.map((p) => (
                        <div key={p.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                          <div
                            className="w-16 h-16 rounded-xl border-2 border-gray-200 flex-shrink-0"
                            style={{ backgroundColor: p.color_hex || '#e5e7eb' }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{p.room_name || 'Room'}</p>
                            <p className="text-base font-semibold text-gray-900 mt-0.5">
                              {[p.brand, p.color_name && `"${p.color_name}"`].filter(Boolean).join(' ') || 'Unknown color'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {[p.color_hex, p.finish].filter(Boolean).join(' \u00B7 ')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

                {appliances.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                    <Settings className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-hb-navy font-medium mb-1">No appliances logged yet</p>
                    <p className="text-sm text-gray-500">Add appliances during onboarding or upload photos to Homer.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appliances.map((a) => (
                      <div key={a.id} className="bg-white rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Settings className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{a.name || a.type || 'Appliance'}</h3>
                            <p className="text-gray-600">{[a.brand, a.model].filter(Boolean).join(' ') || 'No brand/model'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {a.model && <div><p className="text-xs text-gray-500">Model</p><p className="font-medium text-gray-900">{a.model}</p></div>}
                          {a.install_date && <div><p className="text-xs text-gray-500">Installed</p><p className="font-medium text-gray-900">{a.install_date}</p></div>}
                          {a.serial_number && <div><p className="text-xs text-gray-500">Serial Number</p><p className="font-medium text-gray-900 font-mono text-xs">{a.serial_number}</p></div>}
                          {a.type && <div><p className="text-xs text-gray-500">Type</p><p className="font-medium text-gray-900 capitalize">{a.type}</p></div>}
                        </div>
                        {a.notes && <p className="text-sm text-gray-500 mt-3">{a.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
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

                {systems.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                    <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-hb-navy font-medium mb-1">No mechanical systems logged yet</p>
                    <p className="text-sm text-gray-500">Add HVAC, plumbing, electrical, and water heater info to track them here.</p>
                  </div>
                ) : (
                  <>
                    {/* Electrical Panel */}
                    {legacySystems.electrical && (
                      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-4">
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Zap className="w-7 h-7 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Electrical Panel</h3>
                            <p className="text-gray-600 mb-2">{legacySystems.electrical.location || 'Location not set'}</p>
                            <p className="text-sm text-gray-500">
                              {[legacySystems.electrical.amperage && `${legacySystems.electrical.amperage}A`, legacySystems.electrical.panel_type].filter(Boolean).join(' · ') || 'No details'}
                            </p>
                          </div>
                        </div>
                        <FuseBoxDiagram darkMode={false} electricalData={legacySystems.electrical} />
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Water Heater */}
                      {legacySystems.waterHeater && (
                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Droplets className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">Water Heater</h3>
                              <p className="text-gray-600 mb-3">
                                {[legacySystems.waterHeater.brand, legacySystems.waterHeater.model, legacySystems.waterHeater.capacity].filter(Boolean).join(' · ') || 'No details'}
                              </p>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {legacySystems.waterHeater.install_year && (
                                  <div>
                                    <p className="text-gray-500">Installed</p>
                                    <p className="font-medium text-gray-900">{legacySystems.waterHeater.install_year}</p>
                                  </div>
                                )}
                                {legacySystems.waterHeater.serial_number && (
                                  <div>
                                    <p className="text-gray-500">Serial Number</p>
                                    <p className="font-mono text-gray-900">{legacySystems.waterHeater.serial_number}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Plumbing */}
                      {legacySystems.plumbing && (
                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Droplets className="w-6 h-6 text-cyan-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">Plumbing</h3>
                              <p className="text-gray-600 mb-3">{legacySystems.plumbing.material || legacySystems.plumbing.type || 'No details'}</p>
                              {legacySystems.plumbing.notes && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <p className="text-sm text-gray-600">{legacySystems.plumbing.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* HVAC */}
                      {legacySystems.hvac && (
                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Wind className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">HVAC System</h3>
                              <p className="text-gray-600 mb-3">
                                {[legacySystems.hvac.brand, legacySystems.hvac.model, legacySystems.hvac.type].filter(Boolean).join(' · ') || 'No details'}
                              </p>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {legacySystems.hvac.install_year && (
                                  <div>
                                    <p className="text-gray-500">Installed</p>
                                    <p className="font-medium text-gray-900">{legacySystems.hvac.install_year}</p>
                                  </div>
                                )}
                                {legacySystems.hvac.last_service && (
                                  <div>
                                    <p className="text-gray-500">Last Service</p>
                                    <p className="font-medium text-gray-900">{legacySystems.hvac.last_service}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
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

                <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                  <Trees className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-hb-navy font-medium mb-1">No landscape data yet</p>
                  <p className="text-sm text-gray-500">Upload a landscape plan or describe your yard to Homer to get started.</p>
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

                {exterior.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                    <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-hb-navy font-medium mb-1">No exterior data yet</p>
                    <p className="text-sm text-gray-500">Add roofing, gutters, siding, and other exterior details here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exterior.map((item) => (
                      <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-100">
                        <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4">
                          {item.name || item.type || 'Exterior Feature'}
                        </h3>
                        <div className="space-y-3">
                          {item.material && <SpecRow label="Material" value={item.material} />}
                          {item.brand && <SpecRow label="Brand" value={item.brand} />}
                          {item.install_date && <SpecRow label="Installed" value={item.install_date} />}
                          {item.condition && <SpecRow label="Condition" value={item.condition} />}
                          {item.notes && <SpecRow label="Notes" value={item.notes} />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

                {smartHome.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                    <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-hb-navy font-medium mb-1">No smart home devices yet</p>
                    <p className="text-sm text-gray-500">Add smart devices, security systems, and connected home info here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {smartHome.map((device) => (
                      <div key={device.id} className="bg-white rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Zap className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{device.name || device.type || 'Smart Device'}</h3>
                            <p className="text-gray-600 mb-3">
                              {[device.data?.brand, device.data?.model].filter(Boolean).join(' · ') || device.type || 'No details'}
                            </p>
                            {device.data && (
                              <div className="space-y-2 text-sm">
                                {Object.entries(device.data).filter(([k]) => !['brand', 'model', 'password', 'code'].includes(k)).map(([key, val]) => (
                                  <SpecRow key={key} label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} value={String(val)} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </section>

            {/* CHAPTER 9: DOCUMENTS */}
            <section id="chapter-documents" className="scroll-mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Info className={`w-6 h-6 ${darkMode ? 'text-slate-300' : 'text-gray-900'}`} />
                  <h2 className={`text-3xl font-light tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Document Management Hub
                  </h2>
                </div>

                {documents.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                    <Info className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-hb-navy font-medium mb-1">No documents uploaded yet</p>
                    <p className="text-sm text-gray-500">Upload appraisals, inspections, warranties, and other home documents. Homer can extract data from them automatically.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      All Documents
                    </h3>
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => doc.file_url && window.open(doc.file_url, '_blank')}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Info className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doc.name || doc.type || 'Document'}</p>
                              <p className="text-sm text-gray-500">
                                {[doc.type, doc.source, doc.created_at && new Date(doc.created_at).toLocaleDateString()].filter(Boolean).join(' · ')}
                              </p>
                            </div>
                          </div>
                          {doc.file_url && <ExternalLink className="w-4 h-4 text-gray-400" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </section>

            {/* CHAPTER 10: EMERGENCY */}
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
                {emergencyInfo.length === 0 ? (
                  <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
                    <AlertTriangle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-white font-medium mb-1">No emergency shutoff locations set</p>
                    <p className="text-sm text-slate-400">Add water, gas, and electrical shutoff locations so you can find them fast in an emergency.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {emergencyInfo.map((info) => {
                      const iconMap = {
                        water: { icon: Droplets, color: 'bg-blue-500' },
                        gas: { icon: Flame, color: 'bg-orange-500' },
                        electrical: { icon: Zap, color: 'bg-yellow-500' },
                      };
                      const typeKey = Object.keys(iconMap).find(k => info.type?.toLowerCase().includes(k));
                      const IconComp = typeKey ? iconMap[typeKey].icon : AlertTriangle;
                      const iconColor = typeKey ? iconMap[typeKey].color : 'bg-red-500';

                      return (
                        <div key={info.id} className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 ${iconColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                              <IconComp className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white mb-1">{info.name || info.type || 'Emergency Shutoff'}</h3>
                              <p className="text-slate-300 mb-2">{info.location || 'Location not set'}</p>
                              {info.instructions && (
                                <p className="text-sm text-slate-400">{info.instructions}</p>
                              )}
                              {info.notes && (
                                <p className="text-sm text-slate-400 mt-1">{info.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Show fuse box if electrical system exists */}
                    {legacySystems.electrical && (
                      <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Zap className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">Electrical Panel</h3>
                            <p className="text-slate-300 mb-2">{legacySystems.electrical.location || 'Location not set'}</p>
                            <p className="text-sm text-slate-400">
                              {[legacySystems.electrical.amperage && `${legacySystems.electrical.amperage}A`, legacySystems.electrical.panel_type].filter(Boolean).join(' · ') || 'No details'}
                            </p>
                          </div>
                        </div>
                        <FuseBoxDiagram darkMode={true} electricalData={legacySystems.electrical} />
                      </div>
                    )}
                  </div>
                )}

                {/* Emergency Contacts */}
                <div className="mt-8">
                  <h3 className="text-xs font-medium text-slate-500 tracking-widest uppercase mb-4">
                    Emergency Service Providers
                  </h3>
                  {(() => {
                    const emergencyContacts = contacts.filter(c =>
                      c.trade && ['plumber', 'plumbing', 'electrician', 'electrical', 'hvac', 'heating', 'cooling'].some(t => c.trade.toLowerCase().includes(t))
                    );
                    return emergencyContacts.length === 0 ? (
                      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center">
                        <p className="text-slate-400 text-sm">No emergency service contacts saved yet. Add plumber, electrician, or HVAC contacts on the Contacts page.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {emergencyContacts.map((contact) => (
                          <a
                            key={contact.id}
                            href={contact.phone ? `tel:${contact.phone.replace(/\D/g, '')}` : '#'}
                            className="flex items-center justify-between bg-slate-800 rounded-2xl p-4 border border-slate-700 hover:bg-slate-700 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-white">{contact.trade || 'Service Provider'}</p>
                              <p className="text-sm text-slate-400">{contact.name || contact.company || ''}</p>
                            </div>
                            {contact.phone && (
                              <div className="text-right">
                                <p className="text-blue-400 text-sm font-mono">{contact.phone}</p>
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            </section>
          </div>
        </main>

      {/* Add Info Modal */}
      <AddInfoModal
        isOpen={showAddInfoModal}
        onClose={() => setShowAddInfoModal(false)}
        section={selectedSection}
        propertyId={activeProperty?.id}
        onSave={refreshProperties}
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
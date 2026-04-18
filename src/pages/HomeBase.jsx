import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useProperty } from '@/lib/PropertyContext';
import { systemsArrayToLegacy } from '@/lib/supabaseDataStore';
import { HomeBaseLoader } from '@/components/HomeBaseLogo';
import {
  Home,
  Grid3X3,
  AlertTriangle,
  Wifi,
  Key,
  MapPin,
  ChevronRight,
  Book,
  Droplets,
  Flame,
  Zap,
  Phone,
  Ruler,
  Palette,
  Refrigerator,
  ArrowRight,
  Wrench,
  Shield,
  TrendingUp,
  Plug,
  CheckCircle2,
  Circle
} from 'lucide-react';

function useHomeData() {
  const { activeProperty, homeData: supaData, isLoading } = useProperty();

  if (isLoading) return { homeData: null, loading: true };

  if (activeProperty && supaData) {
    return {
      homeData: {
        property: {
          address: activeProperty.address || '',
          city: activeProperty.city || '',
          state: activeProperty.state || '',
          zip: activeProperty.zip || '',
          yearBuilt: activeProperty.year_built || '',
          sqft: activeProperty.sqft || '',
          lotSize: activeProperty.lot_size || '',
          stories: activeProperty.stories || '',
          bedrooms: activeProperty.bedrooms || '',
          bathrooms: activeProperty.bathrooms || '',
        },
        rooms: (supaData.rooms || []).map(r => ({
          id: r.id, name: r.name, type: r.type, floor: r.floor, sqft: r.sqft, notes: r.notes,
        })),
        appliances: (supaData.appliances || []).map(a => ({
          id: a.id, name: a.name, type: a.type, brand: a.brand, model: a.model,
          serialNumber: a.serial_number, installDate: a.install_date, notes: a.notes,
        })),
        systems: systemsArrayToLegacy(supaData.systems || []),
        smartHome: (() => {
          const devices = supaData.smartHome || [];
          const find = (...keywords) => devices.find(d =>
            keywords.some(k => (d.type || '').toLowerCase().includes(k) || (d.name || '').toLowerCase().includes(k))
          );
          const wifi = find('wifi', 'network');
          const lock = find('lock', 'door');
          const security = find('security', 'alarm');
          const garage = find('garage');
          return {
            wifi: { networkName: wifi?.data?.network_name || wifi?.name || '', password: wifi?.data?.password || '' },
            doorLocks: lock ? [{ brand: lock.data?.brand || '', code: lock.data?.code || '', location: lock.data?.location || '' }] : [],
            security: { provider: security?.data?.brand || '', panelLocation: security?.data?.location || '' },
            garage: { brand: garage?.data?.brand || '', code: garage?.data?.code || '' },
          };
        })(),
        emergency: (() => {
          const info = supaData.emergencyInfo || [];
          const find = (key) => info.find(i => (i.type || '').toLowerCase().includes(key) || (i.name || '').toLowerCase().includes(key)) || {};
          return {
            waterShutoff: { location: find('water').location || '', instructions: find('water').instructions || '' },
            gasShutoff: { location: find('gas').location || '', instructions: find('gas').instructions || '' },
            electricalPanel: { location: find('electric').location || '', instructions: find('electric').instructions || '' },
            contacts: supaData.contacts || [],
          };
        })(),
        exterior: (() => {
          const items = supaData.exterior || [];
          const find = (key) => items.find(i => (i.type || '').toLowerCase().includes(key) || (i.name || '').toLowerCase().includes(key)) || {};
          const roof = find('roof');
          const gutters = find('gutter');
          const siding = find('siding');
          return {
            roof: { type: roof.type || '', material: roof.material || '', installDate: roof.install_date || '' },
            gutters: { type: gutters.type || '', material: gutters.material || '' },
            siding: { material: siding.material || '' },
          };
        })(),
        paint: (supaData.paintRecords || []).map(p => ({
          id: p.id, room: p.room_name, colorName: p.color_name, colorCode: p.color_hex,
          brand: p.brand, finish: p.finish,
        })),
        contacts: supaData.contacts || [],
        utilities: supaData.utilities || [],
        documents: supaData.documents || [],
        onboardingComplete: activeProperty.onboarding_complete,
        lastUpdated: activeProperty.updated_at,
      },
      loading: false,
    };
  }

  return { homeData: null, loading: false };
}

// Progress item for the setup checklist
const ProgressItem = ({ label, done, icon: Icon }) => (
  <div className="flex items-center gap-3 py-2">
    {done
      ? <CheckCircle2 className="w-5 h-5 text-hb-teal flex-shrink-0" strokeWidth={1.5} />
      : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" strokeWidth={1.5} />
    }
    <span className={`text-sm ${done ? 'text-hb-navy' : 'text-hb-slate'}`}>{label}</span>
  </div>
);

// Quick access card
const QuickCard = ({ icon: Icon, title, value, subtitle, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-hb-teal-200 transition-colors"
  >
    <div className="w-10 h-10 rounded-xl bg-hb-teal-50 flex items-center justify-center mb-3">
      <Icon className="w-5 h-5 text-hb-teal" strokeWidth={1.5} />
    </div>
    <p className="text-xs font-medium text-hb-slate uppercase tracking-wider mb-1">{title}</p>
    <p className="text-lg font-semibold text-hb-navy">{value}</p>
    {subtitle && <p className="text-sm text-hb-slate mt-0.5">{subtitle}</p>}
  </motion.div>
);

// Navigation card linking to a page
const NavCard = ({ icon: Icon, title, description, to, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Link
      to={to}
      className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 hover:border-hb-teal-200 hover:shadow-sm transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-hb-teal-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-hb-teal" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-hb-navy">{title}</p>
        <p className="text-xs text-hb-slate mt-0.5">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-hb-teal transition-colors flex-shrink-0" strokeWidth={1.5} />
    </Link>
  </motion.div>
);


// Dashboard View
const DashboardView = () => {
  const { homeData, loading } = useHomeData();

  if (loading || !homeData) return <HomeBaseLoader message="Loading your home..." />;

  const hasProperty = homeData.property?.address;
  const hasRooms = homeData.rooms?.length > 0;
  const hasAppliances = homeData.appliances?.length > 0;
  const hasSystems = homeData.systems?.hvac?.brand || homeData.systems?.waterHeater?.brand;
  const hasContacts = homeData.contacts?.length > 0;
  const checks = [hasProperty, hasRooms, hasAppliances, hasSystems, hasContacts];
  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return (
    <div className="min-h-screen bg-hb-warm">
      <div className="px-6 pt-8 pb-12 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-semibold text-hb-navy tracking-tight mb-1">
            {hasProperty ? homeData.property.address : 'Welcome to HomeBase'}
          </h1>
          {hasProperty && (
            <p className="text-hb-slate">
              {[homeData.property.city, homeData.property.state].filter(Boolean).join(', ')}
              {homeData.property.sqft && ` \u00B7 ${homeData.property.sqft} sq ft`}
              {homeData.property.yearBuilt && ` \u00B7 Built ${homeData.property.yearBuilt}`}
            </p>
          )}
        </motion.div>

        {/* Setup Progress */}
        {pct < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-hb-navy">Home Setup</h2>
                <p className="text-sm text-hb-slate">{pct}% complete</p>
              </div>
              <Link
                to={createPageUrl('Onboarding')}
                className="flex items-center gap-2 px-4 py-2 bg-hb-teal text-white rounded-xl text-sm font-medium hover:bg-hb-teal-600 transition-colors"
              >
                Continue
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
              <motion.div
                className="bg-hb-teal rounded-full h-2"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-x-6">
              <ProgressItem label="Property details" done={!!hasProperty} icon={Home} />
              <ProgressItem label="Rooms added" done={hasRooms} icon={Grid3X3} />
              <ProgressItem label="Appliances logged" done={hasAppliances} icon={Refrigerator} />
              <ProgressItem label="Systems configured" done={!!hasSystems} icon={Wrench} />
              <ProgressItem label="Contacts saved" done={hasContacts} icon={Shield} />
            </div>
          </motion.div>
        )}

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-xs font-semibold text-hb-slate uppercase tracking-wider mb-3">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickCard
              icon={Wifi}
              title="WiFi"
              value={homeData.smartHome?.wifi?.networkName || 'Not set'}
              subtitle={homeData.smartHome?.wifi?.password || 'Add in Manual'}
              delay={0.25}
            />
            <QuickCard
              icon={Key}
              title="Access"
              value={homeData.smartHome?.doorLocks?.[0]?.code || 'Not set'}
              subtitle={homeData.smartHome?.doorLocks?.[0]?.location || 'Add in Manual'}
              delay={0.3}
            />
          </div>
        </motion.div>

        {/* Navigate */}
        <h3 className="text-xs font-semibold text-hb-slate uppercase tracking-wider mb-3">Explore</h3>
        <div className="space-y-3">
          <NavCard
            icon={Book}
            title="Home Manual"
            description="Complete specs, warranties, and documentation"
            to={createPageUrl('HomeBaseManual')}
            delay={0.35}
          />
          <NavCard
            icon={TrendingUp}
            title="Insights"
            description="Energy usage, system health, and savings"
            to={createPageUrl('Insights')}
            delay={0.4}
          />
          <NavCard
            icon={Wrench}
            title="Projects"
            description="Track repairs, upgrades, and contractor quotes"
            to={createPageUrl('Projects')}
            delay={0.45}
          />
          <NavCard
            icon={Plug}
            title="Integrations"
            description="Utility bills and connected services"
            to={createPageUrl('Integrations')}
            delay={0.5}
          />
        </div>
      </div>
    </div>
  );
};

// Room Detail View (placeholder)
const RoomDetailView = () => {
  const { homeData } = useHomeData();
  const rooms = homeData.rooms || [];

  return (
    <div className="min-h-screen bg-hb-warm">
      <div className="px-6 pt-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <h1 className="text-2xl font-semibold text-hb-navy tracking-tight mb-1">Rooms</h1>
          <p className="text-sm text-hb-slate">{rooms.length} room{rooms.length !== 1 ? 's' : ''} tracked</p>
        </motion.div>

        {rooms.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <Grid3X3 className="w-10 h-10 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-hb-navy font-medium mb-1">No rooms yet</p>
            <p className="text-sm text-hb-slate mb-4">Add rooms during onboarding or in the Manual.</p>
            <Link
              to={createPageUrl('HomeBaseManual')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-hb-teal text-white rounded-xl text-sm font-medium hover:bg-hb-teal-600 transition-colors"
            >
              Open Manual
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room, i) => (
              <motion.div
                key={room.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-hb-teal-50 flex items-center justify-center">
                    <Home className="w-5 h-5 text-hb-teal" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-hb-navy">{room.name}</p>
                    <p className="text-xs text-hb-slate">
                      {[room.type, room.floor && `Floor ${room.floor}`, room.sqft && `${room.sqft} sq ft`].filter(Boolean).join(' \u00B7 ')}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Emergency View
const EmergencyView = () => {
  const { homeData } = useHomeData();
  const emergencyItems = [
    { icon: Droplets, title: 'Water Main Shutoff', location: homeData.emergency?.waterShutoff?.location || 'Not set', detail: homeData.emergency?.waterShutoff?.instructions || 'Add location in Manual', color: 'bg-blue-500' },
    { icon: Flame, title: 'Gas Shutoff', location: homeData.emergency?.gasShutoff?.location || 'Not set', detail: homeData.emergency?.gasShutoff?.instructions || 'Add location in Manual', color: 'bg-orange-500' },
    { icon: Zap, title: 'Electrical Panel', location: homeData.emergency?.electricalPanel?.location || 'Not set', detail: homeData.emergency?.electricalPanel?.instructions || 'Add location in Manual', color: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="px-6 pt-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-red-500 uppercase tracking-wider">Emergency</p>
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Critical Shutoffs</h1>
        </motion.div>

        <motion.a
          href="tel:911"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl mb-8 transition-colors font-semibold"
        >
          <Phone className="w-5 h-5" strokeWidth={1.5} />
          Call 911
        </motion.a>

        <div className="space-y-4">
          {emergencyItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <item.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-slate-300">{item.location}</p>
                  <p className="text-sm text-slate-500 mt-1">{item.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-8 pb-8"
        >
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Emergency Contacts</h2>
          {(() => {
            const parseNotes = (n) => { try { return JSON.parse(n); } catch { return {}; } };
            const ec = (homeData.contacts || []).filter(c => parseNotes(c.notes)?.isEmergency);
            if (ec.length > 0) {
              return (
                <div className="space-y-3">
                  {ec.map((c) => (
                    <a
                      key={c.id}
                      href={c.phone ? `tel:${c.phone.replace(/\D/g, '')}` : '#'}
                      className="flex items-center justify-between bg-slate-800 rounded-2xl p-4 border border-slate-700"
                    >
                      <div>
                        <p className="font-medium text-white">{c.name}</p>
                        <p className="text-sm text-slate-400">{c.role || c.company || ''}</p>
                      </div>
                      <p className="text-blue-400 text-sm">{c.phone || 'No phone'}</p>
                    </a>
                  ))}
                </div>
              );
            }
            return (
              <div className="text-center py-6">
                <p className="text-slate-400 text-sm">No emergency contacts yet.</p>
                <p className="text-slate-500 text-xs mt-1">Add contacts in the Contacts page and flag them as emergency.</p>
              </div>
            );
          })()}
        </motion.div>
      </div>
    </div>
  );
};

// Sub-nav within Dashboard for Rooms & Emergency
const SubNav = ({ activeView, setActiveView }) => {
  const items = [
    { id: 'home', icon: Home, label: 'Dashboard' },
    { id: 'rooms', icon: Grid3X3, label: 'Rooms' },
    { id: 'emergency', icon: AlertTriangle, label: 'Emergency' },
  ];

  return (
    <div className="sticky top-[6.5rem] z-20 flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur-xl border-b border-gray-100">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveView(item.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeView === item.id
              ? item.id === 'emergency'
                ? 'bg-red-50 text-red-600'
                : 'bg-hb-teal-50 text-hb-teal'
              : 'text-hb-slate hover:text-hb-navy hover:bg-gray-50'
          }`}
        >
          <item.icon className="w-4 h-4" strokeWidth={1.5} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default function HomeBase() {
  const [activeView, setActiveView] = useState('home');

  const renderView = () => {
    switch (activeView) {
      case 'home': return <DashboardView />;
      case 'rooms': return <RoomDetailView />;
      case 'emergency': return <EmergencyView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-hb-warm">
      <SubNav activeView={activeView} setActiveView={setActiveView} />
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
  );
}

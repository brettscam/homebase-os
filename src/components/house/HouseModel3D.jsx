import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  Eye,
  X,
  Droplets,
  Flame,
  Zap,
  Thermometer,
  Home,
  Trees,
  Car,
  ChevronRight
} from 'lucide-react';

// Default emergency marker layout positions
const MARKER_POSITIONS = {
  water_shutoff: { parcel: { top: '78%', left: '28%' }, floorplan: { top: '85%', left: '25%' } },
  gas_shutoff: { parcel: { top: '42%', left: '12%' }, floorplan: { top: '40%', left: '5%' } },
  electrical_panel: { parcel: { top: '55%', left: '82%' }, floorplan: { top: '30%', left: '72%' } },
  water_heater: { parcel: { top: '60%', left: '75%' }, floorplan: { top: '38%', left: '68%' } },
};

const MARKER_META = {
  water_shutoff: { icon: Droplets, color: 'bg-blue-500', ringColor: 'ring-blue-400', pulse: true },
  gas_shutoff: { icon: Flame, color: 'bg-orange-500', ringColor: 'ring-orange-400', pulse: true },
  electrical_panel: { icon: Zap, color: 'bg-yellow-500', ringColor: 'ring-yellow-400', pulse: true },
  water_heater: { icon: Thermometer, color: 'bg-cyan-500', ringColor: 'ring-cyan-400', pulse: false },
};

// Build emergency markers from real data (or show defaults if no data)
function buildEmergencyMarkers(emergencyInfo, systems) {
  const markers = [];

  // Water shutoff
  const waterInfo = emergencyInfo?.find(e => e.type === 'water_shutoff') || {};
  markers.push({
    id: 'water_shutoff',
    label: 'Water Main Shutoff',
    location: waterInfo.location || 'Not set',
    detail: waterInfo.instructions || 'Add in Manual',
    ...MARKER_META.water_shutoff,
    position: MARKER_POSITIONS.water_shutoff.parcel,
  });

  // Gas shutoff
  const gasInfo = emergencyInfo?.find(e => e.type === 'gas_shutoff') || {};
  markers.push({
    id: 'gas_shutoff',
    label: 'Gas Shutoff',
    location: gasInfo.location || 'Not set',
    detail: gasInfo.instructions || 'Add in Manual',
    ...MARKER_META.gas_shutoff,
    position: MARKER_POSITIONS.gas_shutoff.parcel,
  });

  // Electrical panel
  const elecInfo = emergencyInfo?.find(e => e.type === 'electrical_panel') || {};
  markers.push({
    id: 'electrical_panel',
    label: 'Electrical Panel',
    location: elecInfo.location || 'Not set',
    detail: elecInfo.instructions || 'Add in Manual',
    ...MARKER_META.electrical_panel,
    position: MARKER_POSITIONS.electrical_panel.parcel,
  });

  // Water heater (from systems data)
  const whSystem = systems?.find(s => s.type === 'water_heater');
  const whData = whSystem?.data || {};
  markers.push({
    id: 'water_heater',
    label: 'Water Heater',
    location: whData.location || 'Not set',
    detail: [whData.brand, whData.model, whData.capacity && `${whData.capacity} Gal`, whData.installDate && `(${whData.installDate})`].filter(Boolean).join(' ') || 'Add in Manual',
    ...MARKER_META.water_heater,
    position: MARKER_POSITIONS.water_heater.parcel,
  });

  return markers;
}

// Room pastel colors for floor plan rendering
const ROOM_COLORS = ['#EEF2FF', '#F0FDF4', '#FFF7ED', '#F5F3FF', '#FDF2F8', '#FFF1F2', '#ECFEFF', '#F1F5F9', '#FEF3C7'];

// Generate a simple grid layout for rooms from real data
function buildRoomLayout(rooms) {
  if (!rooms || rooms.length === 0) return [];

  // Simple grid layout: distribute rooms evenly
  const count = rooms.length;
  const cols = count <= 4 ? 2 : 3;
  const cellW = Math.floor(75 / cols);
  const cellH = 22;
  const startX = 5;
  const startY = 18;

  return rooms.map((room, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      id: room.id || `room-${i}`,
      name: room.name,
      dims: room.sqft ? `${room.sqft} sq ft` : '',
      x: startX + col * (cellW + 2),
      y: startY + row * (cellH + 2),
      w: cellW,
      h: cellH,
      color: ROOM_COLORS[i % ROOM_COLORS.length],
      isBath: /bath/i.test(room.type || room.name),
      isGarage: /garage/i.test(room.type || room.name),
    };
  });
}

// Parcel Property View - flat aerial layout
export default function HouseModel3D({ onRoomClick, darkMode, property, rooms, emergencyInfo, systems }) {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showMarkers, setShowMarkers] = useState(true);
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [viewMode, setViewMode] = useState('parcel'); // 'parcel' or 'floorplan'

  const EMERGENCY_MARKERS = buildEmergencyMarkers(emergencyInfo, systems);
  const ROOMS = buildRoomLayout(rooms);

  // Property display values
  const propertyName = property?.address?.split(',')[0] || property?.name || 'My Home';
  const specs = [
    property?.sqft && `${property.sqft} sq ft`,
    property?.bedrooms && `${property.bedrooms} Bed`,
    property?.bathrooms && `${property.bathrooms} Bath`,
  ].filter(Boolean).join(' \u00B7 ') || 'Add property details';
  const lotInfo = property?.lot_size ? `${property.lot_size} Acres` : '';
  const cityState = [property?.city, property?.state].filter(Boolean).join(', ');

  const handleRoomClick = (room) => {
    if (onRoomClick) {
      onRoomClick({ name: room.name, description: room.dims, section: 'spaces' });
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* View Mode Toggle */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-gray-200">
        <button
          onClick={() => setViewMode('parcel')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'parcel'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Property View
        </button>
        <button
          onClick={() => setViewMode('floorplan')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'floorplan'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Floor Plan
        </button>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setShowMarkers(!showMarkers)}
          className={`p-2.5 rounded-xl shadow-lg transition-all text-xs font-medium flex items-center gap-1.5 ${
            showMarkers
              ? 'bg-red-500 text-white'
              : darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'
          }`}
          title="Toggle Emergency Markers"
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">{showMarkers ? 'Hide' : 'Show'} Shutoffs</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'parcel' ? (
          <motion.div
            key="parcel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            {/* Parcel / Aerial View */}
            <div className={`w-full h-full relative ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-green-100 via-green-50 to-emerald-100'} rounded-2xl overflow-hidden`}>
              {/* Property boundary */}
              <div className="absolute inset-[8%] border-2 border-dashed border-green-300/60 rounded-xl" />

              {/* Lot features - Trees */}
              {[
                { top: '10%', left: '10%', size: 'w-14 h-14' },
                { top: '8%', left: '22%', size: 'w-12 h-12' },
                { top: '12%', left: '16%', size: 'w-16 h-16' },
                { top: '75%', left: '65%', size: 'w-10 h-10' },
                { top: '80%', left: '75%', size: 'w-12 h-12' },
              ].map((tree, i) => (
                <div
                  key={i}
                  className={`absolute ${tree.size} rounded-full bg-green-400/30 border border-green-500/20 flex items-center justify-center`}
                  style={{ top: tree.top, left: tree.left }}
                >
                  <Trees className="w-5 h-5 text-green-600/40" />
                </div>
              ))}

              {/* Driveway */}
              <div
                className={`absolute ${darkMode ? 'bg-slate-600' : 'bg-stone-200'} rounded-lg`}
                style={{ top: '30%', right: '5%', width: '8%', height: '25%' }}
              />
              <div
                className={`absolute ${darkMode ? 'bg-slate-600' : 'bg-stone-200'} rounded-lg`}
                style={{ bottom: '5%', right: '5%', width: '20%', height: '6%' }}
              />

              {/* House footprint */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`absolute ${
                  darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
                } border-2 shadow-2xl rounded-xl cursor-pointer hover:shadow-3xl transition-shadow`}
                style={{ top: '20%', left: '18%', width: '58%', height: '55%' }}
                onClick={() => setViewMode('floorplan')}
              >
                {/* House label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`w-16 h-16 rounded-2xl ${darkMode ? 'bg-slate-600' : 'bg-blue-50'} flex items-center justify-center mb-3`}>
                    <Home className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {propertyName}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'} mt-1`}>
                    {specs}
                  </p>
                  <div className={`mt-4 flex items-center gap-1.5 px-4 py-2 ${darkMode ? 'bg-blue-600' : 'bg-blue-600'} text-white rounded-lg text-sm font-medium`}>
                    <Eye className="w-4 h-4" />
                    <span>View Floor Plan</span>
                  </div>
                </div>

                {/* Garage wing */}
                <div
                  className={`absolute ${darkMode ? 'bg-slate-600 border-slate-500' : 'bg-gray-100 border-gray-200'} border rounded-lg flex items-center justify-center`}
                  style={{ top: '10%', right: '-18%', width: '16%', height: '35%' }}
                >
                  <Car className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                </div>
              </motion.div>

              {/* Patio */}
              <div
                className={`absolute ${darkMode ? 'bg-slate-600/50 border-slate-500' : 'bg-amber-50 border-amber-200'} border rounded-lg`}
                style={{ top: '15%', left: '25%', width: '20%', height: '8%' }}
              >
                <p className={`text-center mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-amber-600/60'}`}>Patio</p>
              </div>

              {/* Property address label */}
              <div className={`absolute bottom-4 left-4 ${darkMode ? 'bg-slate-700/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-gray-400'} tracking-widest uppercase`}>Property Parcel</p>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{lotInfo || 'Lot size not set'}</p>
                {cityState && <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'} mt-0.5`}>{cityState}</p>}
              </div>

              {/* Emergency Markers on Parcel View */}
              <AnimatePresence>
                {showMarkers && EMERGENCY_MARKERS.map((marker) => (
                  <motion.button
                    key={marker.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    onClick={(e) => { e.stopPropagation(); setSelectedMarker(marker); }}
                    className={`absolute z-10 w-9 h-9 ${marker.color} rounded-full flex items-center justify-center shadow-lg cursor-pointer ring-2 ${marker.ringColor} ring-offset-2 ${darkMode ? 'ring-offset-slate-800' : 'ring-offset-green-50'}`}
                    style={{ top: marker.position.top, left: marker.position.left, transform: 'translate(-50%, -50%)' }}
                    title={marker.label}
                  >
                    <marker.icon className="w-4 h-4 text-white" />
                    {marker.pulse && (
                      <span className={`absolute inset-0 rounded-full ${marker.color} opacity-40 animate-ping`} />
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="floorplan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            {/* Floor Plan View */}
            <div className={`w-full h-full relative ${darkMode ? 'bg-slate-800' : 'bg-gray-50'} rounded-2xl overflow-hidden p-6`}>
              {/* Back to parcel button */}
              <button
                onClick={() => setViewMode('parcel')}
                className={`absolute top-14 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 ${
                  darkMode ? 'bg-slate-700 text-white' : 'bg-white text-gray-700'
                } rounded-lg shadow-md text-xs font-medium hover:scale-105 transition-transform`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Back to Property</span>
              </button>

              {/* Grid background */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `linear-gradient(${darkMode ? '#475569' : '#94a3b8'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? '#475569' : '#94a3b8'} 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Rooms */}
              <div className="relative w-full h-full">
                {ROOMS.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Home className={`w-10 h-10 mx-auto mb-2 ${darkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                      <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>No rooms added yet</p>
                      <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'} mt-1`}>Add rooms in onboarding or the Manual</p>
                    </div>
                  </div>
                )}
                {ROOMS.map((room) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: ROOMS.indexOf(room) * 0.05 }}
                    className={`absolute border-2 rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                      hoveredRoom === room.id
                        ? darkMode
                          ? 'border-blue-400 shadow-lg shadow-blue-500/20 z-10'
                          : 'border-blue-400 shadow-lg shadow-blue-200 z-10'
                        : darkMode
                        ? 'border-slate-600 hover:border-slate-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      left: `${room.x}%`,
                      top: `${room.y}%`,
                      width: `${room.w}%`,
                      height: `${room.h}%`,
                      backgroundColor: darkMode
                        ? hoveredRoom === room.id ? '#1e293b' : '#0f172a'
                        : room.color,
                    }}
                    onMouseEnter={() => setHoveredRoom(room.id)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onClick={() => handleRoomClick(room)}
                  >
                    <p className={`text-xs font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-700'
                    } ${room.isBath || room.isGarage ? 'text-[10px]' : ''}`}>
                      {room.name}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                      {room.dims}
                    </p>
                    {hoveredRoom === room.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 mt-1 text-blue-600"
                      >
                        <span className="text-[9px] font-medium">View specs</span>
                        <ChevronRight className="w-2.5 h-2.5" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}

                {/* Emergency Markers on Floor Plan */}
                <AnimatePresence>
                  {showMarkers && EMERGENCY_MARKERS.map((marker) => {
                    const pos = MARKER_POSITIONS[marker.id]?.floorplan || marker.position;

                    return (
                      <motion.button
                        key={marker.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => setSelectedMarker(marker)}
                        className={`absolute z-10 w-8 h-8 ${marker.color} rounded-full flex items-center justify-center shadow-lg cursor-pointer ring-2 ${marker.ringColor} ring-offset-1 ${darkMode ? 'ring-offset-slate-800' : 'ring-offset-gray-50'}`}
                        style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
                        title={marker.label}
                      >
                        <marker.icon className="w-3.5 h-3.5 text-white" />
                        {marker.pulse && (
                          <span className={`absolute inset-0 rounded-full ${marker.color} opacity-30 animate-ping`} />
                        )}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Legend */}
              <div className={`absolute bottom-4 left-4 ${darkMode ? 'bg-slate-700/90' : 'bg-white/90'} backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                <p className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-gray-400'} tracking-widest uppercase mb-1.5`}>Floor Plan</p>
                <p className={`text-xs ${darkMode ? 'text-white' : 'text-gray-700'}`}>Click any room for full specs</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Marker Detail Panel */}
      <AnimatePresence>
        {selectedMarker && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`absolute bottom-4 right-4 ${
              darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
            } border rounded-2xl shadow-2xl p-5 w-80 z-30`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${selectedMarker.color} rounded-xl flex items-center justify-center`}>
                  <selectedMarker.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedMarker.label}
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {selectedMarker.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMarker(null)}
                className={`${darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className={`${darkMode ? 'bg-slate-600' : 'bg-gray-50'} rounded-xl p-3`}>
              <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                {selectedMarker.detail}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

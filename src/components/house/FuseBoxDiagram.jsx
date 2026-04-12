import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Info } from 'lucide-react';

export default function FuseBoxDiagram({ darkMode = false, electricalData }) {
  const [selectedFuse, setSelectedFuse] = useState(null);

  const breakers = electricalData?.breakers || [];
  const mainAmperage = electricalData?.amperage || electricalData?.mainAmperage;
  const panelLocation = electricalData?.panelLocation;
  const hasData = breakers.length > 0;

  const Fuse = ({ fuse }) => {
    const isSelected = selectedFuse?.id === fuse.id;
    const isActive = fuse.status !== 'inactive';

    return (
      <motion.button
        onClick={() => setSelectedFuse(fuse)}
        className={`relative ${
          isActive
            ? darkMode
              ? 'bg-slate-700 hover:bg-slate-600'
              : 'bg-gray-100 hover:bg-gray-200'
            : darkMode
              ? 'bg-slate-800'
              : 'bg-gray-50'
        } rounded-lg p-3 transition-all ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex flex-col items-center gap-1">
          <Zap
            className={`w-4 h-4 ${
              isActive
                ? darkMode ? 'text-yellow-400' : 'text-yellow-600'
                : darkMode ? 'text-slate-600' : 'text-gray-400'
            }`}
          />
          <span className={`text-xs font-mono font-semibold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {fuse.id}
          </span>
          <span className={`text-[10px] ${
            darkMode ? 'text-slate-400' : 'text-gray-500'
          }`}>
            {fuse.amps}A
          </span>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="space-y-4">
      <div className={`${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      } border rounded-2xl p-6`}>
        <div className="flex items-start gap-3 mb-6">
          <div className={`w-12 h-12 ${
            darkMode ? 'bg-yellow-500/20' : 'bg-yellow-50'
          } rounded-xl flex items-center justify-center`}>
            <Zap className={`w-6 h-6 ${
              darkMode ? 'text-yellow-400' : 'text-yellow-600'
            }`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-1 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Electrical Panel Map
            </h3>
            <p className={`text-sm ${
              darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              {hasData ? 'Tap any breaker to see details' : 'Add breaker details to see full panel diagram'}
            </p>
          </div>
        </div>

        {hasData ? (
          <>
            {/* Main Panel Grid */}
            <div className={`${
              darkMode ? 'bg-slate-900' : 'bg-gray-50'
            } rounded-xl p-6 mb-4`}>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {breakers.slice(0, Math.ceil(breakers.length / 2)).map((fuse) => (
                  <Fuse key={fuse.id} fuse={fuse} />
                ))}
              </div>
              {breakers.length > 4 && (
                <div className="grid grid-cols-4 gap-3">
                  {breakers.slice(Math.ceil(breakers.length / 2)).map((fuse) => (
                    <Fuse key={fuse.id} fuse={fuse} />
                  ))}
                </div>
              )}

              {/* Main Breaker */}
              {mainAmperage && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className={`${
                    darkMode ? 'bg-red-900/30' : 'bg-red-50'
                  } rounded-lg p-4 text-center`}>
                    <p className={`text-xs font-medium ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    } mb-1`}>
                      MAIN BREAKER
                    </p>
                    <p className={`text-2xl font-bold ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {mainAmperage}A
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Zap className={`w-3 h-3 ${
                  darkMode ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
                <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className={`w-3 h-3 ${
                  darkMode ? 'text-slate-600' : 'text-gray-400'
                }`} />
                <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>
                  Spare
                </span>
              </div>
            </div>
          </>
        ) : (
          /* Empty state — show basic info if available */
          <div className={`${
            darkMode ? 'bg-slate-900' : 'bg-gray-50'
          } rounded-xl p-8 text-center`}>
            {mainAmperage || panelLocation ? (
              <div className="space-y-3">
                {mainAmperage && (
                  <div className={`${
                    darkMode ? 'bg-red-900/30' : 'bg-red-50'
                  } rounded-lg p-4 inline-block`}>
                    <p className={`text-xs font-medium ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    } mb-1`}>MAIN BREAKER</p>
                    <p className={`text-2xl font-bold ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>{mainAmperage}A</p>
                  </div>
                )}
                {panelLocation && (
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Panel location: {panelLocation}
                  </p>
                )}
                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'} mt-2`}>
                  Add breaker details to see the full panel diagram
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Zap className={`w-8 h-8 mx-auto ${darkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  No electrical panel data yet
                </p>
                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                  Add your electrical system details in the Mechanical section
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedFuse && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-200'
            } border rounded-2xl p-6`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${
                  darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                } rounded-lg flex items-center justify-center`}>
                  <span className={`text-lg font-bold ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {selectedFuse.id}
                  </span>
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedFuse.label}
                  </h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    {selectedFuse.amps} Amp Breaker
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFuse(null)}
                className={`${
                  darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedFuse.rooms?.length > 0 && (
              <div>
                <p className={`text-xs font-medium ${
                  darkMode ? 'text-slate-500' : 'text-gray-500'
                } uppercase tracking-wider mb-2`}>
                  Controls
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedFuse.rooms.map((room, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 ${
                        darkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-gray-700'
                      } rounded-full text-sm`}
                    >
                      {room}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(!selectedFuse.rooms || selectedFuse.rooms.length === 0) && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Info className="w-4 h-4" />
                <span>Spare breaker - not currently in use</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

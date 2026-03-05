import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import {
  Home, ChevronRight, ChevronLeft, Check, Plus, X, Trash2,
  BedDouble, Bath, Building2, Layers,
  Refrigerator, CookingPot, Wind, Flame, Zap, Droplets,
  Palette, Wifi, Warehouse,
  AlertTriangle,
  FileText, Upload, Sparkles, Loader2, ArrowRight,
  CheckCircle2, Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getHomeData, saveHomeData, generateId, calculateCompletion
} from '../lib/homeDataStore';

// ─── Step Progress Bar ───────────────────────────────────────────────
const StepProgress = ({ currentStep, totalSteps, steps }) => (
  <div className="flex items-center gap-1 w-full max-w-2xl mx-auto px-4">
    {steps.map((step, i) => (
      <div key={i} className="flex-1 flex items-center gap-1">
        <div className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
          i < currentStep ? 'bg-blue-600' : i === currentStep ? 'bg-blue-400' : 'bg-gray-200'
        }`} />
      </div>
    ))}
  </div>
);

// ─── Reusable Form Field ─────────────────────────────────────────────
const Field = ({ label, value, onChange, placeholder, type = 'text', suffix, className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-medium text-gray-500 tracking-wide uppercase mb-1.5">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 transition-all"
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">{suffix}</span>
      )}
    </div>
  </div>
);

// ─── Selectable Card ─────────────────────────────────────────────────
const SelectCard = ({ icon: Icon, label, selected, onClick, description }) => (
  <button
    onClick={onClick}
    className={`text-left p-4 rounded-2xl border-2 transition-all ${
      selected
        ? 'border-blue-500 bg-blue-50 shadow-sm'
        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center gap-3">
      {Icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          selected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${selected ? 'text-blue-900' : 'text-gray-900'}`}>{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {selected && <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />}
    </div>
  </button>
);

// ─── Step Layout Wrapper ─────────────────────────────────────────────
const StepLayout = ({ title, subtitle, icon: Icon, children, tip }) => (
  <motion.div
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -40 }}
    transition={{ duration: 0.3 }}
    className="max-w-2xl mx-auto px-4"
  >
    <div className="mb-8">
      {Icon && (
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-blue-600" strokeWidth={1.5} />
        </div>
      )}
      <h2 className="text-3xl font-light text-gray-900 tracking-tight mb-2">{title}</h2>
      <p className="text-gray-500">{subtitle}</p>
    </div>
    {tip && (
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
        <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">{tip}</p>
      </div>
    )}
    {children}
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════
//  STEP 0 — Welcome
// ═══════════════════════════════════════════════════════════════════════
const WelcomeStep = ({ onNext, onImport }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -30 }}
    className="max-w-2xl mx-auto px-4 text-center"
  >
    <div className="mb-8">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Home className="w-10 h-10 text-white" strokeWidth={1.5} />
      </div>
      <h1 className="text-4xl font-light text-gray-900 tracking-tight mb-3">
        Welcome to HomeBase
      </h1>
      <p className="text-lg text-gray-500 max-w-md mx-auto">
        Let's digitize your home. We'll walk you through each area — it takes about 10 minutes.
      </p>
    </div>

    <div className="space-y-4 max-w-sm mx-auto">
      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl transition-colors font-semibold text-lg shadow-lg"
      >
        Start Setup
        <ArrowRight className="w-5 h-5" />
      </button>

      <button
        onClick={onImport}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 py-4 px-6 rounded-2xl transition-colors font-medium border border-gray-200"
      >
        <FileText className="w-5 h-5" />
        Import from Documents
      </button>

      <p className="text-sm text-gray-400 mt-4">
        You can skip any section and come back later
      </p>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════
//  STEP 1 — Property Basics
// ═══════════════════════════════════════════════════════════════════════
const PropertyStep = ({ data, onChange }) => {
  const p = data.property;
  const update = (field, value) => onChange({ ...data, property: { ...p, [field]: value } });

  return (
    <StepLayout
      title="Your Property"
      subtitle="Start with the basics about your home"
      icon={Building2}
    >
      <div className="space-y-5">
        <Field label="Street Address" value={p.address} onChange={v => update('address', v)} placeholder="123 Main Street" />
        <div className="grid grid-cols-3 gap-3">
          <Field label="City" value={p.city} onChange={v => update('city', v)} placeholder="Mill Valley" className="col-span-1" />
          <Field label="State" value={p.state} onChange={v => update('state', v)} placeholder="CA" />
          <Field label="ZIP" value={p.zip} onChange={v => update('zip', v)} placeholder="94941" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Year Built" value={p.yearBuilt} onChange={v => update('yearBuilt', v)} placeholder="1987" />
          <Field label="Square Feet" value={p.sqft} onChange={v => update('sqft', v)} placeholder="2,847" suffix="sq ft" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Bedrooms" value={p.bedrooms} onChange={v => update('bedrooms', v)} placeholder="4" type="number" />
          <Field label="Bathrooms" value={p.bathrooms} onChange={v => update('bathrooms', v)} placeholder="3.5" />
          <Field label="Stories" value={p.stories} onChange={v => update('stories', v)} placeholder="2" type="number" />
        </div>
        <Field label="Lot Size" value={p.lotSize} onChange={v => update('lotSize', v)} placeholder="0.31" suffix="acres" />
      </div>
    </StepLayout>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  STEP 2 — Rooms & Spaces
// ═══════════════════════════════════════════════════════════════════════
const ROOM_TYPES = [
  { value: 'kitchen', label: 'Kitchen', icon: CookingPot },
  { value: 'living', label: 'Living Room', icon: Home },
  { value: 'bedroom', label: 'Bedroom', icon: BedDouble },
  { value: 'bathroom', label: 'Bathroom', icon: Bath },
  { value: 'dining', label: 'Dining Room', icon: Home },
  { value: 'office', label: 'Office', icon: Home },
  { value: 'garage', label: 'Garage', icon: Warehouse },
  { value: 'laundry', label: 'Laundry', icon: Home },
  { value: 'other', label: 'Other', icon: Layers },
];

const RoomsStep = ({ data, onChange }) => {
  const [editingRoom, setEditingRoom] = useState(null);
  const rooms = data.rooms || [];

  const addRoom = (type) => {
    const typeInfo = ROOM_TYPES.find(t => t.value === type);
    const newRoom = {
      id: generateId(),
      name: typeInfo?.label || 'Room',
      type,
      length: '',
      width: '',
      ceilingHeight: '',
      flooring: '',
      windows: '',
      notes: '',
    };
    const updated = [...rooms, newRoom];
    onChange({ ...data, rooms: updated });
    setEditingRoom(newRoom.id);
  };

  const updateRoom = (id, field, value) => {
    const updated = rooms.map(r => r.id === id ? { ...r, [field]: value } : r);
    onChange({ ...data, rooms: updated });
  };

  const removeRoom = (id) => {
    onChange({ ...data, rooms: rooms.filter(r => r.id !== id) });
    if (editingRoom === id) setEditingRoom(null);
  };

  const editRoom = rooms.find(r => r.id === editingRoom);

  return (
    <StepLayout
      title="Rooms & Spaces"
      subtitle="Add each room in your home"
      icon={Layers}
      tip="Tap a room type to add it. You can add multiple rooms of the same type (e.g. 3 bedrooms)."
    >
      {/* Room type quick-add */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {ROOM_TYPES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => addRoom(value)}
            className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all text-sm"
          >
            <Plus className="w-4 h-4 text-blue-500" />
            <Icon className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Added rooms list */}
      {rooms.length > 0 && (
        <div className="space-y-3 mb-4">
          <p className="text-xs font-medium text-gray-400 tracking-widest uppercase">
            Added Rooms ({rooms.length})
          </p>
          {rooms.map((room) => (
            <div key={room.id}>
              <div
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  editingRoom === room.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-100 bg-white hover:bg-gray-50'
                }`}
                onClick={() => setEditingRoom(editingRoom === room.id ? null : room.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    editingRoom === room.id ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {(() => {
                      const RIcon = ROOM_TYPES.find(t => t.value === room.type)?.icon || Home;
                      return <RIcon className="w-5 h-5 text-gray-600" />;
                    })()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{room.name}</p>
                    {room.length && room.width && (
                      <p className="text-xs text-gray-500">{room.length}' × {room.width}'</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeRoom(room.id); }}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${editingRoom === room.id ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Expanded edit form */}
              <AnimatePresence>
                {editingRoom === room.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-3 bg-gray-50 rounded-b-2xl border border-t-0 border-gray-100">
                      <Field label="Room Name" value={room.name} onChange={v => updateRoom(room.id, 'name', v)} placeholder="e.g. Primary Bedroom" />
                      <div className="grid grid-cols-3 gap-3">
                        <Field label="Length" value={room.length} onChange={v => updateRoom(room.id, 'length', v)} placeholder="16" suffix="ft" />
                        <Field label="Width" value={room.width} onChange={v => updateRoom(room.id, 'width', v)} placeholder="18" suffix="ft" />
                        <Field label="Ceiling" value={room.ceilingHeight} onChange={v => updateRoom(room.id, 'ceilingHeight', v)} placeholder={`9'6"`} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Flooring" value={room.flooring} onChange={v => updateRoom(room.id, 'flooring', v)} placeholder="Hardwood oak" />
                        <Field label="Windows" value={room.windows} onChange={v => updateRoom(room.id, 'windows', v)} placeholder="2" />
                      </div>
                      <Field label="Notes" value={room.notes} onChange={v => updateRoom(room.id, 'notes', v)} placeholder="Bay window facing south..." />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {rooms.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Home className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Tap a room type above to start adding rooms</p>
        </div>
      )}
    </StepLayout>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  STEP 3 — Appliances (AI-Assisted)
// ═══════════════════════════════════════════════════════════════════════
const APPLIANCE_TYPES = [
  'Refrigerator', 'Dishwasher', 'Range/Oven', 'Microwave', 'Washer',
  'Dryer', 'Garbage Disposal', 'Range Hood', 'Wine Cooler', 'Other'
];

const AppliancesStep = ({ data, onChange }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [newAppliance, setNewAppliance] = useState({
    type: '', brand: '', model: '', serialNumber: '', installDate: '', warrantyExpiry: '', room: '', notes: ''
  });
  const appliances = data.appliances || [];

  const aiLookup = async () => {
    if (!newAppliance.brand && !newAppliance.model) {
      toast.error('Enter at least a brand or model number');
      return;
    }
    setAiLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `I have a home appliance. Here's what I know:
Brand: ${newAppliance.brand || 'unknown'}
Model: ${newAppliance.model || 'unknown'}
Type: ${newAppliance.type || 'unknown'}

Please provide the following details in this exact JSON format (use empty strings for unknown values):
{
  "type": "appliance category (e.g. Refrigerator, Dishwasher, Range/Oven)",
  "brand": "full brand name",
  "model": "full model name/number",
  "typicalWarrantyYears": "number of years typical warranty lasts",
  "filterInfo": "what filters need replacement and how often, or empty string if none",
  "notes": "one sentence about this specific model - key features or things to know"
}

Return ONLY the JSON, no markdown or explanation.`
      });

      try {
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        setNewAppliance(prev => ({
          ...prev,
          type: parsed.type || prev.type,
          brand: parsed.brand || prev.brand,
          model: parsed.model || prev.model,
          notes: [parsed.notes, parsed.filterInfo].filter(Boolean).join('. '),
        }));
        toast.success('AI filled in appliance details');
      } catch {
        toast.error('Could not parse AI response. Try adding more details.');
      }
    } catch {
      toast.error('AI lookup failed. You can fill in details manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const addAppliance = () => {
    if (!newAppliance.type && !newAppliance.brand) {
      toast.error('Add at least a type or brand');
      return;
    }
    const entry = { ...newAppliance, id: generateId() };
    onChange({ ...data, appliances: [...appliances, entry] });
    setNewAppliance({ type: '', brand: '', model: '', serialNumber: '', installDate: '', warrantyExpiry: '', room: '', notes: '' });
    setShowAdd(false);
    toast.success('Appliance added');
  };

  const removeAppliance = (id) => {
    onChange({ ...data, appliances: appliances.filter(a => a.id !== id) });
  };

  return (
    <StepLayout
      title="Appliances"
      subtitle="Add your major appliances — AI can help fill in details"
      icon={Refrigerator}
      tip="Just type a brand and model number, then tap the AI button to auto-fill specs and warranty info."
    >
      {/* Existing appliances */}
      {appliances.length > 0 && (
        <div className="space-y-3 mb-6">
          {appliances.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Refrigerator className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{a.type || a.brand}</p>
                  <p className="text-xs text-gray-500">{a.brand} {a.model}</p>
                </div>
              </div>
              <button onClick={() => removeAppliance(a.id)} className="p-2 text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add appliance form */}
      {showAdd ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">New Appliance</h3>
            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 tracking-wide uppercase mb-1.5">Type</label>
            <div className="flex flex-wrap gap-2">
              {APPLIANCE_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setNewAppliance(prev => ({ ...prev, type }))}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    newAppliance.type === type
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Brand" value={newAppliance.brand} onChange={v => setNewAppliance(p => ({ ...p, brand: v }))} placeholder="Sub-Zero" />
            <Field label="Model Number" value={newAppliance.model} onChange={v => setNewAppliance(p => ({ ...p, model: v }))} placeholder="BI-42U" />
          </div>

          {/* AI Lookup Button */}
          <button
            onClick={aiLookup}
            disabled={aiLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl transition-all disabled:opacity-60 font-medium"
          >
            {aiLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Looking up details...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> AI Auto-Fill Details</>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Install Date" value={newAppliance.installDate} onChange={v => setNewAppliance(p => ({ ...p, installDate: v }))} placeholder="March 2021" />
            <Field label="Warranty Until" value={newAppliance.warrantyExpiry} onChange={v => setNewAppliance(p => ({ ...p, warrantyExpiry: v }))} placeholder="March 2026" />
          </div>
          <Field label="Serial Number" value={newAppliance.serialNumber} onChange={v => setNewAppliance(p => ({ ...p, serialNumber: v }))} placeholder="Optional" />
          <Field label="Room" value={newAppliance.room} onChange={v => setNewAppliance(p => ({ ...p, room: v }))} placeholder="Kitchen" />
          <Field label="Notes" value={newAppliance.notes} onChange={v => setNewAppliance(p => ({ ...p, notes: v }))} placeholder="AI-generated notes will appear here" />

          <button
            onClick={addAppliance}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
          >
            <Check className="w-4 h-4" /> Save Appliance
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Appliance
        </button>
      )}
    </StepLayout>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  STEP 4 — Paint & Finishes
// ═══════════════════════════════════════════════════════════════════════
const SURFACES = ['Walls', 'Trim', 'Cabinets', 'Ceiling', 'Accent Wall', 'Doors', 'Exterior'];
const FINISHES = ['Flat/Matte', 'Eggshell', 'Satin', 'Semi-Gloss', 'High-Gloss'];

const PaintStep = ({ data, onChange }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [newPaint, setNewPaint] = useState({
    room: '', surface: '', brand: '', colorName: '', colorCode: '', finish: ''
  });
  const paints = data.paint || [];

  const aiLookup = async () => {
    if (!newPaint.colorName && !newPaint.colorCode) {
      toast.error('Enter a color name or code');
      return;
    }
    setAiLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `I have a paint color. Here's what I know:
Brand: ${newPaint.brand || 'unknown'}
Color Name: ${newPaint.colorName || 'unknown'}
Color Code: ${newPaint.colorCode || 'unknown'}

Please provide the following details in this exact JSON format:
{
  "brand": "full brand name",
  "colorName": "full official color name",
  "colorCode": "official color code/number",
  "hexColor": "approximate hex color code like #F5F5F0",
  "finish": "recommended finish for this color"
}

Return ONLY the JSON, no markdown or explanation.`
      });
      try {
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        setNewPaint(prev => ({
          ...prev,
          brand: parsed.brand || prev.brand,
          colorName: parsed.colorName || prev.colorName,
          colorCode: parsed.colorCode || prev.colorCode,
          finish: parsed.finish || prev.finish,
        }));
        toast.success('AI filled in paint details');
      } catch {
        toast.error('Could not parse AI response');
      }
    } catch {
      toast.error('AI lookup failed');
    } finally {
      setAiLoading(false);
    }
  };

  const addPaint = () => {
    if (!newPaint.colorName && !newPaint.brand) {
      toast.error('Add at least a brand or color name');
      return;
    }
    onChange({ ...data, paint: [...paints, { ...newPaint, id: generateId() }] });
    setNewPaint({ room: '', surface: '', brand: '', colorName: '', colorCode: '', finish: '' });
    setShowAdd(false);
    toast.success('Paint color added');
  };

  const removePaint = (id) => {
    onChange({ ...data, paint: paints.filter(p => p.id !== id) });
  };

  return (
    <StepLayout
      title="Paint & Finishes"
      subtitle="Record your paint colors so you never forget them"
      icon={Palette}
      tip="Look on the paint can lid for the brand, color name, and code. AI can look up details from just the name."
    >
      {paints.length > 0 && (
        <div className="space-y-3 mb-6">
          {paints.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border border-gray-200" style={{ backgroundColor: p.hexColor || '#e5e7eb' }} />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{p.colorName || p.brand}</p>
                  <p className="text-xs text-gray-500">{p.brand} {p.colorCode && `(${p.colorCode})`} · {p.room} {p.surface}</p>
                </div>
              </div>
              <button onClick={() => removePaint(p.id)} className="p-2 text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">New Paint Color</h3>
            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Room" value={newPaint.room} onChange={v => setNewPaint(p => ({ ...p, room: v }))} placeholder="Kitchen" />
            <div>
              <label className="block text-xs font-medium text-gray-500 tracking-wide uppercase mb-1.5">Surface</label>
              <div className="flex flex-wrap gap-1.5">
                {SURFACES.map(s => (
                  <button key={s} onClick={() => setNewPaint(p => ({ ...p, surface: s }))}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      newPaint.surface === s ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          <Field label="Brand" value={newPaint.brand} onChange={v => setNewPaint(p => ({ ...p, brand: v }))} placeholder="Benjamin Moore" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Color Name" value={newPaint.colorName} onChange={v => setNewPaint(p => ({ ...p, colorName: v }))} placeholder="Chantilly Lace" />
            <Field label="Color Code" value={newPaint.colorCode} onChange={v => setNewPaint(p => ({ ...p, colorCode: v }))} placeholder="OC-65" />
          </div>

          <button onClick={aiLookup} disabled={aiLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl transition-all disabled:opacity-60 font-medium">
            {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Looking up color...</> : <><Sparkles className="w-4 h-4" /> AI Color Lookup</>}
          </button>

          <div>
            <label className="block text-xs font-medium text-gray-500 tracking-wide uppercase mb-1.5">Finish</label>
            <div className="flex flex-wrap gap-2">
              {FINISHES.map(f => (
                <button key={f} onClick={() => setNewPaint(p => ({ ...p, finish: f }))}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    newPaint.finish === f ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}>{f}</button>
              ))}
            </div>
          </div>

          <button onClick={addPaint}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium">
            <Check className="w-4 h-4" /> Save Color
          </button>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-all">
          <Plus className="w-5 h-5" /> Add Paint Color
        </button>
      )}
    </StepLayout>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  STEP 5 — Systems & Smart Home
// ═══════════════════════════════════════════════════════════════════════
const SystemsStep = ({ data, onChange }) => {
  const sys = data.systems;
  const smart = data.smartHome;

  const updateSys = (section, field, value) => {
    onChange({
      ...data,
      systems: { ...sys, [section]: { ...sys[section], [field]: value } }
    });
  };
  const updateSmart = (section, field, value) => {
    onChange({
      ...data,
      smartHome: { ...smart, [section]: { ...smart[section], [field]: value } }
    });
  };

  return (
    <StepLayout
      title="Systems & Smart Home"
      subtitle="HVAC, water heater, electrical, WiFi, and access codes"
      icon={Zap}
    >
      <div className="space-y-6">
        {/* HVAC */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Wind className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">HVAC / Heating & Cooling</h3>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand" value={sys.hvac.brand} onChange={v => updateSys('hvac', 'brand', v)} placeholder="Carrier" />
              <Field label="Model" value={sys.hvac.model} onChange={v => updateSys('hvac', 'model', v)} placeholder="24ACC636A003" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Filter Size" value={sys.hvac.filterSize} onChange={v => updateSys('hvac', 'filterSize', v)} placeholder='20x25x1"' />
              <Field label="Thermostat" value={sys.hvac.thermostat} onChange={v => updateSys('hvac', 'thermostat', v)} placeholder="Nest Learning" />
            </div>
          </div>
        </div>

        {/* Water Heater */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Water Heater</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Brand" value={sys.waterHeater.brand} onChange={v => updateSys('waterHeater', 'brand', v)} placeholder="Rheem" />
            <Field label="Model" value={sys.waterHeater.model} onChange={v => updateSys('waterHeater', 'model', v)} placeholder="Performance Platinum" />
            <Field label="Capacity" value={sys.waterHeater.capacity} onChange={v => updateSys('waterHeater', 'capacity', v)} placeholder="50 gallons" />
            <Field label="Installed" value={sys.waterHeater.installDate} onChange={v => updateSys('waterHeater', 'installDate', v)} placeholder="2023" />
          </div>
        </div>

        {/* Electrical */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Electrical Panel</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Amperage" value={sys.electrical.amperage} onChange={v => updateSys('electrical', 'amperage', v)} placeholder="200A" />
            <Field label="Circuits" value={sys.electrical.circuits} onChange={v => updateSys('electrical', 'circuits', v)} placeholder="16" />
            <Field label="Panel Location" value={sys.electrical.panelLocation} onChange={v => updateSys('electrical', 'panelLocation', v)} placeholder="Garage" />
          </div>
        </div>

        {/* WiFi */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Wifi className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">WiFi & Access</h3>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Network Name" value={smart.wifi.networkName} onChange={v => updateSmart('wifi', 'networkName', v)} placeholder="MyNetwork_5G" />
              <Field label="Password" value={smart.wifi.password} onChange={v => updateSmart('wifi', 'password', v)} placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Security Provider" value={smart.security.provider} onChange={v => updateSmart('security', 'provider', v)} placeholder="ADT, Ring, etc." />
              <Field label="Garage Code" value={smart.garage.code} onChange={v => updateSmart('garage', 'code', v)} placeholder="8900" />
            </div>
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  STEP 6 — Emergency Info
// ═══════════════════════════════════════════════════════════════════════
const EmergencyStep = ({ data, onChange }) => {
  const em = data.emergency;
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ type: '', name: '', company: '', phone: '', email: '' });

  const updateShutoff = (section, field, value) => {
    onChange({
      ...data,
      emergency: { ...em, [section]: { ...em[section], [field]: value } }
    });
  };

  const addContact = () => {
    if (!newContact.name && !newContact.company) {
      toast.error('Add at least a name or company');
      return;
    }
    const contacts = [...(em.contacts || []), { ...newContact, id: generateId() }];
    onChange({ ...data, emergency: { ...em, contacts } });
    setNewContact({ type: '', name: '', company: '', phone: '', email: '' });
    setShowAddContact(false);
    toast.success('Contact added');
  };

  const removeContact = (id) => {
    onChange({ ...data, emergency: { ...em, contacts: em.contacts.filter(c => c.id !== id) } });
  };

  const CONTACT_TYPES = ['Plumber', 'Electrician', 'HVAC', 'Handyman', 'Roofer', 'Landscaper', 'General Contractor', 'Other'];

  return (
    <StepLayout
      title="Emergency Info"
      subtitle="Critical shutoff locations and emergency contacts"
      icon={AlertTriangle}
      tip="This information is shown in Emergency Mode for quick access during a crisis."
    >
      <div className="space-y-6">
        {/* Shutoffs */}
        <div className="space-y-4">
          <p className="text-xs font-medium text-gray-400 tracking-widest uppercase">Shutoff Locations</p>

          {[
            { key: 'waterShutoff', icon: Droplets, label: 'Water Main', color: 'bg-blue-50 text-blue-600' },
            { key: 'gasShutoff', icon: Flame, label: 'Gas Main', color: 'bg-orange-50 text-orange-600' },
            { key: 'electricalPanel', icon: Zap, label: 'Electrical Panel', color: 'bg-yellow-50 text-yellow-600' },
          ].map(({ key, icon: Icon, label, color }) => (
            <div key={key} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Location" value={em[key].location} onChange={v => updateShutoff(key, 'location', v)} placeholder="Front yard, garage, etc." />
                <Field label="Instructions" value={em[key].instructions} onChange={v => updateShutoff(key, 'instructions', v)} placeholder="Turn clockwise to close" />
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Contacts */}
        <div>
          <p className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-3">Emergency Contacts</p>

          {(em.contacts || []).map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl mb-3">
              <div>
                <p className="font-medium text-gray-900 text-sm">{c.type} — {c.name || c.company}</p>
                <p className="text-xs text-gray-500">{c.company} · {c.phone}</p>
              </div>
              <button onClick={() => removeContact(c.id)} className="p-2 text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {showAddContact ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 tracking-wide uppercase mb-1.5">Type</label>
                <div className="flex flex-wrap gap-2">
                  {CONTACT_TYPES.map(t => (
                    <button key={t} onClick={() => setNewContact(p => ({ ...p, type: t }))}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        newContact.type === t ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" value={newContact.name} onChange={v => setNewContact(p => ({ ...p, name: v }))} placeholder="John Smith" />
                <Field label="Company" value={newContact.company} onChange={v => setNewContact(p => ({ ...p, company: v }))} placeholder="ABC Plumbing" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone" value={newContact.phone} onChange={v => setNewContact(p => ({ ...p, phone: v }))} placeholder="(555) 123-4567" />
                <Field label="Email" value={newContact.email} onChange={v => setNewContact(p => ({ ...p, email: v }))} placeholder="optional" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAddContact(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm">Cancel</button>
                <button onClick={addContact} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddContact(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-all text-sm">
              <Plus className="w-4 h-4" /> Add Emergency Contact
            </button>
          )}
        </div>
      </div>
    </StepLayout>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  STEP 7 — Document Import (AI-Powered)
// ═══════════════════════════════════════════════════════════════════════
const DocumentImportStep = ({ data, onChange }) => {
  const [pastedText, setPastedText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} file(s) added for reference`);
  };

  const aiExtract = async () => {
    if (!pastedText.trim()) {
      toast.error('Paste some text from a document first');
      return;
    }
    setAiLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a home data extraction assistant. I'm going to give you text from a home document (could be an inspection report, appraisal, disclosure, or other home document).

Extract as much structured home data as possible and return it in this exact JSON format. Use empty strings for any data you cannot find. Do not fabricate data — only extract what's explicitly stated:

{
  "property": {
    "address": "", "city": "", "state": "", "zip": "",
    "yearBuilt": "", "sqft": "", "lotSize": "", "stories": "",
    "bedrooms": "", "bathrooms": ""
  },
  "rooms": [
    { "name": "", "type": "", "length": "", "width": "", "flooring": "", "notes": "" }
  ],
  "appliances": [
    { "type": "", "brand": "", "model": "", "installDate": "", "notes": "" }
  ],
  "systems": {
    "hvac": { "brand": "", "model": "", "type": "" },
    "waterHeater": { "brand": "", "model": "", "capacity": "", "type": "" },
    "electrical": { "amperage": "", "circuits": "", "panelLocation": "" }
  },
  "exterior": {
    "roof": { "type": "", "material": "", "installDate": "" },
    "gutters": { "type": "", "material": "" }
  },
  "notes": "Any other important details found in the document"
}

Return ONLY the JSON, no markdown or explanation. Here's the document text:

${pastedText.slice(0, 8000)}`
      });

      try {
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        setExtractedData(parsed);
        toast.success('Data extracted! Review below and apply.');
      } catch {
        toast.error('Could not parse extracted data. Try pasting a cleaner section.');
      }
    } catch {
      toast.error('AI extraction failed. Try a shorter text section.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyExtracted = () => {
    if (!extractedData) return;

    const merged = { ...data };

    // Merge property fields (only fill empty ones)
    if (extractedData.property) {
      for (const [key, value] of Object.entries(extractedData.property)) {
        if (value && !merged.property[key]) {
          merged.property[key] = value;
        }
      }
    }

    // Add rooms
    if (extractedData.rooms?.length) {
      const newRooms = extractedData.rooms
        .filter(r => r.name)
        .map(r => ({ ...r, id: generateId() }));
      merged.rooms = [...(merged.rooms || []), ...newRooms];
    }

    // Add appliances
    if (extractedData.appliances?.length) {
      const newAppliances = extractedData.appliances
        .filter(a => a.type || a.brand)
        .map(a => ({ ...a, id: generateId() }));
      merged.appliances = [...(merged.appliances || []), ...newAppliances];
    }

    // Merge systems
    if (extractedData.systems) {
      for (const section of ['hvac', 'waterHeater', 'electrical']) {
        if (extractedData.systems[section]) {
          for (const [key, value] of Object.entries(extractedData.systems[section])) {
            if (value && merged.systems[section] && !merged.systems[section][key]) {
              merged.systems[section][key] = value;
            }
          }
        }
      }
    }

    // Merge exterior
    if (extractedData.exterior) {
      for (const section of ['roof', 'gutters']) {
        if (extractedData.exterior[section]) {
          for (const [key, value] of Object.entries(extractedData.exterior[section])) {
            if (value && merged.exterior?.[section] && !merged.exterior[section][key]) {
              merged.exterior[section][key] = value;
            }
          }
        }
      }
    }

    // Store uploaded files as document records
    if (files.length > 0) {
      const docs = files.map(f => ({
        id: generateId(),
        name: f.name,
        type: f.type,
        uploadDate: new Date().toISOString(),
      }));
      merged.documents = [...(merged.documents || []), ...docs];
    }

    onChange(merged);
    setExtractedData(null);
    setPastedText('');
    toast.success('Extracted data applied to your home profile!');
  };

  return (
    <StepLayout
      title="Import Documents"
      subtitle="Paste text from inspection reports, appraisals, or disclosures — AI will extract the data"
      icon={FileText}
      tip="Copy and paste text from a PDF, email, or document. The AI will find property details, appliances, systems info, and more."
    >
      <div className="space-y-6">
        {/* File upload for reference */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Upload Documents</h3>
              <p className="text-xs text-gray-500">Save files for your records</p>
            </div>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
            <input type="file" id="doc-upload" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
            <label htmlFor="doc-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload files</p>
              <p className="text-xs text-gray-400">PDFs, documents, or photos</p>
            </label>
          </div>
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                  <span className="text-gray-700 truncate">{f.name}</span>
                  <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paste text for AI extraction */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">AI Document Extraction</h3>
              <p className="text-xs text-gray-500">Paste text and let AI find the data</p>
            </div>
          </div>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste text from your home inspection report, appraisal, property listing, seller disclosure, or any home document here..."
            rows={8}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-sm text-gray-700"
          />
          <button
            onClick={aiExtract}
            disabled={aiLoading || !pastedText.trim()}
            className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl transition-all disabled:opacity-60 font-medium"
          >
            {aiLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Extracting data...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Extract Home Data</>
            )}
          </button>
        </div>

        {/* Extracted Data Preview */}
        {extractedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-green-900">Data Extracted</h3>
            </div>

            <div className="space-y-3 text-sm">
              {extractedData.property?.address && (
                <div className="flex justify-between py-1 border-b border-green-100">
                  <span className="text-green-700">Address</span>
                  <span className="font-medium text-green-900">{extractedData.property.address}</span>
                </div>
              )}
              {extractedData.property?.sqft && (
                <div className="flex justify-between py-1 border-b border-green-100">
                  <span className="text-green-700">Square Feet</span>
                  <span className="font-medium text-green-900">{extractedData.property.sqft}</span>
                </div>
              )}
              {extractedData.property?.yearBuilt && (
                <div className="flex justify-between py-1 border-b border-green-100">
                  <span className="text-green-700">Year Built</span>
                  <span className="font-medium text-green-900">{extractedData.property.yearBuilt}</span>
                </div>
              )}
              {extractedData.rooms?.filter(r => r.name).length > 0 && (
                <div className="flex justify-between py-1 border-b border-green-100">
                  <span className="text-green-700">Rooms Found</span>
                  <span className="font-medium text-green-900">{extractedData.rooms.filter(r => r.name).length} rooms</span>
                </div>
              )}
              {extractedData.appliances?.filter(a => a.type || a.brand).length > 0 && (
                <div className="flex justify-between py-1 border-b border-green-100">
                  <span className="text-green-700">Appliances Found</span>
                  <span className="font-medium text-green-900">{extractedData.appliances.filter(a => a.type || a.brand).length} appliances</span>
                </div>
              )}
              {extractedData.notes && (
                <div className="py-1">
                  <span className="text-green-700 block mb-1">Additional Notes</span>
                  <span className="text-green-900 text-xs">{extractedData.notes}</span>
                </div>
              )}
            </div>

            <button
              onClick={applyExtracted}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-medium"
            >
              <Check className="w-4 h-4" /> Apply to My Home Profile
            </button>
          </motion.div>
        )}
      </div>
    </StepLayout>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  STEP 8 — Review & Complete
// ═══════════════════════════════════════════════════════════════════════
const ReviewStep = ({ data }) => {
  const completion = calculateCompletion(data);

  const sections = [
    { key: 'property', label: 'Property Details', icon: Building2 },
    { key: 'rooms', label: 'Rooms & Spaces', icon: Layers },
    { key: 'appliances', label: 'Appliances', icon: Refrigerator },
    { key: 'paint', label: 'Paint & Finishes', icon: Palette },
    { key: 'systems', label: 'Systems', icon: Zap },
    { key: 'smartHome', label: 'Smart Home', icon: Wifi },
    { key: 'emergency', label: 'Emergency', icon: AlertTriangle },
  ];

  return (
    <StepLayout
      title="You're All Set!"
      subtitle="Here's a summary of your home profile"
      icon={CheckCircle2}
    >
      {/* Overall Score */}
      <div className="text-center mb-8">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52" fill="none" stroke="#2563EB" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - completion.overall.percentage / 100)}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-light text-gray-900">{completion.overall.percentage}%</span>
            <span className="text-xs text-gray-500">Complete</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm">
          {completion.overall.completed} of {completion.overall.total} data points filled
        </p>
      </div>

      {/* Section Breakdown */}
      <div className="space-y-3">
        {sections.map(({ key, label, icon: Icon }) => {
          const sec = completion[key];
          if (!sec) return null;
          return (
            <div key={key} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                sec.percentage === 100 ? 'bg-green-50' : sec.percentage > 0 ? 'bg-blue-50' : 'bg-gray-50'
              }`}>
                <Icon className={`w-5 h-5 ${
                  sec.percentage === 100 ? 'text-green-600' : sec.percentage > 0 ? 'text-blue-600' : 'text-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900 text-sm">{label}</p>
                  <span className="text-xs text-gray-500">{sec.completed}/{sec.total}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                      sec.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${sec.percentage}%` }}
                  />
                </div>
              </div>
              {sec.percentage === 100 && <Check className="w-5 h-5 text-green-500" />}
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-gray-400 mt-6">
        You can always come back and add more details later
      </p>
    </StepLayout>
  );
};

// ═══════════════════════════════════════════════════════════════════════
//  MAIN ONBOARDING WIZARD
// ═══════════════════════════════════════════════════════════════════════
const STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'property', label: 'Property' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'appliances', label: 'Appliances' },
  { id: 'paint', label: 'Paint' },
  { id: 'systems', label: 'Systems' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'documents', label: 'Import' },
  { id: 'review', label: 'Review' },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [homeData, setHomeData] = useState(() => getHomeData());
  const navigate = useNavigate();

  // Auto-save on data changes
  useEffect(() => {
    if (currentStep > 0) {
      saveHomeData(homeData);
    }
  }, [homeData, currentStep]);

  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToImport = () => {
    setCurrentStep(STEPS.findIndex(s => s.id === 'documents'));
  };

  const finishOnboarding = () => {
    const updated = { ...homeData, onboardingComplete: true };
    saveHomeData(updated);
    navigate(createPageUrl('HomeBase'));
    toast.success('Home profile saved! Welcome to HomeBase.');
  };

  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-sm tracking-tight">HOMEBASE SETUP</span>
            </div>
            {!isFirstStep && (
              <span className="text-xs text-gray-400">
                Step {currentStep} of {STEPS.length - 1}
              </span>
            )}
          </div>
          {!isFirstStep && (
            <StepProgress currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="pt-8 pb-32">
        <AnimatePresence mode="wait">
          {currentStep === 0 && <WelcomeStep key="welcome" onNext={goNext} onImport={goToImport} />}
          {currentStep === 1 && <PropertyStep key="property" data={homeData} onChange={setHomeData} />}
          {currentStep === 2 && <RoomsStep key="rooms" data={homeData} onChange={setHomeData} />}
          {currentStep === 3 && <AppliancesStep key="appliances" data={homeData} onChange={setHomeData} />}
          {currentStep === 4 && <PaintStep key="paint" data={homeData} onChange={setHomeData} />}
          {currentStep === 5 && <SystemsStep key="systems" data={homeData} onChange={setHomeData} />}
          {currentStep === 6 && <EmergencyStep key="emergency" data={homeData} onChange={setHomeData} />}
          {currentStep === 7 && <DocumentImportStep key="documents" data={homeData} onChange={setHomeData} />}
          {currentStep === 8 && <ReviewStep key="review" data={homeData} />}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      {!isFirstStep && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-40">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={goPrev}
              className="flex items-center gap-2 px-5 py-3 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              {!isLastStep && (
                <button
                  onClick={goNext}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={isLastStep ? finishOnboarding : goNext}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  isLastStep
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLastStep ? (
                  <>
                    Go to HomeBase
                    <Home className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
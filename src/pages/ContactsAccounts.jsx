import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Search, Phone, Mail, Globe, MapPin, Star,
  Droplets, Zap, Flame, Thermometer, Wrench, Trees, Palette,
  Key, Home, Sparkles, Bug, Wifi, Trash2, Tv, Sun, Shield,
  Bell, Building2, ChevronRight, ChevronDown, Copy, Check,
  Edit3, DollarSign, Calendar, Eye, EyeOff, ExternalLink,
  Filter, Users
} from 'lucide-react';
import { toast } from 'sonner';
import { getHomeData, saveHomeData, generateId } from '../lib/homeDataStore';

// ─── Trade & Utility Type Configs ─────────────────────────────────────
const TRADE_TYPES = [
  { id: 'plumber', label: 'Plumber', icon: Droplets, color: 'bg-blue-600' },
  { id: 'electrician', label: 'Electrician', icon: Zap, color: 'bg-yellow-600' },
  { id: 'hvac', label: 'HVAC', icon: Thermometer, color: 'bg-cyan-600' },
  { id: 'handyman', label: 'Handyman', icon: Wrench, color: 'bg-gray-600' },
  { id: 'landscaper', label: 'Landscaper', icon: Trees, color: 'bg-green-600' },
  { id: 'painter', label: 'Painter', icon: Palette, color: 'bg-pink-600' },
  { id: 'roofer', label: 'Roofer', icon: Home, color: 'bg-slate-600' },
  { id: 'general_contractor', label: 'General Contractor', icon: Wrench, color: 'bg-orange-600' },
  { id: 'pest_control', label: 'Pest Control', icon: Bug, color: 'bg-red-600' },
  { id: 'cleaning', label: 'Cleaning', icon: Sparkles, color: 'bg-violet-600' },
  { id: 'locksmith', label: 'Locksmith', icon: Key, color: 'bg-amber-600' },
  { id: 'other', label: 'Other', icon: Users, color: 'bg-gray-500' },
];

const UTILITY_TYPES = [
  { id: 'electric', label: 'Electric', icon: Zap, color: 'bg-yellow-500' },
  { id: 'gas', label: 'Gas', icon: Flame, color: 'bg-orange-500' },
  { id: 'water_sewer', label: 'Water / Sewer', icon: Droplets, color: 'bg-blue-500' },
  { id: 'internet', label: 'Internet', icon: Wifi, color: 'bg-indigo-500' },
  { id: 'trash', label: 'Trash', icon: Trash2, color: 'bg-green-600' },
  { id: 'cable_tv', label: 'Cable / TV', icon: Tv, color: 'bg-purple-500' },
  { id: 'phone', label: 'Phone', icon: Phone, color: 'bg-slate-500' },
  { id: 'solar', label: 'Solar', icon: Sun, color: 'bg-amber-500' },
  { id: 'home_warranty', label: 'Home Warranty', icon: Shield, color: 'bg-emerald-500' },
  { id: 'alarm_monitoring', label: 'Alarm / Monitoring', icon: Bell, color: 'bg-red-500' },
  { id: 'hoa', label: 'HOA', icon: Building2, color: 'bg-stone-500' },
  { id: 'other', label: 'Other', icon: Globe, color: 'bg-gray-500' },
];

const getTradeConfig = (tradeId) => TRADE_TYPES.find(t => t.id === tradeId) || TRADE_TYPES[TRADE_TYPES.length - 1];
const getUtilityConfig = (typeId) => UTILITY_TYPES.find(t => t.id === typeId) || UTILITY_TYPES[UTILITY_TYPES.length - 1];

// ─── Copy Button ──────────────────────────────────────────────────────
const CopyBtn = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title={`Copy ${label}`}>
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
    </button>
  );
};

// ─── Star Rating ──────────────────────────────────────────────────────
const StarRating = ({ rating, onChange, size = 'sm' }) => {
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            className={`${starSize} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );
};

// ─── Provider Card ────────────────────────────────────────────────────
const ProviderCard = ({ contact, onClick }) => {
  const trade = getTradeConfig(contact.trade);
  const TradeIcon = trade.icon;
  const lastJob = contact.jobs?.[contact.jobs.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 ${trade.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <TradeIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{contact.name}</h3>
            {contact.isEmergency && (
              <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-medium rounded-md">911</span>
            )}
            {contact.isFavorite && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
          </div>
          {contact.company && <p className="text-xs text-gray-500 truncate">{contact.company}</p>}
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 ${trade.color}/10 text-xs font-medium rounded-md`} style={{ color: 'inherit' }}>
              {trade.label}
            </span>
            {contact.rating > 0 && <StarRating rating={contact.rating} size="sm" />}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 mt-1" />
      </div>

      {contact.phone && (
        <a
          href={`tel:${contact.phone.replace(/\D/g, '')}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 mt-3 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-sm text-blue-600 font-medium">{contact.phone}</span>
        </a>
      )}

      {lastJob && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Last job</p>
          <p className="text-xs text-gray-600 mt-0.5 truncate">{lastJob.description}</p>
          <div className="flex items-center gap-2 mt-1">
            {lastJob.cost && <span className="text-xs font-medium text-gray-700">${Number(lastJob.cost).toLocaleString()}</span>}
            {lastJob.date && <span className="text-xs text-gray-400">{lastJob.date}</span>}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ─── Utility Card ─────────────────────────────────────────────────────
const UtilityCard = ({ utility, onClick }) => {
  const config = getUtilityConfig(utility.utilityType);
  const TypeIcon = config.icon;
  const [showAccount, setShowAccount] = useState(false);

  const maskedAccount = utility.accountNumber
    ? '••••' + utility.accountNumber.slice(-4)
    : 'Not set';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 ${config.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <TypeIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{utility.provider || config.label}</h3>
          <p className="text-xs text-gray-500">{config.label}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 mt-1" />
      </div>

      <div className="mt-3 space-y-2">
        {/* Account Number */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Account</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono text-gray-700">
              {showAccount ? utility.accountNumber : maskedAccount}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowAccount(!showAccount); }}
              className="p-1 rounded hover:bg-gray-100"
            >
              {showAccount ? <EyeOff className="w-3 h-3 text-gray-400" /> : <Eye className="w-3 h-3 text-gray-400" />}
            </button>
            {utility.accountNumber && (
              <span onClick={(e) => e.stopPropagation()}>
                <CopyBtn text={utility.accountNumber} label="Account number" />
              </span>
            )}
          </div>
        </div>

        {/* Monthly Cost */}
        {utility.avgMonthlyCost && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Monthly</span>
            <span className="text-sm font-semibold text-gray-900">${Number(utility.avgMonthlyCost).toLocaleString()}/mo</span>
          </div>
        )}

        {/* Autopay Badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Autopay</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
            utility.autopay ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
          }`}>
            {utility.autopay ? 'On' : 'Off'}
          </span>
        </div>
      </div>

      {/* Contract warning */}
      {utility.contractEndDate && (() => {
        const daysLeft = Math.ceil((new Date(utility.contractEndDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 60 && daysLeft > 0) {
          return (
            <div className="mt-3 px-3 py-2 bg-amber-50 rounded-xl">
              <p className="text-xs text-amber-700 font-medium">Contract ends in {daysLeft} days</p>
            </div>
          );
        }
        return null;
      })()}
    </motion.div>
  );
};

// ─── Add/Edit Provider Modal ──────────────────────────────────────────
const ProviderModal = ({ isOpen, onClose, onSave, editData }) => {
  const [form, setForm] = useState({
    name: '', company: '', trade: 'plumber', phone: '', email: '',
    website: '', address: '', rating: 0, isEmergency: false,
    isFavorite: false, notes: '', jobs: [],
  });

  useEffect(() => {
    if (editData) setForm({ ...editData });
    else setForm({ name: '', company: '', trade: 'plumber', phone: '', email: '', website: '', address: '', rating: 0, isEmergency: false, isFavorite: false, notes: '', jobs: [] });
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    onSave({
      ...form,
      id: editData?.id || generateId(),
      type: 'provider',
      createdAt: editData?.createdAt || new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{editData ? 'Edit Provider' : 'Add Provider'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="Mike's Plumbing" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Company</label>
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="Optional company name" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Trade</label>
            <select value={form.trade} onChange={(e) => setForm({ ...form, trade: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 bg-white">
              {TRADE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="mike@plumbing.com" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Website</label>
            <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="https://..." />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</label>
            <div className="mt-1"><StarRating rating={form.rating} onChange={(r) => setForm({ ...form, rating: r })} size="lg" /></div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none" placeholder="Any notes..." />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isEmergency} onChange={(e) => setForm({ ...form, isEmergency: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
              <span className="text-sm text-gray-700">Emergency contact</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFavorite} onChange={(e) => setForm({ ...form, isFavorite: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" />
              <span className="text-sm text-gray-700">Favorite</span>
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
            {editData ? 'Save Changes' : 'Add Provider'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Add/Edit Utility Modal ───────────────────────────────────────────
const UtilityModal = ({ isOpen, onClose, onSave, editData }) => {
  const [form, setForm] = useState({
    utilityType: 'electric', provider: '', accountNumber: '', phone: '',
    website: '', loginEmail: '', avgMonthlyCost: '', billingCycle: 'monthly',
    autopay: false, paymentMethod: '', contractEndDate: '', notes: '', isActive: true,
  });

  useEffect(() => {
    if (editData) setForm({ ...editData });
    else setForm({ utilityType: 'electric', provider: '', accountNumber: '', phone: '', website: '', loginEmail: '', avgMonthlyCost: '', billingCycle: 'monthly', autopay: false, paymentMethod: '', contractEndDate: '', notes: '', isActive: true });
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.provider.trim()) { toast.error('Provider name is required'); return; }
    onSave({
      ...form,
      id: editData?.id || generateId(),
      type: 'utility',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{editData ? 'Edit Account' : 'Add Utility Account'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
            <select value={form.utilityType} onChange={(e) => setForm({ ...form, utilityType: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 bg-white">
              {UTILITY_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Provider *</label>
            <input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="PG&E, Comcast, etc." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account Number</label>
              <input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="1234567890" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Support Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="(800) 555-1234" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Website / Login URL</label>
              <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Login Email</label>
              <input value={form.loginEmail} onChange={(e) => setForm({ ...form, loginEmail: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="you@email.com" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Monthly Cost</label>
              <input type="number" value={form.avgMonthlyCost} onChange={(e) => setForm({ ...form, avgMonthlyCost: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="150" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Cycle</label>
              <select value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 bg-white">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contract End</label>
              <input type="date" value={form.contractEndDate} onChange={(e) => setForm({ ...form, contractEndDate: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.autopay} onChange={(e) => setForm({ ...form, autopay: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Autopay enabled</span>
            </label>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</label>
            <input value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="Visa ending 4242" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none" placeholder="Any notes..." />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
            {editData ? 'Save Changes' : 'Add Account'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Detail Slide-Over ────────────────────────────────────────────────
const DetailPanel = ({ item, onClose, onEdit, onDelete, onAddJob }) => {
  if (!item) return null;

  const isProvider = item.type === 'provider';
  const config = isProvider ? getTradeConfig(item.trade) : getUtilityConfig(item.utilityType);
  const ConfigIcon = config.icon;
  const totalSpend = isProvider ? (item.jobs || []).reduce((sum, j) => sum + (Number(j.cost) || 0), 0) : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${config.color} rounded-xl flex items-center justify-center`}>
                  <ConfigIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{isProvider ? item.name : item.provider}</h2>
                  <p className="text-sm text-gray-500">{isProvider ? (item.company || config.label) : config.label}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onEdit(item)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => { onDelete(item.id); onClose(); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-medium text-red-600 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="p-6 space-y-3">
            {item.phone && (
              <a href={`tel:${item.phone.replace(/\D/g, '')}`} className="flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">{item.phone}</span>
              </a>
            )}
            {item.email && (
              <a href={`mailto:${item.email}`} className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <Mail className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{item.email}</span>
              </a>
            )}
            {item.website && (
              <a href={item.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <ExternalLink className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700 truncate">{item.website}</span>
              </a>
            )}

            {/* Provider-specific */}
            {isProvider && (
              <>
                {item.rating > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Rating</span>
                    <StarRating rating={item.rating} size="sm" />
                  </div>
                )}
                {totalSpend > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Total spent</span>
                    <span className="text-sm font-semibold text-gray-900">${totalSpend.toLocaleString()}</span>
                  </div>
                )}
                {item.notes && (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{item.notes}</p>
                  </div>
                )}

                {/* Job History */}
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase">Job History</h3>
                    <button onClick={() => onAddJob(item)} className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-700">
                      <Plus className="w-3 h-3" /> Add Job
                    </button>
                  </div>
                  {(item.jobs || []).length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No jobs recorded yet</p>
                  ) : (
                    <div className="space-y-3">
                      {[...(item.jobs || [])].reverse().map((job) => (
                        <div key={job.id} className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm font-medium text-gray-900">{job.description}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {job.cost && <span className="text-xs font-semibold text-gray-700">${Number(job.cost).toLocaleString()}</span>}
                            {job.date && <span className="text-xs text-gray-400">{job.date}</span>}
                          </div>
                          {job.notes && <p className="text-xs text-gray-500 mt-1">{job.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Utility-specific */}
            {!isProvider && (
              <>
                {item.accountNumber && (
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Account #</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-gray-900">{item.accountNumber}</span>
                      <CopyBtn text={item.accountNumber} label="Account" />
                    </div>
                  </div>
                )}
                {item.loginEmail && (
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Login</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{item.loginEmail}</span>
                      <CopyBtn text={item.loginEmail} label="Login email" />
                    </div>
                  </div>
                )}
                {item.avgMonthlyCost && (
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Avg Monthly</span>
                    <span className="text-sm font-semibold text-gray-900">${Number(item.avgMonthlyCost).toLocaleString()}</span>
                  </div>
                )}
                {item.paymentMethod && (
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Payment</span>
                    <span className="text-sm text-gray-900">{item.paymentMethod}</span>
                  </div>
                )}
                {item.billingCycle && (
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Billing</span>
                    <span className="text-sm text-gray-900 capitalize">{item.billingCycle}</span>
                  </div>
                )}
                {item.notes && (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">Notes</p>
                    <p className="text-sm text-gray-700">{item.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Add Job Modal ────────────────────────────────────────────────────
const AddJobModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({ description: '', cost: '', date: '', notes: '' });

  useEffect(() => {
    if (isOpen) setForm({ description: '', cost: '', date: new Date().toISOString().split('T')[0], notes: '' });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Add Job Record</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description *</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="Fixed leaking kitchen faucet" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</label>
              <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="250" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
          <button onClick={() => { if (!form.description.trim()) { toast.error('Description required'); return; } onSave({ ...form, id: generateId() }); }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">Add Job</button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
export default function ContactsAccounts() {
  const [contacts, setContacts] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [editingUtility, setEditingUtility] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [jobModalProvider, setJobModalProvider] = useState(null);

  // Load data
  useEffect(() => {
    const data = getHomeData();
    setContacts(data.contacts || []);
    setUtilities(data.utilities || []);
  }, []);

  // Save helpers
  const saveContacts = (updated) => {
    setContacts(updated);
    const data = getHomeData();
    data.contacts = updated;
    saveHomeData(data);
  };

  const saveUtilities = (updated) => {
    setUtilities(updated);
    const data = getHomeData();
    data.utilities = updated;
    saveHomeData(data);
  };

  const handleSaveProvider = (provider) => {
    const exists = contacts.find(c => c.id === provider.id);
    const updated = exists ? contacts.map(c => c.id === provider.id ? provider : c) : [...contacts, provider];
    saveContacts(updated);
    setShowProviderModal(false);
    setEditingProvider(null);
    toast.success(exists ? 'Provider updated' : 'Provider added');
  };

  const handleSaveUtility = (utility) => {
    const exists = utilities.find(u => u.id === utility.id);
    const updated = exists ? utilities.map(u => u.id === utility.id ? utility : u) : [...utilities, utility];
    saveUtilities(updated);
    setShowUtilityModal(false);
    setEditingUtility(null);
    toast.success(exists ? 'Account updated' : 'Account added');
  };

  const handleDelete = (id) => {
    const inContacts = contacts.find(c => c.id === id);
    if (inContacts) {
      saveContacts(contacts.filter(c => c.id !== id));
      toast.success('Provider removed');
    } else {
      saveUtilities(utilities.filter(u => u.id !== id));
      toast.success('Account removed');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(null);
    if (item.type === 'provider') {
      setEditingProvider(item);
      setShowProviderModal(true);
    } else {
      setEditingUtility(item);
      setShowUtilityModal(true);
    }
  };

  const handleAddJob = (provider) => {
    setJobModalProvider(provider);
  };

  const handleSaveJob = (job) => {
    const updated = contacts.map(c => {
      if (c.id === jobModalProvider.id) {
        return { ...c, jobs: [...(c.jobs || []), job], lastContactedAt: new Date().toISOString() };
      }
      return c;
    });
    saveContacts(updated);
    setJobModalProvider(null);
    // Update detail panel
    const updatedItem = updated.find(c => c.id === jobModalProvider.id);
    if (selectedItem?.id === jobModalProvider.id) setSelectedItem(updatedItem);
    toast.success('Job recorded');
  };

  // Filter
  const search = searchQuery.toLowerCase();
  const filteredProviders = contacts.filter(c => {
    if (search && !c.name.toLowerCase().includes(search) && !(c.company || '').toLowerCase().includes(search)) return false;
    if (activeTab === 'emergency') return c.isEmergency;
    return activeTab === 'all' || activeTab === 'providers';
  });

  const filteredUtilities = utilities.filter(u => {
    if (search && !u.provider.toLowerCase().includes(search)) return false;
    return activeTab === 'all' || activeTab === 'utilities';
  });

  // Monthly total
  const monthlyTotal = utilities.reduce((sum, u) => sum + (Number(u.avgMonthlyCost) || 0), 0);

  const isEmpty = contacts.length === 0 && utilities.length === 0;

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'providers', label: 'Providers' },
    { id: 'utilities', label: 'Utilities' },
    { id: 'emergency', label: 'Emergency' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-light text-gray-900 tracking-tight">Contacts & Accounts</h1>
            <p className="text-sm text-gray-500 mt-1">Service providers, utility accounts, and emergency contacts</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {showAddMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => { setShowAddMenu(false); setEditingProvider(null); setShowProviderModal(true); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm text-gray-700"
                    >
                      <Users className="w-4 h-4 text-blue-600" />
                      Service Provider
                    </button>
                    <button
                      onClick={() => { setShowAddMenu(false); setEditingUtility(null); setShowUtilityModal(true); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left text-sm text-gray-700 border-t border-gray-100"
                    >
                      <DollarSign className="w-4 h-4 text-green-600" />
                      Utility Account
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Monthly Summary (when utilities exist) */}
        {utilities.length > 0 && (activeTab === 'all' || activeTab === 'utilities') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 mb-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/70 tracking-widest uppercase">Est. Monthly Utilities</p>
                <p className="text-3xl font-light mt-1">${monthlyTotal.toLocaleString()}/mo</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80">{utilities.length} account{utilities.length !== 1 ? 's' : ''}</p>
                <p className="text-sm text-white/80">{utilities.filter(u => u.autopay).length} on autopay</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search + Tabs */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts and accounts..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex items-center bg-gray-100 rounded-xl p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.id === 'emergency' && contacts.filter(c => c.isEmergency).length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px]">
                    {contacts.filter(c => c.isEmergency).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No contacts or accounts yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Add your service providers and utility accounts so you never lose track of them again.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { setEditingProvider(null); setShowProviderModal(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Users className="w-4 h-4" /> Add Provider
              </button>
              <button
                onClick={() => { setEditingUtility(null); setShowUtilityModal(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors"
              >
                <DollarSign className="w-4 h-4" /> Add Utility Account
              </button>
            </div>
          </motion.div>
        )}

        {/* Providers Section */}
        {filteredProviders.length > 0 && (
          <div className="mb-8">
            {activeTab === 'all' && (
              <h2 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4">Service Providers</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProviders
                .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))
                .map((contact) => (
                  <ProviderCard key={contact.id} contact={contact} onClick={() => setSelectedItem(contact)} />
                ))}
            </div>
          </div>
        )}

        {/* Utilities Section */}
        {filteredUtilities.length > 0 && (
          <div>
            {activeTab === 'all' && (
              <h2 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4">Utility Accounts</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUtilities.map((utility) => (
                <UtilityCard key={utility.id} utility={utility} onClick={() => setSelectedItem(utility)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProviderModal isOpen={showProviderModal} onClose={() => { setShowProviderModal(false); setEditingProvider(null); }} onSave={handleSaveProvider} editData={editingProvider} />
      <UtilityModal isOpen={showUtilityModal} onClose={() => { setShowUtilityModal(false); setEditingUtility(null); }} onSave={handleSaveUtility} editData={editingUtility} />
      <DetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} onEdit={handleEdit} onDelete={handleDelete} onAddJob={handleAddJob} />
      <AddJobModal isOpen={!!jobModalProvider} onClose={() => setJobModalProvider(null)} onSave={handleSaveJob} />
    </div>
  );
}

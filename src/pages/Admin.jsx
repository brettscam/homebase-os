import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Building2, Plus, X, Edit3, Trash2, Download, Upload,
  ArrowRight, Users, Bell, Shield, Check, ChevronRight,
  Home, MapPin, Settings, FileText, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useProperty } from '../lib/PropertyContext';
import { useAuth } from '../lib/AuthContext';
import { createProperty, updateProperty, deleteProperty } from '../lib/supabaseDataStore';

// ─── Property Card ────────────────────────────────────────────────────
const PropertyCard = ({ property, isActive, onSwitch, onEdit, onDelete }) => {
  const statusColors = {
    active: 'bg-green-50 text-green-600',
    vacant: 'bg-amber-50 text-amber-600',
    maintenance: 'bg-red-50 text-red-600',
  };
  const typeLabels = {
    primary_residence: 'Primary',
    rental: 'Rental',
    vacation: 'Vacation',
    commercial: 'Commercial',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl p-5 border-2 transition-all ${
        isActive ? 'border-blue-400 shadow-md' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isActive ? 'bg-blue-600' : 'bg-gray-200'
        }`}>
          <Building2 className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{property.name}</h3>
            {isActive && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded-md">Active</span>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{property.address}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${statusColors[property.status] || statusColors.active}`}>
              {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
            </span>
            <span className="text-[10px] text-gray-400">{typeLabels[property.type] || 'Home'}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        {!isActive && (
          <button onClick={onSwitch} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors">
            <Check className="w-3.5 h-3.5" /> Switch to this
          </button>
        )}
        <button onClick={onEdit} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium text-gray-600 transition-colors">
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        {!isActive && (
          <button onClick={onDelete} className="px-3 py-2 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-medium text-red-600 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Add Property Modal ───────────────────────────────────────────────
const AddPropertyModal = ({ isOpen, onClose, onSave, editData }) => {
  const [form, setForm] = useState({
    name: '', address: '', type: 'primary_residence', status: 'active',
  });

  useEffect(() => {
    if (editData) setForm({ name: editData.name, address: editData.address, type: editData.type, status: editData.status });
    else setForm({ name: '', address: '', type: 'primary_residence', status: 'active' });
  }, [editData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{editData ? 'Edit Property' : 'Add Property'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Property Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="Mill Valley Home" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address *</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="142 Cascade Dr, Mill Valley, CA" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 bg-white">
                <option value="primary_residence">Primary Residence</option>
                <option value="rental">Rental</option>
                <option value="vacation">Vacation</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 bg-white">
                <option value="active">Active</option>
                <option value="vacant">Vacant</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
          <button onClick={() => {
            if (!form.name.trim() || !form.address.trim()) { toast.error('Name and address are required'); return; }
            onSave(form);
          }} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
            {editData ? 'Save' : 'Add Property'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Admin Page ──────────────────────────────────────────────────
export default function Admin() {
  const { activeProperty, allProperties, homeData, refreshProperties, switchProperty } = useProperty();
  const { user } = useAuth();
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('properties');

  const handleSaveProperty = async (propertyFormData) => {
    try {
      if (editingProperty) {
        await updateProperty(editingProperty.id, {
          name: propertyFormData.name,
          address: propertyFormData.address,
        });
      } else {
        await createProperty(user.id, {
          name: propertyFormData.name,
          address: propertyFormData.address,
          is_active: allProperties.length === 0,
        });
      }
      await refreshProperties();
      setShowPropertyModal(false);
      setEditingProperty(null);
      toast.success(editingProperty ? 'Property updated' : 'Property added');
    } catch (err) {
      console.error('Failed to save property:', err);
      toast.error('Failed to save property');
    }
  };

  const handleSwitchProperty = async (propertyId) => {
    try {
      // Deactivate all, activate selected
      for (const prop of allProperties) {
        if (prop.id === propertyId) {
          await updateProperty(prop.id, { is_active: true });
        } else if (prop.is_active) {
          await updateProperty(prop.id, { is_active: false });
        }
      }
      switchProperty(propertyId);
      toast.success('Switched property');
    } catch (err) {
      console.error('Failed to switch property:', err);
      toast.error('Failed to switch property');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (allProperties.length <= 1) {
      toast.error("Can't delete your only property");
      return;
    }
    try {
      await deleteProperty(propertyId);
      await refreshProperties();
      toast.success('Property deleted');
    } catch (err) {
      console.error('Failed to delete property:', err);
      toast.error('Failed to delete property');
    }
  };

  const handleExport = () => {
    const exportData = { property: activeProperty, ...(homeData || {}) };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `homebase-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  const handleClearData = async () => {
    if (!activeProperty?.id || !user?.id) return;
    try {
      const addr = activeProperty.address;
      await deleteProperty(activeProperty.id);
      await createProperty(user.id, { name: activeProperty.name || 'My Home', address: addr, is_active: true });
      await refreshProperties();
      setShowClearConfirm(false);
      toast.success('Property data cleared');
    } catch (err) {
      console.error('Failed to clear data:', err);
      toast.error('Failed to clear data');
    }
  };

  const tabs = [
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'people', label: 'People', icon: Users },
    { id: 'data', label: 'Data', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-gray-400" />
            <h1 className="text-3xl font-light text-gray-900 tracking-tight">Admin</h1>
          </div>
          <p className="text-sm text-gray-500">Property management, data, and access control</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium text-gray-400 tracking-widest uppercase">Your Properties</h2>
              <button
                onClick={() => { setEditingProperty(null); setShowPropertyModal(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Property
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isActive={property.id === activeProperty?.id}
                  onSwitch={() => handleSwitchProperty(property.id)}
                  onEdit={() => { setEditingProperty(property); setShowPropertyModal(true); }}
                  onDelete={() => handleDeleteProperty(property.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* People Tab */}
        {activeTab === 'people' && (
          <div>
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">People & Access</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                Invite others to view your home data. Share with tenants, property managers, or contractors.
              </p>
              <button
                disabled
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 text-gray-400 rounded-xl text-sm font-medium mx-auto cursor-not-allowed"
              >
                <Plus className="w-4 h-4" /> Invite People
                <span className="px-2 py-0.5 bg-gray-300 text-gray-500 text-[10px] font-medium rounded-md ml-1">Coming Soon</span>
              </button>

              {/* Placeholder role explanations */}
              <div className="mt-10 grid grid-cols-2 gap-4 max-w-lg mx-auto text-left">
                {[
                  { role: 'Owner', desc: 'Full access to everything', icon: Shield, color: 'text-blue-600 bg-blue-50' },
                  { role: 'Manager', desc: 'Full access except billing', icon: Settings, color: 'text-purple-600 bg-purple-50' },
                  { role: 'Tenant', desc: 'Read-only key info', icon: Home, color: 'text-green-600 bg-green-50' },
                  { role: 'Contractor', desc: 'Temporary section access', icon: Wrench, color: 'text-orange-600 bg-orange-50' },
                ].map((r) => (
                  <div key={r.role} className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className={`w-8 h-8 rounded-lg ${r.color} flex items-center justify-center mb-2`}>
                      <r.icon className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{r.role}</p>
                    <p className="text-xs text-gray-500">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            {/* Export */}
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-left"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">Export Property Data</h3>
                <p className="text-xs text-gray-500 mt-0.5">Download all data as JSON. Includes rooms, appliances, contacts, utilities, and more.</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>

            {/* Import via Onboarding */}
            <Link
              to={createPageUrl('Onboarding')}
              className="w-full flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">Import / Update Data</h3>
                <p className="text-xs text-gray-500 mt-0.5">Upload documents and use AI to extract home information.</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </Link>

            {/* Transfer */}
            <div className="w-full flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 opacity-60">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">Transfer to New Owner</h3>
                <p className="text-xs text-gray-500 mt-0.5">Generate a transfer package when selling your property.</p>
              </div>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-medium rounded-md">Coming Soon</span>
            </div>

            {/* Clear Data */}
            <div className="pt-8 border-t border-gray-200">
              <h3 className="text-xs font-medium text-red-400 tracking-widest uppercase mb-3">Danger Zone</h3>
              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" /> Clear All Property Data
                </button>
              ) : (
                <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                  <p className="text-sm text-red-700 mb-3">This will permanently delete all data for the current property. This cannot be undone.</p>
                  <div className="flex items-center gap-3">
                    <button onClick={handleClearData} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors">
                      Yes, Delete Everything
                    </button>
                    <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 text-sm font-medium text-gray-600">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Placeholder */}
            <div className="pt-8 border-t border-gray-200">
              <h3 className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-3">Notifications</h3>
              <div className="space-y-3">
                {[
                  'Maintenance reminders',
                  'Warranty expiration alerts',
                  'Contract renewal reminders',
                  'Component replacement alerts',
                ].map((label) => (
                  <div key={label} className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100 opacity-60">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-medium rounded-md">Soon</span>
                      <div className="w-10 h-6 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <AddPropertyModal
        isOpen={showPropertyModal}
        onClose={() => { setShowPropertyModal(false); setEditingProperty(null); }}
        onSave={handleSaveProperty}
        editData={editingProperty}
      />
    </div>
  );
}

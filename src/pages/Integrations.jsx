import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useProperty } from '@/lib/PropertyContext';
import { useAuth } from '@/lib/AuthContext';
import { createEnergyBill, deleteEnergyBill, getEnergyBills } from '@/lib/supabaseDataStore';
import {
  Zap, Flame, Droplets, Upload, Plus, X, Loader2,
  Check, ChevronDown, Wifi, Thermometer, Home,
  FileText, Link2, AlertCircle, Trash2, Calendar
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Utility Bill Entry Form ────────────────────────────────
const BillEntryForm = ({ propertyId, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    utility_type: 'electric',
    billing_period_start: '',
    billing_period_end: '',
    amount_dollars: '',
    usage_amount: '',
    usage_unit: 'kWh',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const utilityTypes = [
    { value: 'electric', label: 'Electric', icon: Zap, unit: 'kWh' },
    { value: 'gas', label: 'Gas', icon: Flame, unit: 'therms' },
    { value: 'water', label: 'Water', icon: Droplets, unit: 'gallons' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount_dollars) {
      toast.error('Enter the bill amount');
      return;
    }
    setSaving(true);
    try {
      await createEnergyBill({
        property_id: propertyId,
        utility_type: form.utility_type,
        billing_period_start: form.billing_period_start || null,
        billing_period_end: form.billing_period_end || null,
        amount_dollars: parseFloat(form.amount_dollars),
        usage_amount: form.usage_amount ? parseFloat(form.usage_amount) : null,
        usage_unit: form.usage_unit,
        source: 'manual',
        notes: form.notes,
      });
      toast.success('Bill added');
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save bill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Add Energy Bill</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Type selector */}
      <div className="flex gap-2">
        {utilityTypes.map(ut => (
          <button
            key={ut.value}
            type="button"
            onClick={() => setForm({ ...form, utility_type: ut.value, usage_unit: ut.unit })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              form.utility_type === ut.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ut.icon className="w-4 h-4" />
            {ut.label}
          </button>
        ))}
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Period Start</label>
          <input
            type="date"
            value={form.billing_period_start}
            onChange={e => setForm({ ...form, billing_period_start: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Period End</label>
          <input
            type="date"
            value={form.billing_period_end}
            onChange={e => setForm({ ...form, billing_period_end: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Amount + Usage */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            value={form.amount_dollars}
            onChange={e => setForm({ ...form, amount_dollars: e.target.value })}
            placeholder="125.50"
            required
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Usage ({form.usage_unit})</label>
          <input
            type="number"
            step="0.01"
            value={form.usage_amount}
            onChange={e => setForm({ ...form, usage_amount: e.target.value })}
            placeholder="850"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Notes (optional)</label>
        <input
          type="text"
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
          placeholder="e.g., Unusually hot month"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Save Bill
      </button>
    </motion.form>
  );
};

// ─── Bill History List ──────────────────────────────────────
const BillHistory = ({ bills, onDelete }) => {
  if (!bills || bills.length === 0) return null;

  const typeIcon = { electric: Zap, gas: Flame, water: Droplets };
  const typeColor = { electric: 'text-yellow-500', gas: 'text-orange-500', water: 'text-blue-500' };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Bill History</h3>
      <div className="space-y-2">
        {bills.map(bill => {
          const Icon = typeIcon[bill.utility_type] || Zap;
          const color = typeColor[bill.utility_type] || 'text-gray-500';
          return (
            <div key={bill.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Icon className={`w-5 h-5 ${color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 capitalize">{bill.utility_type}</p>
                <p className="text-xs text-gray-500">
                  {bill.billing_period_start && bill.billing_period_end
                    ? `${bill.billing_period_start} to ${bill.billing_period_end}`
                    : 'No date range'}
                  {bill.usage_amount ? ` | ${bill.usage_amount} ${bill.usage_unit}` : ''}
                </p>
              </div>
              <p className="text-sm font-bold text-gray-900">${bill.amount_dollars}</p>
              <button
                onClick={() => onDelete(bill.id)}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Integrations Page ─────────────────────────────────
export default function Integrations() {
  const { activeProperty, homeData: supaData, isLoading, refreshProperties } = useProperty();
  const [showAddBill, setShowAddBill] = useState(false);
  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);

  // Load bills from Supabase or context
  React.useEffect(() => {
    if (supaData?.energyBills) {
      setBills(supaData.energyBills);
    }
  }, [supaData]);

  const handleBillSaved = async () => {
    setShowAddBill(false);
    await refreshProperties();
  };

  const handleDeleteBill = async (billId) => {
    try {
      await deleteEnergyBill(billId);
      setBills(prev => prev.filter(b => b.id !== billId));
      toast.success('Bill removed');
    } catch {
      toast.error('Failed to delete bill');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const propertyId = activeProperty?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-light text-gray-900 tracking-tight mb-2">Integrations</h1>
          <p className="text-gray-500">
            Connect your accounts and upload bills to power your Insights dashboard.
          </p>
        </motion.div>

        {/* Manual Bill Entry */}
        <div className="mb-6">
          {!showAddBill ? (
            <button
              onClick={() => setShowAddBill(true)}
              disabled={!propertyId}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Energy Bill
            </button>
          ) : (
            propertyId && (
              <BillEntryForm
                propertyId={propertyId}
                onSaved={handleBillSaved}
                onCancel={() => setShowAddBill(false)}
              />
            )
          )}
          {!propertyId && (
            <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Complete onboarding first to start adding bills.
            </p>
          )}
        </div>

        <BillHistory bills={bills} onDelete={handleDeleteBill} />
      </div>
    </div>
  );
}

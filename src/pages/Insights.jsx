import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProperty } from '@/lib/PropertyContext';
import { systemsArrayToLegacy } from '@/lib/supabaseDataStore';
import {
  TrendingUp, TrendingDown, DollarSign, Zap, Droplets, Flame,
  AlertTriangle, CheckCircle2, Clock, Home, Thermometer,
  BarChart3, ArrowRight, Lightbulb, Calendar, ChevronRight,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// ─── Component Lifecycle Data (moved from Projects) ────────────────
const COMPONENT_CATEGORIES = [
  { id: 'roof', label: 'Roof', icon: Home, defaultLifespan: 25, lifespanYears: { asphalt: 25, metal: 50, tile: 50, wood: 30, flat: 15 } },
  { id: 'hvac', label: 'HVAC System', icon: Thermometer, defaultLifespan: 15, lifespanYears: { central_ac: 15, furnace: 20, heat_pump: 15, boiler: 25, mini_split: 20 } },
  { id: 'water_heater', label: 'Water Heater', icon: Droplets, defaultLifespan: 10, lifespanYears: { tank: 10, tankless: 20, hybrid: 13 } },
  { id: 'appliance', label: 'Appliances', icon: Zap, defaultLifespan: 12, lifespanYears: { refrigerator: 13, dishwasher: 10, washer: 11, dryer: 13, oven: 15 } },
];

function getYearsRemaining(installYear, lifespanYears) {
  if (!installYear) return null;
  const currentYear = new Date().getFullYear();
  const age = currentYear - parseInt(installYear);
  return Math.max(0, lifespanYears - age);
}

function getHealthColor(remaining, lifespan) {
  if (remaining === null) return 'text-gray-400';
  const pct = remaining / lifespan;
  if (pct > 0.5) return 'text-green-600';
  if (pct > 0.2) return 'text-amber-500';
  return 'text-red-500';
}

function getHealthBg(remaining, lifespan) {
  if (remaining === null) return 'bg-gray-50 border-gray-200';
  const pct = remaining / lifespan;
  if (pct > 0.5) return 'bg-green-50 border-green-200';
  if (pct > 0.2) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

// ─── Energy Summary Card ────────────────────────────────────
const EnergySummaryCard = ({ bills }) => {
  if (!bills || bills.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Energy Usage</h3>
            <p className="text-xs text-gray-500">No data yet</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Upload your energy bills in the <strong>Integrations</strong> tab to see consumption trends, estimated costs, and savings opportunities.
        </p>
        <Link
          to={createPageUrl('Integrations')}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Add your first bill
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Calculate monthly averages
  const electricBills = bills.filter(b => b.utility_type === 'electric');
  const gasBills = bills.filter(b => b.utility_type === 'gas');
  const waterBills = bills.filter(b => b.utility_type === 'water');

  const avgElectric = electricBills.length
    ? (electricBills.reduce((s, b) => s + (b.amount_dollars || 0), 0) / electricBills.length).toFixed(0)
    : null;
  const avgGas = gasBills.length
    ? (gasBills.reduce((s, b) => s + (b.amount_dollars || 0), 0) / gasBills.length).toFixed(0)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Energy Summary</h3>
          <p className="text-xs text-gray-500">{bills.length} bill{bills.length !== 1 ? 's' : ''} tracked</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {avgElectric && (
          <div className="text-center">
            <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">${avgElectric}</p>
            <p className="text-xs text-gray-500">Avg Electric/mo</p>
          </div>
        )}
        {avgGas && (
          <div className="text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">${avgGas}</p>
            <p className="text-xs text-gray-500">Avg Gas/mo</p>
          </div>
        )}
        {!avgElectric && !avgGas && (
          <div className="col-span-3 text-center text-sm text-gray-400">
            Add bills to see averages
          </div>
        )}
      </div>
    </div>
  );
};

// ─── System Health Card ─────────────────────────────────────
const SystemHealthCard = ({ systems, appliances }) => {
  // Build items from systems and appliances that have install dates
  const items = [];

  // Check systems
  for (const cat of COMPONENT_CATEGORIES) {
    const sysData = systems?.[cat.id];
    if (sysData?.data?.installDate || sysData?.data?.installYear) {
      const yr = sysData.data.installYear || sysData.data.installDate?.slice(0, 4);
      if (yr) {
        const remaining = getYearsRemaining(yr, cat.defaultLifespan);
        items.push({
          label: cat.label,
          Icon: cat.icon,
          remaining,
          lifespan: cat.defaultLifespan,
          installYear: yr,
        });
      }
    }
  }

  // Check appliances
  for (const app of (appliances || [])) {
    const yr = app.install_date?.slice(0, 4) || app.installDate?.slice(0, 4);
    if (yr) {
      const appCat = COMPONENT_CATEGORIES.find(c => c.id === 'appliance');
      const specific = appCat.lifespanYears[app.type?.toLowerCase()] || appCat.defaultLifespan;
      const remaining = getYearsRemaining(yr, specific);
      items.push({
        label: app.name || app.type || 'Appliance',
        Icon: Zap,
        remaining,
        lifespan: specific,
        installYear: yr,
      });
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">System Health</h3>
          <p className="text-xs text-gray-500">Based on age and typical lifespans</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">
          Add install dates to your systems and appliances to see health projections.
        </p>
      ) : (
        <div className="space-y-3">
          {items.sort((a, b) => (a.remaining ?? 999) - (b.remaining ?? 999)).map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${getHealthBg(item.remaining, item.lifespan)}`}>
              <item.Icon className={`w-5 h-5 ${getHealthColor(item.remaining, item.lifespan)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
                <p className="text-xs text-gray-500">Installed {item.installYear}</p>
              </div>
              <div className="text-right">
                {item.remaining !== null ? (
                  <>
                    <p className={`text-sm font-bold ${getHealthColor(item.remaining, item.lifespan)}`}>
                      {item.remaining === 0 ? 'Due' : `${item.remaining}y left`}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Unknown</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Savings Opportunities ──────────────────────────────────
const SavingsOpportunities = ({ systems, appliances, bills }) => {
  const opportunities = [];

  // Check for aging appliances that could be replaced with energy-efficient models
  for (const app of (appliances || [])) {
    const yr = app.install_date?.slice(0, 4) || app.installDate?.slice(0, 4);
    if (yr && (new Date().getFullYear() - parseInt(yr)) > 10) {
      opportunities.push({
        title: `Replace ${app.name || app.type || 'old appliance'}`,
        description: `Installed in ${yr}. Newer Energy Star models can save 10-50% on energy for this appliance.`,
        estimatedSaving: '$50-200/yr',
        urgency: (new Date().getFullYear() - parseInt(yr)) > 15 ? 'high' : 'medium',
      });
    }
  }

  // Check HVAC age
  const hvac = (systems || []).find(s => s?.type === 'hvac');
  if (hvac?.data?.installDate || hvac?.data?.installYear) {
    const yr = hvac.data.installYear || hvac.data.installDate?.slice(0, 4);
    if (yr && (new Date().getFullYear() - parseInt(yr)) > 12) {
      opportunities.push({
        title: 'Upgrade HVAC system',
        description: `Your HVAC was installed in ${yr}. Modern heat pumps can reduce heating/cooling costs by 30-50%.`,
        estimatedSaving: '$300-800/yr',
        urgency: 'high',
      });
    }
  }

  if (opportunities.length === 0 && (!bills || bills.length === 0)) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Savings Opportunities</h3>
            <p className="text-xs text-gray-500">Add more data to unlock insights</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          As you add appliance details and energy bills, we'll identify ways to reduce your costs and improve efficiency.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Savings Opportunities</h3>
          <p className="text-xs text-gray-500">{opportunities.length} found</p>
        </div>
      </div>

      <div className="space-y-3">
        {opportunities.map((opp, i) => (
          <div key={i} className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{opp.title}</p>
                <p className="text-xs text-gray-600 mt-1">{opp.description}</p>
              </div>
              <span className="text-sm font-bold text-green-600 whitespace-nowrap">{opp.estimatedSaving}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Insights Page ─────────────────────────────────────
export default function Insights() {
  const { activeProperty, homeData: supaData, isLoading } = useProperty();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const bills = supaData?.energyBills || [];
  const systems = supaData?.systems || [];
  const appliances = supaData?.appliances || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-light text-gray-900 tracking-tight mb-2">Insights</h1>
          <p className="text-gray-500">
            Understand your home's health, energy usage, and where you can save money.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <EnergySummaryCard bills={bills} />
          </div>
          <SystemHealthCard systems={systems} appliances={appliances} />
          <SavingsOpportunities systems={systems} appliances={appliances} bills={bills} />
        </div>
      </div>
    </div>
  );
}

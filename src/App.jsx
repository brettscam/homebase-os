import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { PropertyProvider, useProperty } from '@/lib/PropertyContext';
import Login from '@/pages/Login';
import Onboarding from '@/pages/Onboarding';
import { HomeBaseLogo, HomeBaseLoader } from '@/components/HomeBaseLogo';
import { supabase } from '@/lib/supabase';
import React, { useState, useEffect } from 'react';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated } = useAuth();

  if (isLoadingAuth) {
    return <HomeBaseLoader message="Checking your account..." />;
  }

  // Not logged in → show login page
  if (!isAuthenticated) {
    return <Login />;
  }

  // Logged in → render the app with property context
  return (
    <PropertyProvider>
      <PropertyGate />
    </PropertyProvider>
  );
};

const ErrorScreen = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-hb-warm flex items-center justify-center p-6">
      <div className="max-w-sm mx-auto text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-hb-navy mb-2">Something went wrong</h2>
        <p className="text-sm text-hb-slate mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-hb-teal text-white rounded-xl font-medium w-full hover:bg-hb-teal-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

const ConnectingScreen = ({ onRetry }) => {
  const { user } = useAuth();
  const [checks, setChecks] = useState([]);

  const addCheck = (label, status, detail) => {
    setChecks(prev => [...prev.filter(c => c.label !== label), { label, status, detail }]);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const runDiagnostics = async () => {
      // Check 1: Env vars
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      addCheck('Env vars', url && key ? 'ok' : 'fail',
        `URL: ${url || '(NOT SET)'} | Key: ${key ? key.substring(0, 20) + '...' : '(NOT SET)'}`);
      if (!url || !key) return;

      // Check 2: Auth session
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (cancelled) return;
        addCheck('Auth session', error ? 'fail' : session ? 'ok' : 'warn',
          error ? error.message : session ? `Token: ${session.access_token?.substring(0, 15)}...` : 'No session found');
      } catch (e) {
        if (cancelled) return;
        addCheck('Auth session', 'fail', e.message);
      }

      // Check 3: Raw fetch (bypasses supabase-js entirely)
      try {
        addCheck('Raw REST fetch', 'loading', 'Fetching...');
        const { data: { session } } = await supabase.auth.getSession();
        const resp = await fetch(`${url}/rest/v1/properties?select=id&limit=1`, {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${session?.access_token || key}`,
          },
        });
        if (cancelled) return;
        const body = await resp.text();
        addCheck('Raw REST fetch', resp.ok ? 'ok' : 'fail',
          `HTTP ${resp.status}: ${body.substring(0, 150)}`);
      } catch (e) {
        if (cancelled) return;
        addCheck('Raw REST fetch', 'fail', e.message);
      }

      // Check 4: supabase-js query
      try {
        addCheck('Supabase JS query', 'loading', 'Querying...');
        const start = Date.now();
        const { data, error } = await supabase.from('properties').select('id').limit(1);
        if (cancelled) return;
        const ms = Date.now() - start;
        addCheck('Supabase JS query', error ? 'fail' : 'ok',
          error ? `${error.message} (${error.code})` : `OK in ${ms}ms — ${data?.length || 0} rows`);
      } catch (e) {
        if (cancelled) return;
        addCheck('Supabase JS query', 'fail', e.message);
      }

      // Check 5: User-specific query
      try {
        addCheck('User properties', 'loading', 'Querying...');
        const { data, error } = await supabase.from('properties').select('id, name').eq('user_id', user.id);
        if (cancelled) return;
        addCheck('User properties', error ? 'fail' : 'ok',
          error ? error.message : `${data?.length || 0} properties found`);
      } catch (e) {
        if (cancelled) return;
        addCheck('User properties', 'fail', e.message);
      }
    };

    runDiagnostics();
    return () => { cancelled = true; };
  }, [user]);

  const statusIcon = (s) => s === 'ok' ? 'bg-green-400' : s === 'fail' ? 'bg-red-400' : s === 'warn' ? 'bg-yellow-400' : 'bg-gray-300 animate-pulse';

  return (
    <div className="min-h-screen bg-hb-warm flex items-center justify-center p-6">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-6">
          <div className="text-hb-teal mb-4 flex justify-center">
            <HomeBaseLogo size={48} animate={false} />
          </div>
          <h2 className="text-lg font-semibold text-hb-navy">Connection Diagnostic</h2>
          <p className="text-xs text-hb-slate mt-1">User: {user?.email}</p>
        </div>

        <div className="space-y-2 mb-6">
          {checks.map(({ label, status, detail }) => (
            <div key={label} className="bg-white rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusIcon(status)}`} />
                <span className="text-sm font-medium text-hb-navy">{label}</span>
              </div>
              <p className="text-xs text-hb-slate mt-1 break-all font-mono">{detail}</p>
            </div>
          ))}
          {checks.length === 0 && <p className="text-sm text-hb-slate text-center">Running checks...</p>}
        </div>

        <button
          onClick={onRetry}
          className="px-6 py-3 bg-hb-teal text-white rounded-xl font-medium w-full hover:bg-hb-teal-600 transition-colors"
        >
          Retry Now
        </button>
      </div>
    </div>
  );
};

const PropertyGate = () => {
  const { allProperties, isLoading, error, hasLoaded, isConnecting, refreshProperties } = useProperty();

  // First 6 seconds: loading screen
  if (isLoading) {
    return <HomeBaseLoader message="Loading your home..." />;
  }

  // Query returned an error
  if (error) {
    return <ErrorScreen error={error} onRetry={refreshProperties} />;
  }

  // Query is still pending after soft timeout — show connecting screen, not an error
  if (!hasLoaded && isConnecting) {
    return <ConnectingScreen onRetry={refreshProperties} />;
  }

  // New user with no properties → onboarding
  if (allProperties.length === 0) {
    return <Onboarding />;
  }

  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App

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
import { HomeBaseLoader } from '@/components/HomeBaseLogo';
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

// Live diagnostic — runs independent checks and shows results on screen
const DiagnosticPanel = () => {
  const { user } = useAuth();
  const [checks, setChecks] = useState({});

  useEffect(() => {
    if (!user) return;
    const run = async () => {
      // Check 1: Auth session
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        setChecks(c => ({ ...c, session: error ? `ERR: ${error.message}` : session ? `OK (token: ${session.access_token?.substring(0, 20)}...)` : 'NO SESSION' }));
      } catch (e) {
        setChecks(c => ({ ...c, session: `EXCEPTION: ${e.message}` }));
      }

      // Check 2: Raw fetch to REST API (bypass supabase-js)
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/properties?select=id&limit=1`;
        const { data: { session } } = await supabase.auth.getSession();
        setChecks(c => ({ ...c, rawFetch: 'FETCHING...' }));
        const resp = await fetch(url, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });
        const body = await resp.text();
        setChecks(c => ({ ...c, rawFetch: `HTTP ${resp.status}: ${body.substring(0, 200)}` }));
      } catch (e) {
        setChecks(c => ({ ...c, rawFetch: `EXCEPTION: ${e.message}` }));
      }

      // Check 3: supabase-js query
      try {
        setChecks(c => ({ ...c, jsQuery: 'QUERYING...' }));
        const start = Date.now();
        const { data, error } = await supabase.from('properties').select('id').limit(1);
        const ms = Date.now() - start;
        setChecks(c => ({ ...c, jsQuery: error ? `ERR in ${ms}ms: ${error.message} (${error.code})` : `OK in ${ms}ms: ${JSON.stringify(data)}` }));
      } catch (e) {
        setChecks(c => ({ ...c, jsQuery: `EXCEPTION: ${e.message}` }));
      }

      // Check 4: User's properties
      try {
        setChecks(c => ({ ...c, userProps: 'QUERYING...' }));
        const { data, error } = await supabase.from('properties').select('id, name, address').eq('user_id', user.id);
        setChecks(c => ({ ...c, userProps: error ? `ERR: ${error.message}` : `${data?.length || 0} properties: ${JSON.stringify(data)}` }));
      } catch (e) {
        setChecks(c => ({ ...c, userProps: `EXCEPTION: ${e.message}` }));
      }
    };
    run();
  }, [user]);

  return (
    <div className="min-h-screen bg-hb-warm p-6">
      <div className="max-w-lg mx-auto">
        <h2 className="text-lg font-bold text-hb-navy mb-1">Homebase Diagnostic</h2>
        <p className="text-xs text-gray-400 mb-4">User: {user?.id} | {user?.email}</p>
        {Object.entries(checks).map(([key, val]) => (
          <div key={key} className="bg-white rounded-lg p-3 mb-2 border border-gray-100">
            <p className="text-xs font-semibold text-gray-600 uppercase">{key}</p>
            <p className="text-xs text-gray-800 mt-1 break-all font-mono">{val || '...'}</p>
          </div>
        ))}
        {Object.keys(checks).length === 0 && <p className="text-sm text-gray-400">Running checks...</p>}
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-3 bg-hb-teal text-white rounded-xl font-medium w-full">
          Refresh
        </button>
      </div>
    </div>
  );
};

const PropertyGate = () => {
  const { allProperties, isLoading, error } = useProperty();

  if (isLoading) {
    return <HomeBaseLoader message="Loading your home..." />;
  }

  if (error) {
    return <DiagnosticPanel />;
  }

  // New user with no properties → go straight to onboarding
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

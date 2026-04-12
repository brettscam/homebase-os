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
import React from 'react';

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

const ConnectingScreen = ({ onRetry }) => (
  <div className="min-h-screen bg-hb-warm flex items-center justify-center p-6">
    <div className="max-w-sm mx-auto text-center">
      <div className="text-hb-teal mb-6 flex justify-center">
        <HomeBaseLogo size={64} animate />
      </div>
      <h2 className="text-lg font-semibold text-hb-navy mb-2">Connecting to your data...</h2>
      <p className="text-sm text-hb-slate mb-6">This can take a moment on first load.</p>
      <div className="flex items-center justify-center gap-1.5 mb-6">
        {[0, 1, 2].map((i) => (
          <span key={i} className="block w-1.5 h-1.5 rounded-full bg-hb-teal/40 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
        ))}
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

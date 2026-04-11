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

const PropertyGate = () => {
  const { allProperties, isLoading, error } = useProperty();

  if (isLoading) {
    return <HomeBaseLoader message="Loading your home..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-hb-warm flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">!</span>
          </div>
          <h2 className="text-lg font-semibold text-hb-navy mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <details className="text-left bg-gray-50 rounded-xl p-4 mb-6">
            <summary className="text-xs text-gray-400 cursor-pointer">Debug info</summary>
            <pre className="text-xs text-gray-500 mt-2 whitespace-pre-wrap break-all">
{`Supabase URL: ${import.meta.env.VITE_SUPABASE_URL || '(not set)'}
Anon key: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 16) + '...' : '(not set)'}
Error: ${error}
Check browser console for [PropertyContext] logs.`}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-hb-teal text-white rounded-xl font-medium hover:bg-hb-teal-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
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

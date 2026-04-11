import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getUserProperties, loadFullHomeData } from './supabaseDataStore';

const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [activeProperty, setActiveProperty] = useState(null);
  const [allProperties, setAllProperties] = useState([]);
  const [homeData, setHomeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // True when the initial query succeeded at least once
  const [hasLoaded, setHasLoaded] = useState(false);
  // True when queries are still pending after the soft timeout
  const [isConnecting, setIsConnecting] = useState(false);
  const retryTimer = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    let queryResolved = false;

    const loadProperties = async () => {
      try {
        const properties = await getUserProperties(user.id);
        if (cancelled) return;
        queryResolved = true;
        setIsConnecting(false);
        setAllProperties(properties);
        setHasLoaded(true);

        if (properties.length > 0) {
          const active = properties.find(p => p.is_active) || properties[0];
          setActiveProperty(active);
          // Load full data in background — never blocks UI
          loadFullHomeData(active.id)
            .then((data) => { if (!cancelled) setHomeData(data); })
            .catch(() => {});
        }
      } catch (err) {
        if (cancelled) return;
        queryResolved = true;
        console.error('[PropertyContext] Query failed:', err);
        setError(err.message || 'Failed to load properties');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    // Soft timeout: after 6 seconds, unblock the UI regardless.
    // The query keeps running — if it returns later, the app updates.
    const softTimeout = setTimeout(() => {
      if (!cancelled && !queryResolved) {
        console.warn('[PropertyContext] Soft timeout — unblocking UI, query still pending');
        setIsLoading(false);
        setIsConnecting(true);
      }
    }, 6000);

    loadProperties();

    return () => {
      cancelled = true;
      clearTimeout(softTimeout);
      clearTimeout(retryTimer.current);
    };
  }, [isAuthenticated, user?.id]);

  // Auto-retry when connecting (query didn't return in time)
  useEffect(() => {
    if (!isConnecting || !user?.id) return;

    let cancelled = false;
    const retry = async () => {
      try {
        const properties = await getUserProperties(user.id);
        if (cancelled) return;
        setIsConnecting(false);
        setAllProperties(properties);
        setHasLoaded(true);
        setError(null);
        if (properties.length > 0) {
          const active = properties.find(p => p.is_active) || properties[0];
          setActiveProperty(active);
          loadFullHomeData(active.id)
            .then((data) => { if (!cancelled) setHomeData(data); })
            .catch(() => {});
        }
      } catch {
        // Schedule another retry in 10 seconds
        if (!cancelled) {
          retryTimer.current = setTimeout(retry, 10000);
        }
      }
    };

    retryTimer.current = setTimeout(retry, 8000);
    return () => {
      cancelled = true;
      clearTimeout(retryTimer.current);
    };
  }, [isConnecting, user?.id]);

  const refreshProperties = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    setIsConnecting(false);
    try {
      const properties = await getUserProperties(user.id);
      setAllProperties(properties);
      setHasLoaded(true);
      if (properties.length > 0) {
        const active = properties.find(p => p.is_active) || properties[0];
        setActiveProperty(active);
        loadFullHomeData(active.id).then(setHomeData).catch(() => {});
      } else {
        setActiveProperty(null);
        setHomeData(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const switchProperty = useCallback(async (propertyId) => {
    const prop = allProperties.find(p => p.id === propertyId);
    if (!prop) return;
    setActiveProperty(prop);
    setHomeData(null);
    loadFullHomeData(prop.id).then(setHomeData).catch((err) => {
      console.warn('[PropertyContext] Failed to load property data:', err);
    });
  }, [allProperties]);

  return (
    <PropertyContext.Provider value={{
      activeProperty,
      allProperties,
      homeData,
      isLoading,
      error,
      hasLoaded,
      isConnecting,
      refreshProperties,
      switchProperty,
    }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};

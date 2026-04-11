import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Load properties when user is authenticated
  // Depend on user?.id (string) not user (object) to prevent re-triggers
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setActiveProperty(null);
      setAllProperties([]);
      setHomeData(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const load = async () => {
      try {
        console.log('[PropertyContext] Loading properties for user:', user.id);
        const properties = await getUserProperties(user.id);
        if (cancelled) return;

        console.log('[PropertyContext] Got properties:', properties.length);
        setAllProperties(properties);

        if (properties.length > 0) {
          const active = properties.find(p => p.is_active) || properties[0];
          setActiveProperty(active);
          console.log('[PropertyContext] Loading home data for:', active.id);
          const data = await loadFullHomeData(active.id);
          if (cancelled) return;
          console.log('[PropertyContext] Home data loaded');
          setHomeData(data);
        } else {
          console.log('[PropertyContext] No properties found — new user');
          setActiveProperty(null);
          setHomeData(null);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('[PropertyContext] Failed to load:', err);
        setError(err.message || 'Failed to load properties');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    // Safety timeout — never stay on loading screen forever
    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.warn('[PropertyContext] Loading timed out after 15s');
        setError('Loading timed out. Check your internet connection and try again.');
        setIsLoading(false);
      }
    }, 15000);

    load();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [isAuthenticated, user?.id]);

  const refreshProperties = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const properties = await getUserProperties(user.id);
      setAllProperties(properties);
      if (properties.length > 0) {
        const active = properties.find(p => p.is_active) || properties[0];
        setActiveProperty(active);
        const data = await loadFullHomeData(active.id);
        setHomeData(data);
      } else {
        setActiveProperty(null);
        setHomeData(null);
      }
    } catch (err) {
      console.error('[PropertyContext] Refresh failed:', err);
      setError(err.message || 'Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const switchProperty = useCallback(async (propertyId) => {
    const prop = allProperties.find(p => p.id === propertyId);
    if (!prop) return;
    setActiveProperty(prop);
    setIsLoading(true);
    try {
      const data = await loadFullHomeData(prop.id);
      setHomeData(data);
    } catch (err) {
      console.error('[PropertyContext] Failed to load property data:', err);
      setError(err.message || 'Failed to load property data');
    } finally {
      setIsLoading(false);
    }
  }, [allProperties]);

  return (
    <PropertyContext.Provider value={{
      activeProperty,
      allProperties,
      homeData,
      isLoading,
      error,
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

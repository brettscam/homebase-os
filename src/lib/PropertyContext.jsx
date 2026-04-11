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

  // Step 1: Load properties ONLY — this is the fast gate.
  // The UI unblocks as soon as this single query finishes.
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const properties = await getUserProperties(user.id);
        if (cancelled) return;

        setAllProperties(properties);

        if (properties.length > 0) {
          const active = properties.find(p => p.is_active) || properties[0];
          setActiveProperty(active);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('[PropertyContext] Failed to load properties:', err);
        setError(err.message || 'Failed to load properties');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.id]);

  // Step 2: Once we have an active property, load full home data in the background.
  // This does NOT block the UI — pages render immediately and get data when it arrives.
  useEffect(() => {
    if (!activeProperty?.id) return;

    let cancelled = false;

    loadFullHomeData(activeProperty.id)
      .then((data) => {
        if (!cancelled) setHomeData(data);
      })
      .catch((err) => {
        console.warn('[PropertyContext] Background home data load failed:', err);
        // Don't set error — the app is already usable, pages can load their own data
      });

    return () => { cancelled = true; };
  }, [activeProperty?.id]);

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
        // Background load full data
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
    // Background load
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

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
  const loadAttempt = useRef(0);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const attempt = ++loadAttempt.current;

    // Safety timeout — never hang on "Loading your home..." forever
    const timeout = setTimeout(() => {
      if (!cancelled && loadAttempt.current === attempt) {
        console.error('[PropertyContext] Loading timed out after 20s');
        setError('Loading timed out. Please check your connection and try again.');
        setIsLoading(false);
      }
    }, 20000);

    const load = async () => {
      try {
        console.log('[PropertyContext] Loading properties for user:', user.id);
        const properties = await getUserProperties(user.id);
        if (cancelled) return;

        console.log('[PropertyContext] Got', properties.length, 'properties');
        setAllProperties(properties);

        if (properties.length > 0) {
          const active = properties.find(p => p.is_active) || properties[0];
          setActiveProperty(active);
          const data = await loadFullHomeData(active.id);
          if (cancelled) return;
          setHomeData(data);
        } else {
          setActiveProperty(null);
          setHomeData(null);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('[PropertyContext] Error:', err);
        setError(err.message || 'Failed to load properties');
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setIsLoading(false);
      }
    };

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

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
  const resolved = useRef(false);

  const resolveLoading = () => {
    if (!resolved.current) {
      resolved.current = true;
      setIsLoading(false);
    }
  };

  const refreshProperties = useCallback(async () => {
    if (!user) {
      setActiveProperty(null);
      setAllProperties([]);
      setHomeData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      resolved.current = false;
      setError(null);

      console.log('[PropertyContext] Loading properties for user:', user.id);

      const properties = await getUserProperties(user.id);
      console.log('[PropertyContext] Got properties:', properties.length);

      setAllProperties(properties);

      if (properties.length > 0) {
        const active = properties.find(p => p.is_active) || properties[0];
        setActiveProperty(active);
        console.log('[PropertyContext] Loading home data for property:', active.id);
        const data = await loadFullHomeData(active.id);
        console.log('[PropertyContext] Home data loaded');
        setHomeData(data);
      } else {
        console.log('[PropertyContext] No properties found — new user');
        setActiveProperty(null);
        setHomeData(null);
      }
    } catch (err) {
      console.error('[PropertyContext] Failed to load:', err);
      setError(err.message || 'Failed to load properties');
    } finally {
      resolveLoading();
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Safety timeout — never stay on loading screen forever
      const timeout = setTimeout(() => {
        if (!resolved.current) {
          console.warn('[PropertyContext] Loading timed out after 15s');
          setError('Loading timed out. Check your internet connection and try again.');
          resolveLoading();
        }
      }, 15000);

      refreshProperties();

      return () => clearTimeout(timeout);
    } else {
      setActiveProperty(null);
      setAllProperties([]);
      setHomeData(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, refreshProperties]);

  const switchProperty = useCallback(async (propertyId) => {
    const prop = allProperties.find(p => p.id === propertyId);
    if (!prop) return;
    setActiveProperty(prop);
    setIsLoading(true);
    resolved.current = false;
    try {
      const data = await loadFullHomeData(prop.id);
      setHomeData(data);
    } catch (err) {
      console.error('[PropertyContext] Failed to load property data:', err);
      setError(err.message || 'Failed to load property data');
    } finally {
      resolveLoading();
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

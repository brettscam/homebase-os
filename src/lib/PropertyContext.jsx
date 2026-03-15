import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getActiveProperty, getUserProperties, loadFullHomeData } from './supabaseDataStore';

const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [activeProperty, setActiveProperty] = useState(null);
  const [allProperties, setAllProperties] = useState([]);
  const [homeData, setHomeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      console.error('Failed to load properties:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshProperties();
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
    try {
      const data = await loadFullHomeData(prop.id);
      setHomeData(data);
    } catch (err) {
      console.error('Failed to load property data:', err);
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

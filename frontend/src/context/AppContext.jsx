import React, { createContext, useState, useEffect } from 'react';
import { api } from '../api/api';

export const AppContext = createContext();

// Setup initial alert logs if none exist in localStorage
const initialAlerts = [];

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const token = localStorage.getItem('driveguard_token');
    if (token) {
      const decoded = decodeJWT(token);
      return decoded ? { email: decoded.sub || decoded.email || 'user' } : null;
    }
    return null;
  });

  const [alerts, setAlerts] = useState(() => {
    const key = currentUser ? `driveguard_alerts_${currentUser.email}` : 'driveguard_alerts';
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialAlerts;
  });

  const [activeAlert, setActiveAlert] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Sync loaded data when current user changes
  useEffect(() => {
    const userKey = currentUser ? currentUser.email : '';
    const aKey = userKey ? `driveguard_alerts_${userKey}` : 'driveguard_alerts';

    const savedAlerts = localStorage.getItem(aKey);
    const loadedAlerts = savedAlerts ? JSON.parse(savedAlerts) : initialAlerts;

    setAlerts(loadedAlerts);
  }, [currentUser]);

  // Auth Functions
  const loginUser = async (email, password) => {
    try {
      const response = await api.login({ email, password });
      if (response.token) {
        localStorage.setItem('driveguard_token', response.token);
        const decoded = decodeJWT(response.token);
        setCurrentUser({ email: decoded?.sub || email });
        return { success: true };
      }
      return { success: false, message: 'Invalid token received.' };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed.' };
    }
  };

  const registerUser = async (name, email, phone, password) => {
    try {
      await api.register({ fullName: name, email, password });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed.' };
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setIsMonitoring(false);
    setActiveAlert(null);
    localStorage.removeItem('driveguard_token');
  };

  // Update Profile
  const updateProfile = (updatedFields) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedFields };
    setCurrentUser(updatedUser);
  };


  // Alert Logging
  const logAlert = (alertType, riskLevel) => {
    const newAlert = {
      id: 'a_' + Date.now(),
      timestamp: new Date().toISOString(),
      alertType,
      riskLevel
    };
    const updated = [newAlert, ...alerts];
    setAlerts(updated);
    const key = currentUser ? `driveguard_alerts_${currentUser.email}` : 'driveguard_alerts';
    localStorage.setItem(key, JSON.stringify(updated));
    setActiveAlert(newAlert);
  };

  const clearActiveAlert = () => {
    setActiveAlert(null);
  };

  const clearAlertHistory = () => {
    setAlerts([]);
    const key = currentUser ? `driveguard_alerts_${currentUser.email}` : 'driveguard_alerts';
    localStorage.setItem(key, JSON.stringify([]));
  };

  return (
    <AppContext.Provider
      value={{
        alerts,
        currentUser,
        activeAlert,
        isMonitoring,
        setIsMonitoring,
        setActiveAlert,
        loginUser,
        registerUser,
        logoutUser,
        updateProfile,
        logAlert,
        clearActiveAlert,
        clearAlertHistory
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

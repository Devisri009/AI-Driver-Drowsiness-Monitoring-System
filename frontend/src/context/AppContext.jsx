import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

// Setup initial alert logs if none exist in localStorage
const initialAlerts = [];

// Helper to compute SHA-256 hash
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('driveguard_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [alerts, setAlerts] = useState(() => {
    const savedUser = localStorage.getItem('driveguard_user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const key = user ? `driveguard_alerts_${user.email}` : 'driveguard_alerts';
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

  // Sync current user state changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('driveguard_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('driveguard_user');
    }
  }, [currentUser]);

  // Auth Functions
  const loginUser = async (email, password) => {
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const passwordHash = await hashPassword(password);
    
    let matchedUser = registeredUsers.find(
      u => (u.email === email) && 
           (u.passwordHash === passwordHash || u.password === password)
    );



    if (matchedUser) {
      setCurrentUser(matchedUser);
      // Mock JWT structure for future Spring Boot backend integration
      localStorage.setItem('driveguard_token', `mock-jwt-token-for-${matchedUser.email}-${Date.now()}`);
      return true;
    }
    return false;
  };

  const registerUser = async (name, email, phone, password) => {
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    
    // Check if exists
    if (registeredUsers.some(u => u.email === email)) {
      return { success: false, message: 'Email already registered.' };
    }

    const passwordHash = await hashPassword(password);
    const newUser = { 
      name, 
      email, 
      phone, 
      passwordHash 
    };
    registeredUsers.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
    return { success: true };
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
    
    // Update in registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const updatedUsersList = registeredUsers.map(u => u.email === updatedUser.email ? updatedUser : u);
    localStorage.setItem('registered_users', JSON.stringify(updatedUsersList));
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

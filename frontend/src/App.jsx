import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { RecommendationCard } from './components/RecommendationCard';
import { Login } from './pages/login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Monitoring } from './pages/Monitoring';
import { AlertHistory } from './pages/AlertHistory';
import { Reports } from './pages/Reports';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { LandingPage } from './pages/LandingPage';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useContext(AppContext);
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {children}
      </div>
      {/* Global Safety Alert Overlay */}
      <RecommendationCard />
    </div>
  );
};

const AuthRoute = ({ children }) => {
  const { currentUser } = useContext(AppContext);
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthRoute><LandingPage /></AuthRoute>} />
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><AlertHistory /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
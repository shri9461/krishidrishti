import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Marketing & Consolidated Auth
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';

// Protected Core Workspaces
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            
            {/* Public Marketing & consolidated Auth portal */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/forgot-password" element={<Auth />} />
            <Route path="/admin-login" element={<Auth />} />

            {/* Guarded Farmer & Admin operational pages */}
            <Route element={<ProtectedRoute allowedRoles={['farmer', 'admin']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Catch-all redirects to Landing */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;


import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { MarketOverview } from './pages/buyer/MarketOverview';
import { ComparePrices } from './pages/buyer/ComparePrices';
import { SubmitPrice } from './pages/trader/SubmitPrice';
import { TraderDashboard } from './pages/trader/TraderDashboard';
import { TraderAnalytics } from './pages/trader/TraderAnalytics';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Calculator } from './pages/Calculator';
import { FarmerUpload } from './pages/FarmerUpload';
import { Notifications } from './pages/Notifications';
import { UserRole } from './types';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: UserRole[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/buyer/prices" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Home Page */}
          <Route path="/" element={<Home />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Buyer Routes */}
          <Route path="/buyer/prices" element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER]}>
              <MarketOverview />
            </ProtectedRoute>
          } />
          
          <Route path="/buyer/compare" element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER]}>
              <ComparePrices />
            </ProtectedRoute>
          } />

          <Route path="/calculator" element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN]}>
              <Calculator />
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER]}>
              <Notifications />
            </ProtectedRoute>
          } />

          {/* Trader Routes */}
          <Route path="/trader/dashboard" element={
            <ProtectedRoute allowedRoles={[UserRole.TRADER, UserRole.ADMIN]}>
              <TraderDashboard />
            </ProtectedRoute>
          } />

          <Route path="/trader/analytics" element={
            <ProtectedRoute allowedRoles={[UserRole.TRADER, UserRole.ADMIN]}>
              <TraderAnalytics />
            </ProtectedRoute>
          } />

          <Route path="/trader/submit" element={
            <ProtectedRoute allowedRoles={[UserRole.TRADER, UserRole.ADMIN]}>
              <SubmitPrice />
            </ProtectedRoute>
          } />

          {/* Farmer Routes */}
          <Route path="/farmgate" element={
             <ProtectedRoute allowedRoles={[UserRole.FARMER, UserRole.ADMIN, UserRole.TRADER]}>
               <FarmerUpload />
             </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

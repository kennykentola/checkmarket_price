import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { PublicPrices } from './pages/PublicPrices';
import { MarketOverview } from './pages/buyer/MarketOverview';
import { MarketDetails } from './pages/buyer/MarketDetails';
import { ComparePrices } from './pages/buyer/ComparePrices';
import { Heatmap } from './pages/Heatmap';
import { SubmitPrice } from './pages/trader/SubmitPrice';
import { TraderDashboard } from './pages/trader/TraderDashboard';
import { TraderAnalytics } from './pages/trader/TraderAnalytics';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { MarketInventory } from './pages/admin/MarketInventory';
import { Calculator } from './pages/Calculator';
import { FarmerUpload } from './pages/FarmerUpload';
import { Notifications } from './pages/Notifications';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Verify } from './pages/Verify';
import { UserRole } from '@/types';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: UserRole[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/buyer/prices" />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/prices" element={<PublicPrices />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify" element={<Verify />} />

          {/* Buyer Routes */}
          <Route path="/buyer/prices" element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER]}>
              <MarketOverview />
            </ProtectedRoute>
          } />

          <Route path="/buyer/market/:marketId" element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER]}>
              <MarketDetails />
            </ProtectedRoute>
          } />

          <Route path="/buyer/compare" element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER]}>
              <ComparePrices />
            </ProtectedRoute>
          } />

          <Route path="/heatmap" element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER]}>
              <Heatmap />
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
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.TRADER]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/market-inventory/:marketId" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.TRADER]}>
              <MarketInventory />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

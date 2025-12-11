import React from 'react';
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { MarketOverview } from './pages/buyer/MarketOverview';
import { MarketDetails } from './pages/buyer/MarketDetails';
import { ComparePrices } from './pages/buyer/ComparePrices';
import { Heatmap } from './pages/Heatmap';
import { SubmitPrice } from './pages/trader/SubmitPrice';
import { TraderDashboard } from './pages/trader/TraderDashboard';
import { TraderAnalytics } from './pages/trader/TraderAnalytics';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Calculator } from './pages/Calculator';
import { FarmerUpload } from './pages/FarmerUpload';
import { Notifications } from './pages/Notifications';
import { UserRole } from './types';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: UserRole[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <Redirect to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/buyer/prices" />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          {/* Public Home Page */}
          <Route exact path="/">
            <Home />
          </Route>
          
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          
          {/* Buyer Routes */}
          <Route path="/buyer/prices">
            <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER]}>
              <MarketOverview />
            </ProtectedRoute>
          </Route>

          <Route path="/buyer/market/:marketId">
            <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER]}>
              <MarketDetails />
            </ProtectedRoute>
          </Route>
          
          <Route path="/buyer/compare">
            <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER]}>
              <ComparePrices />
            </ProtectedRoute>
          </Route>

          <Route path="/heatmap">
            <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER]}>
              <Heatmap />
            </ProtectedRoute>
          </Route>

          <Route path="/calculator">
            <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN]}>
              <Calculator />
            </ProtectedRoute>
          </Route>

          <Route path="/notifications">
            <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER]}>
              <Notifications />
            </ProtectedRoute>
          </Route>

          {/* Trader Routes */}
          <Route path="/trader/dashboard">
            <ProtectedRoute allowedRoles={[UserRole.TRADER, UserRole.ADMIN]}>
              <TraderDashboard />
            </ProtectedRoute>
          </Route>

          <Route path="/trader/analytics">
            <ProtectedRoute allowedRoles={[UserRole.TRADER, UserRole.ADMIN]}>
              <TraderAnalytics />
            </ProtectedRoute>
          </Route>

          <Route path="/trader/submit">
            <ProtectedRoute allowedRoles={[UserRole.TRADER, UserRole.ADMIN]}>
              <SubmitPrice />
            </ProtectedRoute>
          </Route>

          {/* Farmer Routes */}
          <Route path="/farmgate">
            <ProtectedRoute allowedRoles={[UserRole.FARMER, UserRole.ADMIN, UserRole.TRADER]}>
              <FarmerUpload />
            </ProtectedRoute>
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/dashboard">
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          </Route>

          {/* Fallback */}
          <Route path="*">
            <Redirect to="/" />
          </Route>

        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { 
  HomeIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  Squares2X2Icon,
  PresentationChartLineIcon,
  CalculatorIcon,
  TruckIcon,
  BellIcon,
  FireIcon
} from '@heroicons/react/24/outline';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/buyer/prices', icon: HomeIcon, roles: [UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER] },
    { name: 'Compare Prices', path: '/buyer/compare', icon: ChartBarIcon, roles: [UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER] },
    { name: 'Price Heatmap', path: '/heatmap', icon: FireIcon, roles: [UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER] },
    { name: 'Calculator', path: '/calculator', icon: CalculatorIcon, roles: [UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN] },
    
    // Trader Links
    { name: 'Dashboard', path: '/trader/dashboard', icon: Squares2X2Icon, roles: [UserRole.TRADER, UserRole.ADMIN] },
    { name: 'Analytics', path: '/trader/analytics', icon: PresentationChartLineIcon, roles: [UserRole.TRADER, UserRole.ADMIN] },
    { name: 'Submit Price', path: '/trader/submit', icon: CurrencyDollarIcon, roles: [UserRole.TRADER, UserRole.ADMIN] },
    
    // Farmer Link
    { name: 'Farmer\'s Gate', path: '/farmgate', icon: TruckIcon, roles: [UserRole.FARMER, UserRole.ADMIN, UserRole.TRADER] },
    
    // Admin Link
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: UserGroupIcon, roles: [UserRole.ADMIN] },
    
    // Notifications
    { name: 'Notifications', path: '/notifications', icon: BellIcon, roles: [UserRole.BUYER, UserRole.TRADER, UserRole.ADMIN, UserRole.FARMER] },
  ];

  const filteredNav = navItems.filter(item => 
    !user || item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-indigo-600 text-white p-4 flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl font-bold">MarketCheck</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition-transform duration-200 ease-in-out
        w-64 bg-white border-r border-gray-200 z-10 flex flex-col
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200 hidden md:flex">
          <span className="text-2xl font-bold text-indigo-600">Local Market Price Check</span>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {user && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-600 font-medium">Welcome,</p>
              <p className="font-bold text-gray-900 truncate">{user.name}</p>
              <span className="text-xs uppercase tracking-wider text-indigo-500 font-bold">{user.role}</span>
            </div>
          )}

          <nav className="space-y-1">
            {filteredNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-500' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
            >
              <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className="flex w-full items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};
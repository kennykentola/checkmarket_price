import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PriceDataExpanded } from '../../types';
import { 
  CurrencyDollarIcon, 
  ArrowRightIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export const TraderDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<PriceDataExpanded[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      api.getTraderHistory(user.$id).then(data => {
        setHistory(data);
        setLoading(false);
      });
    }
  }, [user]);

  const uniqueCommodities = useMemo(() => {
    return new Set(history.map(h => h.commodityId)).size;
  }, [history]);

  const uniqueMarkets = useMemo(() => {
    return new Set(history.map(h => h.marketId)).size;
  }, [history]);

  // Recent 5 items
  const recentHistory = history.slice(0, 5);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.name}. Here is your activity overview.</p>
        </div>
        <Link 
          to="/trader/submit" 
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <CurrencyDollarIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Submit New Price
        </Link>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 border-l-4 border-indigo-500">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{history.length}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 border-l-4 border-green-500">
            <dt className="text-sm font-medium text-gray-500 truncate">Products Traded</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{uniqueCommodities}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 border-l-4 border-blue-500">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Markets</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{uniqueMarkets}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 border-l-4 border-purple-500">
            <dt className="text-sm font-medium text-gray-500 truncate">Latest Activity</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900 truncate">
                {history.length > 0 ? new Date(history[0].dateSubmitted).toLocaleDateString() : 'N/A'}
            </dd>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
          <Link to="/trader/analytics" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
            View All Analytics <ArrowRightIcon className="ml-1 h-4 w-4"/>
          </Link>
        </div>

        <ul role="list" className="divide-y divide-gray-200">
            {recentHistory.map((item) => (
              <li key={item.$id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <TagIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.commodityName}</p>
                        <p className="text-xs text-gray-500">{item.marketName}</p>
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
            {recentHistory.length === 0 && (
                <li className="px-4 py-6 text-center text-gray-500">No recent activity.</li>
            )}
        </ul>
      </div>
    </div>
  );
};
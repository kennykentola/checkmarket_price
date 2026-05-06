import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Activity } from '@/types';
import {
  ClockIcon,
  UserIcon,
  ShieldCheckIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export const ActivityLog = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId'); // Optional user ID filter from URL

  const loadActivities = async () => {
    try {
      const activityLog = await api.getActivityLog(userId || undefined);
      setActivities(activityLog);
    } catch (error) {
      console.error("Failed to load activities", error);
      showNotification('Failed to load activity log. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [userId]);

  const showNotification = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <UserIcon className="h-4 w-4 text-green-600" />;
      case 'logout':
        return <UserIcon className="h-4 w-4 text-gray-600" />;
      case 'submit_price':
        return <ShieldCheckIcon className="h-4 w-4 text-blue-600" />;
      case 'edit_profile':
        return <UserIcon className="h-4 w-4 text-orange-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'submit_price':
        return 'bg-blue-100 text-blue-800';
      case 'edit_profile':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesUser = !userFilter || activity.userName?.toLowerCase().includes(userFilter.toLowerCase()) ||
                       activity.userEmail?.toLowerCase().includes(userFilter.toLowerCase());
    const matchesAction = !actionFilter || activity.action === actionFilter;
    return matchesUser && matchesAction;
  });

  const uniqueActions = Array.from(new Set(activities.map(a => a.action)));

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="mt-1 text-sm text-gray-500">
            {userId ? 'View activities for specific user' : 'Monitor all user activities and system events'}
          </p>
        </div>
        {msg && (
          <div className={`px-4 py-2 rounded-md text-sm font-medium ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} transition-all`}>
            {msg.text}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">Filters</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="userFilter" className="block text-sm font-medium text-gray-700">
                Filter by User
              </label>
              <input
                type="text"
                id="userFilter"
                placeholder="Search by name or email..."
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="actionFilter" className="block text-sm font-medium text-gray-700">
                Filter by Action
              </label>
              <select
                id="actionFilter"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>
                    {action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-4 py-4 sm:px-6 bg-indigo-50 border-b border-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-indigo-600 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-indigo-900">Activity Log</h3>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {filteredActivities.length} {filteredActivities.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        </div>

<div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <tr key={activity.$id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.userName || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {activity.userEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(activity.action)}`}>
                      {getActionIcon(activity.action)}
                      <span className="ml-1 capitalize">
                        {activity.action.replace('_', ' ')}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={activity.description}>
                      {activity.description}
                    </div>
                    {activity.details && (
                      <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={JSON.stringify(activity.details)}>
                        {JSON.stringify(activity.details)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredActivities.length === 0 && (
          <div className="px-6 py-10 text-center">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activities.length === 0 ? 'No activity has been logged yet.' : 'Try adjusting your filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
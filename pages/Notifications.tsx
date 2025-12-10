
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Notification } from '../types';
import { BellIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      api.getNotifications(user.$id).then(setNotifications);
    }
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
           <BellIcon className="h-7 w-7 text-indigo-600 mr-2" />
           Notifications
        </h1>
        <p className="mt-1 text-sm text-gray-500">Stay updated on price changes and system alerts.</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {notifications.map((note) => (
            <li key={note.$id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-start">
                 <div className="flex-shrink-0 pt-0.5">
                   {note.type === 'alert' ? (
                     <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                   ) : (
                     <InformationCircleIcon className="h-6 w-6 text-blue-500" />
                   )}
                 </div>
                 <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{note.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                 </div>
              </div>
            </li>
          ))}
          {notifications.length === 0 && (
            <li className="px-4 py-8 text-center text-gray-500">No new notifications.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { User, UserRole } from '@/types';
import {
  UsersIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const loadUsers = async () => {
    try {
      const userList = await api.getUserList();
      setUsers(userList);
    } catch (error) {
      console.error("Failed to load users", error);
      showNotification('Failed to load users. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

   const handleDeleteUser = async (userId: string, userName: string) => {
     if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return;

     try {
       await api.deleteUser(userId);
       showNotification(`User "${userName}" deleted successfully`, 'success');
       loadUsers(); // Refresh the list
     } catch (error) {
       console.error("Failed to delete user", error);
       showNotification('Failed to delete user. Please try again.', 'error');
     }
   };

   const handleRoleChange = async (userId: string, newRole: UserRole) => {
     try {
       await api.updateUserRole(userId, newRole);
       const roleText = newRole === UserRole.ADMIN ? 'granted admin access' : 'removed admin access';
       showNotification(`User role updated successfully - ${roleText}`, 'success');
       loadUsers(); // Refresh the list
     } catch (error) {
       console.error("Failed to update user role", error);
       showNotification('Failed to update user role. Please try again.', 'error');
     }
   };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <ShieldCheckIcon className="h-4 w-4 text-purple-600" />;
      case UserRole.TRADER:
        return <TruckIcon className="h-4 w-4 text-blue-600" />;
      case UserRole.BUYER:
        return <ShoppingBagIcon className="h-4 w-4 text-green-600" />;
      case UserRole.FARMER:
        return <UserGroupIcon className="h-4 w-4 text-orange-600" />;
      default:
        return <UsersIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800';
      case UserRole.TRADER:
        return 'bg-blue-100 text-blue-800';
      case UserRole.BUYER:
        return 'bg-green-100 text-green-800';
      case UserRole.FARMER:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor user activities and manage user accounts.</p>
        </div>
        {msg && (
          <div className={`px-4 py-2 rounded-md text-sm font-medium ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} transition-all`}>
            {msg.text}
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-4 py-4 sm:px-6 bg-indigo-50 border-b border-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UsersIcon className="h-5 w-5 text-indigo-600 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-indigo-900">All Users</h3>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {users.length}
            </span>
          </div>
        </div>

        {/* Users List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.$id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <UsersIcon className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1 capitalize">{user.role.toLowerCase()}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.$createdAt ? new Date(user.$createdAt).toLocaleDateString() : 'Unknown'}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <div className="flex items-center justify-end space-x-2">
                       <Link
                         to={`/admin/activity?userId=${user.$id}`}
                         className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                         title="View Activity"
                       >
                         <EyeIcon className="h-4 w-4" />
                       </Link>
                       <button
                         onClick={() => handleRoleChange(user.$id, user.role === UserRole.ADMIN ? UserRole.BUYER : UserRole.ADMIN)}
                         className={`text-gray-400 hover:text-${user.role === UserRole.ADMIN ? 'red' : 'purple'}-500 p-1 rounded-full hover:bg-${user.role === UserRole.ADMIN ? 'red' : 'purple'}-50 transition-colors`}
                         title={user.role === UserRole.ADMIN ? 'Remove Admin' : 'Make Admin'}
                       >
                         {user.role === UserRole.ADMIN ? (
                           <TrashIcon className="h-4 w-4" />
                         ) : (
                           <ShieldCheckIcon className="h-4 w-4" />
                         )}
                       </button>
                       <button
                         onClick={() => handleDeleteUser(user.$id, user.name || user.email)}
                         className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                         title="Delete User"
                       >
                         <TrashIcon className="h-4 w-4" />
                       </button>
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="px-6 py-10 text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">Users will appear here once they register.</p>
          </div>
        )}
      </div>
    </div>
  );
};
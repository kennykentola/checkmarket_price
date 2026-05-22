import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PriceDataExpanded } from '@/types';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export const PendingPrices = () => {
  const [pendingPrices, setPendingPrices] = useState<PriceDataExpanded[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const loadPendingPrices = async () => {
    try {
      const prices = await api.getPendingPrices();
      setPendingPrices(prices);
    } catch (error) {
      console.error("Failed to load pending prices", error);
      showNotification('Failed to load pending prices.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingPrices();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleStatusUpdate = async (priceId: string, status: 'approved' | 'rejected') => {
    try {
      await api.updatePriceStatus(priceId, status);
      showNotification(`Price ${status} successfully.`, 'success');
      // Remove from list
      setPendingPrices(prev => prev.filter(p => p.$id !== priceId));
    } catch (error) {
      console.error(`Failed to mark price as ${status}`, error);
      showNotification(`Failed to update price.`, 'error');
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
          <h1 className="text-2xl font-bold text-gray-900">Pending Price Approvals</h1>
          <p className="mt-1 text-sm text-gray-500">Review prices submitted by traders before they go live.</p>
        </div>
        {msg && (
          <div className={`px-4 py-2 rounded-md text-sm font-medium ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} transition-all`}>
            {msg.text}
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-4 py-4 sm:px-6 bg-yellow-50 border-b border-yellow-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-yellow-900">Awaiting Verification</h3>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {pendingPrices.length}
            </span>
          </div>
        </div>

        {/* Prices List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commodity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingPrices.map((price) => (
                <tr key={price.$id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {price.commodityImage ? (
                        <img src={price.commodityImage} alt={price.commodityName} className="h-8 w-8 rounded-full object-cover mr-3" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center mr-3 font-bold text-xs">
                          {price.commodityName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{price.commodityName}</div>
                        <div className="text-xs text-gray-500">Per {price.commodityUnit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {price.marketName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">₦{price.price.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(price.dateSubmitted).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(price.$id, 'approved')}
                        className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 transition-colors flex items-center"
                        title="Approve"
                      >
                        <CheckCircleIcon className="h-5 w-5 mr-1" /> Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(price.$id, 'rejected')}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors flex items-center"
                        title="Reject"
                      >
                        <XCircleIcon className="h-5 w-5 mr-1" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pendingPrices.length === 0 && (
          <div className="px-6 py-10 text-center">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
            <p className="mt-1 text-sm text-gray-500">There are no pending prices awaiting approval.</p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { nigerianMarketsAPI } from '../services/nigerianMarketsAPI';
import { CloudArrowDownIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export const ExternalDataSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [externalData, setExternalData] = useState<any[]>([]);

  const handleSyncData = async () => {
    setIsLoading(true);
    setSyncStatus('idle');

    try {
      const data = await nigerianMarketsAPI.getOyoStatePrices();
      setExternalData(data);
      await nigerianMarketsAPI.syncWithDatabase();
      setLastSync(new Date().toLocaleString());
      setSyncStatus('success');
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'external_sync' } }));
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const previewData = () => {
    return externalData.map((market, index) => (
      <div key={index} className="border rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-lg">{market.marketName}</h4>
        <p className="text-sm text-gray-600">{market.location}</p>
        <div className="mt-2">
          <p className="text-sm font-medium">
            {market.commodities?.some((c: any) => c.type === 'market') 
              ? `Markets: ${market.commodities?.length || 0}` 
              : `Commodities: ${market.commodities?.length || 0}`
            }
          </p>
          {market.commodities?.slice(0, 3).map((commodity: any, idx: number) => (
            <div key={idx} className="text-xs text-gray-500 mt-1">
              {commodity.type === 'market' 
                ? commodity.commodityName 
                : `${commodity.commodityName}: ₦${commodity.price}/${commodity.unit}`
              }
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-4 py-4 sm:px-6 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CloudArrowDownIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-blue-900">External Market Data Sync</h3>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Oyo State Markets
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Sync Latest Market Prices</h4>
              <p className="text-sm text-gray-500">
                Import real-time prices from official Nigerian market data sources
              </p>
              {lastSync && (
                <p className="text-xs text-gray-400 mt-1">Last sync: {lastSync}</p>
              )}
            </div>

            <button
              onClick={handleSyncData}
              disabled={isLoading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isLoading ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CloudArrowDownIcon className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>

          {syncStatus === 'success' && (
            <div className="bg-green-50 p-4 rounded-md mb-4">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Sync completed successfully!</p>
                  <p className="text-sm text-green-700">External market data has been imported and synced.</p>
                </div>
              </div>
            </div>
          )}

{syncStatus === 'error' && (
             <div className="bg-red-50 p-4 rounded-md mb-4">
               <div className="flex">
                 <div className="flex-shrink-0">
                   <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                   </svg>
                 </div>
                 <div className="ml-3">
                   <p className="text-sm font-medium text-red-800">Sync failed</p>
                   <p className="text-sm text-red-700">Unable to fetch external market data. Ensure VITE_NIGERIAN_MARKETS_API_KEY is configured in .env.</p>
                 </div>
               </div>
             </div>
           )}

          {externalData.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Data Preview</h4>
              <div className="max-h-60 overflow-y-auto">
                {previewData()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Commodity, PriceDataExpanded } from '@/types';
import { PriceChart } from '@/components/PriceChart';

export const ComparePrices = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [prices, setPrices] = useState<PriceDataExpanded[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCommodities = async () => {
      const data = await api.getCommodities();
      setCommodities(data);
      if (data.length > 0) setSelectedCommodity(data[0].$id);
    };
    loadCommodities();

    // Listen for data updates from admin changes
    const handleDataUpdate = (event: CustomEvent) => {
      if (event.detail?.type === 'price' || event.detail?.type === 'commodity' || event.detail?.type === 'market') {
        loadCommodities();
      }
    };

    window.addEventListener('dataUpdated', handleDataUpdate as EventListener);

    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      if (!selectedCommodity) return;
      setLoading(true);
      try {
        const allPrices = await api.getLatestPrices();
        const filtered = allPrices.filter(p => p.commodityId === selectedCommodity);
        setPrices(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, [selectedCommodity]);

  const selectedCommodityName = commodities.find(c => c.$id === selectedCommodity)?.name || 'Commodity';

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Compare Prices</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Commodity</label>
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
          >
            {commodities.map(c => (
              <option key={c.$id} value={c.$id}>{c.name} ({c.unit})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
           {loading ? (
             <div className="h-64 flex items-center justify-center bg-white rounded-lg shadow-sm">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
             </div>
           ) : (
             <PriceChart data={prices} type="marketComparison" />
           )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Details for {selectedCommodityName}
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {prices.map(p => (
              <li key={p.$id} className="px-4 py-4 flex justify-between items-center hover:bg-gray-50">
                <span className="font-medium text-gray-700">{p.marketName}</span>
                <span className="font-bold text-gray-900">₦{p.price.toFixed(2)}</span>
              </li>
            ))}
             {prices.length === 0 && !loading && (
              <li className="px-4 py-4 text-center text-gray-500">No price data available for this commodity.</li>
             )}
          </ul>
        </div>
      </div>
    </div>
  );
};
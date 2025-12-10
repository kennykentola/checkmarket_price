
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { PriceDataExpanded } from '../../types';
import { getItemImage } from '../../utils/imageHelpers';
import { MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';

export const MarketOverview = () => {
  const [prices, setPrices] = useState<PriceDataExpanded[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getLatestPrices();
        setPrices(data);
      } catch (error) {
        console.error("Failed to fetch prices", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredPrices = prices.filter(p => 
    p.commodityName.toLowerCase().includes(search.toLowerCase()) || 
    p.marketName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Latest Market Prices</h1>
        <div className="mt-4 sm:mt-0">
          <input
            type="text"
            placeholder="Search commodity or market..."
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading prices...</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredPrices.length > 0 ? filteredPrices.map((price) => (
              <li key={price.$id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out flex items-center">
                  
                  {/* Commodity Image */}
                  <div className="flex-shrink-0 mr-4">
                    <img 
                      className="h-16 w-16 rounded-lg object-cover border border-gray-200" 
                      src={getItemImage(price.commodityName, price.commodityCategory, price.commodityImage)} 
                      alt={price.commodityName} 
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-indigo-600 truncate">{price.commodityName}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-sm leading-5 font-bold rounded-full bg-green-100 text-green-800">
                          ₦{price.price.toLocaleString()} <span className="text-green-600 font-normal ml-1">/ {price.commodityUnit}</span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-700">
                          <MapPinIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                          <span className="truncate font-medium">{price.marketName}</span>
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                        <p>
                          Updated: {new Date(price.dateSubmitted).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )) : (
              <li className="px-4 py-8 text-center text-gray-500">No prices found matching your search.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

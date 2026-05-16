
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { PriceDataExpanded } from '@/types';
import { getItemImage } from '../../utils/imageHelpers';
import { MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export const MarketOverview = () => {
  const [prices, setPrices] = useState<PriceDataExpanded[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleDataUpdate = (event: any) => {
      if (event.detail.type === 'price' || event.detail.type === 'market') {
        loadData();
      }
    };
    window.addEventListener('dataUpdated', handleDataUpdate);
    return () => window.removeEventListener('dataUpdated', handleDataUpdate);
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
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Fetching latest prices...</p>
        </div>
      ) : (
        <div className="animate-fade-in">
          {filteredPrices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrices.map((price) => (
                <div 
                  key={price.$id} 
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-indigo-100 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-5">
                    {/* Header: Image & Name */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img 
                            className="h-16 w-16 rounded-xl object-cover border-2 border-gray-50 group-hover:border-indigo-100 transition-colors shadow-sm" 
                            src={getItemImage(price.commodityName, price.commodityCategory, price.commodityImage)} 
                            alt={price.commodityName} 
                          />
                          <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            NEW
                          </div>
                        </div>
                        <div className="min-w-0">
                          <Link 
                            to={`/product/${price.commodityId}`} 
                            className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate block"
                          >
                            {price.commodityName}
                          </Link>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                            {price.commodityCategory || 'Commodity'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="bg-indigo-50/50 rounded-xl p-4 mb-4 border border-indigo-50/50 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                       <div className="flex items-baseline justify-between">
                          <span className="text-sm font-bold text-indigo-600/70 uppercase">Current Price</span>
                          <div className="text-right">
                             <span className="text-2xl font-black text-indigo-700">₦{price.price.toLocaleString()}</span>
                             <span className="text-sm font-bold text-indigo-400 ml-1">/ {price.commodityUnit}</span>
                          </div>
                       </div>
                    </div>

                    {/* Footer: Market & Date */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <Link 
                        to={`/buyer/market/${price.marketId}`}
                        className="flex items-center text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors"
                        title="View Market"
                      >
                        <MapPinIcon className="h-4 w-4 mr-1.5 text-indigo-400" />
                        <span className="truncate">{price.marketName}</span>
                      </Link>
                      
                      <div className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1 text-gray-300" />
                        {new Date(price.dateSubmitted).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-20 text-center">
              <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No matching prices</h3>
              <p className="text-gray-500 mt-1">Try searching for a different commodity or market.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Market, PriceDataExpanded } from '../../types';
import { getItemImage, getMarketImage } from '../../utils/imageHelpers';
import { 
  ArrowLeftIcon, 
  MapPinIcon, 
  TagIcon,
  BuildingStorefrontIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export const MarketDetails = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const [market, setMarket] = useState<Market | null>(null);
  const [prices, setPrices] = useState<PriceDataExpanded[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!marketId) return;
      try {
        const [m, allPrices] = await Promise.all([
          api.getMarketById(marketId),
          api.getLatestPrices()
        ]);
        setMarket(m || null);
        
        // Filter prices for this market only
        setPrices(allPrices.filter(p => p.marketId === marketId));
      } catch (e) {
        console.error("Failed to load market data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [marketId]);

  // Group prices by category
  const pricesByCategory = useMemo(() => {
    const groups: Record<string, PriceDataExpanded[]> = {};
    prices.forEach(p => {
      const cat = p.commodityCategory || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [prices]);

  // Sort categories alphabetically
  const sortedCategories = Object.keys(pricesByCategory).sort();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Market Not Found</h2>
        <p className="mt-2 text-gray-500">The market you are looking for does not exist or has been removed.</p>
        <Link to="/buyer/prices" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Market Overview
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with Image */}
      <div className="relative h-64 bg-indigo-900 overflow-hidden group">
        <img 
          src={getMarketImage(market.name)} 
          alt={market.name} 
          className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto z-10">
          <Link to="/buyer/prices" className="text-white opacity-80 hover:opacity-100 flex items-center mb-4 text-sm font-medium transition-opacity">
             <ArrowLeftIcon className="h-4 w-4 mr-2" />
             Back to Markets
          </Link>
          <h1 className="text-4xl font-bold text-white tracking-tight">{market.name}</h1>
          <div className="flex items-center text-gray-200 mt-2">
            <MapPinIcon className="h-5 w-5 mr-2 text-indigo-400" />
            <span className="text-lg">{market.location}</span>
          </div>
          <div className="mt-4 flex space-x-4">
             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-600/80 text-white backdrop-blur-sm border border-indigo-500">
                <TagIcon className="h-3 w-3 mr-1" />
                {prices.length} items listed
             </span>
             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/80 text-white backdrop-blur-sm border border-green-500">
                <CalendarIcon className="h-3 w-3 mr-1" />
                Updated Today
             </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
           <h2 className="text-2xl font-bold text-gray-900 flex items-center">
             <BuildingStorefrontIcon className="h-6 w-6 mr-2 text-indigo-600" />
             Market Inventory
           </h2>
           <p className="text-gray-500 mt-1">Explore current prices and commodities available at {market.name}.</p>
        </div>

        {prices.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <TagIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No Listings Available</h3>
            <p className="text-gray-500">There are currently no active price listings for this market.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {sortedCategories.map((category) => (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">{category}</h3>
                  <span className="bg-white px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-600 border border-gray-200">
                    {pricesByCategory[category].length} items
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                   {pricesByCategory[category].map((item) => (
                     <div key={item.$id} className="flex items-start space-x-4 group p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 relative shadow-sm">
                          <img 
                            src={getItemImage(item.commodityName, item.commodityCategory, item.commodityImage)} 
                            alt={item.commodityName} 
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                            {item.commodityName}
                          </p>
                          <p className="text-xs text-gray-500 truncate mb-1">{item.commodityUnit}</p>
                          <p className="text-lg font-bold text-indigo-700">
                            ₦{item.price.toLocaleString()}
                          </p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

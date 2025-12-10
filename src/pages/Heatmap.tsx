
import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { Commodity, PriceDataExpanded, Market } from '../types';
import { CommoditySelector } from '../components/CommoditySelector';
import { FireIcon, MapIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

export const Heatmap = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [allPrices, setAllPrices] = useState<PriceDataExpanded[]>([]);
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [c, m, p] = await Promise.all([
          api.getCommodities(),
          api.getMarkets(),
          api.getLatestPrices()
        ]);
        setCommodities(c);
        setMarkets(m);
        setAllPrices(p);
        if (c.length > 0) setSelectedCommodityId(c[0].$id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Compute Heatmap Data
  const heatmapData = useMemo(() => {
    if (!selectedCommodityId) return [];

    // Filter prices for selected commodity
    const relevantPrices = allPrices.filter(p => p.commodityId === selectedCommodityId);
    
    if (relevantPrices.length === 0) return [];

    const pricesVal = relevantPrices.map(p => p.price);
    const minPrice = Math.min(...pricesVal);
    const maxPrice = Math.max(...pricesVal);
    const avgPrice = pricesVal.reduce((a, b) => a + b, 0) / pricesVal.length;

    // Map markets to their price status
    return markets.map(market => {
      const priceEntry = relevantPrices.find(p => p.marketId === market.$id);
      
      if (!priceEntry) return { market, hasData: false };

      const price = priceEntry.price;
      
      // Calculate Intensity (0 = Cheapest, 1 = Most Expensive)
      // Avoid division by zero if min == max
      const range = maxPrice - minPrice;
      const intensity = range === 0 ? 0.5 : (price - minPrice) / range;
      
      return {
        market,
        price,
        date: priceEntry.dateSubmitted,
        hasData: true,
        intensity, // 0 to 1
        diffFromAvg: ((price - avgPrice) / avgPrice) * 100
      };
    }).sort((a, b) => {
        // Sort by price (cheapest first) if data exists, else push to bottom
        if (a.hasData && b.hasData) return (a.price || 0) - (b.price || 0);
        if (a.hasData) return -1;
        if (b.hasData) return 1;
        return 0;
    });
  }, [selectedCommodityId, allPrices, markets]);

  // Helper to generate color based on intensity
  // Green (120) -> Yellow (60) -> Red (0)
  const getColor = (intensity: number) => {
    const hue = (1 - intensity) * 120; 
    return `hsl(${hue}, 80%, 90%)`; // Light pastel background
  };
  
  const getBorderColor = (intensity: number) => {
    const hue = (1 - intensity) * 120; 
    return `hsl(${hue}, 80%, 40%)`; // Darker border
  };

  const selectedCommodity = commodities.find(c => c.$id === selectedCommodityId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FireIcon className="h-8 w-8 text-orange-600 mr-2" />
          Price Heatmap
        </h1>
        <p className="mt-1 text-sm text-gray-500">
            Visualize price distribution across Oyo State. Green indicates cheaper markets, while Red indicates expensive ones.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="max-w-md">
            <CommoditySelector 
                commodities={commodities}
                selectedCommodityId={selectedCommodityId}
                onSelect={setSelectedCommodityId}
                label="Select Commodity to Map"
            />
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 bg-white p-3 rounded-md shadow-sm">
         <div className="flex items-center">
            <div className="w-4 h-4 bg-green-200 border border-green-600 rounded mr-2"></div>
            <span>Lowest Price</span>
         </div>
         <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-200 border border-yellow-600 rounded mr-2"></div>
            <span>Average</span>
         </div>
         <div className="flex items-center">
            <div className="w-4 h-4 bg-red-200 border border-red-600 rounded mr-2"></div>
            <span>Highest Price</span>
         </div>
      </div>

      {loading ? (
        <div className="flex justify-center h-64 items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {heatmapData.map((item) => (
                <div 
                    key={item.market.$id}
                    className={`relative rounded-lg p-5 border shadow-sm transition-all duration-300 hover:shadow-md ${!item.hasData ? 'bg-gray-50 border-gray-200 opacity-60' : ''}`}
                    style={item.hasData ? {
                        backgroundColor: getColor(item.intensity || 0),
                        borderColor: getBorderColor(item.intensity || 0)
                    } : {}}
                >
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 line-clamp-1" title={item.market.name}>
                            {item.market.name}
                        </h3>
                        {item.hasData && (
                            <span className="text-xs font-semibold px-2 py-0.5 bg-white bg-opacity-60 rounded-full border border-gray-200">
                                {item.intensity !== undefined && item.intensity < 0.3 ? 'Cheap' : item.intensity !== undefined && item.intensity > 0.7 ? 'Costly' : 'Avg'}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                        <MapIcon className="h-3 w-3 mr-1" />
                        {item.market.location}
                    </div>

                    {item.hasData ? (
                        <div>
                            <div className="text-2xl font-extrabold text-gray-900">
                                ₦{item.price?.toLocaleString()}
                            </div>
                            <div className="flex items-center mt-1 text-xs">
                                {item.diffFromAvg !== undefined && item.diffFromAvg < 0 ? (
                                    <span className="text-green-700 flex items-center font-medium">
                                        <ArrowDownIcon className="h-3 w-3 mr-1"/>
                                        {Math.abs(item.diffFromAvg).toFixed(1)}% below avg
                                    </span>
                                ) : (
                                    <span className="text-red-700 flex items-center font-medium">
                                        <ArrowUpIcon className="h-3 w-3 mr-1"/>
                                        {item.diffFromAvg?.toFixed(1)}% above avg
                                    </span>
                                )}
                            </div>
                            <div className="mt-3 text-xs text-gray-500 text-right">
                                {new Date(item.date!).toLocaleDateString()}
                            </div>
                        </div>
                    ) : (
                        <div className="h-16 flex items-center justify-center text-sm text-gray-400 italic">
                            No data available
                        </div>
                    )}
                </div>
            ))}
            {heatmapData.length === 0 && (
                 <div className="col-span-full text-center py-10 text-gray-500">
                     Select a commodity to view price distribution.
                 </div>
            )}
        </div>
      )}
    </div>
  );
};

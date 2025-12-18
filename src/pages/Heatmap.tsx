
import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { Commodity, PriceDataExpanded, Market } from '@/types';
import { CommoditySelector } from '../components/CommoditySelector';
import { FireIcon, ArrowDownIcon, ArrowUpIcon, MagnifyingGlassIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export const Heatmap = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [allPrices, setAllPrices] = useState<PriceDataExpanded[]>([]);
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    
    // Calculate stats only if data exists
    const pricesVal = relevantPrices.map(p => p.price);
    const minPrice = pricesVal.length > 0 ? Math.min(...pricesVal) : 0;
    const maxPrice = pricesVal.length > 0 ? Math.max(...pricesVal) : 0;
    const avgPrice = pricesVal.length > 0 ? pricesVal.reduce((a, b) => a + b, 0) / pricesVal.length : 0;

    // Map markets to their price status
    return markets.filter(m => 
      searchTerm === '' || m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.location.toLowerCase().includes(searchTerm.toLowerCase())
    ).map(market => {
      const priceEntry = relevantPrices.find(p => p.marketId === market.$id);
      
      if (!priceEntry) return { market, hasData: false };

      const price = priceEntry.price;
      
      // Calculate Intensity (0 = Cheapest, 1 = Most Expensive)
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
  }, [selectedCommodityId, allPrices, markets, searchTerm]);

  // Helper to generate color based on intensity
  // Green (120) -> Yellow (60) -> Red (0)
  const getColor = (intensity: number) => {
    const hue = (1 - intensity) * 120; 
    return `hsl(${hue}, 85%, 92%)`; // Soft pastel background
  };
  
  const getBorderColor = (intensity: number) => {
    const hue = (1 - intensity) * 120; 
    return `hsl(${hue}, 70%, 45%)`; // Darker border
  };

  const getTextColor = (intensity: number) => {
    const hue = (1 - intensity) * 120; 
    return `hsl(${hue}, 80%, 25%)`; // Dark readable text
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FireIcon className="h-8 w-8 text-orange-600 mr-2" />
          Price Heatmap
        </h1>
        <p className="mt-1 text-sm text-gray-500">
            Compare prices across Oyo State markets. Green areas indicate lower prices, while Red areas show higher costs.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-end">
        <div className="w-full md:w-1/2">
            <CommoditySelector 
                commodities={commodities}
                selectedCommodityId={selectedCommodityId}
                onSelect={setSelectedCommodityId}
                label="Select Commodity to Map"
            />
        </div>
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter Markets</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="Search by market name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 bg-white p-3 rounded-md shadow-sm border border-gray-100">
         <div className="flex items-center">
            <div className="w-6 h-4 bg-green-100 border border-green-600 rounded mr-2"></div>
            <span>Cheapest</span>
         </div>
         <div className="flex items-center">
            <div className="w-6 h-4 bg-yellow-100 border border-yellow-500 rounded mr-2"></div>
            <span>Average</span>
         </div>
         <div className="flex items-center">
            <div className="w-6 h-4 bg-red-100 border border-red-600 rounded mr-2"></div>
            <span>Expensive</span>
         </div>
         <div className="flex items-center">
            <div className="w-6 h-4 bg-gray-50 border border-gray-300 border-dashed rounded mr-2"></div>
            <span>No Data</span>
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
                    className={`relative rounded-lg p-5 border transition-all duration-300 ${item.hasData ? 'shadow-sm hover:shadow-md hover:scale-[1.02]' : 'bg-gray-50 border-gray-300 border-dashed opacity-80'}`}
                    style={item.hasData ? {
                        backgroundColor: getColor(item.intensity || 0),
                        borderColor: getBorderColor(item.intensity || 0)
                    } : {}}
                >
                    <div className="flex justify-between items-start mb-2">
                        <Link 
                          to={`/buyer/market/${item.market.$id}`} 
                          className={`font-bold hover:underline block leading-snug ${item.hasData ? 'text-gray-900' : 'text-gray-500'}`} 
                          title={`View details for ${item.market.name}`} 
                          style={item.hasData ? { color: getTextColor(item.intensity || 0) } : {}}
                        >
                            {item.market.name} <span className="font-normal text-sm opacity-80 block sm:inline sm:ml-1">({item.market.location})</span>
                        </Link>
                        {item.hasData && (
                            <span className="text-xs font-semibold px-2 py-0.5 bg-white bg-opacity-80 rounded-full border border-gray-200 shadow-sm ml-2 whitespace-nowrap">
                                {item.intensity !== undefined && item.intensity < 0.3 ? 'Low' : item.intensity !== undefined && item.intensity > 0.7 ? 'High' : 'Avg'}
                            </span>
                        )}
                    </div>

                    {item.hasData ? (
                        <div>
                            <div className="text-2xl font-extrabold text-gray-900">
                                ₦{item.price?.toLocaleString()}
                            </div>
                            <div className="flex items-center mt-1 text-xs">
                                {item.diffFromAvg !== undefined && item.diffFromAvg < 0 ? (
                                    <span className="text-green-700 flex items-center font-bold bg-green-50 px-1 rounded">
                                        <ArrowDownIcon className="h-3 w-3 mr-1"/>
                                        {Math.abs(item.diffFromAvg).toFixed(1)}% vs avg
                                    </span>
                                ) : (
                                    <span className="text-red-700 flex items-center font-bold bg-red-50 px-1 rounded">
                                        <ArrowUpIcon className="h-3 w-3 mr-1"/>
                                        {item.diffFromAvg?.toFixed(1)}% vs avg
                                    </span>
                                )}
                            </div>
                            <div className="mt-3 text-xs text-gray-500 text-right opacity-80">
                                Updated: {new Date(item.date!).toLocaleDateString()}
                            </div>
                        </div>
                    ) : (
                        <div className="h-20 flex flex-col items-center justify-center text-gray-400 mt-2">
                             <NoSymbolIcon className="h-6 w-6 mb-1 opacity-50" />
                             <span className="text-xs italic">No price data</span>
                        </div>
                    )}
                </div>
            ))}
            {heatmapData.length === 0 && (
                 <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                     <p className="text-gray-500">No markets found matching your filters.</p>
                 </div>
            )}
        </div>
      )}
    </div>
  );
};

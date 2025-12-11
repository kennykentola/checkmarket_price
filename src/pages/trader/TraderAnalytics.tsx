
import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PriceDataExpanded, Commodity } from '../../types';
import { getItemImage, getMarketImage } from '../../utils/imageHelpers';
import { 
  FunnelIcon,
  TagIcon,
  CalendarIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  BuildingStorefrontIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

export const TraderAnalytics = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<PriceDataExpanded[]>([]);
  const [allCommodities, setAllCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Chart selection state
  const [selectedChartCommodity, setSelectedChartCommodity] = useState<string>('');
  
  // History Table Filter state
  const [filterMarket, setFilterMarket] = useState<string>('ALL');
  const [filterCommodity, setFilterCommodity] = useState<string>('ALL');

  useEffect(() => {
    if (user) {
      Promise.all([
        api.getTraderHistory(user.$id),
        api.getCommodities()
      ]).then(([histData, commData]) => {
        setHistory(histData);
        setAllCommodities(commData);
        if (histData.length > 0) {
          setSelectedChartCommodity(histData[0].commodityId);
        }
        setLoading(false);
      });
    }
  }, [user]);

  // Derived Data: Stats for the visual grid selector
  const commodityStats = useMemo(() => {
    const stats = new Map<string, {
      id: string;
      name: string;
      unit: string;
      category: string;
      image?: string;
      totalPrice: number;
      count: number;
      lastDate: string;
    }>();

    history.forEach(h => {
       if (!stats.has(h.commodityId)) {
         // Find category from global list
         const commDef = allCommodities.find(c => c.$id === h.commodityId);
         stats.set(h.commodityId, {
           id: h.commodityId,
           name: h.commodityName,
           unit: h.commodityUnit,
           category: commDef?.category || 'Other',
           image: commDef?.image, // Capture the custom image
           totalPrice: 0,
           count: 0,
           lastDate: h.dateSubmitted
         });
       }
       const stat = stats.get(h.commodityId)!;
       stat.totalPrice += h.price;
       stat.count += 1;
       if (new Date(h.dateSubmitted) > new Date(stat.lastDate)) {
         stat.lastDate = h.dateSubmitted;
       }
    });

    return Array.from(stats.values()).map(s => ({
      ...s,
      avgPrice: s.totalPrice / s.count
    }));
  }, [history, allCommodities]);

  // Derived Data: Unique Markets for Dropdown
  const uniqueMarkets = useMemo(() => {
    const map = new Map();
    history.forEach(h => map.set(h.marketId, h.marketName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [history]);

  // Derived Data: Unique Commodities for Table Filter
  const uniqueCommoditiesList = useMemo(() => {
    const map = new Map();
    history.forEach(h => map.set(h.commodityId, h.commodityName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [history]);

  // Derived Data: Trend Chart
  const lineChartData = useMemo(() => {
    if (!selectedChartCommodity) return [];
    return history
      .filter(h => h.commodityId === selectedChartCommodity)
      .sort((a, b) => new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime())
      .map(h => ({
        date: new Date(h.dateSubmitted).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        price: h.price,
        market: h.marketName
      }));
  }, [history, selectedChartCommodity]);

  // Derived Data: Market Comparison Chart
  const barChartData = useMemo(() => {
    if (!selectedChartCommodity) return [];
    const stats: Record<string, { total: number; count: number }> = {};
    history
      .filter(h => h.commodityId === selectedChartCommodity)
      .forEach(h => {
        if (!stats[h.marketName]) stats[h.marketName] = { total: 0, count: 0 };
        stats[h.marketName].total += h.price;
        stats[h.marketName].count += 1;
      });
    return Object.entries(stats).map(([marketName, val]) => ({
        name: marketName,
        avgPrice: val.total / val.count
    }));
  }, [history, selectedChartCommodity]);

  // Derived Data: Detailed Market Stats Breakdown
  const marketStatsBreakdown = useMemo(() => {
    if (!selectedChartCommodity) return [];
    const stats = new Map<string, {
      name: string;
      total: number;
      count: number;
      min: number;
      max: number;
      earliest: string;
      latest: string;
    }>();

    history
      .filter(h => h.commodityId === selectedChartCommodity)
      .forEach(h => {
        if (!stats.has(h.marketId)) {
          stats.set(h.marketId, {
            name: h.marketName,
            total: 0,
            count: 0,
            min: h.price,
            max: h.price,
            earliest: h.dateSubmitted,
            latest: h.dateSubmitted
          });
        }
        const s = stats.get(h.marketId)!;
        s.total += h.price;
        s.count += 1;
        s.min = Math.min(s.min, h.price);
        s.max = Math.max(s.max, h.price);
        
        // Track dates
        if (new Date(h.dateSubmitted) < new Date(s.earliest)) s.earliest = h.dateSubmitted;
        if (new Date(h.dateSubmitted) > new Date(s.latest)) s.latest = h.dateSubmitted;
      });

    return Array.from(stats.values()).map(s => ({
      ...s,
      avg: s.total / s.count
    })).sort((a, b) => b.count - a.count); // Sort by most active markets
  }, [history, selectedChartCommodity]);

  // Top 5 Frequent Markets for Chart
  const topMarketsChartData = useMemo(() => {
      return marketStatsBreakdown.slice(0, 5).map(m => ({
          name: m.name,
          avg: m.avg,
          count: m.count
      }));
  }, [marketStatsBreakdown]);

  // Filtered History Table
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchMarket = filterMarket === 'ALL' || item.marketId === filterMarket;
      const matchCommodity = filterCommodity === 'ALL' || item.commodityId === filterCommodity;
      return matchMarket && matchCommodity;
    });
  }, [history, filterMarket, filterCommodity]);

  const selectedCommodityName = commodityStats.find(c => c.id === selectedChartCommodity)?.name || 'Commodity';
  const selectedCommodityGlobalAvg = commodityStats.find(c => c.id === selectedChartCommodity)?.avgPrice || 0;
  const selectedCommodityUnit = commodityStats.find(c => c.id === selectedChartCommodity)?.unit || '';

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Analyze your historical pricing and market trends.</p>
      </div>

      {/* VISUAL COMMODITY SELECTOR (Image Grid Layer) */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Select Commodity to Analyze</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {commodityStats.map(stat => (
            <button
              key={stat.id}
              onClick={() => setSelectedChartCommodity(stat.id)}
              className={`group relative h-40 rounded-xl overflow-hidden shadow-sm transition-all duration-300 text-left w-full
                ${selectedChartCommodity === stat.id ? 'ring-4 ring-indigo-500 ring-offset-2' : 'hover:shadow-lg hover:scale-[1.02]'}
              `}
            >
              {/* Background Image Layer */}
              <div className="absolute inset-0 bg-gray-200">
                <img 
                  src={getItemImage(stat.name, stat.category, stat.image)} 
                  alt={stat.name} 
                  className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${selectedChartCommodity === stat.id ? 'from-indigo-900/90 to-indigo-800/40' : 'from-gray-900/80 to-transparent'}`}></div>
              </div>
              
              {/* Content Layer */}
              <div className="relative z-10 h-full p-4 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                   <span className="text-xs font-bold uppercase tracking-wider opacity-80">{stat.category}</span>
                   {selectedChartCommodity === stat.id && <CheckCircleIcon className="h-5 w-5 text-white" />}
                </div>
                <div>
                   <h4 className="font-bold text-lg leading-tight">{stat.name}</h4>
                   <p className="text-xs text-gray-300 mt-1">{stat.count} submissions</p>
                   <p className="text-sm font-semibold mt-1">Avg: ₦{stat.avgPrice.toFixed(2)} / {stat.unit}</p>
                </div>
              </div>
            </button>
          ))}
          {commodityStats.length === 0 && (
            <div className="col-span-full py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No submission history found.</p>
            </div>
          )}
        </div>
      </div>

      {/* CHARTS SECTION */}
      {selectedChartCommodity && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
            {/* LINE CHART */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-bold text-gray-900">Price History</h4>
                  <p className="text-xs text-gray-500">Trend for {selectedCommodityName} (per {selectedCommodityUnit})</p>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg">
                   <TagIcon className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{fill: '#6B7280', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#6B7280', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `₦${val}`}/>
                    <Tooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                      formatter={(value: number) => [`₦${value.toFixed(2)}`, 'Price']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#4F46E5" 
                      strokeWidth={3} 
                      dot={{r: 4, strokeWidth: 2}} 
                      activeDot={{r: 6}}
                      name="Price" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* TOP 5 MARKETS CHART */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
               <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-bold text-gray-900">Top 5 Markets by Volume</h4>
                  <p className="text-xs text-gray-500">Avg price in your most active markets for {selectedCommodityName}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                   <ChartBarIcon className="h-5 w-5 text-purple-600" />
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topMarketsChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" tick={{fill: '#6B7280', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `₦${val}`}/>
                    <YAxis type="category" dataKey="name" width={80} tick={{fill: '#6B7280', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: '#F3F4F6'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                      formatter={(value: number) => [`₦${value.toFixed(2)}`, 'Avg Price']}
                    />
                    <Legend />
                     <ReferenceLine 
                      x={selectedCommodityGlobalAvg} 
                      stroke="#EF4444" 
                      strokeDasharray="3 3"
                      label={{ value: 'Avg', position: 'insideTopRight', fill: '#EF4444', fontSize: 10 }} 
                    />
                    <Bar dataKey="avg" name="Avg Price" fill="#8B5CF6" radius={[0, 4, 4, 0]}>
                       {topMarketsChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8B5CF6' : '#A78BFA'} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
        </div>
      )}

      {/* MARKET PERFORMANCE SUMMARY CARDS */}
      {selectedChartCommodity && (
        <div className="space-y-4">
           <h3 className="text-lg font-medium text-gray-900">Market Breakdown for {selectedCommodityName}</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketStatsBreakdown.map((market) => {
                const diffFromAvg = selectedCommodityGlobalAvg ? ((market.avg - selectedCommodityGlobalAvg) / selectedCommodityGlobalAvg) * 100 : 0;
                
                return (
                <div key={market.name} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
                   <div className="p-5">
                      <div className="flex items-center">
                         <div className="flex-shrink-0 h-12 w-12">
                            <img 
                              className="h-12 w-12 rounded-full object-cover border border-gray-200" 
                              src={getMarketImage(market.name)} 
                              alt={market.name} 
                            />
                         </div>
                         <div className="ml-5 w-0 flex-1">
                            <dl>
                               <dt className="text-sm font-medium text-gray-500 truncate">{market.name}</dt>
                               <dd>
                                  <div className="text-lg font-medium text-gray-900">₦{market.avg.toFixed(2)}</div>
                                  <div className="flex items-center text-xs mt-1">
                                    {diffFromAvg < -0.1 ? (
                                        <span className="text-green-700 font-medium flex items-center bg-green-50 px-1.5 py-0.5 rounded">
                                            <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                                            {Math.abs(diffFromAvg).toFixed(1)}% vs avg
                                        </span>
                                    ) : diffFromAvg > 0.1 ? (
                                        <span className="text-red-700 font-medium flex items-center bg-red-50 px-1.5 py-0.5 rounded">
                                            <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                                            {diffFromAvg.toFixed(1)}% vs avg
                                        </span>
                                    ) : (
                                        <span className="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Average</span>
                                    )}
                                  </div>
                               </dd>
                            </dl>
                         </div>
                      </div>
                   </div>
                   <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                      <div className="text-sm flex justify-between items-center text-gray-500 mb-2">
                         <div className="flex space-x-4">
                            <span className="flex items-center" title="Lowest Price Submitted">
                              <ArrowTrendingDownIcon className="h-4 w-4 text-green-500 mr-1" />
                              ₦{market.min}
                            </span>
                            <span className="flex items-center" title="Highest Price Submitted">
                              <ArrowTrendingUpIcon className="h-4 w-4 text-red-400 mr-1" />
                              ₦{market.max}
                            </span>
                         </div>
                         <div className="font-medium text-indigo-600">{market.count} entries</div>
                      </div>
                      <div className="text-xs text-gray-400 flex flex-col space-y-1">
                          <div className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Earliest: {new Date(market.earliest).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Latest: {new Date(market.latest).toLocaleDateString()}
                          </div>
                      </div>
                   </div>
                </div>
              )})}
              {marketStatsBreakdown.length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-500">
                   No market data found for this commodity.
                </div>
              )}
           </div>
        </div>
      )}

      {/* FULL HISTORY TABLE */}
      <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Submission Log</h3>
            <p className="mt-1 text-sm text-gray-500">Detailed records of your market submissions.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
              </div>
              <select 
                value={filterMarket}
                onChange={(e) => setFilterMarket(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 sm:text-sm border-gray-300 rounded-md border py-2"
              >
                <option value="ALL">All Markets</option>
                {uniqueMarkets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TagIcon className="h-4 w-4 text-gray-400" />
              </div>
              <select 
                 value={filterCommodity}
                 onChange={(e) => setFilterCommodity(e.target.value)}
                 className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 sm:text-sm border-gray-300 rounded-md border py-2"
              >
                <option value="ALL">All Commodities</option>
                {uniqueCommoditiesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commodity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((item) => (
                <tr key={item.$id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {item.commodityName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.commodityName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.marketName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      ₦{item.price.toFixed(2)} / {item.commodityUnit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     <div className="flex items-center">
                       <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                       {new Date(item.dateSubmitted).toLocaleDateString()}
                     </div>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                 <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                       No entries match your filters.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
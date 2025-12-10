
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PriceDataExpanded, Commodity } from '../types';
import { getItemImage } from '../utils/imageHelpers';
import { 
  ArrowRightIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  UserCircleIcon,
  ScaleIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

export const Home = () => {
  const [prices, setPrices] = useState<PriceDataExpanded[]>([]);
  const [loading, setLoading] = useState(true);
  const [commodities, setCommodities] = useState<Commodity[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, c] = await Promise.all([api.getLatestPrices(), api.getCommodities()]);
        setPrices(p);
        setCommodities(c);
      } catch (error) {
        console.error("Failed to load public data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Compute stats for the grid
  const gridItems = useMemo(() => {
    return commodities.map(c => {
      const cPrices = prices.filter(p => p.commodityId === c.$id);
      if (cPrices.length === 0) return null;
      
      // Sort desc by date to find latest and calculate trend
      const sortedPrices = [...cPrices].sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
      
      const avgPrice = cPrices.reduce((acc, curr) => acc + curr.price, 0) / cPrices.length;
      const minPrice = Math.min(...cPrices.map(p => p.price));
      const latestUpdate = new Date(sortedPrices[0].dateSubmitted);
      
      // Calculate Trend (Latest vs Previous)
      let trend: 'up' | 'down' | 'neutral' = 'neutral';
      if (sortedPrices.length > 1) {
        const latest = sortedPrices[0].price;
        const prev = sortedPrices[1].price;
        if (latest > prev) trend = 'up';
        else if (latest < prev) trend = 'down';
      }
      
      return {
        ...c,
        avgPrice,
        minPrice,
        latestUpdate,
        // Pass custom image if exists
        bgImage: getItemImage(c.name, c.category, c.image),
        count: cPrices.length,
        trend
      };
    }).filter(Boolean);
  }, [commodities, prices]);

  // Use all items up to 30
  const displayItems = gridItems.slice(0, 30);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600 tracking-tight">MarketCheck</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-500 hover:text-gray-900 font-medium px-3 py-2">
                Log in
              </Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-indigo-900 text-white">
        <div className="absolute inset-0 z-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1920&q=80" alt="Market" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="md:w-2/3">
                <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl mb-6">
                  Nigeria's Real-Time Market Monitor
                </h1>
                <p className="mt-4 text-xl text-indigo-100 max-w-3xl">
                  Track prices of Garri, Rice, Yams, and daily essentials across major markets like Mile 12, Bodija, and Wuse. Empowering traders and families with transparent pricing.
                </p>
                <div className="mt-8 flex gap-4">
                  <Link
                      to="/buyer/prices"
                      className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-900 bg-white hover:bg-indigo-50 md:py-4 md:text-lg transition-all"
                    >
                      Check Prices
                  </Link>
                   <Link
                      to="/register"
                      className="px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-indigo-900 md:py-4 md:text-lg transition-all"
                    >
                      Join as Trader
                  </Link>
                </div>
            </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x divide-gray-100">
                <div>
                    <p className="text-3xl font-bold text-indigo-600">{commodities.length}+</p>
                    <p className="text-sm text-gray-500">Commodities Tracked</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-indigo-600">5+</p>
                    <p className="text-sm text-gray-500">Major Markets</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-indigo-600">{prices.length}</p>
                    <p className="text-sm text-gray-500">Daily Updates</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-indigo-600">24/7</p>
                    <p className="text-sm text-gray-500">Real-time Access</p>
                </div>
            </div>
        </div>
      </div>

      {/* Image Grid Layers - Live Prices */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
             <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Market Essentials</h2>
                <p className="mt-2 text-gray-500">Average prices across Lagos, Abuja, and other regions today.</p>
             </div>
             <Link to="/buyer/prices" className="inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium">
                View Full Market List <ArrowRightIcon className="ml-2 h-4 w-4"/>
             </Link>
          </div>
          
          {loading ? (
             <div className="flex justify-center py-20">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {displayItems && displayItems.map((item) => (
                 item && (
                   <div key={item.$id} className="group relative h-72 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-default bg-white">
                      {/* Background Image Layer */}
                      <div className="absolute inset-0 bg-gray-200">
                         <img 
                           src={item.bgImage} 
                           alt={item.category} 
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                           loading="lazy"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100"></div>
                      </div>
                      
                      {/* Content Layer */}
                      <div className="relative z-10 h-full p-5 flex flex-col justify-between text-white">
                        <div className="flex justify-between items-start">
                           <span className="inline-block px-2 py-1 rounded-md text-xs font-bold bg-black/30 backdrop-blur-sm text-white uppercase tracking-wider border border-white/10">
                              {item.category}
                           </span>
                           
                           {/* Price Trend Indicator */}
                           <div className="flex items-center justify-center h-7 w-7 rounded-full bg-black/40 backdrop-blur-md border border-white/10" title={`Trend: ${item.trend.toUpperCase()}`}>
                              {item.trend === 'up' && <ArrowTrendingUpIcon className="h-4 w-4 text-red-400" />}
                              {item.trend === 'down' && <ArrowTrendingDownIcon className="h-4 w-4 text-green-400" />}
                              {item.trend === 'neutral' && <MinusIcon className="h-4 w-4 text-gray-300" />}
                           </div>
                        </div>
                        
                        <div>
                           <h3 className="text-xl font-bold mb-1 group-hover:text-indigo-200 transition-colors">{item.name}</h3>
                           
                           <div className="flex items-baseline mb-3">
                              <span className="text-3xl font-extrabold text-white">₦{item.avgPrice.toLocaleString()}</span>
                              <span className="ml-2 text-gray-300 text-sm">/ {item.unit}</span>
                           </div>
                           
                           <div className="pt-3 border-t border-white/20 flex justify-between items-center text-xs text-gray-300">
                              <span className="flex items-center">
                                <MapPinIcon className="h-3 w-3 mr-1" />
                                {item.count} Markets
                              </span>
                              <span>Updated {item.latestUpdate.toLocaleDateString()}</span>
                           </div>
                        </div>
                      </div>
                   </div>
                 )
               ))}
               {displayItems.length === 0 && (
                 <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
                    <p className="text-gray-500">No market data available right now.</p>
                 </div>
               )}
            </div>
          )}
          
          <div className="mt-12 text-center">
             <Link to="/buyer/prices" className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Browse All Commodities
             </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Built for the Nigerian Market
            </p>
          </div>
          <div className="mt-12">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <ArrowTrendingUpIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Price Alerts</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Know when the price of Rice or Beans drops in your local market immediately.
                </dd>
              </div>
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <ScaleIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Compare Markets</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Is Yam cheaper in Mile 12 or Oyingbo? Check real-time comparisons before you move.
                </dd>
              </div>
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Trusted Traders</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Verified traders submit prices daily, ensuring the data you see is actionable.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                 <span className="text-2xl font-bold text-white">MarketCheck</span>
                 <p className="mt-4 text-sm text-gray-400">
                    The #1 platform for local food price tracking in Nigeria. Connecting farmers, traders, and consumers.
                 </p>
              </div>
              <div>
                 <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">Quick Links</h3>
                 <ul className="mt-4 space-y-4">
                    <li><Link to="/buyer/prices" className="text-base hover:text-white">All Commodities</Link></li>
                    <li><Link to="/buyer/compare" className="text-base hover:text-white">Compare Prices</Link></li>
                    <li><Link to="/login" className="text-base hover:text-white">Trader Portal</Link></li>
                 </ul>
              </div>
              <div>
                 <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">Contact</h3>
                 <p className="mt-4 text-base">
                    Lagos, Nigeria<br/>
                    support@marketcheck.ng
                 </p>
              </div>
           </div>
           <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm">
              &copy; 2023 MarketCheck Nigeria. All rights reserved.
           </div>
        </div>
      </footer>
    </div>
  );
};

import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PriceDataExpanded, Commodity } from '../types';
import { 
  ArrowRightIcon, 
  ArrowTrendingUpIcon,
  UserCircleIcon,
  ScaleIcon
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
      
      const avgPrice = cPrices.reduce((acc, curr) => acc + curr.price, 0) / cPrices.length;
      const minPrice = Math.min(...cPrices.map(p => p.price));
      const latestUpdate = new Date(Math.max(...cPrices.map(p => new Date(p.dateSubmitted).getTime())));
      
      // Assign color based on category
      let bgClass = "bg-gradient-to-br from-gray-100 to-gray-200";
      if (c.category === 'Vegetables') bgClass = "bg-gradient-to-br from-green-100 to-green-200";
      if (c.category === 'Fruits') bgClass = "bg-gradient-to-br from-orange-100 to-yellow-100";
      if (c.category === 'Grains') bgClass = "bg-gradient-to-br from-yellow-50 to-amber-100";
      if (c.category === 'Meat') bgClass = "bg-gradient-to-br from-red-50 to-rose-100";
      if (c.category === 'Dairy') bgClass = "bg-gradient-to-br from-blue-50 to-sky-100";

      return {
        ...c,
        avgPrice,
        minPrice,
        latestUpdate,
        bgClass,
        count: cPrices.length
      };
    }).filter(Boolean);
  }, [commodities, prices]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">MarketCheck</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-500 hover:text-gray-900 font-medium px-3 py-2">
                Log in
              </Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20 px-4 sm:px-6 lg:px-8">
            <main className="mt-10 mx-auto max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Real-time local</span>{' '}
                  <span className="block text-indigo-600 xl:inline">market prices</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Empowering traders and buyers with up-to-date commodity prices from your local markets. Compare, track, and make informed decisions.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/buyer/prices"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg"
                    >
                      Browse Prices
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-indigo-50 flex items-center justify-center">
             <div className="grid grid-cols-2 gap-4 p-8 opacity-70 transform rotate-3">
                <div className="h-32 w-32 bg-green-200 rounded-2xl shadow-lg"></div>
                <div className="h-32 w-32 bg-orange-200 rounded-2xl shadow-lg mt-12"></div>
                <div className="h-32 w-32 bg-red-200 rounded-2xl shadow-lg -mt-12"></div>
                <div className="h-32 w-32 bg-blue-200 rounded-2xl shadow-lg"></div>
             </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why use MarketCheck?
            </p>
          </div>
          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <ArrowTrendingUpIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Live Updates</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Traders submit prices daily, ensuring you always have the latest market data at your fingertips.
                </dd>
              </div>
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <ScaleIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Smart Comparison</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Compare prices across different local markets to find the best deals for your business.
                </dd>
              </div>
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Trader History</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Traders can track their submission history and analyze price trends over time.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Image Grid Layers - Live Prices */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
             <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Current Market Rates</h2>
                <p className="mt-2 text-gray-500">Snapshot of today's average prices across all markets.</p>
             </div>
             <Link to="/buyer/prices" className="hidden sm:flex items-center text-indigo-600 hover:text-indigo-500 font-medium">
                View All <ArrowRightIcon className="ml-2 h-4 w-4"/>
             </Link>
          </div>
          
          {loading ? (
             <div className="flex justify-center py-12">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {gridItems && gridItems.map((item) => (
                 item && (
                   <div key={item.$id} className={`relative rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden ${item.bgClass}`}>
                      {/* Decorative Background Circle */}
                      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white opacity-20"></div>
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.category}</p>
                              <h3 className="text-xl font-bold text-gray-900 mt-1">{item.name}</h3>
                           </div>
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-60 text-gray-800">
                              {item.count} Listings
                           </span>
                        </div>
                        
                        <div className="mt-6 flex items-baseline">
                           <span className="text-3xl font-extrabold text-gray-900">${item.avgPrice.toFixed(2)}</span>
                           <span className="ml-1 text-gray-600 font-medium">/ {item.unit}</span>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-black border-opacity-5 flex justify-between items-center text-sm">
                           <span className="text-gray-600">Lowest: <span className="font-semibold text-gray-900">${item.minPrice.toFixed(2)}</span></span>
                           <span className="text-gray-500 text-xs">Updated {item.latestUpdate.toLocaleDateString()}</span>
                        </div>
                      </div>
                   </div>
                 )
               ))}
               {gridItems && gridItems.length === 0 && (
                 <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No market data available right now.</p>
                 </div>
               )}
            </div>
          )}
          
          <div className="mt-8 text-center sm:hidden">
             <Link to="/buyer/prices" className="inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium">
                View All <ArrowRightIcon className="ml-2 h-4 w-4"/>
             </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                 <span className="text-2xl font-bold text-indigo-400">MarketCheck</span>
                 <p className="mt-4 text-gray-400 text-sm">
                    Connecting local traders and buyers with transparent pricing information.
                 </p>
              </div>
              <div>
                 <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Platform</h3>
                 <ul className="mt-4 space-y-4">
                    <li><Link to="/buyer/prices" className="text-base text-gray-400 hover:text-white">Browse Markets</Link></li>
                    <li><Link to="/login" className="text-base text-gray-400 hover:text-white">Trader Login</Link></li>
                 </ul>
              </div>
              <div>
                 <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Contact</h3>
                 <p className="mt-4 text-base text-gray-400">
                    support@marketcheck.local
                 </p>
              </div>
           </div>
           <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
              &copy; 2023 MarketCheck. All rights reserved.
           </div>
        </div>
      </footer>
    </div>
  );
};

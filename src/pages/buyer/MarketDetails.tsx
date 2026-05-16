
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Market, PriceDataExpanded } from '@/types';
import { getItemImage, getMarketImage } from '../../utils/imageHelpers';
import { 
  ArrowLeftIcon, 
  MapPinIcon, 
  TagIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  ClockIcon,
  InformationCircleIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

export const MarketDetails = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const [market, setMarket] = useState<Market | null>(null);
  const [prices, setPrices] = useState<PriceDataExpanded[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'about'>('inventory');

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

    // Listen for data updates from admin changes
    const handleDataUpdate = (event: CustomEvent) => {
      if (event.detail?.type === 'price' || event.detail?.type === 'market') {
        loadData();
      }
    };

    window.addEventListener('dataUpdated', handleDataUpdate as EventListener);

    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate as EventListener);
    };
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
          src={getMarketImage(market.name, market.image)} 
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
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-4 px-8 text-sm font-bold transition-colors relative ${
              activeTab === 'inventory' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Market Inventory
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-4 px-8 text-sm font-bold transition-colors relative ${
              activeTab === 'about' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            About {market.name}
          </button>
        </div>

        {activeTab === 'inventory' ? (
          <>
            <div className="mb-8">
               <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                 <BuildingStorefrontIcon className="h-6 w-6 mr-2 text-indigo-600" />
                 Product Listings
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
                          <Link 
                            to={`/product/${item.commodityId}`} 
                            key={item.$id} 
                            className="flex items-start space-x-4 group p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
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
                          </Link>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                  <InformationCircleIcon className="h-6 w-6 mr-2 text-indigo-600" />
                  Market Overview
                </h3>
                <div className="text-gray-600 leading-relaxed text-lg space-y-4">
                  <p>
                    {market.description || (
                      market.name.toLowerCase().includes('dugbe') 
                        ? "Dugbe Market is one of the largest and oldest bustling trading centers in Ibadan. It is most famous as the city's premier hub for budget-friendly thrift items, fresh farm produce, and traditional crafts."
                        : market.name.toLowerCase().includes('gbagi')
                        ? "Gbagi Market is Ibadan's international textile hub. It is the leading destination for wholesale and retail fabrics, including high-quality lace, Ankara, and imported textiles that supply most of Western Nigeria."
                        : market.name.toLowerCase().includes('oja-oba')
                        ? "Oja-Oba (The King's Market) is a historic landmark located near the Mapo Hall. it is deeply rooted in Ibadan's heritage, offering a wide array of traditional foodstuffs, herbs, and locally manufactured goods."
                        : market.name.toLowerCase().includes('aleshinloye')
                        ? "Aleshinloye Market is one of the most organized and modern markets in Ibadan. It is highly regarded for fashion accessories, jewelry, luxury household items, and high-end groceries."
                        : market.name.toLowerCase().includes('oje')
                        ? "Oje Market is culturally significant as the center for traditional Aso-Oke weaving and ancient Yorubaland trade. It also serves as a major terminal for fresh farm produce from rural areas."
                        : `Welcome to ${market.name}. This is a key trading hub located in ${market.location}, known for its vibrant atmosphere and diverse range of agricultural and consumer goods.`
                    )}
                  </p>
                  
                  {market.name.toLowerCase().includes('bodija') && !market.description && (
                    <p>
                      Bodija Market is particularly famous for its food items, serving as a primary collection point for grains and livestock coming from Northern Nigeria to the Southwest.
                    </p>
                  )}
                </div>
              </section>

              {/* Highlights Section for specific markets */}
              {((market.name.toLowerCase().includes('dugbe') || market.name.toLowerCase().includes('gbagi') || market.name.toLowerCase().includes('aleshinloye')) && !market.description) && (
                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                    <SparklesIcon className="h-6 w-6 mr-2 text-indigo-600" />
                    Key Highlights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {market.name.toLowerCase().includes('gbagi') ? (
                      <>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                          <h4 className="font-bold text-purple-900 text-sm uppercase mb-2">Textile Capital</h4>
                          <p className="text-sm text-purple-800 leading-relaxed">The primary source for Ankara, Lace, and Aso-Ebi materials in Ibadan.</p>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                          <h4 className="font-bold text-indigo-900 text-sm uppercase mb-2">Wholesale Prices</h4>
                          <p className="text-sm text-indigo-800 leading-relaxed">Highly competitive pricing for bulk buyers and boutique owners.</p>
                        </div>
                      </>
                    ) : market.name.toLowerCase().includes('aleshinloye') ? (
                      <>
                        <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
                          <h4 className="font-bold text-pink-900 text-sm uppercase mb-2">Luxury Finds</h4>
                          <p className="text-sm text-pink-800 leading-relaxed">The best location for designer jewelry, watches, and formal wear.</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                          <h4 className="font-bold text-orange-900 text-sm uppercase mb-2">Modern Layout</h4>
                          <p className="text-sm text-orange-800 leading-relaxed">Easier to navigate with distinct sections for various product categories.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                          <h4 className="font-bold text-indigo-900 text-sm uppercase mb-2">Thrifting Paradise</h4>
                          <p className="text-sm text-indigo-800 leading-relaxed">Famous for 'Okrika' items at unbeatable budget-friendly prices.</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                          <h4 className="font-bold text-green-900 text-sm uppercase mb-2">Central Location</h4>
                          <p className="text-sm text-green-800 leading-relaxed">Located in the commercial heart of Ibadan with excellent accessibility.</p>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              )}

              {/* Tips Section for Dugbe */}
              {(market.name.toLowerCase().includes('dugbe') && !market.description) && (
                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                    <ClipboardDocumentCheckIcon className="h-6 w-6 mr-2 text-indigo-600" />
                    Pro Tips
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold mr-3 mt-0.5">1</div>
                      <p className="text-gray-600"><span className="font-bold text-gray-900">Haggle:</span> Bargaining is essential for the best deals on thrift items.</p>
                    </div>
                    <div className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold mr-3 mt-0.5">2</div>
                      <p className="text-gray-600"><span className="font-bold text-gray-900">Best Times:</span> Saturdays between 11 AM and 2 PM are the peak times for new stock.</p>
                    </div>
                  </div>
                </section>
              )}

              <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                  <SparklesIcon className="h-6 w-6 mr-2 text-indigo-600" />
                  Market Specialties
                </h3>
                <div className="flex flex-wrap gap-3">
                  {market.name.toLowerCase().includes('dugbe') ? (
                    ['Okrika', 'Electronics', 'Fresh Produce', 'Wholesale'].map(spec => (
                      <span key={spec} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-100">{spec}</span>
                    ))
                  ) : market.name.toLowerCase().includes('gbagi') ? (
                    ['Textiles', 'Lace', 'Ankara', 'Fashion Wholesale'].map(spec => (
                      <span key={spec} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold border border-purple-100">{spec}</span>
                    ))
                  ) : (market.specialties || ['Fresh Produce', 'Grains', 'Wholesale', 'Retail', 'Livestock']).map(spec => (
                    <span key={spec} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-100">{spec}</span>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2 text-green-600" />
                  Market Verification
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  This market is part of our verified network. All prices shown are crowdsourced and validated by our local agents.
                </p>
                <div className="flex items-center text-green-600 font-bold text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                  Verified Active
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

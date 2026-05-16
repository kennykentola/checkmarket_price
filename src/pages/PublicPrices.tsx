import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PriceDataExpanded } from '@/types';
import { getItemImage } from '../utils/imageHelpers';
import {
  MapPinIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export const PublicPrices = () => {
  const [prices, setPrices] = useState<PriceDataExpanded[]>([]);
  const [trendingPrices, setTrendingPrices] = useState<PriceDataExpanded[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(7); // Default to 7 days

  const loadData = async () => {
    try {
      setLoading(true);
      const [latestPrices, trends] = await Promise.all([
        api.getLatestPrices(),
        api.getTrendingPrices(selectedPeriod)
      ]);
      setPrices(latestPrices);
      setTrendingPrices(trends.slice(0, 20)); // Show top 20 trending items
    } catch (error) {
      console.error("Failed to fetch prices", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const filteredPrices = prices.filter(p =>
    p.commodityName.toLowerCase().includes(search.toLowerCase()) ||
    p.marketName.toLowerCase().includes(search.toLowerCase())
  );

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTrend = (trend: number) => {
    const sign = trend > 0 ? '+' : '';
    return `${sign}${trend.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Market Price Updates
            </h1>
            <p className="text-lg text-gray-600">
              Real-time commodity prices from markets across Nigeria
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search commodity or market..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 font-medium">View:</span>
              {[1, 7, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedPeriod(days)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    selectedPeriod === days
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {days === 1 ? 'Today' : days === 7 ? 'This Week' : 'This Month'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured / Latest Prices Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium mr-2">Featured</span>
                Latest Market Updates
              </h3>
              {filteredPrices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredPrices.slice(0, 50).map((price) => (
                    <Link
                      to={`/product/${price.commodityId}`}
                      key={price.$id}
                      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-all block"
                    >
                      <div className="flex items-start space-x-3 mb-3">
                        <img
                          src={getItemImage(price.commodityName, price.commodityCategory, price.commodityImage)}
                          alt={price.commodityName}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                            {price.commodityName}
                          </h4>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <MapPinIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{price.marketName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-700">
                          <span className="font-bold text-lg text-indigo-600">₦{price.price.toLocaleString()}</span>
                          <span className="text-sm text-gray-500 ml-1">/ {price.commodityUnit}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        Updated {new Date(price.dateSubmitted).toLocaleDateString()}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 px-6 py-12 text-center text-gray-500">
                  No prices found matching your search.
                </div>
              )}
            </div>

            {/* Trending / Price Movements Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium mr-2">Trending</span>
                Price Movements
              </h3>
              {trendingPrices.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500">No trending data available for the selected period.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trendingPrices.map((item) => (
                    <div
                      key={`${item.commodityId}-${item.marketId}`}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex items-start space-x-3 mb-3">
                        <img
                          src={getItemImage(item.commodityName, item.commodityCategory, item.commodityImage)}
                          alt={item.commodityName}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                            {item.commodityName}
                          </h4>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {item.marketName}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {getTrendIcon(item.trendDirection || 'stable')}
                          <span className={`text-sm font-semibold ${getTrendColor(item.trendDirection || 'stable')}`}>
                            {item.trend ? formatTrend(item.trend) : '0.0%'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-700">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          <span className="font-bold text-lg">₦{item.price.toLocaleString()}</span>
                          <span className="text-sm text-gray-500 ml-1">/ {item.commodityUnit}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        Updated {new Date(item.dateSubmitted).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

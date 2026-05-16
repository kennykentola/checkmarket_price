import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PriceDataExpanded } from '@/types';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export const DailyMarketTrends = () => {
  const [trendingPrices, setTrendingPrices] = useState<PriceDataExpanded[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(7); // Default to 7 days

  // Persistent featured items that update less frequently
  const [featuredItems, setFeaturedItems] = useState<PriceDataExpanded[]>([]);

  useEffect(() => {
    const loadTrendingPrices = async () => {
      try {
        setLoading(true);
        const trends = await api.getTrendingPrices(selectedPeriod);
        setTrendingPrices(trends.slice(0, 40)); // Show top 40 trending items

        // Update featured items occasionally (every few loads)
        if (Math.random() < 0.3 || featuredItems.length === 0) { // 30% chance to update featured
          const latest = await api.getLatestPrices();
          // Select up to 80 diverse featured items
          const featured = latest.slice(0, 80);
          setFeaturedItems(featured);
        }
      } catch (error) {
        console.error("Failed to load trending prices", error);
      } finally {
        setLoading(false);
      }
    };

    loadTrendingPrices();
  }, [selectedPeriod]);

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Market Trends</h2>
          <p className="text-gray-600 mt-1">Price movements across markets</p>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-2">
          {[1, 3, 7, 14, 100].map((days) => (
            <button
              key={days}
              onClick={() => setSelectedPeriod(days)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedPeriod === days
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {days === 1 ? '1 Day' : `${days} Days`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured Items Section */}
          {featuredItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium mr-2">Featured</span>
                Latest Market Updates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredItems.map((item) => (
                  <Link
                    to={`/product/${item.commodityId}`}
                    key={`featured-${item.commodityId}-${item.marketId}`}
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-all block"
                  >
                    <div className="flex items-start space-x-3 mb-3">
                      {item.commodityImage ? (
                        <img
                          src={item.commodityImage}
                          alt={item.commodityName}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <CurrencyDollarIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                          {item.commodityName}
                        </h4>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <MapPinIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{item.marketName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <span className="font-bold text-lg text-indigo-600">₦{item.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 ml-1">/ {item.commodityUnit}</span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Updated {new Date(item.dateSubmitted).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Trending Items Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium mr-2">Trending</span>
              Price Movements
            </h3>
            {trendingPrices.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No trending data available for the selected period.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {trendingPrices.map((item) => (
                  <Link
                    to={`/product/${item.commodityId}`}
                    key={`${item.commodityId}-${item.marketId}`}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200 block"
                  >
                    <div className="flex items-start space-x-3 mb-3">
                      {item.commodityImage ? (
                        <img
                          src={item.commodityImage}
                          alt={item.commodityName}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
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
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

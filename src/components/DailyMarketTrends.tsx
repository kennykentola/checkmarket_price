import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const loadTrendingPrices = async () => {
      try {
        setLoading(true);
        const trends = await api.getTrendingPrices(selectedPeriod);
        setTrendingPrices(trends.slice(0, 12)); // Show top 12 trending items
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
          {[1, 3, 7, 14].map((days) => (
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
      ) : trendingPrices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No trending data available for the selected period.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingPrices.map((item) => (
            <div
              key={`${item.commodityId}-${item.marketId}`}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {item.commodityName}
                  </h3>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    {item.marketName}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
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
  );
};

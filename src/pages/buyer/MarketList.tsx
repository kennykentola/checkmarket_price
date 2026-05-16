import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Market, PriceDataExpanded } from '@/types';
import { getMarketImage } from '../../utils/imageHelpers';
import { MapPinIcon, MagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export const MarketList = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [prices, setPrices] = useState<PriceDataExpanded[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [marketList, latestPrices] = await Promise.all([api.getMarkets(), api.getLatestPrices()]);
        setMarkets(marketList);
        setPrices(latestPrices);
      } catch (e) {
        console.error('Failed to load markets', e);
        setError('Unable to load markets at the moment.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const marketStats = useMemo(() => {
    const stats = new Map<string, { count: number; lastUpdated: string }>();

    prices.forEach((price) => {
      const existing = stats.get(price.marketId);
      const updatedAt = existing ? existing.lastUpdated : price.dateSubmitted;
      const latestDate = existing && new Date(price.dateSubmitted) > new Date(existing.lastUpdated)
        ? price.dateSubmitted
        : updatedAt;

      stats.set(price.marketId, {
        count: (existing?.count || 0) + 1,
        lastUpdated: latestDate,
      });
    });

    return stats;
  }, [prices]);

  const uniqueMarkets = useMemo(() => {
    const unique = new Map<string, Market>();
    markets.forEach(m => {
      // Use name as the key to collapse visual duplicates
      if (!unique.has(m.name)) {
        unique.set(m.name, m);
      }
    });
    return Array.from(unique.values());
  }, [markets]);

  const filteredMarkets = uniqueMarkets.filter((market) =>
    market.name.toLowerCase().includes(search.toLowerCase()) ||
    market.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Markets</h1>
          <p className="mt-2 text-gray-500 max-w-2xl">
            Browse the available markets, then click through to see the market details, what is selling, and current prices.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <label htmlFor="market-search" className="sr-only">Search markets</label>
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2" />
            <input
              id="market-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by market or location"
              className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-sm text-gray-500">Loading market list…</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {error}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredMarkets.length > 0 ? filteredMarkets.map((market) => {
            const stats = marketStats.get(market.$id);
            return (
              <Link
                to={`/buyer/market/${market.$id}`}
                key={market.$id}
                className="group block overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-40 overflow-hidden bg-gray-100">
                  <img
                    src={getMarketImage(market.name, market.image)}
                    alt={market.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-4 text-white">
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-200">Market</p>
                    <h2 className="text-xl font-semibold leading-tight">{market.name}</h2>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(market.specialties || ['General', 'Food']).slice(0, 2).map(spec => (
                        <span key={spec} className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-[10px] uppercase font-bold tracking-wider">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-indigo-500" />
                        {market.location}
                      </p>
                    </div>
                    <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                      {stats?.count ?? 0} item{stats?.count === 1 ? '' : 's'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <p>{stats?.lastUpdated ? `Updated ${new Date(stats.lastUpdated).toLocaleDateString()}` : 'No recent prices'}</p>
                    <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
                      View details <ArrowRightIcon className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          }) : (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
              No markets found for your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
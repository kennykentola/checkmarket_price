import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Market, Commodity } from '@/types';
import { BuildingStorefrontIcon, MapPinIcon } from '@heroicons/react/24/outline';

export const SubmitPrice = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  
  const [formData, setFormData] = useState({
    marketId: '',
    commodityId: '',
    price: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    Promise.all([api.getMarkets(), api.getCommodities()]).then(([m, c]) => {
      setMarkets(m);
      setCommodities(c);
      
      // Check for market query parameter
      const marketParam = searchParams.get('market');
      if (marketParam && m.find(mkt => mkt.$id === marketParam)) {
        setFormData(prev => ({ ...prev, marketId: marketParam }));
      } else if (m.length) {
        setFormData(prev => ({ ...prev, marketId: m[0].$id }));
      }
      
      if (c.length) setFormData(prev => ({ ...prev, commodityId: c[0].$id }));
    });

    // Listen for data updates from admin changes
    const handleDataUpdate = (event: CustomEvent) => {
      if (event.detail?.type === 'market' || event.detail?.type === 'commodity') {
        Promise.all([api.getMarkets(), api.getCommodities()]).then(([m, c]) => {
          setMarkets(m);
          setCommodities(c);
          // Update selected values if needed
          if (m.length && !m.find(mkt => mkt.$id === formData.marketId)) {
            setFormData(prev => ({ ...prev, marketId: m[0].$id }));
          }
          if (c.length && !c.find(cmd => cmd.$id === formData.commodityId)) {
            setFormData(prev => ({ ...prev, commodityId: c[0].$id }));
          }
        });
      }
    };

    window.addEventListener('dataUpdated', handleDataUpdate as EventListener);

    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate as EventListener);
    };
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setStatus('submitting');

    try {
      await api.submitPrice({
        marketId: formData.marketId,
        commodityId: formData.commodityId,
        traderId: user.$id,
        price: parseFloat(formData.price)
      });
      setStatus('success');
      setFormData(prev => ({ ...prev, price: '' }));
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submit Daily Price</h1>
        <p className="mt-1 text-sm text-gray-500">Update current prices for your local market.</p>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {status === 'success' && (
            <div className="bg-green-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Price submitted successfully!</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="market" className="block text-sm font-medium text-gray-700">Market</label>
              <select
                id="market"
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={formData.marketId}
                onChange={e => setFormData({ ...formData, marketId: e.target.value })}
              >
                {markets.map(m => (
                  <option key={m.$id} value={m.$id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="commodity" className="block text-sm font-medium text-gray-700">Commodity</label>
              <select
                id="commodity"
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={formData.commodityId}
                onChange={e => setFormData({ ...formData, commodityId: e.target.value })}
              >
                {commodities.map(c => (
                  <option key={c.$id} value={c.$id}>{c.name} ({c.unit})</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price per Unit</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₦</span>
                </div>
                <input
                  type="number"
                  name="price"
                  id="price"
                  step="0.01"
                  required
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit Price'}
            </button>
          </div>
        </form>
      </div>

      {/* Market List for Quick Navigation */}
      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <BuildingStorefrontIcon className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Market Navigation</h3>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {markets.length}
            </span>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {markets.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500">No markets available.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {markets.map((market) => (
                <li key={market.$id} className="px-4 py-3 hover:bg-gray-50">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, marketId: market.$id }))}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{market.name}</span>
                      <span className="ml-2 text-xs text-gray-500">({market.location})</span>
                    </div>
                    {formData.marketId === market.$id && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Selected
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

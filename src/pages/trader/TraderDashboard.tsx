import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '@/context/AuthContext';
import { PriceDataExpanded, Market, Commodity, Category } from '@/types';
import {
  CurrencyDollarIcon,
  ArrowRightIcon,
  TagIcon,
  BuildingStorefrontIcon,
  PlusIcon,
  MapPinIcon,
  TrashIcon,
  PhotoIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export const TraderDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<PriceDataExpanded[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [marketName, setMarketName] = useState('');
  const [marketLoc, setMarketLoc] = useState('');
  const [comName, setComName] = useState('');
  const [comUnit, setComUnit] = useState('');
  const [comCategory, setComCategory] = useState('');
  const [comImage, setComImage] = useState<string>('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const loadData = async () => {
    if (user) {
      const [historyData, m, c, cats] = await Promise.all([
        api.getTraderHistory(user.$id),
        api.getMarkets(),
        api.getCommodities(),
        api.getCategories()
      ]);
      setHistory(historyData);
      setMarkets(m);
      setCommodities(c);
      setCategories(cats);

      // Set default category for form
      if (cats.length > 0 && !comCategory) {
        setComCategory(cats[0].name);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for data updates
    const handleDataUpdate = (event: CustomEvent) => {
      if (event.detail?.type === 'price' || event.detail?.type === 'market' || event.detail?.type === 'commodity') {
        loadData();
      }
    };

    window.addEventListener('dataUpdated', handleDataUpdate as EventListener);

    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate as EventListener);
    };
  }, [user]);

  const uniqueCommodities = useMemo(() => {
    return new Set(history.map(h => h.commodityId)).size;
  }, [history]);

  const uniqueMarkets = useMemo(() => {
    return new Set(history.map(h => h.marketId)).size;
  }, [history]);

  // Recent 5 items
  const recentHistory = history.slice(0, 5);

  const showNotification = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleAddMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketName || !marketLoc) return;

    try {
      await api.addMarket({ name: marketName, location: marketLoc });
      showNotification(`Market "${marketName}" added successfully`, 'success');
      setMarketName('');
      setMarketLoc('');
      loadData();
      // Dispatch event to refresh other pages
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'market' } }));
    } catch (error) {
      showNotification('Failed to add market', 'error');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setComImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCommodity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comName || !comUnit || !comCategory) {
      showNotification('Please fill all fields', 'error');
      return;
    }

    if (comUnit.trim().length < 2) {
      showNotification('Unit must be at least 2 characters long', 'error');
      return;
    }

    try {
      await api.addCommodity({
        name: comName,
        unit: comUnit,
        category: comCategory,
        image: comImage
      });
      showNotification(`Commodity "${comName}" added successfully`, 'success');
      setComName('');
      setComUnit('');
      setComImage('');
      loadData();
      // Dispatch event to refresh other pages
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'commodity' } }));
    } catch (error) {
      showNotification('Failed to add commodity', 'error');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.name}. Here is your activity overview.</p>
        </div>
        <Link
          to="/trader/submit"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <CurrencyDollarIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Submit New Price
        </Link>
      </div>

      {/* Notification */}
      {msg && (
        <div className={`px-4 py-2 rounded-md text-sm font-medium ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} transition-all`}>
          {msg.text}
        </div>
      )}
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 border-l-4 border-indigo-500">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{history.length}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 border-l-4 border-green-500">
            <dt className="text-sm font-medium text-gray-500 truncate">Products Traded</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{uniqueCommodities}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 border-l-4 border-blue-500">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Markets</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{uniqueMarkets}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 border-l-4 border-purple-500">
            <dt className="text-sm font-medium text-gray-500 truncate">Latest Activity</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900 truncate">
                {history.length > 0 ? new Date(history[0].dateSubmitted).toLocaleDateString() : 'N/A'}
            </dd>
        </div>
      </div>

      {/* Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Market */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <BuildingStorefrontIcon className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Add New Market</h3>
          </div>
          <form onSubmit={handleAddMarket} className="space-y-4">
            <input
              type="text"
              placeholder="Market Name"
              required
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={marketName}
              onChange={(e) => setMarketName(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Location"
                required
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={marketLoc}
                onChange={(e) => setMarketLoc(e.target.value)}
              />
              <button
                type="submit"
                className="inline-flex justify-center items-center p-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Add Commodity */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <TagIcon className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Add New Commodity</h3>
          </div>
          <form onSubmit={handleAddCommodity} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Name"
                required
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-green-500 focus:border-green-500"
                value={comName}
                onChange={(e) => setComName(e.target.value)}
              />
              <select
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-green-500 focus:border-green-500"
                value={comCategory}
                onChange={(e) => setComCategory(e.target.value)}
              >
                {categories.length === 0 && <option value="">No Categories</option>}
                {categories.map(cat => (
                  <option key={cat.$id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              placeholder="Unit (min 2 chars)"
              required
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-green-500 focus:border-green-500"
              value={comUnit}
              onChange={(e) => setComUnit(e.target.value)}
            />
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 overflow-hidden">
                <PhotoIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                <span className="truncate">{comImage ? 'Change' : 'Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
              >
                Add
              </button>
            </div>
            {comImage && (
              <div className="h-12 w-full relative rounded overflow-hidden border border-gray-300">
                <img src={comImage} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Market List Section */}
      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <BuildingStorefrontIcon className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">All Markets</h3>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {markets.length}
            </span>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {markets.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500">No markets defined yet.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {markets.map((market) => (
                <li key={market.$id} className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{market.name}</span>
                    <span className="ml-2 text-xs text-gray-500">({market.location})</span>
                  </div>
                  <Link
                    to={`/trader/submit?market=${market.$id}`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    Submit Price
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
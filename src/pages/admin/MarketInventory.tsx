import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Market, PriceDataExpanded } from '@/types';
import { getMarketImage } from '../../utils/imageHelpers';
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

export const MarketInventory = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const [market, setMarket] = useState<Market | null>(null);
  const [prices, setPrices] = useState<PriceDataExpanded[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (marketId) {
      loadData();
    }
  }, [marketId]);

  const loadData = async () => {
    if (!marketId) return;

    try {
      const [marketData, allPrices] = await Promise.all([
        api.getMarketById(marketId),
        api.getLatestPrices()
      ]);

      setMarket(marketData || null);
      setImageUrl(marketData?.image || '');

      // Filter prices for this market
      const marketPrices = allPrices.filter(p => p.marketId === marketId);
      setPrices(marketPrices);
    } catch (error) {
      console.error('Failed to load market inventory:', error);
      showNotification('Failed to load market inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleEditPrice = (priceId: string, currentPrice: number) => {
    setEditingPrice(priceId);
    setEditValue(currentPrice.toString());
  };

  const handleMarketImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1000000) {
      showNotification('Image file is too large. Please use a file under 1MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageUrl(result);
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveImage = async () => {
    if (!market || !imageUrl?.trim()) {
      showNotification('Please enter a valid image URL or upload a file', 'error');
      return;
    }

    setIsSavingImage(true);
    try {
      const cleanImageUrl = imageUrl.trim();
      const updatedMarket = await api.updateMarket(market.$id, { image: cleanImageUrl });

      setMarket(updatedMarket);
      setImageUrl(updatedMarket.image || '');
      setImageFileName('');

      showNotification('Market image updated successfully', 'success');
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'market' } }));
    } catch (error) {
      console.error('Failed to update market image', error);
      showNotification('Failed to update market image', 'error');
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleSavePrice = async (priceId: string) => {
    const newPrice = parseFloat(editValue);
    if (isNaN(newPrice) || newPrice <= 0) {
      showNotification('Please enter a valid price', 'error');
      return;
    }

    try {
      await api.updatePrice(priceId, newPrice);
      showNotification('Price updated successfully', 'success');
      setEditingPrice(null);
      loadData(); // Refresh data
      // Dispatch event to refresh buyer pages
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'price' } }));
    } catch (error) {
      showNotification('Failed to update price', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingPrice(null);
    setEditValue('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="text-center py-12">
        <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Market not found</h3>
        <p className="mt-1 text-sm text-gray-500">The requested market could not be found.</p>
        <div className="mt-6">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="-ml-0.5 mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{market.name} Inventory</h1>
            <p className="mt-1 text-sm text-gray-500 flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {market.location}
            </p>
          </div>
        </div>
        {msg && (
          <div className={`px-4 py-2 rounded-md text-sm font-medium ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} transition-all`}>
            {msg.text}
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-3xl border border-gray-200 overflow-hidden">
        <div className="p-6 lg:flex lg:items-center lg:gap-6">
          <div className="relative h-48 w-full lg:w-72 overflow-hidden rounded-3xl border border-gray-200 bg-gray-100">
            <img
              src={getMarketImage(market.name, market.image)}
              alt={market.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-6 lg:mt-0 flex-1">
            <div className="flex items-center gap-3 text-sm font-semibold text-gray-900 mb-3">
              <PhotoIcon className="h-5 w-5 text-indigo-600" />
              <span>Market Image</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Update the image used across buyer pages and market details for this market.
            </p>
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageFileName('');
                  }}
                  placeholder="Paste a market image URL"
                  className="block w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleSaveImage}
                  disabled={isSavingImage}
                  className={`inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 ${isSavingImage ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSavingImage ? 'Saving...' : 'Save Image'}
                </button>
              </div>
              <div className="rounded-xl border border-dashed border-gray-300 p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload image file</label>
                <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <PhotoIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                  Choose file
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMarketImageFileChange}
                    className="hidden"
                  />
                </label>
                {imageFileName && (
                  <p className="mt-2 text-sm text-gray-500">Selected file: {imageFileName}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Current Prices</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage commodity prices for this market. Click the edit icon to update prices.
          </p>
        </div>

        <ul className="divide-y divide-gray-200">
          {prices.length === 0 ? (
            <li className="px-4 py-10 text-center text-gray-500">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No prices available</h3>
              <p className="mt-1 text-sm text-gray-500">No commodity prices have been set for this market yet.</p>
            </li>
          ) : (
            prices.map((price) => (
              <li key={price.$id} className="px-4 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{price.commodityName}</h4>
                        <p className="text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">{price.commodityCategory}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          {price.commodityUnit}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {editingPrice === price.$id ? (
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₦</span>
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="block w-24 pl-8 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <button
                          onClick={() => handleSavePrice(price.$id)}
                          className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50"
                          title="Save"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                          title="Cancel"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-semibold text-gray-900">
                          ₦{price.price.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleEditPrice(price.$id, price.price)}
                          className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50"
                          title="Edit Price"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

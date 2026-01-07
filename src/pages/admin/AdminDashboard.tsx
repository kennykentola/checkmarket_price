import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Market, Commodity, Category } from '@/types';
import {
  BuildingStorefrontIcon,
  TagIcon,
  PlusIcon,
  MapPinIcon,
  TrashIcon,
  PhotoIcon,
  SwatchIcon,
  BarsArrowUpIcon,
  BarsArrowDownIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export const AdminDashboard = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{
    markets: 'asc' | 'desc';
    categories: 'asc' | 'desc';
    commodities: 'asc' | 'desc';
  }>({
    markets: 'asc',
    categories: 'asc',
    commodities: 'asc'
  });

  // Commodity Sorting State
  const [commoditySortField, setCommoditySortField] = useState<'name' | 'category' | 'unit'>('name');

  // Market Filtering & Sorting State
  const [marketSortField, setMarketSortField] = useState<'name' | 'location'>('name');
  const [marketLocationFilter, setMarketLocationFilter] = useState<string>('');

  // Market Form State
  const [marketName, setMarketName] = useState('');
  const [marketLoc, setMarketLoc] = useState('');

  // Category Form State
  const [categoryName, setCategoryName] = useState('');

  // Commodity Form State
  const [comName, setComName] = useState('');
  const [comUnit, setComUnit] = useState('');
  const [comCategory, setComCategory] = useState('');
  const [comImage, setComImage] = useState<string>(''); // Base64 or URL

  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const loadData = async () => {
    try {
      const [m, c, cats] = await Promise.all([
        api.getMarkets(), 
        api.getCommodities(),
        api.getCategories()
      ]);
      setMarkets(m);
      setCommodities(c);
      setCategories(cats);
      
      // Set default category for form
      if (cats.length > 0 && !comCategory) {
        setComCategory(cats[0].name);
      }
    } catch (error) {
      console.error("Failed to load data", error);
      showNotification('Failed to load data. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const toggleSort = (key: 'markets' | 'categories' | 'commodities') => {
    setSortConfig(prev => ({
      ...prev,
      [key]: prev[key] === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedData = <T extends { name: string }>(data: T[], key: 'markets' | 'categories' | 'commodities'): T[] => {
    return [...data].sort((a, b) => {
      return sortConfig[key] === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    });
  };

  // --- MARKET HANDLERS ---
  const handleAddMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketName || !marketLoc) return;

    try {
      await api.addMarket({ name: marketName, location: marketLoc });
      showNotification(`Market "${marketName}" added successfully`, 'success');
      setMarketName('');
      setMarketLoc('');
      loadData();
      // Dispatch event to refresh buyer pages
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'market' } }));
    } catch (error) {
      showNotification('Failed to add market', 'error');
    }
  };

  const handleDeleteMarket = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this market?')) return;
    try {
      await api.deleteMarket(id);
      showNotification('Market deleted', 'success');
      loadData();
    } catch (error) {
      showNotification('Failed to delete market', 'error');
    }
  };

  // --- CATEGORY HANDLERS ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;

    try {
      await api.addCategory(categoryName);
      showNotification(`Category "${categoryName}" added successfully`, 'success');
      setCategoryName('');
      loadData();
    } catch (error) {
      showNotification('Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.deleteCategory(id);
      showNotification('Category deleted', 'success');
      loadData();
    } catch (error) {
      showNotification('Failed to delete category', 'error');
    }
  };

  // --- COMMODITY HANDLERS ---
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

    // VALIDATION CHANGE: Check Unit Length
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
      // Dispatch event to refresh buyer/trader pages
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'commodity' } }));
    } catch (error) {
      showNotification('Failed to add commodity', 'error');
    }
  };

  const handleDeleteCommodity = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this commodity?')) return;
    try {
      await api.deleteCommodity(id);
      showNotification('Commodity deleted', 'success');
      loadData();
    } catch (error) {
      showNotification('Failed to delete commodity', 'error');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  // Market List Calculation
  const uniqueLocations = Array.from(new Set(markets.map(m => m.location))).sort();

  const sortedMarkets = (() => {
    let data = [...markets];
    
    // Filter
    if (marketLocationFilter) {
      data = data.filter(m => m.location === marketLocationFilter);
    }

    // Sort
    data.sort((a, b) => {
      const fieldA = a[marketSortField].toLowerCase();
      const fieldB = b[marketSortField].toLowerCase();
      
      if (sortConfig.markets === 'asc') {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });
    
    return data;
  })();

  const sortedCategories = getSortedData<Category>(categories, 'categories');

  const sortedCommodities = (() => {
    return [...commodities].sort((a, b) => {
      const fieldA = a[commoditySortField].toLowerCase();
      const fieldB = b[commoditySortField].toLowerCase();

      if (sortConfig.commodities === 'asc') {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });
  })();

  // Commodity List Calculation
  const commodityStats = useMemo(() => {
    const byCategory = commodities.reduce((acc, com) => {
      acc[com.category] = (acc[com.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      total: commodities.length,
      byCategory,
      withImage: commodities.filter(c => c.image).length
    };
  }, [commodities]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
          <p className="mt-1 text-sm text-gray-500">Manage global settings, markets, categories, and commodities.</p>
        </div>
        {msg && (
          <div className={`px-4 py-2 rounded-md text-sm font-medium ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} transition-all`}>
            {msg.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- MARKETS SECTION --- */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 h-full flex flex-col">
            <div className="px-4 py-4 sm:px-6 bg-indigo-50 border-b border-indigo-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                        <BuildingStorefrontIcon className="h-5 w-5 text-indigo-600 mr-2" />
                        <h3 className="text-lg leading-6 font-medium text-indigo-900">Markets</h3>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {markets.length}
                    </span>
                </div>
                
                {/* Filters & Sorting */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <select 
                            value={marketLocationFilter} 
                            onChange={(e) => setMarketLocationFilter(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs py-1.5 pl-2 pr-6"
                        >
                            <option value="">All Locations</option>
                            {uniqueLocations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex rounded-md shadow-sm">
                         <select
                            value={marketSortField}
                            onChange={(e) => setMarketSortField(e.target.value as 'name' | 'location')}
                            className="rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs py-1.5 pl-2 pr-6 border-r-0"
                            title="Sort By"
                        >
                            <option value="name">Name</option>
                            <option value="location">Location</option>
                        </select>
                         <button 
                            onClick={() => toggleSort('markets')}
                            className="inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 text-gray-500 hover:bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500"
                            title={sortConfig.markets === 'asc' ? "Ascending" : "Descending"}
                        >
                            {sortConfig.markets === 'asc' ? <BarsArrowUpIcon className="h-4 w-4"/> : <BarsArrowDownIcon className="h-4 w-4"/>}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Add Market Form */}
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Add New Market</h4>
              <form onSubmit={handleAddMarket} className="space-y-3">
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

            {/* Markets List */}
            <ul className="divide-y divide-gray-200 overflow-y-auto flex-1 max-h-[400px]">
              {sortedMarkets.map(market => (
                <li key={market.$id} className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between group">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{market.name}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      {market.location}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Link
                      to={`/admin/market-inventory/${market.$id}`}
                      className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                      title="Manage Inventory"
                    >
                      <CogIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteMarket(market.$id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                      title="Delete Market"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
              {sortedMarkets.length === 0 && (
                <li className="px-4 py-10 text-center text-gray-500 flex flex-col items-center justify-center">
                  <BuildingStorefrontIcon className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-xs">No markets found.</p>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* --- CATEGORIES SECTION --- */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 h-full flex flex-col">
            <div className="px-4 py-5 sm:px-6 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center">
                <SwatchIcon className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-purple-900">Categories</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {categories.length}
                </span>
                 <button 
                  onClick={() => toggleSort('categories')}
                  className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-100"
                  title="Sort A-Z / Z-A"
                >
                  {sortConfig.categories === 'asc' ? <BarsArrowUpIcon className="h-4 w-4"/> : <BarsArrowDownIcon className="h-4 w-4"/>}
                </button>
              </div>
            </div>

            {/* Add Category Form */}
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Add New Category</h4>
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Category Name"
                  required 
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                  value={categoryName} 
                  onChange={(e) => setCategoryName(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="inline-flex justify-center items-center p-2 border border-transparent rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Categories List */}
            <ul className="divide-y divide-gray-200 overflow-y-auto flex-1 max-h-[400px]">
              {sortedCategories.map(cat => (
                <li key={cat.$id} className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between group">
                  <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                  <button 
                    onClick={() => handleDeleteCategory(cat.$id)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                    title="Delete Category"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="px-4 py-10 text-center text-gray-500 flex flex-col items-center justify-center">
                  <SwatchIcon className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-xs">No categories defined.</p>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* --- COMMODITIES SECTION --- */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 h-full flex flex-col">
            <div className="px-4 py-5 sm:px-6 bg-green-50 border-b border-green-100 flex items-center justify-between">
              <div className="flex items-center">
                <TagIcon className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-green-900">Commodities</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {commodities.length}
                </span>
                <div className="flex rounded-md shadow-sm">
                  <select
                    value={commoditySortField}
                    onChange={(e) => setCommoditySortField(e.target.value as 'name' | 'category' | 'unit')}
                    className="rounded-l-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-xs py-1.5 pl-2 pr-6 border-r-0"
                    title="Sort By"
                  >
                    <option value="name">Name</option>
                    <option value="category">Category</option>
                    <option value="unit">Unit</option>
                  </select>
                  <button
                    onClick={() => toggleSort('commodities')}
                    className="inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 text-gray-500 hover:bg-gray-50 focus:border-green-500 focus:ring-green-500"
                    title={sortConfig.commodities === 'asc' ? "Ascending" : "Descending"}
                  >
                    {sortConfig.commodities === 'asc' ? <BarsArrowUpIcon className="h-4 w-4"/> : <BarsArrowDownIcon className="h-4 w-4"/>}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Add Commodity Form */}
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Add New Commodity</h4>
              <form onSubmit={handleAddCommodity} className="space-y-3">
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
                
                <div className="flex flex-col gap-2">
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
                </div>
              </form>
            </div>

            {/* Commodities List */}
            <ul className="divide-y divide-gray-200 overflow-y-auto flex-1 max-h-[400px]">
              {sortedCommodities.map(com => (
                <li key={com.$id} className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between group">
                  <div className="flex items-center overflow-hidden">
                    {/* Small preview of image if exists */}
                    {com.image ? (
                        <img src={com.image} alt={com.name} className="h-8 w-8 rounded-full object-cover mr-3 border border-gray-200 flex-shrink-0" />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3 text-green-600 flex-shrink-0">
                             <TagIcon className="h-4 w-4" />
                        </div>
                    )}
                    <div className="truncate">
                        <p className="text-sm font-medium text-gray-900 truncate">{com.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{com.category}</span>
                        <span className="mx-1 text-gray-300">|</span>
                        {com.unit}
                        </p>
                    </div>
                  </div>
                   <button 
                      onClick={() => handleDeleteCommodity(com.$id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors ml-2"
                      title="Delete Commodity"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                </li>
              ))}
              {commodities.length === 0 && (
                <li className="px-4 py-10 text-center text-gray-500 flex flex-col items-center justify-center">
                  <TagIcon className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-xs">No commodities defined.</p>
                </li>
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Market, Commodity, Category } from '@/types';
import { ExternalDataSync } from '../../components/ExternalDataSync';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { getItemImage, getMarketImage } from '../../utils/imageHelpers';
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
  CogIcon,
  PencilIcon,
  UsersIcon,
  ClockIcon,
  ArrowPathIcon,
  ClipboardDocumentCheckIcon
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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedEditFile, setSelectedEditFile] = useState<File | null>(null);
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

  // Edit Image State
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<string>('');

  const [marketSearch, setMarketSearch] = useState('');
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);

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

  const handleUpdateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMarket) return;

    try {
      await api.updateMarket(editingMarket.$id, {
        name: editingMarket.name,
        location: editingMarket.location,
        description: editingMarket.description,
        specialties: editingMarket.specialties,
        operatingHours: editingMarket.operatingHours,
        established: editingMarket.established
      });
      showNotification(`Market "${editingMarket.name}" updated successfully`, 'success');
      setEditingMarket(null);
      loadData();
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'market' } }));
    } catch (error) {
      showNotification('Failed to update market', 'error');
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
      setSelectedFile(file);
      // Create preview
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
      setIsUploading(true);
      let cloudinaryId = '';
      
      if (selectedFile) {
        cloudinaryId = await uploadToCloudinary(selectedFile);
      }

      await api.addCommodity({
        name: comName,
        unit: comUnit,
        category: comCategory,
        image: cloudinaryId // SAVE THE CLOUDINARY ID, NOT BASE64
      });
      
      showNotification(`Commodity "${comName}" added successfully`, 'success');
      setComName('');
      setComUnit('');
      setComImage('');
      setSelectedFile(null);
      loadData();
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'commodity' } }));
    } catch (error) {
      console.error(error);
      showNotification('Failed to add commodity', 'error');
    } finally {
      setIsUploading(false);
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

  const handleEditImage = (commodityId: string) => {
    setEditingImageId(commodityId);
    setNewImage('');
  };

  const handleImageEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedEditFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (!editingImageId || !selectedEditFile) return;
    try {
      setIsUploading(true);
      const cloudinaryId = await uploadToCloudinary(selectedEditFile);
      
      await api.updateCommodity(editingImageId, { image: cloudinaryId });
      showNotification('Commodity image updated successfully', 'success');
      setEditingImageId(null);
      setNewImage('');
      setSelectedEditFile(null);
      loadData();
    } catch (error) {
      showNotification('Failed to update commodity image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingImageId(null);
    setNewImage('');
  };

  // Commodity List Calculation (moved up to avoid conditional hook)
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

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  // Market List Calculation (deduplicated by name)
  const uniqueLocations = Array.from(new Set(markets.map(m => m.location))).sort();

  const sortedMarkets = (() => {
    // Deduplicate markets by name (keep first occurrence)
    const seen = new Set<string>();
    let data = markets.filter(m => {
      if (seen.has(m.name.toLowerCase())) {
        return false;
      }
      seen.add(m.name.toLowerCase());
      return true;
    });
    
    // Filter by Location
    if (marketLocationFilter) {
      data = data.filter(m => m.location === marketLocationFilter);
    }

    // Filter by Search Query
    if (marketSearch) {
      const query = marketSearch.toLowerCase();
      data = data.filter(m => 
        m.name.toLowerCase().includes(query) || 
        m.location.toLowerCase().includes(query)
      );
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
  // (moved to top to avoid conditional hook)

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

      {/* Navigation Links */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-4 py-4 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Admin Tools</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/users"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              User Management
            </Link>
            <Link
              to="/admin/activity"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              Activity Log
            </Link>
            <Link
              to="/admin/pending"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2" />
              Pending Prices
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- EXTERNAL DATA SYNC SECTION --- */}
        <div className="lg:col-span-3">
          <ExternalDataSync />
        </div>
        
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
                <div className="space-y-2">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search markets..."
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs py-1.5 pl-2 pr-2"
                            value={marketSearch}
                            onChange={(e) => setMarketSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <label htmlFor="admin-market-location-filter" className="sr-only">Filter by Location</label>
                            <select 
                                id="admin-market-location-filter"
                                value={marketLocationFilter} 
                                onChange={(e) => setMarketLocationFilter(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs py-1.5 pl-2 pr-6"
                                title="Filter by Location"
                            >
                                <option value="">All Locations</option>
                                {uniqueLocations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex rounded-md shadow-sm">
                            <label htmlFor="admin-market-sort-field" className="sr-only">Sort Markets By</label>
                            <select
                                id="admin-market-sort-field"
                                value={marketSortField}
                                onChange={(e) => setMarketSortField(e.target.value as 'name' | 'location')}
                                className="rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs py-1.5 pl-2 pr-6 border-r-0"
                                title="Sort Field"
                            >
                                <option value="name">Name</option>
                                <option value="location">Location</option>
                            </select>
                            <button 
                                onClick={() => toggleSort('markets')}
                                className="inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 text-gray-500 hover:bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500"
                                title={sortConfig.markets === 'asc' ? "Sort Ascending" : "Sort Descending"}
                                aria-label={sortConfig.markets === 'asc' ? "Sort markets ascending" : "Sort markets descending"}
                            >
                                {sortConfig.markets === 'asc' ? <BarsArrowUpIcon className="h-4 w-4"/> : <BarsArrowDownIcon className="h-4 w-4"/>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Add Market Form */}
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Add New Market</h4>
              <form onSubmit={handleAddMarket} className="space-y-3">
                 <label htmlFor="new-market-name" className="sr-only">Market Name</label>
                 <input 
                  id="new-market-name"
                  type="text" 
                  placeholder="Market Name"
                  required 
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={marketName} 
                  onChange={(e) => setMarketName(e.target.value)}
                />
                <div className="flex gap-2">
                  <label htmlFor="new-market-location" className="sr-only">Location</label>
                  <input 
                    id="new-market-location"
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
                    title="Add Market"
                    aria-label="Add new market"
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
                    <button
                      onClick={() => setEditingMarket(market)}
                      className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                      title="Edit Market Details"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
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
                  title={sortConfig.categories === 'asc' ? "Sort Categories Ascending" : "Sort Categories Descending"}
                  aria-label={sortConfig.categories === 'asc' ? "Sort categories ascending" : "Sort categories descending"}
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
                  aria-label="Add new category"
                  title="Add Category"
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
                  <label htmlFor="admin-commodity-sort-field" className="sr-only">Sort Commodities By</label>
                  <select
                    id="admin-commodity-sort-field"
                    value={commoditySortField}
                    onChange={(e) => setCommoditySortField(e.target.value as 'name' | 'category' | 'unit')}
                    className="rounded-l-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-xs py-1.5 pl-2 pr-6 border-r-0"
                    title="Sort Field"
                  >
                    <option value="name">Name</option>
                    <option value="category">Category</option>
                    <option value="unit">Unit</option>
                  </select>
                  <button
                    onClick={() => toggleSort('commodities')}
                    className="inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 text-gray-500 hover:bg-gray-50 focus:border-green-500 focus:ring-green-500"
                    title={sortConfig.commodities === 'asc' ? "Sort Commodities Ascending" : "Sort Commodities Descending"}
                    aria-label={sortConfig.commodities === 'asc' ? "Sort commodities ascending" : "Sort commodities descending"}
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
                   <label htmlFor="commodity-category-select" className="sr-only">Commodity Category</label>
                   <select
                    id="commodity-category-select"
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-green-500 focus:border-green-500"
                    value={comCategory}
                    onChange={(e) => setComCategory(e.target.value)}
                    title="Select Commodity Category"
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
                      disabled={isUploading}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isUploading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} focus:outline-none`}
                      title={isUploading ? "Uploading to Cloudinary..." : "Add Commodity"}
                      aria-label={isUploading ? "Uploading to Cloudinary" : "Add new commodity"}
                    >
                      {isUploading ? (
                        <ArrowPathIcon className="h-5 w-5 animate-spin mr-1" />
                      ) : (
                        'Add'
                      )}
                    </button>
                  </div>
                  
                  {isUploading && (
                    <p className="text-[10px] text-green-600 font-medium animate-pulse">Uploading photo to Cloudinary CDN...</p>
                  )}
                  
                  {comImage && !isUploading && (
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
                  {editingImageId === com.$id ? (
                    // Edit Image Mode
                    <div className="flex-1 flex items-center space-x-3">
                      <img src={getItemImage(com.name, com.category, newImage || com.image)} alt={com.name} className="h-10 w-10 rounded-full object-cover border-2 border-indigo-200 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{com.name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <input
                            id={`edit-commodity-image-${com.$id}`}
                            type="file"
                            accept="image/*"
                            onChange={handleImageEditChange}
                            className="text-[10px] border border-gray-300 rounded bg-white px-2 py-1 max-w-[120px] sm:max-w-xs"
                            title="Choose new image"
                            aria-label="Upload new commodity image"
                          />
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleSaveImage}
                              disabled={!selectedEditFile || isUploading}
                              className={`text-xs px-3 py-1 rounded shadow-sm font-bold text-white transition-all ${(!selectedEditFile || isUploading) ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}
                            >
                              {isUploading ? (
                                <ArrowPathIcon className="h-3 w-3 animate-spin" />
                              ) : (
                                'Save'
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isUploading}
                              className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded border border-gray-300 hover:bg-gray-200 transition-all active:scale-95"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                        {isUploading && <p className="text-[10px] text-indigo-600 mt-1 animate-pulse font-medium">Updating photo...</p>}
                      </div>
                    </div>
                  ) : (
                    // Normal View
                    <div className="flex items-center overflow-hidden flex-1">
                      {/* Small preview of image if exists */}
                      <img 
                        src={getItemImage(com.name, com.category, com.image)} 
                        alt={com.name} 
                        className="h-8 w-8 rounded-full object-cover mr-3 border border-gray-200 flex-shrink-0" 
                      />
                      <div className="truncate">
                          <p className="text-sm font-medium text-gray-900 truncate">{com.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{com.category}</span>
                          <span className="mx-1 text-gray-300">|</span>
                          {com.unit}
                          </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    {editingImageId !== com.$id && (
                      <button
                        onClick={() => handleEditImage(com.$id)}
                        className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Edit Image"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteCommodity(com.$id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                      title="Delete Commodity"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
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

      {/* --- MARKET EDIT MODAL --- */}
      {editingMarket && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setEditingMarket(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleUpdateMarket}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-xl leading-6 font-bold text-gray-900 mb-6" id="modal-title">
                        Edit Market: {editingMarket.name}
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="edit-market-name" className="block text-sm font-medium text-gray-700 mb-1">Market Name</label>
                            <input 
                              id="edit-market-name"
                              type="text" 
                              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                              value={editingMarket.name}
                              onChange={(e) => setEditingMarket({...editingMarket, name: e.target.value})}
                              placeholder="Market Name"
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-market-location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input 
                              id="edit-market-location"
                              type="text" 
                              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                              value={editingMarket.location}
                              onChange={(e) => setEditingMarket({...editingMarket, location: e.target.value})}
                              placeholder="Location"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                          <textarea 
                            rows={4}
                            className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Tell users what makes this market special..."
                            value={editingMarket.description || ''}
                            onChange={(e) => setEditingMarket({...editingMarket, description: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialties (comma separated)</label>
                            <input 
                              type="text" 
                              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="e.g. Fresh Produce, Textiles, Electronics"
                              value={(editingMarket.specialties || []).join(', ')}
                              onChange={(e) => setEditingMarket({...editingMarket, specialties: e.target.value.split(',').map(s => s.trim())})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
                            <input 
                              type="text" 
                              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="e.g. 7:00 AM - 6:00 PM"
                              value={editingMarket.operatingHours || ''}
                              onChange={(e) => setEditingMarket({...editingMarket, operatingHours: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                          <input 
                            type="text" 
                            className="block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g. 1985"
                            value={editingMarket.established || ''}
                            onChange={(e) => setEditingMarket({...editingMarket, established: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button 
                    type="submit" 
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingMarket(null)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

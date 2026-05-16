import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PriceDataExpanded } from '@/types';
import { getItemImage } from '../utils/imageHelpers';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
  ArrowLeftIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

export const ProductDetail = () => {
  const { commodityId } = useParams<{ commodityId: string }>();
  const [product, setProduct] = useState<PriceDataExpanded | null>(null);
  const [allPrices, setAllPrices] = useState<PriceDataExpanded[]>([]);
  const [relatedItems, setRelatedItems] = useState<PriceDataExpanded[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [imageZoomed, setImageZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'markets' | 'reviews'>('description');

  useEffect(() => {
    const loadProduct = async () => {
      if (!commodityId) return;
      try {
        setLoading(true);
        
        // 1. Fetch commodity metadata directly
        const commodity = await api.getCommodity(commodityId);
        
        // 2. Fetch price entries using the new service method
        const priceEntries = await api.getCommodityPrices(commodityId);
        
        // 3. Map to PriceDataExpanded format
        const markets = await api.getMarkets();
        const expandedPrices = priceEntries.map(p => {
          const m = markets.find(mark => mark.$id === p.marketId);
          return {
            ...p,
            marketName: m?.name || 'Unknown Market',
            commodityName: commodity.name,
            commodityUnit: commodity.unit,
            commodityCategory: commodity.category,
            commodityImage: commodity.image
          };
        });

        if (expandedPrices.length > 0) {
          setProduct(expandedPrices[0]);
          setAllPrices(expandedPrices);
          
          // Fetch related items (from same category)
          const allCommodities = await api.getCommodities();
          const related = allCommodities
            .filter(c => c.category === commodity.category && c.$id !== commodityId)
            .slice(0, 4)
            .map(c => ({
              commodityId: c.$id,
              commodityName: c.name,
              commodityCategory: c.category,
              commodityImage: c.image,
              price: 0, 
              marketName: 'Various Markets'
            } as any));
          setRelatedItems(related);
        } else {
          // If no prices yet, still show the commodity info
          setProduct({
            commodityId: commodity.$id,
            commodityName: commodity.name,
            commodityCategory: commodity.category,
            commodityImage: commodity.image,
            commodityUnit: commodity.unit,
            price: 0,
            marketName: 'No Data',
            dateSubmitted: new Date().toISOString()
          } as any);
        }
      } catch (error) {
        console.error('Failed to load product', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [commodityId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCartIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/prices"
            className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Prices
          </Link>
        </div>
      </div>
    );
  }

  const productImage = getItemImage(product.commodityName, product.commodityCategory, product.commodityImage);
  const priceRange = allPrices.length > 1
    ? {
      min: Math.min(...allPrices.map(p => p.price)),
      max: Math.max(...allPrices.map(p => p.price))
    }
    : null;

  // Generate product features based on commodity name/category
  const getProductFeatures = (name: string, category?: string) => {
    const n = name.toLowerCase();
    if (n.includes('rice')) return ['Good quality', 'Non sticky rice', 'Long grain', 'Clean and stone-free'];
    if (n.includes('beans')) return ['Premium quality', 'Well sorted', 'No weevils', 'Quick cooking'];
    if (n.includes('yam')) return ['Fresh tubers', 'Well cured', 'No rot', 'Medium to large size'];
    if (n.includes('garri')) return ['White granules', 'Well processed', 'Crispy texture', 'Ijebu style'];
    if (n.includes('pepper')) return ['Fresh and spicy', 'Bright red color', 'Well sorted', 'No mold'];
    if (n.includes('tomato')) return ['Fresh and ripe', 'Firm texture', 'Bright red', 'No bruises'];
    if (n.includes('onion')) return ['Dry and firm', 'No sprouts', 'Medium size', 'Long shelf life'];
    if (n.includes('oil') || n.includes('palm')) return ['Pure and natural', 'Rich color', 'No additives', 'Premium grade'];
    if (n.includes('fish') || n.includes('titus')) return ['Fresh catch', 'Well preserved', 'Medium size', 'Cleaned'];
    if (n.includes('chicken') || n.includes('poultry')) return ['Fresh and tender', 'Well cleaned', 'Hormone free', 'Full size'];
    if (n.includes('egg')) return ['Farm fresh', 'Large size', 'Strong shells', 'Rich yolk'];
    if (n.includes('plantain')) return ['Ripe and sweet', 'No bruises', 'Large size', 'Yellow and spotty'];
    // Default features
    return ['Premium quality', 'Fresh produce', 'Well packaged', 'Market verified'];
  };

  const features = getProductFeatures(product.commodityName, product.commodityCategory);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <Link to="/prices" className="flex items-center text-gray-600 hover:text-teal-600 transition-colors group">
              <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Market</span>
            </Link>
            <Link to="/" className="text-xl font-bold text-teal-600 tracking-tight">
              MarketCheck
            </Link>
            <div className="flex items-center space-x-3">
              <button aria-label="Shopping cart" title="Shopping cart" className="text-gray-500 hover:text-teal-600 transition-colors p-2 rounded-lg hover:bg-gray-50">
                <ShoppingCartIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center text-sm text-gray-500 space-x-2">
          <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/prices" className="hover:text-teal-600 transition-colors">Market Prices</Link>
          <span>/</span>
          {product.commodityCategory && (
            <>
              <span className="hover:text-teal-600 transition-colors cursor-pointer">{product.commodityCategory}</span>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-medium">{product.commodityName}</span>
        </nav>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">

            {/* LEFT — Product Image */}
            <div className="lg:w-[55%] relative bg-white p-6 lg:p-10 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="relative w-full max-w-lg">
                <div
                  className={`relative overflow-hidden rounded-xl bg-gray-50 cursor-zoom-in transition-all duration-300 ${imageZoomed ? 'ring-2 ring-teal-400 shadow-lg' : ''
                    }`}
                  onClick={() => setImageZoomed(!imageZoomed)}
                >
                  <img
                    src={productImage}
                    alt={product.commodityName}
                    className={`w-full aspect-square object-cover transition-transform duration-500 ease-out ${imageZoomed ? 'scale-150' : 'scale-100'
                      }`}
                  />

                  {/* Zoom Icon */}
                  <button
                    aria-label="Zoom image"
                    title="Zoom image"
                    className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all group border border-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageZoomed(!imageZoomed);
                    }}
                  >
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-600 group-hover:text-teal-600 transition-colors" />
                  </button>
                </div>

                {/* Thumbnail strip (decorative) */}
                <div className="flex items-center justify-center mt-4 space-x-3">
                  <div className="w-16 h-16 rounded-lg border-2 border-teal-500 overflow-hidden cursor-pointer shadow-sm">
                    <img src={productImage} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-teal-300 transition-colors opacity-70 hover:opacity-100">
                    <img src={productImage} alt="" className="w-full h-full object-cover brightness-110" />
                  </div>
                  <div className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-teal-300 transition-colors opacity-70 hover:opacity-100">
                    <img src={productImage} alt="" className="w-full h-full object-cover saturate-50" />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Product Details */}
            <div className="lg:w-[45%] p-6 lg:p-10 flex flex-col">

              {/* Category Badge */}
              {product.commodityCategory && (
                <div className="mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                    <TagIcon className="h-3 w-3 mr-1" />
                    {product.commodityCategory}
                  </span>
                </div>
              )}

              {/* Product Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4 font-serif-elegant">
                {product.commodityName}
              </h1>

              {/* Rating Stars (decorative) */}
              <div className="flex items-center space-x-2 mb-5">
                <div className="flex items-center">
                  {[1, 2, 3, 4].map(i => (
                    <StarSolid key={i} className="h-4 w-4 text-amber-400" />
                  ))}
                  <StarIcon className="h-4 w-4 text-amber-400" />
                </div>
                <span className="text-sm text-gray-500">(4.0 · Market verified)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                {priceRange && priceRange.min !== priceRange.max ? (
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold text-teal-500 font-serif-elegant">
                      ₦{priceRange.min.toLocaleString()}
                    </span>
                    <span className="text-xl text-gray-400 font-medium">–</span>
                    <span className="text-3xl font-bold text-teal-500 font-serif-elegant">
                      ₦{priceRange.max.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-teal-500 font-serif-elegant">
                    ₦{product.price.toLocaleString()}
                  </span>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  per {product.commodityUnit} · Price varies by market
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-2"></div>

              {/* Short Description */}
              <div className="mb-5 mt-4">
                <p className="text-gray-600 text-base leading-relaxed">
                  {product.commodityName} ({product.commodityUnit}) — available across {allPrices.length} market{allPrices.length > 1 ? 's' : ''} in Oyo State.
                  Premium quality produce sourced directly from verified local traders.
                </p>
              </div>

              {/* Product Features */}
              <div className="mb-6">
                <ul className="space-y-2.5">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-3 flex-shrink-0"></div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-2"></div>

              {/* Variant Selector */}
              <div className="mb-6 mt-4">
                <label htmlFor="variant-select" className="block text-sm font-semibold text-gray-800 mb-2">
                  {product.commodityName} ({product.commodityUnit?.toLowerCase()}):
                </label>
                <div className="relative">
                  <select
                    id="variant-select"
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-700 text-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all hover:border-gray-400 cursor-pointer shadow-sm"
                  >
                    <option value="">Choose an option</option>
                    {allPrices.map((p) => (
                      <option key={p.$id} value={p.$id}>
                        {p.marketName} — ₦{p.price.toLocaleString()} / {p.commodityUnit}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center space-x-6 mb-6 text-xs text-gray-500">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheckIcon className="h-4 w-4 text-teal-500" />
                  <span>Verified Price</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <TruckIcon className="h-4 w-4 text-teal-500" />
                  <span>Market Sourced</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <MapPinIcon className="h-4 w-4 text-teal-500" />
                  <span>{product.marketName}</span>
                </div>
              </div>

              {/* Updated Date */}
              <p className="text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100">
                Last updated: {new Date(product.dateSubmitted).toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Section — Description / Markets / Reviews */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            {(['description', 'markets', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-all relative ${activeTab === tab
                    ? 'text-teal-600 bg-teal-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {tab === 'markets' ? `Markets (${allPrices.length})` : tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"></div>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 lg:p-8">
            {activeTab === 'description' && (
              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About {product.commodityName}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {product.commodityName} is a popular commodity available in Nigerian markets.
                  This product is sourced directly from verified traders who operate in local markets,
                  ensuring competitive pricing and authentic quality.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Unit</p>
                    <p className="text-sm font-semibold text-gray-800">{product.commodityUnit}</p>
                  </div>
                  {product.commodityCategory && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Category</p>
                      <p className="text-sm font-semibold text-gray-800">{product.commodityCategory}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Markets Available</p>
                    <p className="text-sm font-semibold text-gray-800">{allPrices.length} market{allPrices.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(product.dateSubmitted).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'markets' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Price across {allPrices.length} market{allPrices.length > 1 ? 's' : ''}
                </h3>
                <div className="space-y-3">
                  {allPrices.map((p) => (
                    <div
                      key={p.$id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                          <MapPinIcon className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{p.marketName}</p>
                          <p className="text-xs text-gray-500">
                            Updated {new Date(p.dateSubmitted).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-teal-600">₦{p.price.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">per {p.commodityUnit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Market reviews and trader ratings coming soon. Help us improve by sharing your experience.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedItems.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-5">Related Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedItems.map((item) => (
                <Link
                  key={`${item.commodityId}-${item.marketId}`}
                  to={`/product/${item.commodityId}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={getItemImage(item.commodityName, item.commodityCategory, item.commodityImage)}
                      alt={item.commodityName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{item.commodityName}</h4>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      <span className="truncate">{item.marketName}</span>
                    </div>
                    <p className="text-lg font-bold text-teal-600 mt-2">
                      ₦{item.price.toLocaleString()}
                      <span className="text-xs text-gray-500 font-normal ml-1">/ {item.commodityUnit}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

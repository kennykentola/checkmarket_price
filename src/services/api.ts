import { Market, Commodity, PriceEntry, PriceDataExpanded, User, UserRole, FarmgateEntry, Notification, Category, Activity } from '@/types';
import { databases, DATABASE_ID, COLLECTION_MARKETS, COLLECTION_COMMODITIES, COLLECTION_PRICES, COLLECTION_CATEGORIES, COLLECTION_USERS, COLLECTION_NOTIFICATIONS, COLLECTION_FARMGATE_PRICES, COLLECTION_ACTIVITIES } from './appwriteConfig';
import { ID, Query } from 'appwrite';

// Mock data for Demo Mode Fallback when Quota is hit (Error 402)
const DEMO_PRICES: any[] = [
  { $id: 'demo1', commodityName: 'Yellow Maize', marketName: 'Bodija Market', price: 45000, commodityUnit: '100kg Bag', dateSubmitted: new Date().toISOString(), commodityCategory: 'Grains', trendDirection: 'up', trend: 5.2 },
  { $id: 'demo2', commodityName: 'White Yam', marketName: 'Mile 12', price: 2500, commodityUnit: 'Large Tuber', dateSubmitted: new Date().toISOString(), commodityCategory: 'Tubers', trendDirection: 'down', trend: 2.1 },
  { $id: 'demo3', commodityName: 'Red Palm Oil', marketName: 'Oja Oba', price: 18000, commodityUnit: '25L Gallon', dateSubmitted: new Date().toISOString(), commodityCategory: 'Oil', trendDirection: 'stable', trend: 0.0 },
  { $id: 'demo4', commodityName: 'Broiler Chicken', marketName: 'Dugbe Market', price: 8500, commodityUnit: 'Live Bird', dateSubmitted: new Date().toISOString(), commodityCategory: 'Poultry', trendDirection: 'up', trend: 12.5 },
  { $id: 'demo5', commodityName: 'Soya Beans', marketName: 'Akinyele', price: 52000, commodityUnit: '100kg Bag', dateSubmitted: new Date().toISOString(), commodityCategory: 'Grains', trendDirection: 'up', trend: 8.4 }
];



// --- API INTERFACE ---

interface ApiService {
  getMarkets: () => Promise<Market[]>;
  getMarketById: (id: string) => Promise<Market | undefined>;
  getCommodities: () => Promise<Commodity[]>;
  getCommodity: (id: string) => Promise<Commodity>;
  getCommodityPrices: (commodityId: string) => Promise<PriceEntry[]>;
  getCategories: () => Promise<Category[]>;
  getLatestPrices: () => Promise<PriceDataExpanded[]>;
  getTraderHistory: (traderId: string) => Promise<PriceDataExpanded[]>;
  submitPrice: (price: Omit<PriceEntry, '$id' | 'dateSubmitted'>) => Promise<PriceEntry>;
  submitFarmgatePrice: (entry: Omit<FarmgateEntry, '$id' | 'dateSubmitted'>) => Promise<FarmgateEntry>;
  addMarket: (market: Omit<Market, '$id'>) => Promise<Market>;
  updateMarket: (id: string, updates: Partial<Market>) => Promise<Market>;
  deleteMarket: (id: string) => Promise<void>;
  addCommodity: (commodity: Omit<Commodity, '$id'>) => Promise<Commodity>;
  updateCommodity: (id: string, updates: Partial<Commodity>) => Promise<Commodity>;
  deleteCommodity: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  getNotifications: (userId: string) => Promise<Notification[]>;
  getHistoricalPrices: (commodityId: string, marketId: string, days: number) => Promise<PriceEntry[]>;
  getTrendingPrices: (days: number) => Promise<PriceDataExpanded[]>;
  updatePrice: (priceId: string, newPrice: number) => Promise<PriceEntry>;
   getUserList: () => Promise<User[]>;
   deleteUser: (userId: string) => Promise<void>;
   updateUserRole: (userId: string, role: UserRole) => Promise<void>;
   logActivity: (activity: Omit<Activity, '$id'>) => Promise<Activity>;
   getActivityLog: (userId?: string) => Promise<Activity[]>;
}

// --- MOCK IMPLEMENTATION ---
const mockApi: ApiService = {
  getMarkets: async () => {
    const CACHE_KEY = 'marketcheck_markets_cache';
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { localStorage.removeItem(CACHE_KEY); }
    }
    
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_MARKETS, [
        Query.limit(100)
      ]);
      const result = response.documents as unknown as Market[];
      localStorage.setItem(CACHE_KEY, JSON.stringify(result));
      return result;
    } catch (error) {
      if (cached) return JSON.parse(cached);
      throw error;
    }
  },
  getMarketById: async (id: string) => {
    const markets = await mockApi.getMarkets();
    return markets.find(m => m.$id === id);
  },
  getCommodities: async () => {
    const CACHE_KEY = 'marketcheck_commodities_cache';
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { localStorage.removeItem(CACHE_KEY); }
    }

    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_COMMODITIES, [
        Query.limit(100)
      ]);
      const result = response.documents as unknown as Commodity[];
      localStorage.setItem(CACHE_KEY, JSON.stringify(result));
      return result;
    } catch (error) {
      if (cached) return JSON.parse(cached);
      throw error;
    }
  },
  getCommodity: async (id: string) => {
    const commodities = await mockApi.getCommodities();
    const found = commodities.find(c => c.$id === id);
    if (found) return found;
    
    const response = await databases.getDocument(DATABASE_ID, COLLECTION_COMMODITIES, id);
    return response as unknown as Commodity;
  },
  getCommodityPrices: async (commodityId: string) => {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_PRICES, [
      Query.equal('commodityId', commodityId),
      Query.orderDesc('dateSubmitted'),
      Query.limit(50)
    ]);
    return response.documents as unknown as PriceEntry[];
  },
  getCategories: async () => {
    const CACHE_KEY = 'marketcheck_categories_cache';
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { localStorage.removeItem(CACHE_KEY); }
    }

    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_CATEGORIES);
      const result = response.documents as unknown as Category[];
      localStorage.setItem(CACHE_KEY, JSON.stringify(result));
      return result;
    } catch (error) {
      if (cached) return JSON.parse(cached);
      throw error;
    }
  },
  getLatestPrices: async () => {
    const CACHE_KEY = 'marketcheck_latest_prices_cache';
    const cached = localStorage.getItem(CACHE_KEY);
    
    try {
      const pricesResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_PRICES, [
        Query.orderDesc('$createdAt'),
        Query.limit(30)
      ]);

      const markets = await mockApi.getMarkets();
      const commodities = await mockApi.getCommodities();

      const latestPrices = new Map<string, any>();
      pricesResponse.documents.forEach((price: any) => {
        const key = `${price.commodityId}-${price.marketId}`;
        const existing = latestPrices.get(key);
        if (!existing || new Date(price.dateSubmitted) > new Date(existing.dateSubmitted)) {
          latestPrices.set(key, price);
        }
      });

      const result = Array.from(latestPrices.values()).map((p: any) => {
        const m = markets.find(mark => mark.$id === p.marketId);
        const c = commodities.find(com => com.$id === p.commodityId);
        return {
          ...p,
          marketName: m?.name || 'Unknown',
          commodityName: c?.name || 'Unknown',
          commodityUnit: c?.unit || '?',
          commodityCategory: c?.category || 'Other',
          commodityImage: c?.image
        };
      }).sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());

      localStorage.setItem(CACHE_KEY, JSON.stringify(result));
      return result;

    } catch (error: any) {
      console.warn("API Error (likely quota):", error.message);
      if (cached) {
        console.log("Serving Latest Prices from Local Cache");
        return JSON.parse(cached);
      }
      if (error.code === 402) {
        console.warn("Quota hit. Serving Demo Data.");
        return DEMO_PRICES;
      }
      throw error;
    }
  },
  getTraderHistory: async (traderId: string) => {
    const CACHE_KEY = `marketcheck_trader_history_${traderId}`;
    const cached = localStorage.getItem(CACHE_KEY);

    try {
      const pricesResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_PRICES, [
        Query.equal('traderId', traderId),
        Query.orderDesc('dateSubmitted'),
        Query.limit(50)
      ]);

      const markets = await mockApi.getMarkets();
      const commodities = await mockApi.getCommodities();

      const result = pricesResponse.documents.map((p: any) => {
        const m = markets.find(mark => mark.$id === p.marketId);
        const c = commodities.find(com => com.$id === p.commodityId);
        return {
          ...p,
          marketName: m?.name || 'Unknown',
          commodityName: c?.name || 'Unknown',
          commodityUnit: c?.unit || '?',
          commodityCategory: c?.category || 'Other',
          commodityImage: c?.image
        };
      }).sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());

      localStorage.setItem(CACHE_KEY, JSON.stringify(result));
      return result;
    } catch (error: any) {
      if (cached) return JSON.parse(cached);
      if (error.code === 402) return [];
      throw error;
    }
  },
  submitPrice: async (priceData) => {
    const newPrice = {
      ...priceData,
      dateSubmitted: new Date().toISOString(),
    };
    const response = await databases.createDocument(DATABASE_ID, COLLECTION_PRICES, ID.unique(), newPrice);
    // Trigger refresh for all components
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'price' } }));
    return response as unknown as PriceEntry;
  },
  submitFarmgatePrice: async (data) => {
    const entry = {
        ...data,
        dateSubmitted: new Date().toISOString()
    };
    // In a real app, this would go to a separate collection
    const response = await databases.createDocument(DATABASE_ID, COLLECTION_FARMGATE_PRICES, ID.unique(), entry);
    console.log("Farmgate Price Submitted:", response);
    return response as unknown as FarmgateEntry;
  },
  addMarket: async (data) => {
    const response = await databases.createDocument(DATABASE_ID, COLLECTION_MARKETS, ID.unique(), data);
    // Trigger refresh
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'market' } }));
    return response as unknown as Market;
  },
  updateMarket: async (id, updates) => {
    const sanitizedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(sanitizedUpdates).length === 0) {
      throw new Error('No valid market fields were provided to update.');
    }

    const response = await databases.updateDocument(DATABASE_ID, COLLECTION_MARKETS, id, sanitizedUpdates);
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'market' } }));
    return response as unknown as Market;
  },
  deleteMarket: async (id) => {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_MARKETS, id);
    // Trigger refresh for all components
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'market' } }));
  },
  addCommodity: async (data) => {
    const response = await databases.createDocument(DATABASE_ID, COLLECTION_COMMODITIES, ID.unique(), data);
    // Trigger refresh for all components
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'commodity' } }));
    return response as unknown as Commodity;
  },
  updateCommodity: async (id, updates) => {
    const response = await databases.updateDocument(DATABASE_ID, COLLECTION_COMMODITIES, id, updates);
    // Trigger refresh for all components
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'commodity' } }));
    return response as unknown as Commodity;
  },
  deleteCommodity: async (id) => {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_COMMODITIES, id);
    // Trigger refresh for all components
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'commodity' } }));
  },
  addCategory: async (name) => {
    const response = await databases.createDocument(DATABASE_ID, COLLECTION_CATEGORIES, ID.unique(), { name });
    return response as unknown as Category;
  },
  deleteCategory: async (id) => {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_CATEGORIES, id);
  },
  getNotifications: async (userId) => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_NOTIFICATIONS, [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt')
      ]);
      return response.documents.map(doc => ({
        ...doc,
        isRead: doc.isRead || false,
        createdAt: doc.createdAt || doc.$createdAt
      })) as unknown as Notification[];
    } catch (error: any) {
      // If user doesn't have permission to read notifications, return empty array
      if (error.code === 401 || error.message?.includes('not authorized')) {
        console.warn('User does not have permission to access notifications');
        return [];
      }
      // For other errors, log but don't crash
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  },
  getHistoricalPrices: async (commodityId, marketId, days) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_PRICES, [
      Query.equal('commodityId', commodityId),
      Query.equal('marketId', marketId),
      Query.greaterThanEqual('dateSubmitted', cutoffDate.toISOString()),
      Query.orderDesc('dateSubmitted')
    ]);

    return response.documents as unknown as PriceEntry[];
  },
  getTrendingPrices: async (days) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    try {
      const pricesResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_PRICES, [
        Query.greaterThanEqual('dateSubmitted', cutoffDate.toISOString()),
        Query.orderDesc('dateSubmitted'),
        Query.limit(30)
      ]);
      
      const marketsResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_MARKETS, [
        Query.limit(30)
      ]);
      const commoditiesResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_COMMODITIES, [
        Query.limit(30)
      ]);

      const markets = marketsResponse.documents as unknown as Market[];
      const commodities = commoditiesResponse.documents as unknown as Commodity[];

      // Group by commodity and market to find latest prices
      const latestPrices = new Map();
      pricesResponse.documents.forEach((price: any) => {
        const key = `${price.commodityId}-${price.marketId}`;
        const existing = latestPrices.get(key);
        if (!existing || new Date(price.dateSubmitted) > new Date(existing.dateSubmitted)) {
          latestPrices.set(key, price);
        }
      });

      // Simple trend calculation (Stable for now, can be expanded)
      const trendingPrices = Array.from(latestPrices.values()).map((price: any) => {
        const market = markets.find(m => m.$id === price.marketId);
        const commodity = commodities.find(c => c.$id === price.commodityId);

        return {
          ...price,
          marketName: market?.name || 'Unknown',
          commodityName: commodity?.name || 'Unknown',
          commodityUnit: commodity?.unit || '?',
          commodityCategory: commodity?.category || 'Other',
          commodityImage: commodity?.image,
          trend: 0,
          trendDirection: 'stable' as const
        };
      });

      return trendingPrices.sort((a, b) => Math.abs(b.trend) - Math.abs(a.trend));
    } catch (error: any) {
      if (error.code === 402) {
        console.warn("Appwrite Quota hit. Switching to Demo Mode for Trending Prices.");
        return DEMO_PRICES;
      }
      throw error;
    }
  },
  updatePrice: async (priceId, newPrice) => {
    const response = await databases.updateDocument(DATABASE_ID, COLLECTION_PRICES, priceId, {
      price: newPrice,
      dateSubmitted: new Date().toISOString()
    });
    // Trigger refresh for all components
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'price' } }));
    return response as unknown as PriceEntry;
  },
   getUserList: async () => {
     const response = await databases.listDocuments(DATABASE_ID, COLLECTION_USERS, [
       Query.limit(30),
       Query.orderDesc('$createdAt')
     ]);
     return response.documents as unknown as User[];
   },
   deleteUser: async (userId: string) => {
     await databases.deleteDocument(DATABASE_ID, COLLECTION_USERS, userId);
     // Trigger refresh for all components
     window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'user' } }));
   },
   updateUserRole: async (userId: string, role: UserRole) => {
     await databases.updateDocument(DATABASE_ID, COLLECTION_USERS, userId, { role });
     // Trigger refresh for all components
     window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'user' } }));
   },
    logActivity: async (activity) => {
      const safeActivity = {
        ...activity,
        timestamp: activity.timestamp || new Date().toISOString(),
        details: typeof activity.details === 'object' ? JSON.stringify(activity.details) : String(activity.details || '')
      };
      const response = await databases.createDocument(DATABASE_ID, COLLECTION_ACTIVITIES, ID.unique(), safeActivity);
      return response as unknown as Activity;
    },
   getActivityLog: async (userId?: string) => {
     const queries = [Query.orderDesc('timestamp')];
     if (userId) {
       queries.push(Query.equal('userId', userId));
     }
     const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ACTIVITIES, queries);
     return response.documents as unknown as Activity[];
   }
};

export const api = mockApi;

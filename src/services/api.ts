import { Market, Commodity, PriceEntry, PriceDataExpanded, User, UserRole, FarmgateEntry, Notification, Category } from '@/types';
import { databases, DATABASE_ID, COLLECTION_MARKETS, COLLECTION_COMMODITIES, COLLECTION_PRICES, COLLECTION_CATEGORIES, COLLECTION_USERS, COLLECTION_NOTIFICATIONS, COLLECTION_FARMGATE_PRICES } from './appwriteConfig';
import { ID, Query } from 'appwrite';



// --- API INTERFACE ---

interface ApiService {
  getMarkets: () => Promise<Market[]>;
  getMarketById: (id: string) => Promise<Market | undefined>;
  getCommodities: () => Promise<Commodity[]>;
  getCategories: () => Promise<Category[]>;
  getLatestPrices: () => Promise<PriceDataExpanded[]>;
  getTraderHistory: (traderId: string) => Promise<PriceDataExpanded[]>;
  submitPrice: (price: Omit<PriceEntry, '$id' | 'dateSubmitted'>) => Promise<PriceEntry>;
  submitFarmgatePrice: (entry: Omit<FarmgateEntry, '$id' | 'dateSubmitted'>) => Promise<FarmgateEntry>;
  addMarket: (market: Omit<Market, '$id'>) => Promise<Market>;
  deleteMarket: (id: string) => Promise<void>;
  addCommodity: (commodity: Omit<Commodity, '$id'>) => Promise<Commodity>;
  deleteCommodity: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  getNotifications: (userId: string) => Promise<Notification[]>;
  getHistoricalPrices: (commodityId: string, marketId: string, days: number) => Promise<PriceEntry[]>;
  getTrendingPrices: (days: number) => Promise<PriceDataExpanded[]>;
  updatePrice: (priceId: string, newPrice: number) => Promise<PriceEntry>;
}

// --- MOCK IMPLEMENTATION ---
const mockApi: ApiService = {
  getMarkets: async () => {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_MARKETS);
    return response.documents as unknown as Market[];
  },
  getMarketById: async (id: string) => {
    try {
      const response = await databases.getDocument(DATABASE_ID, COLLECTION_MARKETS, id);
      return response as unknown as Market;
    } catch (error) {
      return undefined;
    }
  },
  getCommodities: async () => {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_COMMODITIES);
    return response.documents as unknown as Commodity[];
  },
  getCategories: async () => {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_CATEGORIES);
    return response.documents as unknown as Category[];
  },
  getLatestPrices: async () => {
    const pricesResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_PRICES, [
      Query.orderDesc('$createdAt'),
      Query.limit(1000)
    ]);

    const marketsResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_MARKETS);
    const commoditiesResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_COMMODITIES);

    const markets = marketsResponse.documents as unknown as Market[];
    const commodities = commoditiesResponse.documents as unknown as Commodity[];

    // Group by commodity-market pair to get latest price
    const latestPrices = new Map<string, any>();
    pricesResponse.documents.forEach((price: any) => {
      const key = `${price.commodityId}-${price.marketId}`;
      const existing = latestPrices.get(key);
      if (!existing || new Date(price.dateSubmitted) > new Date(existing.dateSubmitted)) {
        latestPrices.set(key, price);
      }
    });

    return Array.from(latestPrices.values()).map((p: any) => {
      const m = markets.find(m => m.$id === p.marketId);
      const c = commodities.find(c => c.$id === p.commodityId);
      return {
        ...p,
        marketName: m?.name || 'Unknown',
        commodityName: c?.name || 'Unknown',
        commodityUnit: c?.unit || '?',
        commodityCategory: c?.category || 'Other',
        commodityImage: c?.image
      };
    }).sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
  },
  getTraderHistory: async (traderId: string) => {
    const pricesResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_PRICES, [
      Query.equal('traderId', traderId),
      Query.orderDesc('dateSubmitted')
    ]);

    const marketsResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_MARKETS);
    const commoditiesResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_COMMODITIES);

    const markets = marketsResponse.documents as unknown as Market[];
    const commodities = commoditiesResponse.documents as unknown as Commodity[];

    return pricesResponse.documents.map((p: any) => {
      const m = markets.find(m => m.$id === p.marketId);
      const c = commodities.find(c => c.$id === p.commodityId);
      return {
        ...p,
        marketName: m?.name || 'Unknown',
        commodityName: c?.name || 'Unknown',
        commodityUnit: c?.unit || '?',
        commodityCategory: c?.category || 'Other',
        commodityImage: c?.image
      };
    }).sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
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
  deleteMarket: async (id) => {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_MARKETS, id);
  },
  addCommodity: async (data) => {
    const response = await databases.createDocument(DATABASE_ID, COLLECTION_COMMODITIES, ID.unique(), data);
    return response as unknown as Commodity;
  },
  deleteCommodity: async (id) => {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_COMMODITIES, id);
  },
  addCategory: async (name) => {
    const response = await databases.createDocument(DATABASE_ID, COLLECTION_CATEGORIES, ID.unique(), { name });
    return response as unknown as Category;
  },
  deleteCategory: async (id) => {
    await databases.deleteDocument(DATABASE_ID, COLLECTION_CATEGORIES, id);
  },
  getNotifications: async (userId) => {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_NOTIFICATIONS, [
      Query.equal('userId', userId),
      Query.orderDesc('$createdAt')
    ]);
    return response.documents.map(doc => ({
      ...doc,
      isRead: doc.isRead || false,
      createdAt: doc.createdAt || doc.$createdAt
    })) as unknown as Notification[];
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

    const pricesResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_PRICES, [
      Query.greaterThanEqual('dateSubmitted', cutoffDate.toISOString()),
      Query.orderDesc('dateSubmitted'),
      Query.limit(1000)
    ]);

    const marketsResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_MARKETS);
    const commoditiesResponse = await databases.listDocuments(DATABASE_ID, COLLECTION_COMMODITIES);

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

    // For simplicity, just return latest prices with trend = 0 (stable)
    // In a real implementation, you'd need to compare with previous period
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
  },
  updatePrice: async (priceId, newPrice) => {
    const response = await databases.updateDocument(DATABASE_ID, COLLECTION_PRICES, priceId, {
      price: newPrice,
      dateSubmitted: new Date().toISOString()
    });
    // Trigger refresh for all components
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'price' } }));
    return response as unknown as PriceEntry;
  }
};

export const api = mockApi;

import { Market, Commodity, PriceEntry, PriceDataExpanded, User, UserRole, FarmgateEntry, Notification, Category, Activity } from '@/types';
import { supabase } from './supabaseClient';

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

export const api: ApiService = {
  getMarkets: async () => {
    const { data, error } = await supabase.from('markets').select('*').order('name');
    if (error) throw error;
    return data.map(m => ({ ...m, $id: m.id })) as unknown as Market[];
  },
  getMarketById: async (id) => {
    const { data, error } = await supabase.from('markets').select('*').eq('id', id).single();
    if (error) return undefined;
    return { ...data, $id: data.id } as unknown as Market;
  },
  getCommodities: async () => {
    const { data, error } = await supabase.from('commodities').select('*, categories(name)').order('name');
    if (error) throw error;
    return data.map(c => ({ 
      ...c, 
      $id: c.id,
      category: c.categories?.name || 'Other'
    })) as unknown as Commodity[];
  },
  getCommodity: async (id) => {
    const { data, error } = await supabase.from('commodities').select('*, categories(name)').eq('id', id).single();
    if (error) throw error;
    return { 
      ...data, 
      $id: data.id,
      category: data.categories?.name || 'Other'
    } as unknown as Commodity;
  },
  getCommodityPrices: async (commodityId) => {
    const { data, error } = await supabase
      .from('prices')
      .select('*, markets(name)')
      .eq('commodity_id', commodityId)
      .order('date_submitted', { ascending: false });
    if (error) throw error;
    return data.map(p => ({ 
      ...p, 
      $id: p.id,
      dateSubmitted: p.date_submitted, // Map Supabase snake_case to CamelCase
      marketName: p.markets?.name || 'Unknown'
    })) as unknown as PriceEntry[];
  },
  getCategories: async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw error;
    return data.map(c => ({ ...c, $id: c.id })) as unknown as Category[];
  },
  getLatestPrices: async () => {
    const { data, error } = await supabase
      .from('prices')
      .select(`
        *,
        commodities (id, name, unit, category_id, image, categories(name)),
        markets (id, name)
      `)
      .order('date_submitted', { ascending: false })
      .limit(50);

    if (error) throw error;

    return data.map(p => ({
      ...p,
      $id: p.id,
      dateSubmitted: p.date_submitted, // Map Supabase snake_case to CamelCase
      commodityId: p.commodities.id,
      commodityName: p.commodities.name,
      commodityUnit: p.commodities.unit,
      commodityCategory: p.commodities.categories?.name || 'Other',
      commodityImage: p.commodities.image,
      marketName: p.markets.name,
      marketId: p.markets.id
    })) as unknown as PriceDataExpanded[];
  },
  getTraderHistory: async (traderId) => {
    const { data, error } = await supabase
      .from('prices')
      .select(`
        *,
        commodities (id, name, unit, category_id, image, categories(name)),
        markets (id, name)
      `)
      .eq('trader_id', traderId)
      .order('date_submitted', { ascending: false });

    if (error) throw error;

    return data.map(p => ({
      ...p,
      $id: p.id,
      dateSubmitted: p.date_submitted, // Map Supabase snake_case to CamelCase
      commodityId: p.commodities.id,
      commodityName: p.commodities.name,
      commodityUnit: p.commodities.unit,
      commodityCategory: p.commodities.categories?.name || 'Other',
      commodityImage: p.commodities.image,
      marketName: p.markets.name,
      marketId: p.markets.id
    })) as unknown as PriceDataExpanded[];
  },
  submitPrice: async (price) => {
    const { data, error } = await supabase
      .from('prices')
      .insert({
        commodity_id: (price as any).commodityId,
        market_id: (price as any).marketId,
        price: price.price,
        trader_id: price.traderId
      })
      .select()
      .single();
    
    if (error) throw error;
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'price' } }));
    return { ...data, $id: data.id } as unknown as PriceEntry;
  },
  submitFarmgatePrice: async (entry) => {
    return {} as any;
  },
  addMarket: async (market) => {
    const { data, error } = await supabase.from('markets').insert(market).select().single();
    if (error) throw error;
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'market' } }));
    return { ...data, $id: data.id } as unknown as Market;
  },
  updateMarket: async (id, updates) => {
    const { data, error } = await supabase.from('markets').update(updates).eq('id', id).select().single();
    if (error) throw error;
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'market' } }));
    return { ...data, $id: data.id } as unknown as Market;
  },
  deleteMarket: async (id) => {
    await supabase.from('markets').delete().eq('id', id);
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'market' } }));
  },
  addCommodity: async (commodity) => {
    const { data, error } = await supabase.from('commodities').insert({
        name: commodity.name,
        unit: commodity.unit,
        image: commodity.image,
        category_id: (commodity as any).categoryId 
    }).select().single();
    if (error) throw error;
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'commodity' } }));
    return { ...data, $id: data.id } as unknown as Commodity;
  },
  updateCommodity: async (id, updates) => {
    const { data, error } = await supabase.from('commodities').update(updates).eq('id', id).select().single();
    if (error) throw error;
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'commodity' } }));
    return { ...data, $id: data.id } as unknown as Commodity;
  },
  deleteCommodity: async (id) => {
    await supabase.from('commodities').delete().eq('id', id);
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'commodity' } }));
  },
  addCategory: async (name) => {
    const { data, error } = await supabase.from('categories').insert({ name }).select().single();
    if (error) throw error;
    return { ...data, $id: data.id } as unknown as Category;
  },
  deleteCategory: async (id) => {
    await supabase.from('categories').delete().eq('id', id);
  },
  getNotifications: async (userId) => {
    return []; 
  },
  getHistoricalPrices: async (commodityId, marketId, days) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from('prices')
      .select('*')
      .eq('commodity_id', commodityId)
      .eq('market_id', marketId)
      .gte('date_submitted', cutoffDate.toISOString())
      .order('date_submitted', { ascending: false });

    if (error) throw error;
    return data.map(p => ({ ...p, $id: p.id })) as unknown as PriceEntry[];
  },
  getTrendingPrices: async (days) => {
    const latest = await api.getLatestPrices();
    return latest.map(p => ({
        ...p,
        trend: 0,
        trendDirection: 'stable' as const
    }));
  },
  updatePrice: async (priceId, newPrice) => {
    const { data, error } = await supabase
      .from('prices')
      .update({ price: newPrice, date_submitted: new Date().toISOString() })
      .eq('id', priceId)
      .select()
      .single();
    if (error) throw error;
    window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'price' } }));
    return { ...data, $id: data.id } as unknown as PriceEntry;
  },
  getUserList: async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(u => ({ ...u, $id: u.id, $createdAt: u.created_at })) as unknown as User[];
  },
  deleteUser: async (userId) => {
    // In Supabase, you usually delete from auth.users via a service role or edge function
    // For now, we delete the profile
    await supabase.from('profiles').delete().eq('id', userId);
  },
  updateUserRole: async (userId, role) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (error) throw error;
  },
  logActivity: async (activity) => {
    const { data, error } = await supabase.from('activities').insert({
        user_id: activity.userId,
        user_name: activity.userName,
        user_email: activity.userEmail,
        action: activity.action,
        description: activity.description,
        details: typeof activity.details === 'object' ? JSON.stringify(activity.details) : String(activity.details)
    }).select().single();
    if (error) throw error;
    return { 
      ...data, 
      $id: data.id,
      userName: data.user_name,
      userEmail: data.user_email,
      description: data.description
    } as unknown as Activity;
  },
  getActivityLog: async (userId) => {
    const query = supabase.from('activities').select('*').order('timestamp', { ascending: false });
    if (userId) query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data.map(a => ({ 
      ...a, 
      $id: a.id,
      userName: a.user_name || 'Unknown User',
      userEmail: a.user_email || '',
      description: a.description || ''
    })) as unknown as Activity[];
  }
};

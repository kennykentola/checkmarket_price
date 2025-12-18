
import { Market, Commodity, PriceEntry, PriceDataExpanded, User, UserRole, FarmgateEntry, Notification, Category } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// --- MOCK DATA FOR DEMO ---
let MOCK_MARKETS: Market[] = [
  // Ibadan Major Markets
  { $id: 'm1', name: 'Bodija Market', location: 'Ibadan' },
  { $id: 'm2', name: 'Oja-Oba', location: 'Ibadan' },
  { $id: 'm3', name: 'Dugbe Market', location: 'Ibadan' },
  { $id: 'm4', name: 'Agodi Gate Market', location: 'Ibadan' },
  { $id: 'm5', name: 'Oje Market', location: 'Ibadan' },
  { $id: 'm6', name: 'Aleshinloye Market', location: 'Ibadan' },
  { $id: 'm7', name: 'Apata Market', location: 'Ibadan' },
  { $id: 'm8', name: 'Sango Market', location: 'Ibadan' },
  { $id: 'm9', name: 'Eleyele Market', location: 'Ibadan' },
  { $id: 'm10', name: 'Mokola Market', location: 'Ibadan' },
  { $id: 'm11', name: 'Gbagi Market', location: 'Ibadan' },
  { $id: 'm12', name: 'Beere Market', location: 'Ibadan' },
  { $id: 'm13', name: 'Ojoo Market', location: 'Ibadan' },
  { $id: 'm14', name: 'Iwo Road Market', location: 'Ibadan' },
  { $id: 'm15', name: 'Olomi Market', location: 'Ibadan' },
  { $id: 'm16', name: 'Challenge Market', location: 'Ibadan' },
  { $id: 'm17', name: 'Orita Challenge Mini Market', location: 'Ibadan' },
  { $id: 'm18', name: 'New Garage Market', location: 'Ibadan' },
  { $id: 'm19', name: 'Ojaba Market', location: 'Ibadan' },
  { $id: 'm20', name: 'Gate Spare Parts Market', location: 'Ibadan' },
  { $id: 'm21', name: 'Agbeni Market', location: 'Ibadan' },
  { $id: 'm22', name: 'Ogunpa Market', location: 'Ibadan' },
  { $id: 'm23', name: 'Iyaganku Market', location: 'Ibadan' },
  { $id: 'm24', name: 'Akobo Market', location: 'Ibadan' },
  { $id: 'm25', name: 'Orita Merin Market', location: 'Ibadan' },
  { $id: 'm26', name: 'Molete Market', location: 'Ibadan' },
  { $id: 'm27', name: 'Omi-Adio Market', location: 'Ibadan' },
  { $id: 'm28', name: 'Ogbere Market', location: 'Ibadan' },
  // Oyo State Other
  { $id: 'm29', name: 'Akesan Market', location: 'Oyo Town' },
  { $id: 'm30', name: 'Sabo Market', location: 'Ogbomoso' },
];

let MOCK_CATEGORIES: Category[] = [
  { $id: 'cat1', name: 'Grains' },
  { $id: 'cat2', name: 'Tubers' },
  { $id: 'cat3', name: 'Vegetables' },
  { $id: 'cat4', name: 'Oils' },
  { $id: 'cat5', name: 'Meat' },
  { $id: 'cat6', name: 'Seafood' },
  { $id: 'cat7', name: 'Dairy' },
  { $id: 'cat8', name: 'Spices' },
  { $id: 'cat9', name: 'Processed' },
  { $id: 'cat10', name: 'Fruits' },
  { $id: 'cat11', name: 'Other' },
];

const NIGERIAN_STAPLES = [
  // Grains & Flours
  { name: 'Rice (Local)', unit: '50kg Bag', category: 'Grains', basePrice: 45000 },
  { name: 'Rice (Foreign)', unit: '50kg Bag', category: 'Grains', basePrice: 65000 },
  { name: 'Beans (Oloyin)', unit: 'Derica', category: 'Grains', basePrice: 1200 },
  { name: 'Garri (White)', unit: 'Paint Bucket', category: 'Grains', basePrice: 2500 },
  { name: 'Garri (Yellow)', unit: 'Paint Bucket', category: 'Grains', basePrice: 2800 },
  { name: 'Semovita', unit: '10kg', category: 'Grains', basePrice: 8500 },
  { name: 'Spaghetti', unit: 'Carton', category: 'Grains', basePrice: 11000 },
  
  // Tubers
  { name: 'Yam (Puna)', unit: 'Tuber', category: 'Tubers', basePrice: 2500 },
  { name: 'Sweet Potato', unit: 'Basket', category: 'Tubers', basePrice: 4000 },
  { name: 'Irish Potato', unit: 'Basket', category: 'Tubers', basePrice: 6000 },
  
  // Vegetables
  { name: 'Tomatoes', unit: 'Basket', category: 'Vegetables', basePrice: 15000 },
  { name: 'Pepper (Rodo)', unit: 'Basket', category: 'Vegetables', basePrice: 12000 },
  { name: 'Onions (Red)', unit: 'Bag', category: 'Vegetables', basePrice: 25000 },
  { name: 'Okra', unit: 'Basket', category: 'Vegetables', basePrice: 8000 },
  
  // Oils
  { name: 'Palm Oil', unit: '25L Keg', category: 'Oils', basePrice: 30000 },
  { name: 'Vegetable Oil', unit: '5L', category: 'Oils', basePrice: 9500 },
  
  // Proteins
  { name: 'Chicken (Frozen)', unit: 'kg', category: 'Meat', basePrice: 4500 },
  { name: 'Chicken (Live)', unit: 'Bird', category: 'Meat', basePrice: 6000 },
  { name: 'Beef', unit: 'kg', category: 'Meat', basePrice: 5000 },
  { name: 'Goat Meat', unit: 'kg', category: 'Meat', basePrice: 6500 },
  { name: 'Titus Fish', unit: 'kg', category: 'Seafood', basePrice: 4000 },
  { name: 'Catfish (Dried)', unit: 'kg', category: 'Seafood', basePrice: 8000 },
  { name: 'Crayfish', unit: 'Paint Bucket', category: 'Seafood', basePrice: 5500 },
  { name: 'Eggs', unit: 'Crate', category: 'Dairy', basePrice: 4500 },
  
  // Spices & Others
  { name: 'Egusi (Peeled)', unit: 'Derica', category: 'Spices', basePrice: 1800 },
  { name: 'Ogbono', unit: 'Derica', category: 'Spices', basePrice: 3500 },
  { name: 'Maggi Star', unit: 'Pack', category: 'Spices', basePrice: 1200 },
  { name: 'Indomie', unit: 'Carton', category: 'Processed', basePrice: 7500 },
  { name: 'Sugar (St Louis)', unit: 'Packet', category: 'Processed', basePrice: 1500 },
  { name: 'Peak Milk', unit: 'Tin', category: 'Dairy', basePrice: 1200 },
];

let MOCK_COMMODITIES: Commodity[] = NIGERIAN_STAPLES.map((item, index) => ({
  $id: `c${index + 1}`,
  name: item.name,
  unit: item.unit,
  category: item.category
}));

// Helper to get past dates for realistic history
const getPastDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

// Generate Mock Prices
let MOCK_PRICES: PriceEntry[] = [];
let MOCK_NOTIFICATIONS: Notification[] = [];

// Helper to generate random variance
const getPrice = (base: number) => {
  const variance = base * 0.15; // 15% variance
  return Math.round((base + (Math.random() * variance * 2 - variance)) / 10) * 10;
};

// Populate MOCK_PRICES with realistic data
MOCK_COMMODITIES.forEach(commodity => {
  const staple = NIGERIAN_STAPLES.find(s => s.name === commodity.name);
  if (!staple) return;

  // Add a latest price for random markets
  MOCK_MARKETS.forEach(market => {
    // 70% chance a market has this item to allow for "No Data" gaps in heatmap
    if (Math.random() > 0.3) {
      MOCK_PRICES.push({
        $id: uuidv4(),
        marketId: market.$id,
        commodityId: commodity.$id,
        traderId: 't1', // Assign some to our main demo trader
        price: getPrice(staple.basePrice),
        dateSubmitted: getPastDate(0)
      });
    }
  });

  // Add history for specific items for Trader 1 (for charts)
  if (['Rice (Local)', 'Palm Oil', 'Tomatoes', 'Garri (White)'].includes(commodity.name)) {
    for (let i = 1; i <= 7; i++) {
       MOCK_PRICES.push({
        $id: uuidv4(),
        marketId: 'm1', // Bodija
        commodityId: commodity.$id,
        traderId: 't1',
        price: getPrice(staple.basePrice),
        dateSubmitted: getPastDate(i * 2)
      });
    }
  }
});

MOCK_NOTIFICATIONS.push(
    { $id: 'n1', userId: 't1', message: 'Rice (Local) price rose by 5% in Bodija Market', type: 'alert', isRead: false, createdAt: new Date().toISOString() },
    { $id: 'n2', userId: 't1', message: 'New market "Gbagi" added to the system', type: 'info', isRead: false, createdAt: getPastDate(1) }
);


// --- API INTERFACE ---

interface ApiService {
  getMarkets: () => Promise<Market[]>;
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
}

// --- MOCK IMPLEMENTATION ---
const mockApi: ApiService = {
  getMarkets: async () => {
    await new Promise(r => setTimeout(r, 300)); 
    return [...MOCK_MARKETS];
  },
  getCommodities: async () => {
    await new Promise(r => setTimeout(r, 300));
    return [...MOCK_COMMODITIES];
  },
  getCategories: async () => {
    await new Promise(r => setTimeout(r, 200));
    return [...MOCK_CATEGORIES];
  },
  getLatestPrices: async () => {
    await new Promise(r => setTimeout(r, 500));
    // Return latest entry per commodity per market
    return MOCK_PRICES.map(p => {
      const m = MOCK_MARKETS.find(m => m.$id === p.marketId);
      const c = MOCK_COMMODITIES.find(c => c.$id === p.commodityId);
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
    await new Promise(r => setTimeout(r, 500));
    return MOCK_PRICES
      .filter(p => p.traderId === traderId)
      .map(p => {
        const m = MOCK_MARKETS.find(m => m.$id === p.marketId);
        const c = MOCK_COMMODITIES.find(c => c.$id === p.commodityId);
        return {
          ...p,
          marketName: m?.name || 'Unknown',
          commodityName: c?.name || 'Unknown',
          commodityUnit: c?.unit || '?',
          commodityCategory: c?.category || 'Other',
          commodityImage: c?.image
        };
      })
      .sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
  },
  submitPrice: async (priceData) => {
    await new Promise(r => setTimeout(r, 400));
    const newPrice: PriceEntry = {
      ...priceData,
      $id: uuidv4(),
      dateSubmitted: new Date().toISOString(),
    };
    MOCK_PRICES.unshift(newPrice);
    return newPrice;
  },
  submitFarmgatePrice: async (data) => {
    await new Promise(r => setTimeout(r, 400));
    const entry: FarmgateEntry = {
        ...data,
        $id: uuidv4(),
        dateSubmitted: new Date().toISOString()
    };
    // In a real app, this would go to a separate collection
    console.log("Farmgate Price Submitted:", entry);
    return entry;
  },
  addMarket: async (data) => {
    const m = { ...data, $id: uuidv4() };
    MOCK_MARKETS.push(m);
    return m;
  },
  deleteMarket: async (id) => {
    MOCK_MARKETS = MOCK_MARKETS.filter(m => m.$id !== id);
  },
  addCommodity: async (data) => {
    const c = { ...data, $id: uuidv4() };
    MOCK_COMMODITIES.push(c);
    return c;
  },
  deleteCommodity: async (id) => {
    MOCK_COMMODITIES = MOCK_COMMODITIES.filter(c => c.$id !== id);
  },
  addCategory: async (name) => {
    const cat = { $id: uuidv4(), name };
    MOCK_CATEGORIES.push(cat);
    return cat;
  },
  deleteCategory: async (id) => {
    MOCK_CATEGORIES = MOCK_CATEGORIES.filter(c => c.$id !== id);
  },
  getNotifications: async (userId) => {
      await new Promise(r => setTimeout(r, 300));
      return MOCK_NOTIFICATIONS;
  }
};

export const api = mockApi;

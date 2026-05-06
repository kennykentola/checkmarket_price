import { api } from './api';

// Nigerian Market Data API Integration
// Supports multiple APIs:
// - Riwe.io: Real-time agricultural commodity prices
// - Iya Oloja: Market locations across Nigeria
// Configure API preference in .env
export class NigerianMarketAPI {
  private static instance: NigerianMarketAPI;
  
  private riweBaseURL = 'https://api.riwe.io';
  private iyaOlojaBaseURL = 'https://iya-oloja.pages.dev/api';
  
  static getInstance(): NigerianMarketAPI {
    if (!NigerianMarketAPI.instance) {
      NigerianMarketAPI.instance = new NigerianMarketAPI();
    }
    return NigerianMarketAPI.instance;
  }

  // Fetch latest prices from Oyo State markets
  // Primary: Riwe.io for commodity prices
  // Fallback: Iya Oloja for market locations
  async getOyoStatePrices(): Promise<any[]> {
    // Try Riwe.io first for commodity prices
    const riweData = await this.fetchRiwePrices('Oyo');
    if (riweData.length > 0) {
      return riweData;
    }

    // Fallback to Iya Oloja for market locations
    console.warn('Riwe.io returned no data for Oyo State. Falling back to Iya Oloja for market locations.');
    return this.fetchIyaOlojaMarkets('oyo');
  }

  // Fetch from Riwe.io API (commodity prices)
  private async fetchRiwePrices(stateFilter?: string): Promise<any[]> {
    try {
      const apiKey = import.meta.env.VITE_NIGERIAN_MARKETS_API_KEY;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (apiKey) {
        headers['X-API-KEY'] = apiKey;
      }

      const response = await fetch(`${this.riweBaseURL}/v1/market/prices`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Riwe.io API failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformRiweData(data, stateFilter);
    } catch (error) {
      console.error('Riwe.io fetch failed:', error);
      return [];
    }
  }

  // Fetch from Iya Oloja API (market locations)
  private async fetchIyaOlojaMarkets(state: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.iyaOlojaBaseURL}/markets?state=${state}&limit=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Iya Oloja API failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformIyaOlojaData(data);
    } catch (error) {
      console.error('Iya Oloja fetch failed:', error);
      throw error;
    }
  }

  // Transform Riwe.io data
  private transformRiweData(apiData: any, stateFilter?: string): any[] {
    if (!apiData.prices || !Array.isArray(apiData.prices)) {
      return [];
    }

    let prices = apiData.prices;
    if (stateFilter) {
      prices = prices.filter((item: any) => 
        item.location && item.location.toLowerCase().includes(stateFilter.toLowerCase())
      );
    }

    if (prices.length === 0) {
      return [];
    }

    const marketMap = new Map<string, any>();
    
    prices.forEach((item: any) => {
      const marketKey = item.location || 'Unknown';
      
      if (!marketMap.has(marketKey)) {
        marketMap.set(marketKey, {
          marketId: `market-${marketKey.toLowerCase().replace(/\s+/g, '-')}`,
          marketName: item.market || `${marketKey} Market`,
          location: marketKey,
          commodities: []
        });
      }
      
      const market = marketMap.get(marketKey);
      market.commodities.push({
        commodityId: item.name?.toLowerCase().replace(/\s+/g, '-') || `commodity-${Date.now()}`,
        commodityName: item.name,
        price: item.retail_price || item.wholesale_price || 0,
        unit: item.unit || 'kg',
        dateUpdated: item.last_updated || new Date().toISOString(),
        source: 'Riwe.io'
      });
    });

    return Array.from(marketMap.values());
  }

  // Transform Iya Oloja data
  private transformIyaOlojaData(apiData: any): any[] {
    if (!apiData.success || !apiData.data || !Array.isArray(apiData.data)) {
      return [];
    }

    const marketMap = new Map<string, any>();
    
    apiData.data.forEach((market: any) => {
      const lgaKey = market.lga_name || 'Unknown';
      
      if (!marketMap.has(lgaKey)) {
        marketMap.set(lgaKey, {
          marketId: `market-${lgaKey.toLowerCase().replace(/\s+/g, '-')}`,
          marketName: `${lgaKey} Markets`,
          location: `Oyo State - ${lgaKey}`,
          commodities: []
        });
      }
      
      const marketGroup = marketMap.get(lgaKey);
      marketGroup.commodities.push({
        commodityId: `market-${market.id}`,
        commodityName: market.name,
        price: null,
        unit: 'market',
        dateUpdated: new Date().toISOString(),
        source: 'Iya Oloja API',
        type: 'market',
        lat: market.lat,
        lng: market.lng
      });
    });

    return Array.from(marketMap.values());
  }

  // Sync external data with database
  async syncWithDatabase(): Promise<void> {
    const externalData = await this.getOyoStatePrices();

    for (const market of externalData) {
      let existingMarket = await api.getMarketById(market.marketId);
      if (!existingMarket) {
        await api.addMarket({
          name: market.marketName,
          location: market.location
        });
      }

      for (const commodity of market.commodities) {
        if (commodity.type !== 'market') {
          console.log(`Syncing ${commodity.commodityName} at ${market.marketName}: ₦${commodity.price}`);
        }
      }
    }
  }
}

export const nigerianMarketsAPI = NigerianMarketAPI.getInstance();
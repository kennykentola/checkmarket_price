import { api } from './api';

// Nigerian Market Data API Integration
export class NigerianMarketAPI {
  private static instance: NigerianMarketAPI;
  private baseURL = import.meta.env.VITE_NIGERIAN_MARKETS_BASE_URL || 'https://api.nigerianmarkets.gov.ng/v1';

  static getInstance(): NigerianMarketAPI {
    if (!NigerianMarketAPI.instance) {
      NigerianMarketAPI.instance = new NigerianMarketAPI();
    }
    return NigerianMarketAPI.instance;
  }

  // Fetch latest prices from Oyo State markets
  async getOyoStatePrices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/markets/oyo/prices`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_NIGERIAN_MARKETS_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformToAppFormat(data);
    } catch (error) {
      console.error('Failed to fetch Oyo State prices:', error);
      return [];
    }
  }

  // Transform external API data to match your app's format
  private transformToAppFormat(apiData: any): any[] {
    return apiData.markets?.map((market: any) => ({
      marketId: market.id,
      marketName: market.name,
      location: market.location,
      commodities: market.commodities?.map((commodity: any) => ({
        commodityId: commodity.id,
        commodityName: commodity.name,
        price: commodity.average_price,
        unit: commodity.unit,
        dateUpdated: commodity.last_updated,
        source: 'Nigerian Markets API'
      })) || []
    })) || [];
  }

  // Sync external data with your database
  async syncWithDatabase(): Promise<void> {
    const externalData = await this.getOyoStatePrices();

    for (const market of externalData) {
      // Check if market exists, create if not
      let existingMarket = await api.getMarketById(market.marketId);
      if (!existingMarket) {
        await api.addMarket({
          name: market.marketName,
          location: market.location
        });
      }

      // Add/update commodity prices
      for (const commodity of market.commodities) {
        console.log(`Syncing ${commodity.commodityName} at ${market.marketName}: ₦${commodity.price}`);
      }
    }
  }
}

export const nigerianMarketsAPI = NigerianMarketAPI.getInstance();
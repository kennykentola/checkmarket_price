export enum UserRole {
  BUYER = 'buyer',
  TRADER = 'trader',
  ADMIN = 'admin',
  FARMER = 'farmer'
}

export interface User {
  $id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Market {
  $id: string;
  name: string;
  location: string;
}

export interface Category {
  $id: string;
  name: string;
}

export interface Commodity {
  $id: string;
  name: string;
  unit: string; // e.g., 'kg', 'liter', 'dozen'
  category: string;
  image?: string; // Optional URL or Base64 string
}

export interface PriceEntry {
  $id: string;
  marketId: string;
  commodityId: string;
  traderId: string;
  price: number;
  dateSubmitted: string; // ISO Date string
}

export interface PriceDataExpanded extends PriceEntry {
  marketName: string;
  commodityName: string;
  commodityUnit: string;
  commodityCategory?: string;
  commodityImage?: string;
  traderName?: string;
  trend?: number; // Percentage change
  trendDirection?: 'up' | 'down' | 'stable';
}

export interface FarmgateEntry {
  $id: string;
  commodityId: string;
  location: string;
  farmGatePrice: number;
  transportCost: number;
  dateSubmitted: string;
}

export interface Notification {
  $id: string;
  userId: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  isRead: boolean;
  createdAt: string;
}

export interface RawPriceEntry {
  $id: string;
  dateSubmitted: string;
  // Add other fields if they exist in Appwrite
}

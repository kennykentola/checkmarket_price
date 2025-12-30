import { Client, Databases, Account } from 'appwrite';

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || 'marketprice');

export const databases = new Databases(client);
export const account = new Account(client);
export { client };

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'marketprice';
export const COLLECTION_MARKETS = 'markets';
export const COLLECTION_COMMODITIES = 'commodities';
export const COLLECTION_PRICES = 'prices';
export const COLLECTION_CATEGORIES = 'categories';
export const COLLECTION_USERS = 'users';
export const COLLECTION_NOTIFICATIONS = 'notifications';
export const COLLECTION_FARMGATE_PRICES = 'farmgate_prices';

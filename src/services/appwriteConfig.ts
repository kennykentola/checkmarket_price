import { Client, Databases, Account } from 'appwrite';

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || 'marketprice');

export const databases = new Databases(client);
export const account = new Account(client);
export { client };

// Read all configuration from environment variables
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'marketprice';
export const COLLECTION_MARKETS = import.meta.env.VITE_COLLECTION_MARKETS || '695be60d000e0236d6ef';
export const COLLECTION_COMMODITIES = import.meta.env.VITE_COLLECTION_COMMODITIES || '695be6100001998c482f';
export const COLLECTION_PRICES = import.meta.env.VITE_COLLECTION_PRICES || '695be614002c557c07d8';
export const COLLECTION_CATEGORIES = import.meta.env.VITE_COLLECTION_CATEGORIES || '695be618003dff1fb8b1';
export const COLLECTION_USERS = import.meta.env.VITE_COLLECTION_USERS || '695be61b0010d1f27655';
export const COLLECTION_NOTIFICATIONS = import.meta.env.VITE_COLLECTION_NOTIFICATIONS || '695be61f0033df16b47d';
export const COLLECTION_FARMGATE_PRICES = import.meta.env.VITE_COLLECTION_FARMGATE_PRICES || '695be6240017b11b0669';

import { Client, Account, Databases } from 'appwrite';

// NOTE: In a real deployment, replace these with process.env.VITE_APPWRITE_...
export const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = 'your-project-id'; 
export const DATABASE_ID = 'market_db';
export const COLLECTION_MARKETS = 'markets';
export const COLLECTION_COMMODITIES = 'commodities';
export const COLLECTION_PRICES = 'prices';

const client = new Client();

// Only configure if we have a real project ID to avoid errors in demo mode
if (APPWRITE_PROJECT_ID !== 'your-project-id') {
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);
}

export const account = new Account(client);
export const databases = new Databases(client);

export default client;
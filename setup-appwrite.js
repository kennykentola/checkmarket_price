import { Client, Databases, ID } from 'node-appwrite';
import 'dotenv/config';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY;
console.log('API Key loaded:', !!process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = 'marketprice';

// Collection IDs that match the frontend code in src/services/appwriteConfig.ts
const COLLECTION_IDS = {
  markets: '695be60d000e0236d6ef',
  commodities: '695be6100001998c482f',
  prices: '695be614002c557c07d8',
  categories: '695be618003dff1fb8b1',
  users: '695be61b0010d1f27655',
  notifications: '695be61f0033df16b47d',
  farmgate_prices: '695be6240017b11b0669'
};

async function setupDatabase() {
  try {
    console.log('Setting up Appwrite database...');

    // Create collections with specific IDs
    await createCollection('markets', COLLECTION_IDS.markets, [
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'location', type: 'string', required: true, size: 255 },
      { key: 'image', type: 'string', required: false, size: 1000000 }
    ]);

    await createCollection('commodities', COLLECTION_IDS.commodities, [
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'unit', type: 'string', required: true, size: 255 },
      { key: 'category', type: 'string', required: true, size: 255 },
      { key: 'image', type: 'string', required: false, size: 1000000 }
    ]);

    await createCollection('prices', COLLECTION_IDS.prices, [
      { key: 'commodityId', type: 'string', required: true },
      { key: 'marketId', type: 'string', required: true },
      { key: 'price', type: 'number', required: true },
      { key: 'traderId', type: 'string', required: true },
      { key: 'dateSubmitted', type: 'string', required: true }
    ]);

    await createCollection('categories', COLLECTION_IDS.categories, [
      { key: 'name', type: 'string', required: true, size: 255 }
    ]);

    await createCollection('users', COLLECTION_IDS.users, [
      { key: 'username', type: 'string', required: true, size: 255 },
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'email', type: 'string', required: true, size: 255 },
      { key: 'role', type: 'string', required: true, size: 50 },
      { key: 'passwordHash', type: 'string', required: false, size: 255 },
      { key: 'createdAt', type: 'string', required: false, size: 100 }
    ]);

    await createCollection('notifications', COLLECTION_IDS.notifications, [
      { key: 'userId', type: 'string', required: true },
      { key: 'message', type: 'string', required: true, size: 1000 },
      { key: 'type', type: 'string', required: true, size: 50 },
      { key: 'read', type: 'boolean', required: false, default: false },
      { key: 'createdAt', type: 'string', required: true, size: 100 }
    ]);

    await createCollection('farmgate_prices', COLLECTION_IDS.farmgate_prices, [
      { key: 'commodityId', type: 'string', required: true },
      { key: 'price', type: 'number', required: true },
      { key: 'farmerId', type: 'string', required: true },
      { key: 'location', type: 'string', required: true, size: 255 },
      { key: 'dateSubmitted', type: 'string', required: true }
    ]);

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

async function createCollection(name, collectionId, attributes) {
  try {
    // Try to get existing collection first
    try {
      const existing = await databases.getCollection(databaseId, collectionId);
      console.log(`Collection already exists: ${name} (${collectionId})`);
    } catch {
      // Collection doesn't exist, create it
      const collection = await databases.createCollection(databaseId, collectionId, name);
      console.log(`Created collection: ${name} (${collectionId})`);
    }

    // Add attributes
    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(databaseId, collectionId, attr.key, attr.size || 255, attr.required, attr.default || undefined);
        } else if (attr.type === 'number') {
          await databases.createFloatAttribute(databaseId, collectionId, attr.key, attr.required);
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(databaseId, collectionId, attr.key, attr.required, attr.default || false);
        }
        console.log(`  Added attribute: ${attr.key}`);
      } catch (error) {
        if (error.code === 400 && error.message.includes('already exists')) {
          console.log(`  Attribute already exists: ${attr.key}`);
        } else {
          console.log(`  Error adding attribute ${attr.key}:`, error.message);
        }
      }
    }

  } catch (error) {
    console.error(`Error with collection ${name}:`, error.message);
  }
}

setupDatabase();

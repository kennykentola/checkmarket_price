import { Client, Databases, ID } from 'appwrite';
import 'dotenv/config';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY; // API key from env
console.log('API Key loaded:', !!process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = 'marketprice';

async function setupDatabase() {
  try {
    console.log('Setting up Appwrite database...');

    // Create collections
    await createCollection('markets', [
      { key: 'name', type: 'string', required: true },
      { key: 'location', type: 'string', required: true }
    ]);

    await createCollection('commodities', [
      { key: 'name', type: 'string', required: true },
      { key: 'unit', type: 'string', required: true },
      { key: 'category', type: 'string', required: true },
      { key: 'image', type: 'string', required: false }
    ]);

    await createCollection('prices', [
      { key: 'commodityId', type: 'string', required: true },
      { key: 'marketId', type: 'string', required: true },
      { key: 'price', type: 'number', required: true },
      { key: 'traderId', type: 'string', required: true },
      { key: 'dateSubmitted', type: 'string', required: true }
    ]);

    await createCollection('categories', [
      { key: 'name', type: 'string', required: true }
    ]);

    await createCollection('users', [
      { key: 'username', type: 'string', required: true },
      { key: 'name', type: 'string', required: true },
      { key: 'email', type: 'string', required: true },
      { key: 'role', type: 'string', required: true }
    ]);

    await createCollection('notifications', [
      { key: 'userId', type: 'string', required: true },
      { key: 'message', type: 'string', required: true },
      { key: 'type', type: 'string', required: true },
      { key: 'read', type: 'boolean', required: false, default: false },
      { key: 'createdAt', type: 'string', required: true }
    ]);

    await createCollection('farmgate_prices', [
      { key: 'commodityId', type: 'string', required: true },
      { key: 'price', type: 'number', required: true },
      { key: 'farmerId', type: 'string', required: true },
      { key: 'location', type: 'string', required: true },
      { key: 'dateSubmitted', type: 'string', required: true }
    ]);

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

async function createCollection(name, attributes) {
  try {
    const collection = await databases.createCollection(databaseId, ID.unique(), name);
    console.log(`Created collection: ${name}`);

    // Add attributes
    for (const attr of attributes) {
      if (attr.type === 'string') {
        await databases.createStringAttribute(databaseId, collection.$id, attr.key, attr.required ? 1 : 0, attr.required ? 255 : 0, attr.default || undefined);
      } else if (attr.type === 'number') {
        await databases.createFloatAttribute(databaseId, collection.$id, attr.key, attr.required);
      } else if (attr.type === 'boolean') {
        await databases.createBooleanAttribute(databaseId, collection.$id, attr.key, attr.required, attr.default || false);
      }
      console.log(`Added attribute: ${attr.key} to ${name}`);
    }
  } catch (error) {
    console.error(`Error creating collection ${name}:`, error);
  }
}

setupDatabase();

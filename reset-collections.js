import { Client, Databases, ID } from 'node-appwrite';
import 'dotenv/config';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY;

const databases = new Databases(client);
const databaseId = 'marketprice';

async function resetCollections() {
  try {
    console.log('Resetting collections...');

    // List all collections
    const collections = await databases.listCollections(databaseId);
    console.log('Found collections:', collections.collections.map(c => c.name));

    // Delete all collections
    for (const collection of collections.collections) {
      try {
        await databases.deleteCollection(databaseId, collection.$id);
        console.log(`Deleted collection: ${collection.name}`);
      } catch (error) {
        console.error(`Error deleting ${collection.name}:`, error.message);
      }
    }

    console.log('All collections deleted. Recreating...');

    // Recreate collections with correct attributes and store IDs
    const collectionIds = {};

    collectionIds.markets = await createCollection('markets', [
      { key: 'name', type: 'string', required: true },
      { key: 'location', type: 'string', required: true }
    ]);

    collectionIds.commodities = await createCollection('commodities', [
      { key: 'name', type: 'string', required: true, size: 255 },
      { key: 'unit', type: 'string', required: true, size: 255 },
      { key: 'category', type: 'string', required: true, size: 255 },
      { key: 'image', type: 'string', required: false, size: 1000000 }
    ]);

    collectionIds.prices = await createCollection('prices', [
      { key: 'commodityId', type: 'string', required: true },
      { key: 'marketId', type: 'string', required: true },
      { key: 'price', type: 'number', required: true },
      { key: 'traderId', type: 'string', required: true },
      { key: 'dateSubmitted', type: 'string', required: true }
    ]);

    collectionIds.categories = await createCollection('categories', [
      { key: 'name', type: 'string', required: true }
    ]);

    collectionIds.users = await createCollection('users', [
      { key: 'username', type: 'string', required: true },
      { key: 'name', type: 'string', required: true },
      { key: 'email', type: 'string', required: true },
      { key: 'role', type: 'string', required: true }
    ]);

    collectionIds.notifications = await createCollection('notifications', [
      { key: 'userId', type: 'string', required: true },
      { key: 'message', type: 'string', required: true },
      { key: 'type', type: 'string', required: true },
      { key: 'read', type: 'boolean', required: false, default: false },
      { key: 'createdAt', type: 'string', required: true }
    ]);

    collectionIds.farmgate_prices = await createCollection('farmgate_prices', [
      { key: 'commodityId', type: 'string', required: true },
      { key: 'price', type: 'number', required: true },
      { key: 'farmerId', type: 'string', required: true },
      { key: 'location', type: 'string', required: true },
      { key: 'dateSubmitted', type: 'string', required: true }
    ]);

    console.log('Collections reset complete!');
    console.log('Collection IDs:', collectionIds);

    // Write collection IDs to a file for reference
    const fs = await import('fs');
    fs.writeFileSync('collection-ids.json', JSON.stringify(collectionIds, null, 2));
    console.log('Collection IDs saved to collection-ids.json');

  } catch (error) {
    console.error('Error:', error);
  }
}

async function createCollection(name, attributes) {
  try {
    const collection = await databases.createCollection(databaseId, ID.unique(), name);
    console.log(`Created collection: ${name} (ID: ${collection.$id})`);

    // Add attributes
    for (const attr of attributes) {
      if (attr.type === 'string') {
        await databases.createStringAttribute(databaseId, collection.$id, attr.key, attr.size || (attr.required ? 255 : 1000000), attr.required, attr.default || undefined);
      } else if (attr.type === 'number') {
        await databases.createFloatAttribute(databaseId, collection.$id, attr.key, attr.required);
      } else if (attr.type === 'boolean') {
        await databases.createBooleanAttribute(databaseId, collection.$id, attr.key, attr.required, attr.default || false);
      }
      console.log(`Added attribute: ${attr.key} to ${name}`);
    }

    return collection.$id;
  } catch (error) {
    console.error(`Error creating collection ${name}:`, error);
    return null;
  }
}

resetCollections();

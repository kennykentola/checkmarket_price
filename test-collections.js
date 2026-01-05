import { Client, Databases, ID } from 'node-appwrite';
import 'dotenv/config';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY;

const databases = new Databases(client);
const databaseId = 'marketprice';

const COLLECTION_IDS = {
  markets: '695be60d000e0236d6ef',
  commodities: '695be6100001998c482f',
  prices: '695be614002c557c07d8',
  categories: '695be618003dff1fb8b1',
  users: '695be61b0010d1f27655',
  notifications: '695be61f0033df16b47d',
  farmgate_prices: '695be6240017b11b0669'
};

async function testAndSetup() {
  try {
    console.log('Testing collections...\n');

    // Test each collection
    const collections = ['markets', 'commodities', 'prices', 'categories', 'users', 'notifications', 'farmgate_prices'];
    
    for (const name of collections) {
      try {
        const collection = await databases.getCollection(databaseId, COLLECTION_IDS[name]);
        console.log(`✓ ${name} collection exists (${COLLECTION_IDS[name]})`);
      } catch (error) {
        console.log(`✗ ${name} collection NOT found: ${error.message}`);
      }
    }

    // List all documents in users collection
    console.log('\n--- Users Collection Documents ---');
    try {
      const users = await databases.listDocuments(databaseId, COLLECTION_IDS.users);
      console.log(`Found ${users.documents.length} users`);
      users.documents.forEach(doc => {
        console.log(`  - ${doc.name} (${doc.email}) - Role: ${doc.role}`);
      });
    } catch (error) {
      console.log('Error listing users:', error.message);
    }

    // List all documents in markets collection
    console.log('\n--- Markets Collection Documents ---');
    try {
      const markets = await databases.listDocuments(databaseId, COLLECTION_IDS.markets);
      console.log(`Found ${markets.documents.length} markets`);
      markets.documents.slice(0, 5).forEach(doc => {
        console.log(`  - ${doc.name} (${doc.location})`);
      });
      if (markets.documents.length > 5) {
        console.log(`  ... and ${markets.documents.length - 5} more`);
      }
    } catch (error) {
      console.log('Error listing markets:', error.message);
    }

    // List all documents in commodities collection
    console.log('\n--- Commodities Collection Documents ---');
    try {
      const commodities = await databases.listDocuments(databaseId, COLLECTION_IDS.commodities);
      console.log(`Found ${commodities.documents.length} commodities`);
      commodities.documents.slice(0, 10).forEach(doc => {
        console.log(`  - ${doc.name} (${doc.unit}) - ${doc.category}`);
      });
      if (commodities.documents.length > 10) {
        console.log(`  ... and ${commodities.documents.length - 10} more`);
      }
    } catch (error) {
      console.log('Error listing commodities:', error.message);
    }

    // List all documents in prices collection
    console.log('\n--- Prices Collection Documents ---');
    try {
      const prices = await databases.listDocuments(databaseId, COLLECTION_IDS.prices);
      console.log(`Found ${prices.documents.length} prices`);
      prices.documents.slice(0, 5).forEach(doc => {
        console.log(`  - Commodity: ${doc.commodityId}, Market: ${doc.marketId}, Price: ${doc.price}`);
      });
      if (prices.documents.length > 5) {
        console.log(`  ... and ${prices.documents.length - 5} more`);
      }
    } catch (error) {
      console.log('Error listing prices:', error.message);
    }

    console.log('\n--- Test Complete ---');

  } catch (error) {
    console.error('Error:', error);
  }
}

testAndSetup();

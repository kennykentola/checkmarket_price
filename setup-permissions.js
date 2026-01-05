import { Client, Databases } from 'node-appwrite';
import 'dotenv/config';

// Initialize Appwrite client with API key (admin privileges)
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY;

const databases = new Databases(client);
const databaseId = 'marketprice';

// Collection IDs
const COLLECTIONS = {
  markets: '695be60d000e0236d6ef',
  commodities: '695be6100001998c482f',
  prices: '695be614002c557c07d8',
  categories: '695be618003dff1fb8b1',
  users: '695be61b0010d1f27655',
  notifications: '695be61f0033df16b47d',
  farmgate_prices: '695be6240017b11b0669'
};

async function setupPermissions() {
  try {
    console.log('Setting up Appwrite permissions...\n');

    for (const [collectionName, collectionId] of Object.entries(COLLECTIONS)) {
      try {
        // Get the current collection
        const collection = await databases.getCollection(databaseId, collectionId);
        console.log(`✓ ${collectionName}: found, current permissions: ${JSON.stringify(collection.$permissions)}`);
        
        // Enable document security for this collection by updating with null/empty permissions
        // The SDK will merge with existing permissions
        const updated = await databases.updateCollection(
          databaseId,
          collectionId,
          collection.name,
          1000, // limit
          ['role:member'], // read permission
          ['role:admin']   // write permission
        );
        
        console.log(`✓ ${collectionName}: updated with default permissions`);
      } catch (error) {
        console.log(`✗ Error with ${collectionName}:`, error.message);
      }
    }

    console.log('\n--- Permissions Setup Complete ---');
    console.log('\nTo configure permissions manually in Appwrite Console:');
    console.log('1. Go to https://cloud.appwrite.io/console');
    console.log('2. Navigate to Databases > marketprice');
    console.log('3. Click on each collection and configure permissions');
    console.log('4. For "Read Permissions": role:member (all authenticated users)');
    console.log('5. For "Write Permissions": role:admin, role:trader as needed');
    
  } catch (error) {
    console.error('Error setting up permissions:', error);
  }
}

setupPermissions();

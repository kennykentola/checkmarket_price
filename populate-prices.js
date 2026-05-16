
import { Client, Databases, ID, Query } from 'node-appwrite';
import 'dotenv/config';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketcheck-v2');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY;

const databases = new Databases(client);
const databaseId = 'marketprice';

const COLLECTION_IDS = {
  markets: '695be60d000e0236d6ef',
  commodities: '695be6100001998c482f',
  prices: '695be614002c557c07d8'
};

async function populatePrices() {
  try {
    console.log('Fetching markets and commodities...');
    const markets = await databases.listDocuments(databaseId, COLLECTION_IDS.markets);
    const commodities = await databases.listDocuments(databaseId, COLLECTION_IDS.commodities);

    console.log(`Found ${markets.documents.length} markets and ${commodities.documents.length} commodities.`);
    console.log('Generating sample price history...');

    const traderId = 'system-bot';
    let count = 0;

    for (const commodity of commodities.documents) {
      // Pick 3 random markets for each commodity
      const shuffledMarkets = markets.documents.sort(() => 0.5 - Math.random());
      const selectedMarkets = shuffledMarkets.slice(0, 3);

      for (const market of selectedMarkets) {
        // Base price between 1000 and 50000
        const basePrice = Math.floor(Math.random() * 49000) + 1000;
        
        // Create 5 historical entries for each pair to show trends
        for (let i = 0; i < 5; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (i * 2)); // Every 2 days
          
          // Add some random variation
          const variation = (Math.random() * 0.2) - 0.1; // +/- 10%
          const priceValue = Math.floor(basePrice * (1 + (variation * (5 - i))));

          const priceEntry = {
            commodityId: commodity.$id,
            marketId: market.$id,
            price: priceValue,
            traderId: traderId,
            dateSubmitted: date.toISOString()
          };

          await databases.createDocument(databaseId, COLLECTION_IDS.prices, ID.unique(), priceEntry);
          count++;
          if (count % 20 === 0) console.log(`Created ${count} price entries...`);
        }
      }
    }

    console.log('===========================================');
    console.log(`Successfully added ${count} price entries!`);
    console.log('Your charts and trends should now be alive.');
    console.log('===========================================');
  } catch (error) {
    console.error('Error populating prices:', error);
  }
}

populatePrices();

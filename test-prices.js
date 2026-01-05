import { Client, Databases } from 'node-appwrite';
import 'dotenv/config';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY;

const databases = new Databases(client);
const databaseId = 'marketprice';

// Collection IDs
const COLLECTION_PRICES = '695be614002c557c07d8';
const COLLECTION_COMMODITIES = '695be6100001998c482f';
const COLLECTION_MARKETS = '695be60d000e0236d6ef';

// Sample prices - we'll get the actual IDs from the database
async function getDocumentIds() {
  const commodities = await databases.listDocuments(databaseId, COLLECTION_COMMODITIES);
  const markets = await databases.listDocuments(databaseId, COLLECTION_MARKETS);
  
  const commodityMap = {};
  commodities.documents.forEach(doc => {
    commodityMap[doc.name] = doc.$id;
  });
  
  const marketMap = {};
  markets.documents.forEach(doc => {
    marketMap[doc.name] = doc.$id;
  });
  
  return { commodityMap, marketMap };
}

async function populatePrices() {
  try {
    console.log('Getting document IDs...');
    const { commodityMap, marketMap } = await getDocumentIds();
    
    console.log('Commodities:', Object.keys(commodityMap));
    console.log('Markets:', Object.keys(marketMap));
    
    // Sample prices
    const samplePrices = [
      // Rice prices across markets
      { commodity: 'Rice (Local)', market: 'Bodija Market', price: 28000, traderId: '6945f4a830cefee56729' },
      { commodity: 'Rice (Local)', market: 'Oja-Oba', price: 28500, traderId: '6945f4a830cefee56729' },
      { commodity: 'Rice (Foreign)', market: 'Bodija Market', price: 35000, traderId: '69460a160032fa53c64e' },
      { commodity: 'Rice (Foreign)', market: 'Dugbe Market', price: 34500, traderId: '69460a160032fa53c64e' },
      
      // Garri prices
      { commodity: 'Garri (White)', market: 'Bodija Market', price: 12000, traderId: '69539742cf4bca107f02' },
      { commodity: 'Garri (Yellow)', market: 'Oja-Oba', price: 13000, traderId: '69539742cf4bca107f02' },
      
      // Beans
      { commodity: 'Beans (Oloyin)', market: 'Bodija Market', price: 18000, traderId: '6945f4a830cefee56729' },
      
      // Yam
      { commodity: 'Yam (Puna)', market: 'Oja-Oba', price: 3500, traderId: '69460a160032fa53c64e' },
      { commodity: 'Yam (Puna)', market: 'Dugbe Market', price: 3800, traderId: '69460a160032fa53c64e' },
      
      // Tomatoes
      { commodity: 'Tomatoes', market: 'Bodija Market', price: 1500, traderId: '69539742cf4bca107f02' },
      { commodity: 'Tomatoes', market: 'Oja-Oba', price: 1400, traderId: '69539742cf4bca107f02' },
      
      // Palm Oil
      { commodity: 'Palm Oil', market: 'Bodija Market', price: 18000, traderId: '6945f4a830cefee56729' },
      
      // Onions
      { commodity: 'Onions (Red)', market: 'Dugbe Market', price: 8000, traderId: '69460a160032fa53c64e' },
      
      // Pepper
      { commodity: 'Pepper (Rodo)', market: 'Bodija Market', price: 2000, traderId: '69539742cf4bca107f02' },
      
      // Eggs
      { commodity: 'Eggs', market: 'Oja-Oba', price: 1800, traderId: '6945f4a830cefee56729' },
      
      // Chicken
      { commodity: 'Chicken (Frozen)', market: 'Bodija Market', price: 3500, traderId: '69460a160032fa53c64e' },
    ];
    
    console.log('\nAdding sample prices...');
    for (const price of samplePrices) {
      const commodityId = commodityMap[price.commodity];
      const marketId = marketMap[price.market];
      
      if (commodityId && marketId) {
        await databases.createDocument(databaseId, COLLECTION_PRICES, 'unique()', {
          commodityId: commodityId,
          marketId: marketId,
          price: price.price,
          traderId: price.traderId,
          dateSubmitted: new Date().toISOString()
        });
        console.log(`  Added ${price.commodity} at ${price.market}: ₦${price.price}`);
      } else {
        console.log(`  Skipped ${price.commodity}: commodityId=${!!commodityId}, marketId=${!!marketId}`);
      }
    }
    
    console.log('\nPrices populated successfully!');
  } catch (error) {
    console.error('Error populating prices:', error);
  }
}

populatePrices();

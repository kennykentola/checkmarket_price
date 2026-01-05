import { Client, Databases, ID } from 'node-appwrite';
import 'dotenv/config';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY;

const databases = new Databases(client);
const databaseId = 'marketprice';

async function testMarketCommodityCreation() {
  try {
    console.log('Testing market and commodity creation...');

    // Test creating a market
    const market = await databases.createDocument(databaseId, 'markets', ID.unique(), {
      name: 'Ojoo Market',
      location: 'Ojoo Ibadan'
    });
    console.log('✅ Created market:', market.name, 'at', market.location);

    // Test creating commodities
    const rice = await databases.createDocument(databaseId, 'commodities', ID.unique(), {
      name: 'Rice',
      unit: 'kg',
      category: 'Grains'
    });
    console.log('✅ Created commodity:', rice.name, 'unit:', rice.unit);

    const peakMilk = await databases.createDocument(databaseId, 'commodities', ID.unique(), {
      name: 'Peak Milk',
      unit: 'carton',
      category: 'Dairy'
    });
    console.log('✅ Created commodity:', peakMilk.name, 'unit:', peakMilk.unit);

    console.log('\n🎉 All tests passed! Market and commodity creation working correctly.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testMarketCommodityCreation();

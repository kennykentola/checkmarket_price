import { Client, Databases } from 'node-appwrite';
import 'dotenv/config';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY;

const databases = new Databases(client);
const databaseId = 'marketprice';

// Updated to use actual collection IDs
const COLLECTION_IDS = {
  markets: '695be60d000e0236d6ef',
  commodities: '695be6100001998c482f',
  prices: '695be614002c557c07d8',
  categories: '695be618003dff1fb8b1',
  users: '695be61b0010d1f27655',
  notifications: '695be61f0033df16b47d',
  farmgate_prices: '695be6240017b11b0669'
};

const marketNames = [
  'Bodija Market', 'Oja-Oba', 'Dugbe Market', 'Agodi Gate Market', 'Oje Market',
  'Aleshinloye Market', 'Apata Market', 'Sango Market', 'Eleyele Market', 'Mokola Market',
  'Gbagi Market', 'Beere Market', 'Ojoo Market', 'Iwo Road Market', 'Olomi Market',
  'Challenge Market', 'Orita Challenge Mini Market', 'New Garage Market', 'Ojaba Market',
  'Gate Spare Parts Market', 'Agbeni Market', 'Ogunpa Market', 'Iyaganku Market',
  'Akobo Market', 'Orita Merin Market', 'Molete Market', 'Omi-Adio Market', 'Ogbere Market',
  'Aesan Market', 'Sabo Market'
];

const markets = marketNames.map((name) => ({
  name: name,
  location: 'Ibadan'
}));

const now = new Date().toISOString();
const categories = [
  { name: 'Grains' },
  { name: 'Tubers' },
  { name: 'Vegetables' },
  { name: 'Oils' },
  { name: 'Meat' },
  { name: 'Seafood' },
  { name: 'Dairy' },
  { name: 'Spices' },
  { name: 'Processed' },
  { name: 'Fruits' },
  { name: 'Other' },
  { name: 'Clothing & Textiles' },
  { name: 'Home Appliances' },
  { name: 'Furniture' }
];

const commodities = [
  // Grains & Flours
  { name: 'Rice (Local)', unit: '50kg Bag', category: 'Grains' },
  { name: 'Rice (Foreign)', unit: '50kg Bag', category: 'Grains' },
  { name: 'Beans (Oloyin)', unit: 'Derica', category: 'Grains' },
  { name: 'Garri (White)', unit: 'Paint Bucket', category: 'Grains' },
  { name: 'Garri (Yellow)', unit: 'Paint Bucket', category: 'Grains' },
  { name: 'Semovita', unit: '10kg', category: 'Grains' },
  { name: 'Spaghetti', unit: 'Carton', category: 'Grains' },

  // Tubers
  { name: 'Yam (Puna)', unit: 'Tuber', category: 'Tubers' },
  { name: 'Sweet Potato', unit: 'Basket', category: 'Tubers' },
  { name: 'Irish Potato', unit: 'Basket', category: 'Tubers' },

  // Vegetables
  { name: 'Tomatoes', unit: 'Basket', category: 'Vegetables' },
  { name: 'Pepper (Rodo)', unit: 'Basket', category: 'Vegetables' },
  { name: 'Onions (Red)', unit: 'Bag', category: 'Vegetables' },
  { name: 'Okra', unit: 'Basket', category: 'Vegetables' },

  // Oils
  { name: 'Palm Oil', unit: '25L Keg', category: 'Oils' },
  { name: 'Vegetable Oil', unit: '5L', category: 'Oils' },

  // Proteins
  { name: 'Chicken (Frozen)', unit: 'kg', category: 'Meat' },
  { name: 'Chicken (Live)', unit: 'Bird', category: 'Meat' },
  { name: 'Beef', unit: 'kg', category: 'Meat' },
  { name: 'Goat Meat', unit: 'kg', category: 'Meat' },
  { name: 'Titus Fish', unit: 'kg', category: 'Seafood' },
  { name: 'Catfish (Dried)', unit: 'kg', category: 'Seafood' },
  { name: 'Crayfish', unit: 'Paint Bucket', category: 'Seafood' },
  { name: 'Eggs', unit: 'Crate', category: 'Dairy' },

  // Spices & Others
  { name: 'Egusi (Peeled)', unit: 'Derica', category: 'Spices' },
  { name: 'Ogbono', unit: 'Derica', category: 'Spices' },
  { name: 'Maggi Star', unit: 'Pack', category: 'Spices' },
  { name: 'Indomie', unit: 'Carton', category: 'Processed' },
  { name: 'Sugar (St Louis)', unit: 'Packet', category: 'Processed' },
  { name: 'Peak Milk', unit: 'Tin', category: 'Dairy' },

  // New Categories for specific markets
  { name: 'Ankara Fabric (6 Yards)', unit: 'Piece', category: 'Clothing & Textiles' },
  { name: 'Lace Material (5 Yards)', unit: 'Bundle', category: 'Clothing & Textiles' },
  { name: "Men's Shirt (Local)", unit: 'Piece', category: 'Clothing & Textiles' },
  { name: 'Standing Fan (18")', unit: 'Unit', category: 'Home Appliances' },
  { name: 'Electric Blender', unit: 'Unit', category: 'Home Appliances' },
  { name: 'Plastic Chair', unit: 'Piece', category: 'Furniture' },
  { name: 'Wooden Stool', unit: 'Piece', category: 'Furniture' },
  { name: 'Mattress (Double)', unit: 'Unit', category: 'Furniture' },
];

async function populateDatabase() {
  try {
    console.log('Populating Appwrite database...');

    // Populate markets
    console.log('Adding markets...');
    for (const market of markets) {
      await databases.createDocument(databaseId, COLLECTION_IDS.markets, 'unique()', market);
    }
    console.log(`Added ${markets.length} markets`);

    // Populate categories
    console.log('Adding categories...');
    for (const category of categories) {
      await databases.createDocument(databaseId, COLLECTION_IDS.categories, 'unique()', category);
    }
    console.log(`Added ${categories.length} categories`);

    // Populate commodities
    console.log('Adding commodities...');
    for (const commodity of commodities) {
      await databases.createDocument(databaseId, COLLECTION_IDS.commodities, 'unique()', commodity);
    }
    console.log(`Added ${commodities.length} commodities`);

    console.log('Database populated successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

populateDatabase();

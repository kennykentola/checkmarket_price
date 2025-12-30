import { Client, Databases } from 'appwrite';
import 'dotenv/config';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY; // API key from env

const databases = new Databases(client);
const databaseId = 'marketprice';

// Updated to match your actual collection attributes
const marketNames = [
  'Bodija Market', 'Oja-Oba', 'Dugbe Market', 'Agodi Gate Market', 'Oje Market',
  'Aleshinloye Market', 'Apata Market', 'Sango Market', 'Eleyele Market', 'Mokola Market',
  'Gbagi Market', 'Beere Market', 'Ojoo Market', 'Iwo Road Market', 'Olomi Market',
  'Challenge Market', 'Orita Challenge Mini Market', 'New Garage Market', 'Ojaba Market',
  'Gate Spare Parts Market', 'Agbeni Market', 'Ogunpa Market', 'Iyaganku Market',
  'Akobo Market', 'Orita Merin Market', 'Molete Market', 'Omi-Adio Market', 'Ogbere Market',
  'Akesan Market', 'Sabo Market'
];

const locations = [
  ...Array(28).fill('Ibadan'), 'Oyo Town', 'Ogbomoso'
];

const markets = marketNames.map((name, index) => ({
  name: name,
  marketName: name,
  marketType: 'farmers'
}));

const now = new Date().toISOString();
const categories = [
  { name: 'Grains', categoryName: 'Grains', isActive: true, createdAt: now, updatedAt: now },
  { name: 'Tubers', categoryName: 'Tubers', isActive: true, createdAt: now, updatedAt: now },
  { name: 'Vegetables', categoryName: 'Vegetables', isActive: true, createdAt: now, updatedAt: now },
  { name: 'Oils', categoryName: 'Oils', isActive: true, createdAt: now, updatedAt: now },
  { name: 'Meat', categoryName: 'Meat', isActive: true, createdAt: now, updatedAt: now },
  { name: 'Seafood', categoryName: 'Seafood', isActive: true, createdAt: now, updatedAt: now },
  { name: 'Dairy', categoryName: 'Dairy', isActive: true, createdAt: now, updatedAt: now },
  { name: 'Spices', categoryName: 'Spices', isActive: true, createdAt: now, updatedAt: now },
  { name: 'Processed', categoryName: 'Processed', isActive: true, createdAt: now, updatedAt: now },
  { name: 'Fruits', categoryName: 'Fruits', isActive: true, createdAt: now, updatedAt: now },
  { name: 'Other', categoryName: 'Other', isActive: true, createdAt: now, updatedAt: now },
  { name: 'Clothing & Textiles', categoryName: 'Clothing & Textiles', isActive: true, createdAt: now, updatedAt: now },
  { name: 'Home Appliances', categoryName: 'Home Appliances', isActive: true, createdAt: now, updatedAt: now },
  { name: 'Furniture', categoryName: 'Furniture', isActive: true, createdAt: now, updatedAt: now }
];
const commodities = [
  // Grains & Flours
  { name: 'Rice (Local)', commodityName: 'Rice (Local)', unit: '50kg Bag', category: 'Grains' },
  { name: 'Rice (Foreign)', commodityName: 'Rice (Foreign)', unit: '50kg Bag', category: 'Grains' },
  { name: 'Beans (Oloyin)', commodityName: 'Beans (Oloyin)', unit: 'Derica', category: 'Grains' },
  { name: 'Garri (White)', commodityName: 'Garri (White)', unit: 'Paint Bucket', category: 'Grains' },
  { name: 'Garri (Yellow)', commodityName: 'Garri (Yellow)', unit: 'Paint Bucket', category: 'Grains' },
  { name: 'Semovita', commodityName: 'Semovita', unit: '10kg', category: 'Grains' },
  { name: 'Spaghetti', commodityName: 'Spaghetti', unit: 'Carton', category: 'Grains' },

  // Tubers
  { name: 'Yam (Puna)', commodityName: 'Yam (Puna)', unit: 'Tuber', category: 'Tubers' },
  { name: 'Sweet Potato', commodityName: 'Sweet Potato', unit: 'Basket', category: 'Tubers' },
  { name: 'Irish Potato', commodityName: 'Irish Potato', unit: 'Basket', category: 'Tubers' },

  // Vegetables
  { name: 'Tomatoes', commodityName: 'Tomatoes', unit: 'Basket', category: 'Vegetables' },
  { name: 'Pepper (Rodo)', commodityName: 'Pepper (Rodo)', unit: 'Basket', category: 'Vegetables' },
  { name: 'Onions (Red)', commodityName: 'Onions (Red)', unit: 'Bag', category: 'Vegetables' },
  { name: 'Okra', commodityName: 'Okra', unit: 'Basket', category: 'Vegetables' },

  // Oils
  { name: 'Palm Oil', commodityName: 'Palm Oil', unit: '25L Keg', category: 'Oils' },
  { name: 'Vegetable Oil', commodityName: 'Vegetable Oil', unit: '5L', category: 'Oils' },

  // Proteins
  { name: 'Chicken (Frozen)', commodityName: 'Chicken (Frozen)', unit: 'kg', category: 'Meat' },
  { name: 'Chicken (Live)', commodityName: 'Chicken (Live)', unit: 'Bird', category: 'Meat' },
  { name: 'Beef', commodityName: 'Beef', unit: 'kg', category: 'Meat' },
  { name: 'Goat Meat', commodityName: 'Goat Meat', unit: 'kg', category: 'Meat' },
  { name: 'Titus Fish', commodityName: 'Titus Fish', unit: 'kg', category: 'Seafood' },
  { name: 'Catfish (Dried)', commodityName: 'Catfish (Dried)', unit: 'kg', category: 'Seafood' },
  { name: 'Crayfish', commodityName: 'Crayfish', unit: 'Paint Bucket', category: 'Seafood' },
  { name: 'Eggs', commodityName: 'Eggs', unit: 'Crate', category: 'Dairy' },

  // Spices & Others
  { name: 'Egusi (Peeled)', commodityName: 'Egusi (Peeled)', unit: 'Derica', category: 'Spices' },
  { name: 'Ogbono', commodityName: 'Ogbono', unit: 'Derica', category: 'Spices' },
  { name: 'Maggi Star', commodityName: 'Maggi Star', unit: 'Pack', category: 'Spices' },
  { name: 'Indomie', commodityName: 'Indomie', unit: 'Carton', category: 'Processed' },
  { name: 'Sugar (St Louis)', commodityName: 'Sugar (St Louis)', unit: 'Packet', category: 'Processed' },
  { name: 'Peak Milk', commodityName: 'Peak Milk', unit: 'Tin', category: 'Dairy' },

  // New Categories for specific markets
  { name: 'Ankara Fabric (6 Yards)', commodityName: 'Ankara Fabric (6 Yards)', unit: 'Piece', category: 'Clothing & Textiles' },
  { name: 'Lace Material (5 Yards)', commodityName: 'Lace Material (5 Yards)', unit: 'Bundle', category: 'Clothing & Textiles' },
  { name: "Men's Shirt (Local)", commodityName: "Men's Shirt (Local)", unit: 'Piece', category: 'Clothing & Textiles' },
  { name: 'Standing Fan (18")', commodityName: 'Standing Fan (18")', unit: 'Unit', category: 'Home Appliances' },
  { name: 'Electric Blender', commodityName: 'Electric Blender', unit: 'Unit', category: 'Home Appliances' },
  { name: 'Plastic Chair', commodityName: 'Plastic Chair', unit: 'Piece', category: 'Furniture' },
  { name: 'Wooden Stool', commodityName: 'Wooden Stool', unit: 'Piece', category: 'Furniture' },
  { name: 'Mattress (Double)', commodityName: 'Mattress (Double)', unit: 'Unit', category: 'Furniture' },
];

async function populateDatabase() {
  try {
    console.log('Populating Appwrite database...');

    // Populate markets
    console.log('Adding markets...');
    for (const market of markets) {
      await databases.createDocument(databaseId, 'markets', 'unique()', market);
    }
    console.log(`Added ${markets.length} markets`);

    // Populate categories
    console.log('Adding categories...');
    for (const category of categories) {
      await databases.createDocument(databaseId, 'categories', 'unique()', category);
    }
    console.log(`Added ${categories.length} categories`);

    // Populate commodities
    console.log('Adding commodities...');
    for (const commodity of commodities) {
      await databases.createDocument(databaseId, 'commodities', 'unique()', commodity);
    }
    console.log(`Added ${commodities.length} commodities`);

    console.log('Database populated successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

populateDatabase();
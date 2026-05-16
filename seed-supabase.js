import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  'Grains', 'Tubers', 'Vegetables', 'Fruits', 'Meat', 'Dairy', 'Oils', 'Seafood', 'Spices', 'Processed'
];

const markets = [
  { name: 'Bodija Market', location: 'Ibadan, Oyo' },
  { name: 'Mile 12 Market', location: 'Ketu, Lagos' },
  { name: 'Dugbe Market', location: 'Ibadan, Oyo' },
  { name: 'Wuse Market', location: 'Abuja, FCT' },
  { name: 'Onitsha Main Market', location: 'Onitsha, Anambra' },
  { name: 'Ariaria International Market', location: 'Aba, Abia' },
  { name: 'Gbagi Market', location: 'Ibadan, Oyo' },
  { name: 'Oja Oba Market', location: 'Ibadan, Oyo' },
  { name: 'Singa Market', location: 'Kano, Kano' },
  { name: 'Oil Mill Market', location: 'Port Harcourt, Rivers' }
];

const commodities = [
  { name: 'Yellow Maize', unit: '100kg Bag', category: 'Grains' },
  { name: 'White Yam', unit: 'Large Tuber', category: 'Tubers' },
  { name: 'Red Palm Oil', unit: '25L Gallon', category: 'Oils' },
  { name: 'Titus Fish', unit: 'Carton', category: 'Seafood' },
  { name: 'Beef', unit: '1kg', category: 'Meat' },
  { name: 'Local Rice', unit: '50kg Bag', category: 'Grains' },
  { name: 'Foreign Rice', unit: '50kg Bag', category: 'Grains' },
  { name: 'Brown Beans', unit: '100kg Bag', category: 'Grains' },
  { name: 'Garri (White)', unit: '80kg Bag', category: 'Tubers' },
  { name: 'Tomato', unit: 'Large Basket', category: 'Vegetables' },
  { name: 'Pepper (Rodo)', unit: 'Small Basket', category: 'Vegetables' },
  { name: 'Onion (Red)', unit: '100kg Bag', category: 'Vegetables' }
];

async function seed() {
  console.log('🚀 Starting Supabase Seeding...');

  // 1. Seed Categories
  console.log('--- Seeding Categories ---');
  const categoryMap = {};
  for (const catName of categories) {
    const { data, error } = await supabase
      .from('categories')
      .upsert({ name: catName }, { onConflict: 'name' })
      .select();
    
    if (error) {
      console.error(`Error seeding category ${catName}:`, error.message);
    } else {
      categoryMap[catName] = data[0].id;
      console.log(`✅ Category added: ${catName}`);
    }
  }

  // 2. Seed Markets
  console.log('\n--- Seeding Markets ---');
  const marketMap = {};
  for (const m of markets) {
    const { data, error } = await supabase
      .from('markets')
      .upsert({ name: m.name, location: m.location }, { onConflict: 'name' })
      .select();
    
    if (error) {
      console.error(`Error seeding market ${m.name}:`, error.message);
    } else {
      marketMap[m.name] = data[0].id;
      console.log(`✅ Market added: ${m.name}`);
    }
  }

  // 3. Seed Commodities
  console.log('\n--- Seeding Commodities ---');
  const commodityMap = {};
  for (const c of commodities) {
    const categoryId = categoryMap[c.category];
    const { data, error } = await supabase
      .from('commodities')
      .upsert({ 
        name: c.name, 
        unit: c.unit, 
        category_id: categoryId 
      }, { onConflict: 'name' })
      .select();
    
    if (error) {
      console.error(`Error seeding commodity ${c.name}:`, error.message);
    } else {
      commodityMap[c.name] = data[0].id;
      console.log(`✅ Commodity added: ${c.name}`);
    }
  }

  // 4. Seed some initial prices
  console.log('\n--- Seeding Sample Prices ---');
  const samplePrices = [];
  const marketIds = Object.values(marketMap);
  const commodityIds = Object.values(commodityMap);

  for (const cId of commodityIds) {
    // Add a price for each commodity in at least 2 random markets
    const randomMarkets = marketIds.sort(() => 0.5 - Math.random()).slice(0, 2);
    for (const mId of randomMarkets) {
      samplePrices.push({
        commodity_id: cId,
        market_id: mId,
        price: Math.floor(Math.random() * (50000 - 2000 + 1)) + 2000,
        date_submitted: new Date().toISOString()
      });
    }
  }

  const { error: priceError } = await supabase
    .from('prices')
    .insert(samplePrices);

  if (priceError) {
    console.error('Error seeding prices:', priceError.message);
  } else {
    console.log(`✅ Successfully seeded ${samplePrices.length} sample prices!`);
  }

  console.log('\n✨ Seeding Complete! Your Supabase database is ready.');
}

seed();

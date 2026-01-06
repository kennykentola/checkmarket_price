import { Client, Databases, Account } from 'appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('6767d8d400134a4ac407');

const databases = new Databases(client);
const account = new Account(client);

const COLLECTION_IDS = {
    users: '695be61b0010d1f27655',
    markets: '695be60d000e0236d6ef',
    commodities: '695be6100001998c482f',
    prices: '695be614002c557c07d8',
    categories: '695be618003dff1fb8b1',
    notifications: '695be61f0033df16b47d',
    farmgate_prices: '695be6240017b11b0669',
};
const DATABASE_ID = 'marketprice';

async function testLogin(email, password) {
    console.log(`\n--- Testing login for ${email} ---`);
    try {
        // First create account (this will fail if user exists)
        try {
            await account.create('unique()', email, password);
            console.log('Account created');
        } catch (e) {
            // User might already exist, that's ok
            if (e.code === 409) {
                console.log('Account already exists, attempting login...');
            } else {
                console.log('Account creation error:', e.message);
            }
        }

        // Now try to login with email/password
        const response = await account.createEmailSession(email, password);
        console.log('Login successful! Session:', response.$id);
        
        // Get current user
        const user = await account.get();
        console.log('User:', user.name, '-', user.email);
        
        // Delete session
        await account.deleteSession('current');
        console.log('Session deleted');
        
        return true;
    } catch (e) {
        console.log('Login failed:', e.message);
        return false;
    }
}

async function testDatabaseQueries() {
    console.log('\n--- Testing Database Queries ---');
    
    // Test users collection
    console.log('Testing users collection...');
    try {
        const users = await databases.listDocuments(DATABASE_ID, COLLECTION_IDS.users);
        console.log(`✓ Users collection: ${users.total} documents found`);
    } catch (e) {
        console.log('✗ Users collection error:', e.message);
    }
    
    // Test markets collection
    console.log('Testing markets collection...');
    try {
        const markets = await databases.listDocuments(DATABASE_ID, COLLECTION_IDS.markets);
        console.log(`✓ Markets collection: ${markets.total} documents found`);
    } catch (e) {
        console.log('✗ Markets collection error:', e.message);
    }
    
    // Test commodities collection
    console.log('Testing commodities collection...');
    try {
        const commodities = await databases.listDocuments(DATABASE_ID, COLLECTION_IDS.commodities);
        console.log(`✓ Commodities collection: ${commodities.total} documents found`);
    } catch (e) {
        console.log('✗ Commodities collection error:', e.message);
    }
    
    // Test prices collection
    console.log('Testing prices collection...');
    try {
        const prices = await databases.listDocuments(DATABASE_ID, COLLECTION_IDS.prices);
        console.log(`✓ Prices collection: ${prices.total} documents found`);
    } catch (e) {
        console.log('✗ Prices collection error:', e.message);
    }
}

async function main() {
    console.log('=== Testing Appwrite Configuration ===');
    
    // Test database queries
    await testDatabaseQueries();
    
    // Test login with different user types
    await testLogin('admin@example.com', 'password123');
    await testLogin('trader@example.com', 'password123');
    await testLogin('buyer@example.com', 'password123');
    
    console.log('\n=== All Tests Complete ===');
}

main().catch(console.error);

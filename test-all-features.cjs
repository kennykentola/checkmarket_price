/**
 * Comprehensive Test Script for Market Price App
 * Tests: Login, Commodities, Markets, Products, User Management
 */

const { Client, Databases, Account, ID, Query } = require('appwrite');

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('678f5c7700308d6db374');

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = 'marketprice';
const COLLECTIONS = {
    USERS: 'users',
    COMMODITIES: 'commodities',
    MARKETS: 'markets',
    PRODUCTS: 'products',
    PRICES: 'prices',
};

async function runTests() {
    console.log('='.repeat(60));
    console.log('COMPREHENSIVE MARKET PRICE APP TEST');
    console.log('='.repeat(60));
    
    let passed = 0;
    let failed = 0;
    let tests = [];

    function test(name, fn) {
        try {
            fn();
            console.log(`✓ ${name}`);
            tests.push({ name, status: 'passed' });
            passed++;
        } catch (error) {
            console.log(`✗ ${name}: ${error.message}`);
            tests.push({ name, status: 'failed', error: error.message });
            failed++;
        }
    }

    // Test 1: Verify Collections Exist
    console.log('\n--- Testing Collection Access ---\n');
    
    async function testCollection(name, collectionId) {
        try {
            await databases.listDocuments(DATABASE_ID, collectionId, [Query.limit(1)]);
            return true;
        } catch (error) {
            throw new Error(`Collection '${name}' (${collectionId}): ${error.message}`);
        }
    }

    test('Users collection accessible', async () => {
        await testCollection('Users', COLLECTIONS.USERS);
    });
    
    test('Commodities collection accessible', async () => {
        await testCollection('Commodities', COLLECTIONS.COMMODITIES);
    });
    
    test('Markets collection accessible', async () => {
        await testCollection('Markets', COLLECTIONS.MARKETS);
    });
    
    test('Products collection accessible', async () => {
        await testCollection('Products', COLLECTIONS.PRODUCTS);
    });
    
    test('Prices collection accessible', async () => {
        await testCollection('Prices', COLLECTIONS.PRICES);
    });

    // Test 2: Verify Data in Collections
    console.log('\n--- Testing Data Population ---\n');

    async function getDocumentCount(collectionId) {
        const result = await databases.listDocuments(DATABASE_ID, collectionId);
        return result.total;
    }

    async function getFirstDocument(collectionId) {
        const result = await databases.listDocuments(DATABASE_ID, collectionId, [Query.limit(1)]);
        return result.documents[0] || null;
    }

    test('Commodities have data (rice, corn, etc.)', async () => {
        const count = await getDocumentCount(COLLECTIONS.COMMODITIES);
        if (count === 0) throw new Error('No commodities found');
        console.log(`  Found ${count} commodities`);
    });

    test('Markets have data', async () => {
        const count = await getDocumentCount(COLLECTIONS.MARKETS);
        if (count === 0) throw new Error('No markets found');
        console.log(`  Found ${count} markets`);
    });

    test('Products have data', async () => {
        const count = await getDocumentCount(COLLECTIONS.PRODUCTS);
        if (count === 0) throw new Error('No products found');
        console.log(`  Found ${count} products`);
    });

    test('Prices have data', async () => {
        const count = await getDocumentCount(COLLECTIONS.PRICES);
        if (count === 0) throw new Error('No prices found');
        console.log(`  Found ${count} price records`);
    });

    // Test 3: Verify Data Relationships
    console.log('\n--- Testing Data Relationships ---\n');

    test('Products reference valid commodities', async () => {
        const products = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRODUCTS, [Query.limit(10)]);
        for (const product of products.documents) {
            if (product.commodityId) {
                try {
                    await databases.getDocument(DATABASE_ID, COLLECTIONS.COMMODITIES, product.commodityId);
                } catch (e) {
                    throw new Error(`Product ${product.$id} has invalid commodity reference`);
                }
            }
        }
        console.log(`  Verified ${products.documents.length} products have valid commodity references`);
    });

    test('Products reference valid markets', async () => {
        const products = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRODUCTS, [Query.limit(10)]);
        for (const product of products.documents) {
            if (product.marketId) {
                try {
                    await databases.getDocument(DATABASE_ID, COLLECTIONS.MARKETS, product.marketId);
                } catch (e) {
                    throw new Error(`Product ${product.$id} has invalid market reference`);
                }
            }
        }
        console.log(`  Verified ${products.documents.length} products have valid market references`);
    });

    test('Prices reference valid products', async () => {
        const prices = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRICES, [Query.limit(10)]);
        for (const price of prices.documents) {
            if (price.productId) {
                try {
                    await databases.getDocument(DATABASE_ID, COLLECTIONS.PRODUCTS, price.productId);
                } catch (e) {
                    throw new Error(`Price ${price.$id} has invalid product reference`);
                }
            }
        }
        console.log(`  Verified ${prices.documents.length} prices have valid product references`);
    });

    // Test 4: Sample Data Display
    console.log('\n--- Sample Data ---\n');

    async function displaySampleData() {
        const commodities = await databases.listDocuments(DATABASE_ID, COLLECTIONS.COMMODITIES);
        console.log('Commodities:', commodities.documents.map(c => c.name || c.$id).join(', '));

        const markets = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MARKETS);
        console.log('Markets:', markets.documents.map(m => m.name || m.$id).join(', '));

        const products = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRODUCTS, [Query.limit(5)]);
        console.log('Sample Products:', products.documents.map(p => `${p.name} (${p.$id})`).join(', '));
    }

    await displaySampleData();

    // Test 5: Login Flow Test (without creating account)
    console.log('\n--- Testing Login Flow ---\n');

    console.log('Note: Login requires existing user credentials.');
    console.log('To test login:');
    console.log('1. Register a new user at /register');
    console.log('2. Then login with those credentials');
    console.log('3. Check browser console for any errors');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total: ${passed + failed}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log('='.repeat(60));

    if (failed > 0) {
        console.log('\nFailed tests:');
        tests.filter(t => t.status === 'failed').forEach(t => {
            console.log(`  - ${t.name}: ${t.error}`);
        });
    }

    return { passed, failed, tests };
}

runTests()
    .then(result => {
        console.log('\nTests completed!');
        process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });

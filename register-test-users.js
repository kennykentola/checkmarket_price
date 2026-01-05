import { Client, Account, Databases, ID } from 'node-appwrite';
import 'dotenv/config';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY;

const account = new Account(client);
const databases = new Databases(client);
const databaseId = 'marketprice';
const COLLECTION_USERS = '695be61b0010d1f27655';

// Test users to register
const testUsers = [
  { email: 'buyer@example.com', password: 'password123', name: 'Test Buyer', role: 'viewer' },
  { email: 'trader@example.com', password: 'password123', name: 'Test Trader', role: 'trader' },
  { email: 'admin@example.com', password: 'password123', name: 'Test Admin', role: 'admin' },
  { email: 'farmer@example.com', password: 'password123', name: 'Test Farmer', role: 'trader' }
];

async function registerTestUsers() {
  try {
    console.log('Registering test users...\n');

    for (const user of testUsers) {
      try {
        // Create the Appwrite auth account
        console.log(`Creating auth account for ${user.email}...`);
        const authUser = await account.create(ID.unique(), user.email, user.password, user.name);
        console.log(`  Auth user created with ID: ${authUser.$id}`);

        // Create email password session (login)
        console.log(`  Creating session for ${user.email}...`);
        const session = await account.createEmailPasswordSession(user.email, user.password);
        client.setSession(session.secret);

        // Create user document in database
        console.log(`  Creating user document in database...`);
        await databases.createDocument(databaseId, COLLECTION_USERS, authUser.$id, {
          username: user.name.replace(/\s+/g, '').toLowerCase(),
          name: user.name,
          email: user.email,
          passwordHash: '',
          createdAt: new Date().toISOString(),
          role: user.role
        });
        console.log(`  ✓ Successfully registered: ${user.email} (${user.role})`);

        // Delete the session
        await account.deleteSession('current');
      } catch (error) {
        if (error.code === 409) {
          console.log(`  ℹ User ${user.email} already exists, skipping...`);
        } else {
          console.log(`  ✗ Error with ${user.email}: ${error.message}`);
        }
      }
    }

    console.log('\n--- Registration Complete ---');
  } catch (error) {
    console.error('Error:', error);
  }
}

registerTestUsers();

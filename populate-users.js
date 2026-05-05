import { Client, Databases, ID } from 'node-appwrite';
import 'dotenv/config';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY;

const databases = new Databases(client);
const databaseId = 'marketprice';

// Collection ID for users
const COLLECTION_USERS = process.env.VITE_COLLECTION_USERS || '695be61b0010d1f27655';

// Permanent admin emails that should always have admin role
const PERMANENT_ADMIN_EMAILS = [
  'peterkehindeademola@gmail.com',
  'kilocode52@gmail.com',
  'peterkehindeademola9@gmail.com'
];

// User data with email as the key
const users = [
  { email: 'kennykentola8@gmail.com', username: 'kennyk', name: 'ademola peter kehinde', role: 'buyer' },
  { email: 'test@example.com', username: 'testerk', name: 'tester kenn', role: 'trader' },
  { email: 'peterkehindeademola@gmail.com', username: 'peterk', name: 'ademola peter kehinde', role: 'admin' },
  { email: 'buyer@example.com', username: 'testbuyer', name: 'Test Buyer', role: 'buyer' },
  { email: 'trader@example.com', username: 'testtrader', name: 'Test Trader', role: 'trader' },
  { email: 'admin@example.com', username: 'testadmin', name: 'Test Admin', role: 'admin' },
  { email: 'farmer@example.com', username: 'testfarmer', name: 'Test Farmer', role: 'trader' }
];

async function syncUsers() {
  try {
    console.log('Syncing users by email...\n');

    for (const user of users) {
      try {
        // First, check if user already exists by email
        const existing = await databases.listDocuments(databaseId, COLLECTION_USERS, [
          Query.equal('email', [user.email])
        ]);

        // Determine the role to use - permanent admins always keep admin role
        const finalRole = PERMANENT_ADMIN_EMAILS.includes(user.email) ? 'admin' : user.role;

        if (existing.documents.length > 0) {
          // Update existing user
          const docId = existing.documents[0].$id;
          await databases.updateDocument(databaseId, COLLECTION_USERS, docId, {
            role: finalRole
          });
          console.log(`✓ Updated role for ${user.email}: ${finalRole}`);
        } else {
          // Create new user - we need to use the user's auth ID
          // For now, create with a unique ID (the actual ID will be set when they register)
          await databases.createDocument(databaseId, COLLECTION_USERS, ID.unique(), {
            username: user.username,
            name: user.name,
            email: user.email,
            passwordHash: '',
            createdAt: new Date().toISOString(),
            role: finalRole
          });
          console.log(`✓ Created user: ${user.email} with role ${finalRole}`);
        }
      } catch (error) {
        console.log(`✗ Error with ${user.email}:`, error.message);
      }
    }

    console.log('\n--- User Sync Complete ---');
  } catch (error) {
    console.error('Error syncing users:', error);
  }
}

// Import Query from appwrite
import { Query } from 'appwrite';

syncUsers();

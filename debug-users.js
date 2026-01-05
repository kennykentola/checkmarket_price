import { Client, Databases, Query } from 'node-appwrite';
import 'dotenv/config';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY;

const databases = new Databases(client);
const databaseId = 'marketprice';
const COLLECTION_USERS = '695be61b0010d1f27655';

async function debugUsers() {
  try {
    console.log('Fetching all users from database...\n');

    const response = await databases.listDocuments(databaseId, COLLECTION_USERS);
    
    console.log(`Found ${response.documents.length} users:\n`);
    
    response.documents.forEach(doc => {
      console.log(`ID: ${doc.$id}`);
      console.log(`  Email: "${doc.email}"`);
      console.log(`  Name: "${doc.name}"`);
      console.log(`  Role: "${doc.role}"`);
      console.log('');
    });

    // Now test the query that AuthContext uses
    console.log('Testing query for admin@example.com...');
    const adminQuery = await databases.listDocuments(databaseId, COLLECTION_USERS, [
      Query.equal('email', ['admin@example.com'])
    ]);
    
    console.log(`Found ${adminQuery.documents.length} matching documents`);
    if (adminQuery.documents.length > 0) {
      console.log(`Role: ${adminQuery.documents[0].role}`);
    } else {
      console.log('No match found - this explains why login shows "buyer" role');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugUsers();

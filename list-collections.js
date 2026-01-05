import { Client, Databases } from 'node-appwrite';
import 'dotenv/config';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY;

const databases = new Databases(client);
const databaseId = 'marketprice';

async function listCollections() {
  try {
    console.log('Listing collections...');
    const collections = await databases.listCollections(databaseId);
    console.log('Collections:');
    collections.collections.forEach(collection => {
      console.log(`- ${collection.name} (ID: ${collection.$id})`);
    });
  } catch (error) {
    console.error('Error listing collections:', error);
  }
}

listCollections();

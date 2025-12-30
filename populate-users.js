import { Client, Databases } from 'appwrite';
import 'dotenv/config';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY; // API key from env

const databases = new Databases(client);
const databaseId = 'marketprice';

// User data from Appwrite console
const users = [
  {
    $id: '69528634002661a14535',
    username: 'kennyk',
    name: 'ademola peter kehinde',
    email: 'kennykentola8@gmail.com',
    role: 'viewer'
  },
  {
    $id: '69460a160032fa53c64e',
    username: 'testerk',
    name: 'tester kenn',
    email: 'test@example.com',
    role: 'trader'
  },
  {
    $id: '6945f4a830cefee56729',
    username: 'peterk',
    name: 'ademola peter kehinde',
    email: 'peterkehindeademola@gmail.com',
    role: 'admin'
  },
  {
    $id: '69539741581dff157989',
    username: 'testbuyer',
    name: 'Test Buyer',
    email: 'buyer@example.com',
    role: 'viewer'
  },
  {
    $id: '69539742cf4bca107f02',
    username: 'testtrader',
    name: 'Test Trader',
    email: 'trader@example.com',
    role: 'trader'
  },
  {
    $id: '69539743c3f75f5cc817',
    username: 'testadmin',
    name: 'Test Admin',
    email: 'admin@example.com',
    role: 'admin'
  },
  {
    $id: '69539744b3bf26fbb5a9',
    username: 'testfarmer',
    name: 'Test Farmer',
    email: 'farmer@example.com',
    role: 'trader'
  }
];

async function populateUsers() {
  try {
    console.log('Populating users collection...');

    for (const user of users) {
      try {
        await databases.createDocument(databaseId, 'users', user.$id, {
          username: user.username,
          name: user.name,
          email: user.email,
          passwordHash: '',
          createdAt: new Date().toISOString(),
          role: user.role
        });
        console.log(`Added user: ${user.email} with role ${user.role}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`User ${user.email} already exists, updating role...`);
          await databases.updateDocument(databaseId, 'users', user.$id, {
            role: user.role
          });
        } else {
          console.error(`Error adding user ${user.email}:`, error);
        }
      }
    }

    console.log('Users populated successfully!');
  } catch (error) {
    console.error('Error populating users:', error);
  }
}

populateUsers();

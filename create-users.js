import { Client, Account, ID } from 'appwrite';
import 'dotenv/config';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY; // API key from env

const account = new Account(client);

// User data for creating actual Appwrite accounts
const users = [
  {
    email: 'kennykentola8@gmail.com',
    password: 'password123',
    name: 'ademola peter kehinde'
  },
  {
    email: 'test@example.com',
    password: 'password123',
    name: 'tester kenn'
  },
  {
    email: 'peterkehindeademola@gmail.com',
    password: 'password123',
    name: 'ademola peter kehinde'
  },
  {
    email: 'buyer@example.com',
    password: 'password123',
    name: 'Test Buyer'
  },
  {
    email: 'trader@example.com',
    password: 'password123',
    name: 'Test Trader'
  },
  {
    email: 'admin@example.com',
    password: 'password123',
    name: 'Test Admin'
  },
  {
    email: 'farmer@example.com',
    password: 'password123',
    name: 'Test Farmer'
  }
];

async function createUsers() {
  try {
    console.log('Creating Appwrite user accounts...');

    for (const user of users) {
      try {
        const response = await account.create(ID.unique(), user.email, user.password, user.name);
        console.log(`Created user: ${user.email} with ID: ${response.$id}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`User ${user.email} already exists`);
        } else {
          console.error(`Error creating user ${user.email}:`, error);
        }
      }
    }

    console.log('User accounts created successfully!');
  } catch (error) {
    console.error('Error creating users:', error);
  }
}

createUsers();
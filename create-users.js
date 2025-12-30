import { Client, Users } from 'appwrite';
import 'dotenv/config';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice');

client.headers['X-Appwrite-Key'] = process.env.APPWRITE_API_KEY; // API key from env

const users = new Users(client);

// User data with passwords
const users = [
  {
    $id: '69528634002661a14535',
    email: 'kennykentola8@gmail.com',
    password: 'password123',
    name: 'ademola peter kehinde',
    role: 'viewer'
  },
  {
    $id: '69528634002661a14536',
    email: 'test@example.com',
    password: 'password123',
    name: 'tester kenn',
    role: 'trader'
  },
  {
    $id: '69528634002661a14537',
    email: 'peterkehindeademola@gmail.com',
    password: 'password123',
    name: 'ademola peter kehinde',
    role: 'admin'
  },
  {
    $id: '69539741581dff157989',
    email: 'buyer@example.com',
    password: 'password123',
    name: 'Test Buyer',
    role: 'viewer'
  },
  {
    $id: '69539742cf4bca107f02',
    email: 'trader@example.com',
    password: 'password123',
    name: 'Test Trader',
    role: 'trader'
  },
  {
    $id: '69539743c3f75f5cc817',
    email: 'admin@example.com',
    password: 'password123',
    name: 'Test Admin',
    role: 'admin'
  },
  {
    $id: '69539744b3bf26fbb5a9',
    email: 'farmer@example.com',
    password: 'password123',
    name: 'Test Farmer',
    role: 'trader'
  }
];

async function createUsers() {
  try {
    console.log('Creating user accounts...');

    for (const user of users) {
      try {
        const userAccount = await users.create(user.$id, user.email, user.password, user.name);
        console.log(`Created user account: ${user.email} with ID: ${userAccount.$id}`);
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
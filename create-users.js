import { Client, Users } from 'node-appwrite';
import 'dotenv/config';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('marketprice')
  .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

// User data
const testUsers = [
  {
    email: 'kennykentola8@gmail.com',
    password: 'password123',
    name: 'Ademola Peter Kehinde',
  },
  {
    email: 'test@example.com',
    password: 'password123',
    name: 'Tester Kenn',
  },
  {
    email: 'peterkehindeademola@gmail.com',
    password: 'password123',
    name: 'Ademola Peter Kehinde',
  },
  {
    email: 'buyer@example.com',
    password: 'password123',
    name: 'Test Buyer',
  },
  {
    email: 'trader@example.com',
    password: 'password123',
    name: 'Test Trader',
  },
  {
    email: 'admin@example.com',
    password: 'password123',
    name: 'Test Admin',
  },
  {
    email: 'farmer@example.com',
    password: 'password123',
    name: 'Test Farmer',
  },
];

async function createUsers() {
  try {
    console.log('Creating test users...');

    for (const user of testUsers) {
      try {
        const createdUser = await users.create(
          'unique()', // userId
          user.email,
          undefined, // phone
          user.password,
          user.name
        );
        console.log(`Created user: ${user.email} (${createdUser.$id})`);

        // Disable MFA for the user
        await users.updateMFA(createdUser.$id, false);
        console.log(`Disabled MFA for ${user.email}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`User ${user.email} already exists`);
          // Try to disable MFA if user exists
          try {
            // Need to get user ID first
            const userList = await users.list();
            const existingUser = userList.users.find(u => u.email === user.email);
            if (existingUser) {
              await users.updateMFA(existingUser.$id, false);
              console.log(`Disabled MFA for existing user ${user.email}`);
            }
          } catch (mfaError) {
            console.error(`Error disabling MFA for ${user.email}:`, mfaError.message);
          }
        } else {
          console.error(`Error creating user ${user.email}:`, error.message);
        }
      }
    }

    console.log('User creation complete!');
  } catch (error) {
    console.error('Error:', error);
  }
}

createUsers();
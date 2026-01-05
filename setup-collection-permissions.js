/**
 * IMPORTANT: Appwrite permissions must be configured in the Console, not via API.
 * 
 * To fix the 401 Unauthorized error:
 * 
 * 1. Go to https://cloud.appwrite.io/console
 * 2. Navigate to Databases > marketprice
 * 3. For each collection (users, prices, markets, commodities, categories), do:
 *    - Click on the collection
 *    - Go to "Settings" tab
 *    - Under "Read Permissions", add: role:member
 *    - Under "Write Permissions", add: role:admin, role:trader (as needed)
 * 
 * This allows all authenticated users (role:member) to read documents.
 */

console.log('Appwrite Collection Permissions Setup');
console.log('=====================================\n');
console.log('The 401 Unauthorized error occurs because the collections don\'t have');
console.log('proper permissions set for authenticated users.\n');
console.log('To fix this, configure permissions in Appwrite Console:\n');
console.log('1. Go to: https://cloud.appwrite.io/console');
console.log('2. Click on "Databases" > "marketprice"');
console.log('3. For EACH collection, do:\n');
console.log('   a. Click on the collection name');
console.log('   b. Go to "Settings" tab');
console.log('   c. Under "Read Permissions", click "Add" and select "Any" or "Member"');
console.log('   d. Save the permissions\n');
console.log('Collections to configure:');
console.log('  - users (read: member, write: admin, user:{self})');
console.log('  - markets (read: member/guest, write: admin)');
console.log('  - commodities (read: member/guest, write: admin)');
console.log('  - prices (read: member, write: trader, admin)');
console.log('  - categories (read: member/guest, write: admin)');
console.log('  - notifications (read: member, write: admin)');
console.log('  - farmgate_prices (read: member, write: trader, admin)\n');
console.log('After setting permissions, refresh the browser and login again.');

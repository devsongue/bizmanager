import { restockProduct } from '@/actions/restockActions';

async function testRestock() {
  try {
    // Test restocking a product (you'll need to replace 'prod-1' with an actual product ID from your database)
    const result = await restockProduct('prod-1', 10, 5000);
    console.log('Restock result:', result);
  } catch (error) {
    console.error('Error testing restock:', error);
  }
}

testRestock();
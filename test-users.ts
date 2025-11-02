import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Password: ${user.password}`);
    });
    
    // Test specific user
    const testUser = await prisma.user.findUnique({
      where: { email: 'admin@bizsuite.com' }
    });
    
    if (testUser) {
      console.log('\nTest user found:');
      console.log(`Name: ${testUser.name}`);
      console.log(`Email: ${testUser.email}`);
      console.log(`Password: ${testUser.password}`);
      console.log(`Role: ${testUser.role}`);
    } else {
      console.log('\nTest user not found');
    }
  } catch (error) {
    console.error('Error querying users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUsers();
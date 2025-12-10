import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const username = 'annelbeauty7';
  const password = 'goannelbeauty12';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    console.log('User already exists. Updating password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { username },
      data: { password: hashedPassword },
    });
    console.log('✅ Password updated successfully');
  } else {
    // Create new user
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    console.log('✅ User created successfully');
  }

  console.log(`Username: ${username}`);
  console.log('Password: (hashed and stored securely)');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


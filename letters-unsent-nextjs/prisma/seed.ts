// dummy data to test retrieval

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Array of dummy letters
  const dummyLetters = [
    {
      recipient: 'Alice',
      content: 'This is a letter to Alice about friendship.'
    },
    {
      recipient: 'Bob',
      content: 'A romantic letter to Bob.'
    },
    {
      recipient: null, // anonymous letter
      content: 'An anonymous letter with some heartfelt content.'
    }
  ];

  // Insert each letter into the database
  for (const letter of dummyLetters) {
    await prisma.letter.create({
      data: letter
    });
  }

  console.log('Dummy letters inserted successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

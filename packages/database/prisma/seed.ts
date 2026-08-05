import { PrismaClient, ResourceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old resources...');
  await prisma.studyResource.deleteMany();

  // Create a dummy user if none exists (or find the first one)
  let user = await prisma.user.findFirst();
  
  if (!user) {
    console.log('No user found, creating a dummy user...');
    user = await prisma.user.create({
      data: {
        email: 'dummy@iiitl.ac.in',
        name: 'Seed User',
        emailVerified: true,
      },
    });
  }

  console.log('Seeding StudyResources...');
  
  const resources = [
    {
      title: 'DSA Mid-Sem PYQ',
      courseCode: 'CS101',
      type: ResourceType.PYQ,
      description: 'Mid semester previous year questions for Data Structures and Algorithms',
      uploaderId: user.id,
      url: 'https://example.com/dsa-pyq.pdf'
    },
    {
      title: 'OS Lecture Notes',
      courseCode: 'CS102',
      type: ResourceType.NOTES,
      description: 'Complete lecture notes for Operating Systems',
      uploaderId: user.id,
      url: 'https://example.com/os-notes.pdf'
    },
    {
      title: 'DBMS Lab Manual',
      courseCode: 'CS103',
      type: ResourceType.ASSIGNMENT,
      description: 'Lab assignments and manual for Database Management Systems',
      uploaderId: user.id,
      url: 'https://example.com/dbms-lab.pdf'
    }
  ];

  for (const res of resources) {
    await prisma.studyResource.create({
      data: res
    });
  }

  console.log('Seeding complete! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

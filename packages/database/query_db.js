const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const resources = await prisma.studyResource.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
  console.log(JSON.stringify(resources, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());

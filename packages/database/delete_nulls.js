const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.studyResource.deleteMany({ where: { url: null } });
  console.log(`Deleted ${result.count} resources with null URLs`);
}
main().catch(console.error).finally(() => prisma.$disconnect());

const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '..', 'src', 'generated', 'client'));
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'alexandredesmarais88@gmail.com' },
    update: {
      password: '$2b$12$xbm9vzI4xYPJ3SaFvgu0yOw2akv3QsYVtGbWf/w9mBQvlCwKfjcga',
      name: 'Alexandre Desmarais',
    },
    create: {
      email: 'alexandredesmarais88@gmail.com',
      name: 'Alexandre Desmarais',
      password: '$2b$12$xbm9vzI4xYPJ3SaFvgu0yOw2akv3QsYVtGbWf/w9mBQvlCwKfjcga',
    },
  });
  console.log('User ready:', user.id, user.email);
}

main()
  .then(() => { prisma.$disconnect(); pool.end(); })
  .catch((e) => { console.error(e); prisma.$disconnect(); pool.end(); process.exit(1); });

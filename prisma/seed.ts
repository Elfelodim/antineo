import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seed started...');

    // 1. Chart of Accounts (PUC)
    const accounts = [
        { code: '1105', name: 'Caja', type: 'Asset', balance: 5000000 },
        { code: '1110', name: 'Bancos', type: 'Asset', balance: 25000000 },
        { code: '1115', name: 'Inversiones', type: 'Asset', balance: 0 }
    ];

    for (const acc of accounts) {
        await prisma.account.upsert({
            where: { code: acc.code },
            update: {},
            create: acc,
        });
    }
    console.log('Accounts seeded.');

    console.log('Seed finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

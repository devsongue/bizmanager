import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const adminUser = await prisma.user.create({
    data: {
      id: 'user-1',
      name: 'Admin Principal',
      email: 'admin@bizsuite.com',
      password: 'password123',
      role: 'Admin',
      avatarUrl: 'https://i.pravatar.cc/150?u=admin',
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      id: 'user-2',
      name: 'Jean Gérant',
      email: 'jean@bizsuite.com',
      password: 'password123',
      role: 'Gérant',
      avatarUrl: 'https://i.pravatar.cc/150?u=gerant',
    },
  });

  // Create businesses
  const boutique = await prisma.business.create({
    data: {
      id: 'biz-1',
      name: 'Boutique Chez Jean',
      type: 'Commerce de détail',
    },
  });

  const services = await prisma.business.create({
    data: {
      id: 'biz-2',
      name: 'Presta Services SARL',
      type: 'Fourniture de services',
    },
  });

  // Associate manager with boutique
  await prisma.user.update({
    where: { id: managerUser.id },
    data: {
      managedBusinesses: {
        connect: { id: boutique.id },
      },
    },
  });

  // Create products for boutique
  const savon = await prisma.product.create({
    data: {
      id: 'prod-1',
      name: 'Savon',
      category: 'Hygiène',
      stock: 100,
      retailPrice: 550,
      wholesalePrice: 500,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  const huile = await prisma.product.create({
    data: {
      id: 'prod-2',
      name: 'Huile',
      category: 'Alimentation',
      stock: 8,
      retailPrice: 1500,
      wholesalePrice: 1400,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  const riz = await prisma.product.create({
    data: {
      id: 'prod-3',
      name: 'Riz 5kg',
      category: 'Alimentation',
      stock: 80,
      retailPrice: 3500,
      wholesalePrice: 3300,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  const lait = await prisma.product.create({
    data: {
      id: 'prod-4',
      name: 'Lait en poudre',
      category: 'Alimentation',
      stock: 5,
      retailPrice: 2000,
      wholesalePrice: 1800,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  // Create products for services
  const maintenance = await prisma.product.create({
    data: {
      id: 'prod-b2-1',
      name: 'Maintenance Informatique',
      category: 'Service',
      stock: 999,
      retailPrice: 150000,
      wholesalePrice: 150000,
      business: {
        connect: { id: services.id },
      },
    },
  });

  // Create clients for boutique
  const alice = await prisma.client.create({
    data: {
      id: 'client-1',
      name: 'Alice Dubois',
      contact: '771234567',
      balance: -12000,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  const bob = await prisma.client.create({
    data: {
      id: 'client-2',
      name: 'Bob Martin',
      contact: '781234567',
      balance: 2500,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  // Create clients for services
  const entrepriseA = await prisma.client.create({
    data: {
      id: 'client-b2-1',
      name: 'Entreprise A',
      contact: '338000000',
      balance: -150000,
      business: {
        connect: { id: services.id },
      },
    },
  });

  // Create suppliers for boutique
  const grossiste = await prisma.supplier.create({
    data: {
      id: 'sup-1',
      name: 'Grossiste Dakar',
      product: 'Produits alimentaires',
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  const savonnerie = await prisma.supplier.create({
    data: {
      id: 'sup-2',
      name: 'Savonnerie du coin',
      product: 'Savons et détergents',
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  // Create suppliers for services
  const papeterie = await prisma.supplier.create({
    data: {
      id: 'sup-b2-1',
      name: 'Papeterie Pro',
      product: 'Fournitures de bureau',
      business: {
        connect: { id: services.id },
      },
    },
  });

  // Create sales for boutique
  await prisma.sale.create({
    data: {
      id: 'sale-1',
      date: new Date('2023-10-26'),
      clientId: alice.id,
      clientName: alice.name,
      productId: savon.id,
      productName: savon.name,
      quantity: 10,
      unitPrice: 500,
      total: 5000,
      saleType: 'Vente en gros',
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  await prisma.sale.create({
    data: {
      id: 'sale-2',
      date: new Date('2023-10-25'),
      clientId: bob.id,
      clientName: bob.name,
      productId: huile.id,
      productName: huile.name,
      quantity: 5,
      unitPrice: 1500,
      total: 7500,
      saleType: 'Vente au détail',
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  await prisma.sale.create({
    data: {
      id: 'sale-3',
      date: new Date('2023-09-15'),
      clientId: alice.id,
      clientName: alice.name,
      productId: riz.id,
      productName: riz.name,
      quantity: 2,
      unitPrice: 3500,
      total: 7000,
      saleType: 'Vente au détail',
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  // Create sales for services
  await prisma.sale.create({
    data: {
      id: 'sale-b2-1',
      date: new Date('2023-10-22'),
      clientId: entrepriseA.id,
      clientName: entrepriseA.name,
      productId: maintenance.id,
      productName: maintenance.name,
      quantity: 1,
      unitPrice: 150000,
      total: 150000,
      saleType: 'Vente au détail',
      business: {
        connect: { id: services.id },
      },
    },
  });

  // Create expenses for boutique
  await prisma.expense.create({
    data: {
      id: 'exp-1',
      date: new Date('2023-10-20'),
      category: 'Salaire',
      description: 'Salaire employé',
      amount: 75000,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  await prisma.expense.create({
    data: {
      id: 'exp-2',
      date: new Date('2023-10-15'),
      category: 'Services publics',
      description: 'Facture électricité',
      amount: 15000,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  await prisma.expense.create({
    data: {
      id: 'exp-3',
      date: new Date('2023-09-10'),
      category: 'Recharge',
      description: 'Achat de crédit',
      amount: 10000,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  // Create expenses for services
  await prisma.expense.create({
    data: {
      id: 'exp-b2-1',
      date: new Date('2023-10-05'),
      category: 'Loyer',
      description: 'Loyer bureau Octobre',
      amount: 200000,
      business: {
        connect: { id: services.id },
      },
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
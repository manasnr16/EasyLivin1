/**
 * DATABASE SEED
 *
 * Run with: npm run db:seed
 *
 * Creates:
 * 1. The super admin (Urmilla Dias)
 * 2. Two sample sales executives
 * 3. Integration config rows (disabled by default)
 * 4. A few sample properties for testing
 *
 * IMPORTANT: This seed is idempotent — running it multiple times
 * will not create duplicate records (uses upsert throughout).
 */

import { PrismaClient, UserRole, GoaRegion, GoaTaluka, PropertyType, PropertyStatus, ListingType } from '../generated';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // ── 1. Super Admin (Urmilla Dias) ────────────────────────────
  const adminPassword = await hashPassword(
    process.env['SEED_ADMIN_PASSWORD'] ?? 'ChangeMe@123!'
  );

  const admin = await prisma.user.upsert({
    where: { email: 'admin@easylivingoa.com' },
    update: {},
    create: {
      email: 'admin@easylivingoa.com',
      phone: '+919876543210',
      passwordHash: adminPassword,
      firstName: 'Urmilla',
      lastName: 'Dias',
      role: UserRole.CLIENT_ADMIN,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // ── 1b. Super Admin (platform owner, distinct from the client admin) ─
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@easylivingoa.com' },
    update: {},
    create: {
      email: 'superadmin@easylivingoa.com',
      phone: '+919876543211',
      passwordHash: adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Super admin user: ${superAdmin.email}`);

  // ── 2. Sample Sales Executives ───────────────────────────────
  const exec1Password = await hashPassword('Agent@123!');

  const exec1 = await prisma.user.upsert({
    where: { email: 'rahul@easylivingoa.com' },
    update: {},
    create: {
      email: 'rahul@easylivingoa.com',
      phone: '+919800000001',
      passwordHash: exec1Password,
      firstName: 'Rahul',
      lastName: 'Fernandes',
      role: UserRole.SALES_EXECUTIVE,
      locationTags: [GoaTaluka.BARDEZ, GoaTaluka.PERNEM],
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Sales exec 1: ${exec1.email}`);

  const exec2 = await prisma.user.upsert({
    where: { email: 'priya@easylivingoa.com' },
    update: {},
    create: {
      email: 'priya@easylivingoa.com',
      phone: '+919800000002',
      passwordHash: exec1Password,
      firstName: 'Priya',
      lastName: 'Naik',
      role: UserRole.SALES_EXECUTIVE,
      locationTags: [GoaTaluka.SALCETE, GoaTaluka.MORMUGAO],
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Sales exec 2: ${exec2.email}`);

  // ── 3. Integration Config rows (all disabled by default) ──────
  const integrations = [
    'WHATSAPP', 'META_FACEBOOK', 'META_INSTAGRAM',
    'LINKEDIN', 'YOUTUBE', 'MAGICBRICKS', 'ACRES_99'
  ];

  for (const type of integrations) {
    await prisma.integrationConfig.upsert({
      where: { type },
      update: {},
      create: { type, isEnabled: false, status: 'DISCONNECTED' },
    });
  }
  console.log('✅ Integration config stubs created');

  // ── 4. Sample Properties ─────────────────────────────────────
  const property1 = await prisma.property.upsert({
    where: { slug: 'luxury-villa-vagator-north-goa' },
    update: {},
    create: {
      title: '3 BHK Luxury Villa in Vagator',
      slug: 'luxury-villa-vagator-north-goa',
      description: 'Stunning 3 bedroom villa with private pool, just 800m from Vagator beach. Fully furnished with modern amenities and lush tropical garden.',
      propertyType: PropertyType.VILLA,
      listingType: ListingType.SALE,
      status: PropertyStatus.PUBLISHED,
      region: GoaRegion.NORTH_GOA,
      taluka: GoaTaluka.BARDEZ,
      village: 'Vagator',
      salePrice: 4200000,
      bedrooms: 3,
      bathrooms: 3,
      areaSqFt: 2200,
      plotAreaSqFt: 4500,
      furnishing: 'fully-furnished',
      parking: 2,
      amenities: ['Private Pool', 'Garden', 'Solar Power', 'CCTV', 'Modular Kitchen', 'Covered Parking'],
      isFeatured: true,
      latitude: 15.5937,
      longitude: 73.7443,
      publishedAt: new Date(),
      approvedAt: new Date(),
      approvedBy: admin.id,
      createdById: exec1.id,
    },
  });

  // Assign exec1 as primary agent for property1
  await prisma.propertyAgent.upsert({
    where: { propertyId_agentId: { propertyId: property1.id, agentId: exec1.id } },
    update: {},
    create: { propertyId: property1.id, agentId: exec1.id, isPrimary: true },
  });

  console.log(`✅ Sample property: ${property1.title}`);

  const property2 = await prisma.property.upsert({
    where: { slug: '2bhk-apartment-porvorim-north-goa' },
    update: {},
    create: {
      title: '2 BHK Apartment in Porvorim',
      slug: '2bhk-apartment-porvorim-north-goa',
      description: 'Modern 2 bedroom apartment in a gated complex at Porvorim. Ideal for families and professionals. Close to schools, hospitals and NH-66.',
      propertyType: PropertyType.APARTMENT,
      listingType: ListingType.SALE_AND_RENT,
      status: PropertyStatus.PUBLISHED,
      region: GoaRegion.NORTH_GOA,
      taluka: GoaTaluka.BARDEZ,
      village: 'Porvorim',
      salePrice: 6500000,
      rentPrice: 22000,
      rentPeriod: 'monthly',
      bedrooms: 2,
      bathrooms: 2,
      areaSqFt: 1100,
      furnishing: 'semi-furnished',
      parking: 1,
      amenities: ['Lift', 'Generator Backup', 'Security', 'Children Play Area', 'Gym'],
      publishedAt: new Date(),
      approvedAt: new Date(),
      approvedBy: admin.id,
      createdById: exec1.id,
    },
  });

  await prisma.propertyAgent.upsert({
    where: { propertyId_agentId: { propertyId: property2.id, agentId: exec1.id } },
    update: {},
    create: { propertyId: property2.id, agentId: exec1.id, isPrimary: true },
  });

  console.log(`✅ Sample property: ${property2.title}`);

  const property3 = await prisma.property.upsert({
    where: { slug: 'commercial-plot-margao-south-goa' },
    update: {},
    create: {
      title: 'Commercial Plot in Margao',
      slug: 'commercial-plot-margao-south-goa',
      description: 'Prime commercial plot on main road in Margao. Ideal for retail, office or mixed-use development. Clear title, all approvals in place.',
      propertyType: PropertyType.PLOT,
      listingType: ListingType.SALE,
      status: PropertyStatus.PUBLISHED,
      region: GoaRegion.SOUTH_GOA,
      taluka: GoaTaluka.SALCETE,
      village: 'Margao',
      salePrice: 8500000,
      plotAreaSqFt: 3200,
      priceNegotiable: true,
      amenities: ['Corner Plot', 'Main Road Frontage', 'Water Connection', 'Electricity'],
      reraNumber: 'PRGO123456',
      publishedAt: new Date(),
      approvedAt: new Date(),
      approvedBy: admin.id,
      createdById: exec2.id,
    },
  });

  await prisma.propertyAgent.upsert({
    where: { propertyId_agentId: { propertyId: property3.id, agentId: exec2.id } },
    update: {},
    create: { propertyId: property3.id, agentId: exec2.id, isPrimary: true },
  });

  console.log(`✅ Sample property: ${property3.title}`);

  // ── 5. Sample Leads ──────────────────────────────────────────
  const lead1 = await prisma.lead.upsert({
    where: { id: 'seed-lead-001' },
    update: {},
    create: {
      id: 'seed-lead-001',
      name: 'Arjun Mehta',
      email: 'arjun.mehta@email.com',
      phone: '+919988776655',
      source: 'WEBSITE',
      stage: 'CONTACTED',
      budget: 5000000,
      budgetMax: 7000000,
      propertyId: property2.id,
      assignedToId: exec1.id,
      createdById: exec1.id,
      requirementNote: 'Looking for a 2-3 BHK apartment in North Goa, prefers Porvorim or Mapusa area.',
      firstContactAt: new Date(Date.now() - 86400000 * 3),
    },
  });
  console.log(`✅ Sample lead: ${lead1.name}`);

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\nAdmin login credentials:');
  console.log('  Email: admin@easylivingoa.com (Client Admin)');
  console.log('  Email: superadmin@easylivingoa.com (Super Admin)');
  console.log('  Password: (set via SEED_ADMIN_PASSWORD env var, default: ChangeMe@123!)');
  console.log('\n⚠️  IMPORTANT: Change all passwords immediately after first login.\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

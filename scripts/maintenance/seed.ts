import { db } from './index';
import { products, settings } from './schema';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seed() {
  console.log('🌱 Seeding luxury products...');

  const fakeProducts = [
    {
      name: 'Midnight Velvet Blazer',
      description: 'A masterpiece of tailoring. This deep midnight blue blazer is crafted from premium Italian velvet with silk lapels.',
      price: '850.00',
      stock: 12,
      category: 'men' as const,
      isNewArrival: true,
      image: 'https://images.unsplash.com/photo-1594932224456-75a779401e28?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Silk Cascade Evening Gown',
      description: 'Flowing 100% pure silk gown in champagne gold. Features a hand-draped silhouette perfect for gala evenings.',
      price: '1200.00',
      stock: 5,
      category: 'women' as const,
      isNewArrival: true,
      isSale: true,
      salePercentage: '15',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Heritage Chronograph Watch',
      description: 'Mechanical precision meets timeless design. Stainless steel case with a genuine alligator leather strap.',
      price: '2400.00',
      stock: 8,
      category: 'accessories' as const,
      isNewArrival: false,
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Classic Trench Coat',
      description: 'The iconic outer layer. Water-resistant gabardine with traditional horn buttons and a belted waist.',
      price: '650.00',
      stock: 20,
      category: 'women' as const,
      isNewArrival: false,
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Artisan Leather Chelsea Boots',
      description: 'Hand-burnished calfskin leather boots with elasticated side panels and a stacked wooden heel.',
      price: '380.00',
      stock: 15,
      category: 'men' as const,
      isNewArrival: true,
      image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Oversized Cashmere Scarf',
      description: 'Ultra-soft ethically sourced cashmere. Large enough to be worn as a wrap or a classic scarf.',
      price: '220.00',
      stock: 45,
      category: 'accessories' as const,
      isNewArrival: false,
      isSale: true,
      salePercentage: '10',
      image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    }
  ];

  try {
    for (const product of fakeProducts) {
      await db.insert(products).values(product);
      console.log(`✅ Inserted: ${product.name}`);
    }

    console.log('🌱 Seeding initial store settings...');
    await db.insert(settings).values({
        id: 1,
        storeName: 'Elevanza Moderne',
        storeEmail: 'contact@elevanza.com',
        heroTitle: 'ELEVANZA MODERNE',
        heroSubtitle: 'Define your style with our curated collection of luxury fashion. Designed for those who appreciate the finer details.',
        heroImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
        featuredCategory1: 'men',
        featuredCategory2: 'women',
        featuredCategory3: 'accessories'
    }).onDuplicateKeyUpdate({
        set: {
            storeName: 'Elevanza Moderne',
            heroTitle: 'ELEVANZA MODERNE',
        }
    });

    console.log('✨ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();

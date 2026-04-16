import { pgTable, serial, varchar, text, decimal, boolean, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['admin', 'customer']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'completed', 'cancelled']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['pending', 'out_for_delivery', 'delivered']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: roleEnum('role').default('customer'),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  image: varchar('image', { length: 255 }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

export const festivals = pgTable('festivals', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  isActive: boolean('is_active').default(false),
  salePercentage: integer('sale_percentage').default(0),
  primaryColor: varchar('primary_color', { length: 20 }),
  accentColor: varchar('accent_color', { length: 20 }),
  promoMessage: text('promo_message'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  isNewArrival: boolean('is_new_arrival').default(false),
  isSale: boolean('is_sale').default(false),
  salePercentage: decimal('sale_percentage', { precision: 5, scale: 2 }),
  image: varchar('image', { length: 255 }),
  sizes: text('sizes'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum('status').default('pending'),
  deliveryStatus: deliveryStatusEnum('delivery_status').default('pending'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const settings = pgTable('settings', {
  id: integer('id').primaryKey().default(1),
  storeName: varchar('store_name', { length: 255 }).notNull().default('Elevanza Moderne'),
  storeEmail: varchar('store_email', { length: 255 }).notNull().default('contact@elevanza.com'),
  currency: varchar('currency', { length: 10 }).notNull().default('USD'),
  shippingFee: decimal('shipping_fee', { precision: 10, scale: 2 }).notNull().default('25.00'),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).notNull().default('8.00'),
  freeShippingThreshold: decimal('free_shipping_threshold', { precision: 10, scale: 2 }).notNull().default('500.00'),
  // Home Page Settings
  heroTitle: varchar('hero_title', { length: 255 }).notNull().default('ELEVANZA MODERNE'),
  heroSubtitle: text('hero_subtitle').notNull().default('Define your style with our curated collection of luxury fashion. Designed for those who appreciate the finer details.'),
  heroImage: varchar('hero_image', { length: 255 }).notNull().default('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'),
  featuredCategory1: varchar('featured_category_1', { length: 50 }).notNull().default('men'),
  featuredCategory2: varchar('featured_category_2', { length: 50 }).notNull().default('women'),
  featuredCategory3: varchar('featured_category_3', { length: 50 }).notNull().default('accessories'),
  featuredSegmentsTitle: varchar('featured_segments_title', { length: 255 }).notNull().default('Curated Segments'),
  featuredSegmentsDescription: text('featured_segments_description').notNull().default('Handpicked collections designed for the modern individual.'),
  // CMS Customization
  primaryColor: varchar('primary_color', { length: 20 }).notNull().default('#4f46e5'), 
  accentColor: varchar('accent_color', { length: 20 }).notNull().default('#818cf8'), 
  themePreset: varchar('theme_preset', { length: 50 }).notNull().default('default'), 
  showHero: boolean('show_hero').notNull().default(true),
  showCategories: boolean('show_categories').notNull().default(true),
  showFeatures: boolean('show_features').notNull().default(true),
  showNewsletter: boolean('show_newsletter').notNull().default(true),
  showNavCategories: boolean('show_nav_categories').notNull().default(true),
  // Badge Controls
  showSizeBadge: boolean('show_size_badge').notNull().default(true),
  showSaleBadge: boolean('show_sale_badge').notNull().default(true),
  showNewBadge: boolean('show_new_badge').notNull().default(true),
  // Emergency Notice
  emergencyNoticeText: text('emergency_notice_text'),
  showEmergencyNotice: boolean('show_emergency_notice').notNull().default(false),
  featuredSegmentsConfig: text('featured_segments_config').default('[]'),
  socialLinks: text('social_links').default('[]'),
  footerShopLinks: text('footer_shop_links').default('[]'),
  showFooterShop: boolean('show_footer_shop').notNull().default(true),
  showFooterCompany: boolean('show_footer_company').notNull().default(true),
  showFooterSupport: boolean('show_footer_support').notNull().default(true),
  showFooterNewsletter: boolean('show_footer_newsletter').notNull().default(true),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

export const wishlists = pgTable('wishlists', {
  id:        serial('id').primaryKey(),
  userId:    integer('user_id').notNull().references(() => users.id),
  productId: integer('product_id').notNull().references(() => products.id),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user:    one(users,    { fields: [wishlists.userId],    references: [users.id]    }),
  product: one(products, { fields: [wishlists.productId], references: [products.id] }),
}));

export const contentPages = pgTable('content_pages', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  isVisible: boolean('is_visible').notNull().default(true),
  footerGroup: varchar('footer_group', { length: 50 }).notNull().default('none'),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

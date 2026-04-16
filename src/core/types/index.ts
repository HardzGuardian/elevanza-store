/**
 * Core business entities for the Elevanza Moderne platform.
 * Centralizing types ensures consistency across storefront and admin logic.
 */

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number | string;
    stock: number;
    category: string;
    image: string | null;
    sizes: string | null;
    isNewArrival: boolean | number;
    isSale: boolean | number;
    salePercentage: number | null;
    createdAt: Date | string;
}

export interface StoreSettings {
    id: number;
    storeName: string;
    storeEmail: string;
    currency: string;
    shippingFee: number | string;
    taxRate: number | string;
    freeShippingThreshold: number | string;
    
    // Layout & Branding
    heroTitle: string | null;
    heroSubtitle: string | null;
    heroImage: string | null;
    primaryColor: string | null;
    accentColor: string | null;
    themePreset: string | null;
    
    // Visibility Toggles
    showHero: boolean;
    showCategories: boolean;
    showFeatures: boolean;
    showNewsletter: boolean;
    showNavCategories: boolean;
    showSizeBadge: boolean;
    showSaleBadge: boolean;
    showNewBadge: boolean;
    
    // Footer & Social
    socialLinks: string | null;
    footerShopLinks: string | null;
    showFooterShop: boolean;
    showFooterCompany: boolean;
    showFooterSupport: boolean;
    showFooterNewsletter: boolean;
    
    // Featured Sections
    featuredCategory1: string | null;
    featuredCategory2: string | null;
    featuredCategory3: string | null;
    featuredSegmentsTitle: string | null;
    featuredSegmentsDescription: string | null;
    featuredSegmentsConfig: string | null;

    // Emergency Alerts
    emergencyNoticeText: string | null;
    showEmergencyNotice: boolean | number;
    
    updatedAt: Date | string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    createdAt?: Date | string | null;
}

export interface Festival {
    id: number;
    name: string;
    slug: string;
    promoMessage: string | null;
    salePercentage: number | null;
    isActive: boolean;
    primaryColor: string | null;
    accentColor: string | null;
    createdAt?: Date | string | null;
}

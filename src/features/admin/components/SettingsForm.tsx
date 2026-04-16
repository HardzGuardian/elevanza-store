'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useForm, FormProvider } from 'react-hook-form';

import { cn } from '@/core/utils';
import { Button } from '@/components/ui/button';

// Tab Components
import { GeneralTab } from './settings-tabs/GeneralTab';
import { BannerTab } from './settings-tabs/BannerTab';
import { DesignTab } from './settings-tabs/DesignTab';
import { LayoutTab } from './settings-tabs/LayoutTab';
import { FooterTab } from './settings-tabs/FooterTab';

// Server Actions
import { saveSettings } from '@/features/admin/actions/settings';

/**
 * Settings Form Values
 * No Zod resolver — we handle validation manually to prevent silent blocking.
 */
interface SettingsValues {
  storeName: string;
  storeEmail: string;
  currency: string;
  shippingFee: string;
  taxRate: string;
  freeShippingThreshold: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  showHero: boolean;
  featuredCategory1: string;
  featuredCategory2: string;
  featuredCategory3: string;
  primaryColor: string;
  accentColor: string;
  themePreset: string;
  showCategories: boolean;
  showFeatures: boolean;
  showNewsletter: boolean;
  showNavCategories: boolean;
  showSizeBadge: boolean;
  showSaleBadge: boolean;
  showNewBadge: boolean;
  showEmergencyNotice: boolean;
  emergencyNoticeText: string;
  featuredSegmentsTitle: string;
  featuredSegmentsDescription: string;
  featuredSegmentsConfig: { slug: string; image: string }[];
  socialLinks: { platform: string; url: string }[];
  footerShopLinks: { label: string; href: string }[];
  showFooterShop: boolean;
  showFooterCompany: boolean;
  showFooterSupport: boolean;
  showFooterNewsletter: boolean;
}

/**
 * Admin: Settings Form
 * The central hub for all store configurations.
 */
interface SettingsFormProps {
  initialSettings: any;
  categoriesList: any[];
}

/**
 * Helper: safely extract a value from the DB row.
 * Drizzle returns camelCase, but we also check snake_case as a safety net.
 */
function v(obj: any, camel: string, snake: string, fallback: any = '') {
  return obj?.[camel] ?? obj?.[snake] ?? fallback;
}

function parseJson(val: any): any[] {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return Array.isArray(val) ? val : [];
}

function buildDefaults(s: any): SettingsValues {
  return {
    storeName: v(s, 'storeName', 'store_name'),
    storeEmail: v(s, 'storeEmail', 'store_email'),
    currency: v(s, 'currency', 'currency', 'USD'),
    shippingFee: String(v(s, 'shippingFee', 'shipping_fee', '0')),
    taxRate: String(v(s, 'taxRate', 'tax_rate', '0')),
    freeShippingThreshold: String(v(s, 'freeShippingThreshold', 'free_shipping_threshold', '0')),
    heroTitle: v(s, 'heroTitle', 'hero_title'),
    heroSubtitle: v(s, 'heroSubtitle', 'hero_subtitle'),
    heroImage: v(s, 'heroImage', 'hero_image'),
    showHero: v(s, 'showHero', 'show_hero', true),
    featuredCategory1: v(s, 'featuredCategory1', 'featured_category_1'),
    featuredCategory2: v(s, 'featuredCategory2', 'featured_category_2'),
    featuredCategory3: v(s, 'featuredCategory3', 'featured_category_3'),
    primaryColor: v(s, 'primaryColor', 'primary_color', '#4f46e5'),
    accentColor: v(s, 'accentColor', 'accent_color', '#818cf8'),
    themePreset: v(s, 'themePreset', 'theme_preset', 'default'),
    showCategories: v(s, 'showCategories', 'show_categories', true),
    showFeatures: v(s, 'showFeatures', 'show_features', true),
    showNewsletter: v(s, 'showNewsletter', 'show_newsletter', true),
    showNavCategories: v(s, 'showNavCategories', 'show_nav_categories', true),
    showSizeBadge: v(s, 'showSizeBadge', 'show_size_badge', true),
    showSaleBadge: v(s, 'showSaleBadge', 'show_sale_badge', true),
    showNewBadge: v(s, 'showNewBadge', 'show_new_badge', true),
    showEmergencyNotice: v(s, 'showEmergencyNotice', 'show_emergency_notice', false),
    emergencyNoticeText: v(s, 'emergencyNoticeText', 'emergency_notice_text'),
    featuredSegmentsTitle: v(s, 'featuredSegmentsTitle', 'featured_segments_title'),
    featuredSegmentsDescription: v(s, 'featuredSegmentsDescription', 'featured_segments_description'),
    featuredSegmentsConfig: parseJson(v(s, 'featuredSegmentsConfig', 'featured_segments_config', '[]')),
    socialLinks: parseJson(v(s, 'socialLinks', 'social_links', '[]')),
    footerShopLinks: parseJson(v(s, 'footerShopLinks', 'footer_shop_links', '[]')),
    showFooterShop: v(s, 'showFooterShop', 'show_footer_shop', true),
    showFooterCompany: v(s, 'showFooterCompany', 'show_footer_company', true),
    showFooterSupport: v(s, 'showFooterSupport', 'show_footer_support', true),
    showFooterNewsletter: v(s, 'showFooterNewsletter', 'show_footer_newsletter', true),
  };
}

export function SettingsForm({ initialSettings, categoriesList }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState('general');

  const form = useForm<SettingsValues>({
    defaultValues: buildDefaults(initialSettings),
  });

  const onSubmit = async (values: SettingsValues) => {
    startTransition(async () => {
      try {
        const payload = {
          ...values,
          featuredSegmentsConfig: JSON.stringify(values.featuredSegmentsConfig),
          socialLinks: JSON.stringify(values.socialLinks),
          footerShopLinks: JSON.stringify(values.footerShopLinks),
        };

        const result = await saveSettings(payload);

        if (result.success) {
          toast.success('Configuration synchronized!');
        } else {
          toast.error(result.error || 'Sync failed');
        }
      } catch (error) {
        console.error('Settings save error:', error);
        toast.error('A critical sync error occurred');
      }
    });
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'banner', label: 'Banner' },
    { id: 'design', label: 'Design' },
    { id: 'layout', label: 'Layout' },
    { id: 'footer', label: 'Footer' },
  ];

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 pb-24">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-[0.1em] transition-all",
                activeTab === tab.id
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={cn(activeTab !== 'general' && 'hidden')}>
          <GeneralTab />
        </div>

        <div className={cn(activeTab !== 'banner' && 'hidden')}>
          <BannerTab />
        </div>

        <div className={cn(activeTab !== 'design' && 'hidden')}>
          <DesignTab />
        </div>

        <div className={cn(activeTab !== 'layout' && 'hidden')}>
          <LayoutTab categoriesList={categoriesList} />
        </div>

        <div className={cn(activeTab !== 'footer' && 'hidden')}>
          <FooterTab />
        </div>

        {/* Save Controls */}
        <div className="flex justify-end gap-3 border-t border-neutral-100 pt-8">
          <Button
            variant="outline"
            type="button"
            className="rounded-lg px-6 border-neutral-200 text-sm font-semibold"
            onClick={() => form.reset(buildDefaults(initialSettings))}
          >
            Discard
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-lg px-6 bg-neutral-900 hover:bg-black text-white text-sm font-semibold shadow-none"
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

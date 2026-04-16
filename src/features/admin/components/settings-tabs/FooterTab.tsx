'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Share2, ShoppingBag, Globe, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/core/utils';

const SOCIAL_PLATFORMS = [
  { value: 'Instagram' },
  { value: 'Facebook' },
  { value: 'Twitter' },
  { value: 'YouTube' },
  { value: 'Pinterest' },
  { value: 'TikTok' },
  { value: 'LinkedIn' },
  { value: 'WhatsApp' },
];

const SHOP_LINK_PRESETS = [
  { label: 'New Arrivals',    href: '/products?filter=new' },
  { label: 'Sale',            href: '/products?filter=sale' },
  { label: 'All Products',    href: '/products' },
  { label: 'Men',             href: '/products?category=men' },
  { label: 'Women',           href: '/products?category=women' },
  { label: 'Kids',            href: '/products?category=kids' },
  { label: 'Accessories',     href: '/products?category=accessories' },
  { label: 'Footwear',        href: '/products?category=footwear' },
  { label: 'Best Sellers',    href: '/products?filter=bestsellers' },
];

export function FooterTab() {
  const { register, control, setValue, watch, formState: { errors } } = useFormContext();

  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial
  } = useFieldArray({ control, name: "socialLinks" });

  const {
    fields: shopFields,
    append: appendShop,
    remove: removeShop
  } = useFieldArray({ control, name: "footerShopLinks" });

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Visibility Controls */}
      <Card className="border border-neutral-100 shadow-none rounded-xl bg-white">
        <CardHeader className="p-5 border-b border-neutral-100">
          <CardTitle className="text-base font-bold text-neutral-900">Footer Visibility</CardTitle>
          <CardDescription className="text-sm text-neutral-500">Toggle footer sections on or off.</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { id: 'showFooterShop', label: 'Shop Column' },
              { id: 'showFooterCompany', label: 'Company Column' },
              { id: 'showFooterSupport', label: 'Support Column' },
              { id: 'showFooterNewsletter', label: 'Newsletter' }
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100 cursor-pointer hover:bg-white hover:border-neutral-300 transition-all"
              >
                <input
                  type="checkbox"
                  {...register(item.id)}
                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 cursor-pointer"
                />
                <span className="text-sm text-neutral-700 font-medium">{item.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Social Links */}
        <Card className="border border-neutral-100 shadow-none rounded-xl bg-white">
          <CardHeader className="p-5 border-b border-neutral-100">
            <CardTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-neutral-500" /> Social Links
            </CardTitle>
            <CardDescription className="text-sm text-neutral-500">Manage your store's social presence.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {socialFields.map((field, index) => {
              const fieldError = (errors.socialLinks as any)?.[index];

              return (
                <div key={field.id} className={cn(
                  "p-4 rounded-xl border space-y-3",
                  fieldError ? "bg-red-50 border-red-100" : "bg-neutral-50 border-neutral-100"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                        <Globe className="w-3.5 h-3.5 text-neutral-500" />
                      </div>
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Link {index + 1}</span>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() => removeSocial(index)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Platform</label>
                        {fieldError?.platform && <span className="text-[10px] text-red-500">Required</span>}
                      </div>
                      <select
                        {...register(`socialLinks.${index}.platform`)}
                        className={cn(
                          "w-full h-9 rounded-lg border bg-white px-3 text-sm focus:outline-none focus:border-neutral-400 transition-colors",
                          fieldError?.platform ? "border-red-200" : "border-neutral-200"
                        )}
                      >
                        <option value="">Select platform…</option>
                        {SOCIAL_PLATFORMS.map(p => (
                          <option key={p.value} value={p.value}>{p.value}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Profile URL</label>
                        {fieldError?.url && <span className="text-[10px] text-red-500">Required</span>}
                      </div>
                      <Input
                        placeholder="https://..."
                        {...register(`socialLinks.${index}.url`)}
                        className={cn("h-9 rounded-lg text-sm", fieldError?.url ? "border-red-200" : "border-neutral-200")}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {socialFields.length === 0 && (
              <div className="py-8 text-center border border-dashed border-neutral-200 rounded-xl">
                <p className="text-sm text-neutral-400">No social links added yet.</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => appendSocial({ platform: '', url: '' })}
              className="w-full h-10 rounded-lg border border-dashed border-neutral-300 bg-white text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Social Profile
            </button>
          </CardContent>
        </Card>

        {/* Shop Column Links */}
        <Card className="border border-neutral-100 shadow-none rounded-xl bg-white">
          <CardHeader className="p-5 border-b border-neutral-100">
            <CardTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-neutral-500" /> Shop Links
            </CardTitle>
            <CardDescription className="text-sm text-neutral-500">Links shown in the footer shop column.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {shopFields.map((field, index) => {
              const fieldError = (errors.footerShopLinks as any)?.[index];
              const currentLabel = watch(`footerShopLinks.${index}.label`);
              const isCustom = currentLabel === '__custom__';

              return (
                <div key={field.id} className={cn(
                  "p-4 rounded-xl border space-y-3",
                  fieldError ? "bg-red-50 border-red-100" : "bg-neutral-50 border-neutral-100"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                        <LinkIcon className="w-3.5 h-3.5 text-neutral-500" />
                      </div>
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Link {index + 1}</span>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() => removeShop(index)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Label</label>
                        {fieldError?.label && <span className="text-[10px] text-red-500">Required</span>}
                      </div>
                      <select
                        value={isCustom ? '__custom__' : (currentLabel || '')}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setValue(`footerShopLinks.${index}.label`, '__custom__');
                            setValue(`footerShopLinks.${index}.href`, '');
                          } else {
                            const preset = SHOP_LINK_PRESETS.find(p => p.label === e.target.value);
                            setValue(`footerShopLinks.${index}.label`, e.target.value);
                            if (preset) setValue(`footerShopLinks.${index}.href`, preset.href);
                          }
                        }}
                        className={cn(
                          "w-full h-9 rounded-lg border bg-white px-3 text-sm focus:outline-none focus:border-neutral-400 transition-colors",
                          fieldError?.label ? "border-red-200" : "border-neutral-200"
                        )}
                      >
                        <option value="">Select label…</option>
                        {SHOP_LINK_PRESETS.map(p => (
                          <option key={p.label} value={p.label}>{p.label}</option>
                        ))}
                        <option value="__custom__">— Custom —</option>
                      </select>
                      {isCustom && (
                        <Input
                          placeholder="Enter custom label…"
                          onChange={(e) => setValue(`footerShopLinks.${index}.label`, e.target.value)}
                          className="h-9 rounded-lg border-neutral-200 text-sm mt-1.5"
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">URL</label>
                        {fieldError?.href && <span className="text-[10px] text-red-500">Required</span>}
                      </div>
                      <Input
                        placeholder="/products?..."
                        {...register(`footerShopLinks.${index}.href`)}
                        className={cn("h-9 rounded-lg text-sm font-mono", fieldError?.href ? "border-red-200" : "border-neutral-200")}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {shopFields.length === 0 && (
              <div className="py-8 text-center border border-dashed border-neutral-200 rounded-xl">
                <p className="text-sm text-neutral-400">No shop links added yet.</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => appendShop({ label: '', href: '' })}
              className="w-full h-10 rounded-lg border border-dashed border-neutral-300 bg-white text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Shop Link
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

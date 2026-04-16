'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/core/utils';

export function GeneralTab() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Store Identity */}
      <Card className="border border-neutral-100 shadow-none rounded-xl bg-white">
        <CardHeader className="p-5 border-b border-neutral-100">
          <CardTitle className="text-base font-bold text-neutral-900">General Information</CardTitle>
          <CardDescription className="text-sm text-neutral-500">Store contact and identity settings.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Store Name</label>
              {errors.storeName && <span className="text-[10px] text-red-500">{(errors.storeName as any).message}</span>}
            </div>
            <Input
              id="storeName"
              {...register("storeName")}
              className={cn(
                "h-10 rounded-lg text-sm transition-colors",
                errors.storeName ? "border-red-300" : "border-neutral-200"
              )}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Contact Email</label>
              {errors.storeEmail && <span className="text-[10px] text-red-500">{(errors.storeEmail as any).message}</span>}
            </div>
            <Input
              id="storeEmail"
              type="email"
              {...register("storeEmail")}
              className={cn(
                "h-10 rounded-lg text-sm transition-colors",
                errors.storeEmail ? "border-red-300" : "border-neutral-200"
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Shipping & Tax */}
      <Card className="border border-neutral-100 shadow-none rounded-xl bg-white">
        <CardHeader className="p-5 border-b border-neutral-100">
          <CardTitle className="text-base font-bold text-neutral-900">Shipping & Tax</CardTitle>
          <CardDescription className="text-sm text-neutral-500">Configure regional commerce rules and thresholds.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Shipping Fee ($)</label>
              <Input
                id="shippingFee"
                type="number"
                step="0.01"
                {...register("shippingFee")}
                className="h-10 rounded-lg border-neutral-200 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Tax Rate (%)</label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                {...register("taxRate")}
                className="h-10 rounded-lg border-neutral-200 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Free Shipping Threshold ($)</label>
            <Input
              id="freeShippingThreshold"
              type="number"
              step="0.01"
              {...register("freeShippingThreshold")}
              className="h-10 rounded-lg border-neutral-200 text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

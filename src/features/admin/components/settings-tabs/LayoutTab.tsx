'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { cn } from '@/core/utils';

interface LayoutTabProps {
  categoriesList: any[];
}

export function LayoutTab({ categoriesList }: LayoutTabProps) {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext();

  const {
    fields: segmentFields,
    append: appendSegment,
    remove: removeSegment
  } = useFieldArray({
    control,
    name: "featuredSegmentsConfig"
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Module Visibility & Emergency (Side Column) */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="border border-neutral-100 shadow-none rounded-xl bg-white">
            <CardHeader className="p-5 border-b border-neutral-100">
              <CardTitle className="text-base font-bold text-neutral-900">Visibility</CardTitle>
              <CardDescription className="text-sm text-neutral-500">Toggle shop modules on or off.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-2">
              {[
                { id: 'showHero', label: 'Main Hero Banner' },
                { id: 'showCategories', label: 'Featured Segments' },
                { id: 'showFeatures', label: 'Value Propositions' },
                { id: 'showNewsletter', label: 'Newsletter' },
                { id: 'showNavCategories', label: 'Nav Categories' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <Label htmlFor={item.id} className="text-sm text-neutral-700 cursor-pointer">{item.label}</Label>
                  <input
                    type="checkbox"
                    id={item.id}
                    {...register(item.id)}
                    className="w-4 h-4 rounded border-neutral-300 text-neutral-900 cursor-pointer"
                  />
                </div>
              ))}

              <div className="pt-4 border-t border-neutral-100 mt-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400 mb-2">Product Badges</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'showSizeBadge', label: 'Size Badge' },
                    { id: 'showSaleBadge', label: 'Sale Badge' },
                    { id: 'showNewBadge', label: 'New Arrival Badge' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                      <Label htmlFor={item.id} className="text-sm text-neutral-700 cursor-pointer">{item.label}</Label>
                      <input
                        type="checkbox"
                        id={item.id}
                        {...register(item.id)}
                        className="w-4 h-4 rounded border-neutral-300 text-neutral-900 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Alert */}
          <Card className="border border-red-100 shadow-none rounded-xl bg-red-50/30">
            <CardHeader className="p-5 border-b border-red-100">
              <CardTitle className="text-base font-bold text-red-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Emergency Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100">
                <Label htmlFor="showEmergencyNotice" className="text-sm text-red-800 cursor-pointer font-medium">Activate Alert</Label>
                <input
                  type="checkbox"
                  id="showEmergencyNotice"
                  {...register("showEmergencyNotice")}
                  className="w-4 h-4 rounded border-red-200 text-red-600 cursor-pointer"
                />
              </div>
              <textarea
                id="emergencyNoticeText"
                {...register("emergencyNoticeText")}
                rows={2}
                placeholder="Alert message..."
                className="w-full rounded-lg border border-red-100 bg-white p-3 text-sm focus:outline-none focus:border-red-300 transition-colors resize-none placeholder:text-red-200"
              />
            </CardContent>
          </Card>
        </div>

        {/* Featured Segments (Main Column) */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="border border-neutral-100 shadow-none rounded-xl bg-white">
            <CardHeader className="p-5 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-neutral-900">Featured Segments</CardTitle>
                  <CardDescription className="text-sm text-neutral-500 mt-0.5">Curate homepage collection slots.</CardDescription>
                </div>
                <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-md">{segmentFields.length} / 6 slots</span>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Section Title</label>
                  <Input
                    id="featuredSegmentsTitle"
                    {...register("featuredSegmentsTitle")}
                    className="h-10 rounded-lg border-neutral-200 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Section Description</label>
                  <textarea
                    id="featuredSegmentsDescription"
                    {...register("featuredSegmentsDescription")}
                    rows={1}
                    className="w-full rounded-lg border border-neutral-200 p-3 text-sm focus:outline-none focus:border-neutral-400 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-neutral-100">
                {segmentFields.map((field, index) => {
                  const fieldError = (errors.featuredSegmentsConfig as any)?.[index];

                  return (
                    <div key={field.id} className={cn(
                      "p-5 rounded-xl border transition-all space-y-4",
                      fieldError ? "bg-red-50 border-red-100" : "bg-neutral-50 border-neutral-100"
                    )}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-neutral-700">Slot {String(index + 1).padStart(2, '0')}</span>
                          <span className="text-[10px] text-neutral-400 ml-2">Homepage slot</span>
                        </div>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          onClick={() => removeSegment(index)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">Category</label>
                            {fieldError?.slug && <span className="text-[10px] text-red-500">Required</span>}
                          </div>
                          <select
                            {...register(`featuredSegmentsConfig.${index}.slug`)}
                            className={cn(
                              "w-full h-10 rounded-lg border bg-white px-3 text-sm focus:outline-none transition-colors",
                              fieldError?.slug ? "border-red-200" : "border-neutral-200 focus:border-neutral-400"
                            )}
                          >
                            <option value="">Select Category</option>
                            {categoriesList.map((cat) => (
                              <option key={cat.id} value={cat.slug}>{cat.name}</option>
                            ))}
                            <option value="new_arrival">New Arrivals</option>
                            <option value="sale">Flash Sale</option>
                          </select>
                        </div>

                        <div>
                          <ImageUpload
                            value={watch(`featuredSegmentsConfig.${index}.image`)}
                            onChange={(url) => setValue(`featuredSegmentsConfig.${index}.image`, url)}
                            label="Slot Image"
                          />
                          {fieldError?.image && <p className="mt-1 text-[10px] text-red-500">Image required</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {segmentFields.length === 0 && (
                  <div className="py-10 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50">
                    <p className="text-sm text-neutral-400">No segments added yet.</p>
                  </div>
                )}

                {segmentFields.length < 6 && (
                  <button
                    type="button"
                    onClick={() => appendSegment({ slug: '', image: '' })}
                    className="w-full h-10 rounded-lg border border-dashed border-neutral-300 bg-white text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Segment Slot
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

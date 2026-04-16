'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createProduct, updateProduct } from '@/features/admin/actions/product';
import { toast } from 'react-hot-toast';
import { ImageUpload } from '@/components/ui/image-upload';
import { cn } from '@/core/utils';
import { Loader2 } from 'lucide-react';

const QUICK_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44'];

interface ProductFormProps {
  initialData?: any;
  onSuccess?: () => void;
  categoriesList: any[];
}

export function ProductForm({ initialData, onSuccess, categoriesList }: ProductFormProps) {
  const [loading,  setLoading]  = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData?.image || '');
  const [sizes,    setSizes]    = useState(initialData?.sizes || '');

  const toggleSize = (sz: string) => {
    const current = sizes.split(',').map((s: string) => s.trim()).filter(Boolean);
    const next = current.includes(sz)
      ? current.filter((s: string) => s !== sz)
      : [...current, sz];
    setSizes(next.join(', '));
  };

  const activeSizes = sizes.split(',').map((s: string) => s.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      name:           fd.get('name'),
      description:    fd.get('description'),
      price:          fd.get('price'),
      image:          imageUrl,
      sizes,
      category:       fd.get('category'),
      stock:          fd.get('stock'),
      isNewArrival:   fd.get('isNewArrival') === 'on',
      isSale:         fd.get('isSale') === 'on',
      salePercentage: fd.get('salePercentage') || '0',
    };

    const result = initialData
      ? await updateProduct(initialData.id, data)
      : await createProduct(data);

    if (result.success) {
      toast.success(initialData ? 'Product updated!' : 'Product created!');
      onSuccess?.();
    } else {
      toast.error(result.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <Field label="Product Name">
        <Input id="name" name="name" defaultValue={initialData?.name} required className="rounded-lg border-neutral-200 h-10 text-sm" />
      </Field>

      <Field label="Description">
        <Textarea id="description" name="description" defaultValue={initialData?.description} required className="rounded-lg border-neutral-200 text-sm min-h-[90px]" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price ($)">
          <Input id="price" name="price" type="number" step="0.01" defaultValue={initialData?.price} required className="rounded-lg border-neutral-200 h-10 text-sm" />
        </Field>
        <Field label="Stock">
          <Input id="stock" name="stock" type="number" defaultValue={initialData?.stock} required className="rounded-lg border-neutral-200 h-10 text-sm" />
        </Field>
      </div>

      <Field label="Category">
        <select
          id="category"
          name="category"
          defaultValue={initialData?.category || categoriesList[0]?.slug || ''}
          className="w-full h-10 px-3 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-neutral-400 transition-colors"
        >
          {categoriesList.map(cat => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </Field>

      {/* Sizes */}
      <div className="space-y-2">
        <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
          Available Sizes
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {QUICK_SIZES.map(sz => (
            <button
              key={sz}
              type="button"
              onClick={() => toggleSize(sz)}
              className={cn(
                'px-3 py-1 rounded-md text-[11px] font-semibold border transition-colors',
                activeSizes.includes(sz)
                  ? 'bg-neutral-900 border-neutral-900 text-white'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900'
              )}
            >
              {sz}
            </button>
          ))}
        </div>
        <Input
          placeholder="or type manually: S, M, L, XL"
          value={sizes}
          onChange={e => setSizes(e.target.value)}
          className="rounded-lg border-neutral-200 h-9 text-sm"
        />
      </div>

      {/* Image */}
      <ImageUpload label="Product Image" value={imageUrl} onChange={setImageUrl} />

      {/* Flags */}
      <div className="flex flex-wrap gap-5 py-1">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" id="isNewArrival" name="isNewArrival" defaultChecked={initialData?.isNewArrival}
            className="w-4 h-4 rounded border-neutral-300 text-neutral-900 cursor-pointer" />
          <span className="text-sm font-medium text-neutral-700">New Arrival</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" id="isSale" name="isSale" defaultChecked={initialData?.isSale}
            className="w-4 h-4 rounded border-neutral-300 text-neutral-900 cursor-pointer" />
          <span className="text-sm font-medium text-neutral-700">On Sale</span>
        </label>
      </div>

      <Field label="Sale Percentage (%)">
        <Input id="salePercentage" name="salePercentage" type="number" min="0" max="100"
          defaultValue={initialData?.salePercentage || 0}
          className="rounded-lg border-neutral-200 h-10 text-sm w-32" />
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          : initialData ? 'Update Product' : 'Create Product'
        }
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">{label}</label>
      {children}
    </div>
  );
}

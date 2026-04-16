'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';
import { deleteProduct } from '@/features/admin/actions/product';
import { toast } from 'react-hot-toast';
import { cn } from '@/core/utils';

interface ProductTableProps {
  products: any[];
  categoriesList: any[];
}

export function ProductTable({ products: initialProducts, categoriesList }: ProductTableProps) {
  const [isAddOpen,       setIsAddOpen]       = useState(false);
  const [editingProduct,  setEditingProduct]  = useState<any>(null);
  const [searchQuery,     setSearchQuery]     = useState('');

  const filtered = initialProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    const result = await deleteProduct(id);
    result.success ? toast.success('Product deleted') : toast.error('Failed to delete');
  };

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Products</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your product catalogue and inventory.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger
            render={
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-[13px] font-semibold rounded-lg transition-colors flex-shrink-0">
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            }
          />
          <DialogContent className="sm:max-w-[680px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
            <div className="max-h-[90vh] overflow-y-auto p-7">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-bold text-neutral-900">Add New Product</DialogTitle>
              </DialogHeader>
              <ProductForm onSuccess={() => setIsAddOpen(false)} categoriesList={categoriesList} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
        {/* Search bar */}
        <div className="px-4 py-3 border-b border-neutral-100 flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <Input
              className="pl-9 h-9 bg-neutral-50 border-neutral-200 rounded-lg text-sm"
              placeholder="Search products…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="self-center text-xs text-neutral-400 font-medium ml-auto">
            {filtered.length} / {initialProducts.length} products
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                {['Product', 'Category', 'Price', 'Stock', 'Tags', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400 last:text-right">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-neutral-50/60 transition-colors">

                  {/* Name + image */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                        <OptimizedImage
                          src={product.image || ''}
                          alt={product.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium text-neutral-900 line-clamp-1 max-w-[180px]">{product.name}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4 text-neutral-500 capitalize">{product.category}</td>

                  {/* Price */}
                  <td className="px-5 py-4 font-semibold text-neutral-900">
                    ${parseFloat(product.price.toString()).toFixed(2)}
                  </td>

                  {/* Stock */}
                  <td className="px-5 py-4">
                    <span className={cn('font-semibold', product.stock < 5 ? 'text-red-500' : product.stock < 20 ? 'text-amber-600' : 'text-neutral-500')}>
                      {product.stock}
                    </span>
                  </td>

                  {/* Badges */}
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.stock > 0
                        ? <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[9px] font-semibold rounded">In Stock</span>
                        : <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-semibold rounded">OOS</span>
                      }
                      {product.isNewArrival && <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 text-[9px] font-semibold rounded">New</span>}
                      {product.isSale     && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-semibold rounded">Sale</span>}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Dialog
                        open={editingProduct?.id === product.id}
                        onOpenChange={open => !open && setEditingProduct(null)}
                      >
                        <DialogTrigger
                          render={
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          }
                        />
                        <DialogContent className="sm:max-w-[680px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                          <div className="max-h-[90vh] overflow-y-auto p-7">
                            <DialogHeader className="mb-6">
                              <DialogTitle className="text-xl font-bold text-neutral-900">Edit Product</DialogTitle>
                            </DialogHeader>
                            <ProductForm
                              initialData={product}
                              onSuccess={() => setEditingProduct(null)}
                              categoriesList={categoriesList}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>

                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-14 text-center text-sm text-neutral-400">
            {searchQuery ? `No products matching "${searchQuery}"` : 'No products yet.'}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';
import { deleteProduct, bulkDeleteProducts } from '@/features/admin/actions/product';
import { toast } from 'react-hot-toast';
import { cn } from '@/core/utils';
import { formatMoney } from '@/lib/money';

interface ProductTableProps {
  products: any[];
  categoriesList: any[];
}

export function ProductTable({ products: initialProducts, categoriesList }: ProductTableProps) {
  const [products, setProducts]              = useState(initialProducts);
  const [isAddOpen,      setIsAddOpen]       = useState(false);
  const [editingProduct, setEditingProduct]  = useState<any>(null);
  const [searchQuery,    setSearchQuery]     = useState('');
  const [sortField,      setSortField]       = useState<'name' | 'price' | 'stock' | null>(null);
  const [sortDir,        setSortDir]         = useState<'asc' | 'desc'>('asc');
  const [selectedIds,    setSelectedIds]     = useState<Set<number>>(new Set());
  const [bulkLoading,    setBulkLoading]     = useState(false);

  function toggleSort(field: 'name' | 'price' | 'stock') {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const filtered = products
    .filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      let va = a[sortField];
      let vb = b[sortField];
      if (sortField === 'price' || sortField === 'stock') {
        va = parseFloat(va);
        vb = parseFloat(vb);
      } else {
        va = va?.toLowerCase() ?? '';
        vb = vb?.toLowerCase() ?? '';
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    const result = await deleteProduct(id);
    if (result.success) {
      toast.success('Product deleted');
      setProducts(prev => prev.filter(p => p.id !== id));
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    } else {
      toast.error('Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} product${selectedIds.size !== 1 ? 's' : ''}? This cannot be undone.`)) return;
    setBulkLoading(true);
    const ids = Array.from(selectedIds);
    const result = await bulkDeleteProducts(ids);
    if (result.success) {
      toast.success(`Deleted ${ids.length} product${ids.length !== 1 ? 's' : ''}`);
      setProducts(prev => prev.filter(p => !ids.includes(p.id)));
      setSelectedIds(new Set());
    } else {
      toast.error('Bulk delete failed');
    }
    setBulkLoading(false);
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every(p => selectedIds.has(p.id));

  function toggleRow(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allFilteredSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(p => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(p => next.add(p.id));
        return next;
      });
    }
  }

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
              <ProductForm onSuccess={(product) => { setIsAddOpen(false); if (product) setProducts(prev => [product, ...prev]); }} categoriesList={categoriesList} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
        {/* Search + bulk action bar */}
        <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <Input
              className="pl-9 h-9 bg-neutral-50 border-neutral-200 rounded-lg text-sm"
              placeholder="Search products…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {selectedIds.size > 0 ? (
            <button
              onClick={handleBulkDelete}
              disabled={bulkLoading}
              className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[12px] font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {bulkLoading ? 'Deleting…' : `Delete ${selectedIds.size} selected`}
            </button>
          ) : (
            <span className="ml-auto text-xs text-neutral-400 font-medium">
              {filtered.length} / {initialProducts.length} products
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                {/* Select-all checkbox */}
                <th className="pl-5 pr-2 py-3.5 w-8">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded border-neutral-300 cursor-pointer"
                  />
                </th>
                {/* Sortable: Name */}
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-neutral-700 transition-colors">
                    Product
                    {sortField === 'name'
                      ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      : <ChevronsUpDown className="w-3 h-3 text-neutral-300" />}
                  </button>
                </th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Category</th>
                {/* Sortable: Price */}
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  <button onClick={() => toggleSort('price')} className="flex items-center gap-1 hover:text-neutral-700 transition-colors">
                    Price
                    {sortField === 'price'
                      ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      : <ChevronsUpDown className="w-3 h-3 text-neutral-300" />}
                  </button>
                </th>
                {/* Sortable: Stock */}
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  <button onClick={() => toggleSort('stock')} className="flex items-center gap-1 hover:text-neutral-700 transition-colors">
                    Stock
                    {sortField === 'stock'
                      ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      : <ChevronsUpDown className="w-3 h-3 text-neutral-300" />}
                  </button>
                </th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Tags</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map(product => (
                <tr key={product.id} className={cn('hover:bg-neutral-50/60 transition-colors', selectedIds.has(product.id) && 'bg-neutral-50')}>
                  {/* Row checkbox */}
                  <td className="pl-5 pr-2 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleRow(product.id)}
                      className="w-3.5 h-3.5 rounded border-neutral-300 cursor-pointer"
                    />
                  </td>

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
                    ${formatMoney(product.price)}
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
                              onSuccess={(product) => { setEditingProduct(null); if (product) setProducts(prev => prev.map(p => p.id === product.id ? product : p)); }}
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

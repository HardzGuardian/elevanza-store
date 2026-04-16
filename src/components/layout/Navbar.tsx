'use client';

import { useDeferredValue, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, LogOut, ChevronDown, Search, ArrowUpRight } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/features/cart/store';
import { searchProducts } from '@/features/admin/actions/product';
import { cn } from '@/core/utils';
import { Container } from '@/components/layout/Container';

interface NavbarProps {
  storeName?: string;
  categories?: { name: string; slug: string }[];
}

export function Navbar({ storeName = 'Elevanza Moderne', categories = [] }: NavbarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { totalItems } = useCart();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const itemCount = totalItems();
  const deferredQuery = useDeferredValue(searchQuery.trim());

  useEffect(() => {
    setIsMounted(true);
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchOpen(false);
    setSearchQuery('');
  }, [pathname]);

  // Live search
  useEffect(() => {
    if (deferredQuery.length < 2) { setSearchResults([]); return; }
    const id = setTimeout(async () => {
      const results = await searchProducts(deferredQuery);
      setSearchResults(results);
    }, 250);
    return () => clearTimeout(id);
  }, [deferredQuery]);

  const openSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 80);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    closeSearch();
    router.push(`/products?q=${encodeURIComponent(q)}`);
  };

  const navItems = [
    { label: 'All Products', href: '/products' },
    ...categories.slice(0, 4).map(c => ({ label: c.name, href: `/products?category=${c.slug}` })),
  ];

  return (
    <>
      {/* ── Main Bar ─────────────────────────────────────── */}
      <nav
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-neutral-200/70 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]'
            : 'bg-white/90 backdrop-blur-md border-b border-neutral-100/80'
        )}
      >
        <Container>
          <div className="flex items-center h-16 lg:h-[68px] lg:grid lg:grid-cols-3">

            {/* Brand — left */}
            <div className="flex items-center flex-1 lg:flex-none min-w-0 mr-3">
              <Link href="/" className="group min-w-0">
                <span className="block text-[11px] sm:text-[13px] font-bold tracking-[0.12em] sm:tracking-[0.18em] text-neutral-900 uppercase group-hover:opacity-60 transition-opacity duration-200 truncate">
                  {storeName}
                </span>
              </Link>
            </div>

            {/* Desktop Nav — center */}
            <nav className="hidden lg:flex items-center justify-center gap-6">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 whitespace-nowrap',
                    pathname === item.href
                      ? 'text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-900'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions — right */}
            <div className="flex items-center gap-0.5 justify-end flex-shrink-0">

              {/* Search */}
              <button
                onClick={openSearch}
                className="p-2.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                aria-label="Search"
              >
                <Search className="w-[17px] h-[17px]" />
              </button>

              {/* Cart */}
              <Link href="/cart" aria-label="Cart">
                <span className="relative flex p-2.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors">
                  <ShoppingCart className="w-[17px] h-[17px]" />
                  {isMounted && itemCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-neutral-900 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </span>
              </Link>

              {isMounted && (
                <>
                  <div className="hidden lg:block w-px h-4 bg-neutral-200 mx-1.5" />
                  <div className="hidden lg:block">
                    {session ? (
                      <UserMenu session={session} />
                    ) : (
                      <Link href="/login">
                        <span className="ml-1 inline-flex items-center px-4 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-200 cursor-pointer">
                          Sign In
                        </span>
                      </Link>
                    )}
                  </div>
                </>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setIsMobileOpen(v => !v)}
                className="lg:hidden ml-1 p-2.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                aria-label="Menu"
              >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </Container>
      </nav>

      {/* ── Search Overlay ────────────────────────────────── */}
      {isSearchOpen && (
        <SearchOverlay
          inputRef={searchInputRef}
          query={searchQuery}
          results={searchResults}
          onChange={setSearchQuery}
          onSubmit={handleSearchSubmit}
          onClose={closeSearch}
        />
      )}

      {/* ── Mobile Drawer ─────────────────────────────────── */}
      {isMobileOpen && (
        <MobileDrawer navItems={navItems} session={session} onClose={() => setIsMobileOpen(false)} />
      )}
    </>
  );
}

/* ── Search Overlay ─────────────────────────────────────────── */
function SearchOverlay({ inputRef, query, results, onChange, onSubmit, onClose }: any) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const suggestions = ['New Arrivals', 'Dresses', 'Jackets', 'Accessories', 'Sale'];

  return (
    <div className="fixed inset-0 z-[100] bg-white animate-fade-in flex flex-col">
      {/* Header bar */}
      <div className="border-b border-neutral-100">
        <Container>
          <div className="flex items-center h-16 lg:h-[68px] gap-4">
            <Search className="w-5 h-5 text-neutral-400 flex-shrink-0" />
            <form onSubmit={onSubmit} className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => onChange(e.target.value)}
                placeholder="Search products…"
                className="w-full text-[15px] font-medium text-neutral-900 placeholder:text-neutral-400 bg-transparent focus:outline-none"
              />
            </form>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </Container>
      </div>

      {/* Results body */}
      <div className="flex-1 overflow-y-auto">
        <Container className="py-8">
          {results.length > 0 ? (
            <div className="max-w-2xl space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400 mb-5">
                {results.length} Result{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 -mx-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                >
                  <div className="relative w-11 h-14 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                    <OptimizedImage src={product.image || ''} alt={product.name} fill sizes="44px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate group-hover:opacity-60 transition-opacity">
                      {product.name}
                    </p>
                    <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mt-0.5">
                      {product.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-neutral-900">${product.price}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                  </div>
                </Link>
              ))}
              <Link
                href={`/products?q=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="flex items-center gap-2 pt-4 mt-2 border-t border-neutral-100 text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 uppercase tracking-[0.12em] transition-colors"
              >
                See all results <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="max-w-2xl">
              <p className="text-base font-semibold text-neutral-900 mb-1">No results for "{query}"</p>
              <p className="text-sm text-neutral-500">Try a different search term.</p>
            </div>
          ) : (
            <div className="max-w-2xl space-y-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Popular</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => onChange(s)}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:border-neutral-900 hover:text-neutral-900 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}

/* ── User Dropdown ───────────────────────────────────────────── */
function UserMenu({ session }: any) {
  const { clearCart } = useCart();

  const handleSignOut = () => {
    clearCart();
    signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
            <div className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {session.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-[11px] font-semibold text-neutral-700 hidden lg:block max-w-[72px] truncate">
              {session.user?.name}
            </span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5 shadow-lg border-neutral-100 animate-slide-from-top">
        <DropdownMenuItem render={<Link href="/account" className="rounded-lg px-3 py-2.5 text-sm font-medium" />}>
          My Account
        </DropdownMenuItem>
        {session.user?.role === 'admin' && (
          <DropdownMenuItem render={<Link href="/admin/dashboard" className="rounded-lg px-3 py-2.5 text-sm font-medium" />}>
            Admin Panel
          </DropdownMenuItem>
        )}
        <div className="h-px bg-neutral-100 my-1 mx-1" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Mobile Drawer ───────────────────────────────────────────── */
function MobileDrawer({ navItems, session, onClose }: any) {
  const { clearCart } = useCart();

  const handleSignOut = () => {
    clearCart();
    signOut();
    onClose();
  };

  return (
    <div className="lg:hidden fixed inset-0 top-16 bg-white z-40 animate-slide-from-right overflow-y-auto">
      <Container className="py-8">
        {/* Navigation links */}
        <nav className="space-y-0 mb-8">
          {navItems.map((item: any) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center justify-between py-4 border-b border-neutral-100 group"
            >
              <span className="text-lg font-medium text-neutral-900 group-hover:opacity-50 transition-opacity">
                {item.label}
              </span>
              <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
            </Link>
          ))}
        </nav>

        {/* Auth section */}
        <div className="space-y-3">
          {session ? (
            <>
              <Link href="/account" onClick={onClose} className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-bold">
                  {session.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{session.user?.name}</p>
                  <p className="text-xs text-neutral-500">View Account</p>
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full py-3 text-sm font-semibold text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={onClose} className="block">
                <span className="w-full py-3.5 text-sm font-semibold text-white bg-neutral-900 rounded-xl hover:bg-black transition-colors flex items-center justify-center cursor-pointer">
                  Sign In
                </span>
              </Link>
              <Link href="/register" onClick={onClose} className="block">
                <span className="w-full py-3.5 text-sm font-semibold text-neutral-900 border border-neutral-200 rounded-xl hover:border-neutral-900 transition-colors flex items-center justify-center cursor-pointer">
                  Create Account
                </span>
              </Link>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}

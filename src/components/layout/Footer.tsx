import Link from 'next/link';
import { getVisibleContentPages, getStorefrontShell } from '@/features/shop/services/data';
import { Container } from './Container';
import { Copyright } from './Copyright';

export async function Footer() {
  const [visiblePages, { storeSettings }] = await Promise.all([
    getVisibleContentPages(),
    getStorefrontShell(),
  ]);

  const socialLinks: any[] = JSON.parse(storeSettings?.socialLinks || '[]');
  const shopLinks: any[] = JSON.parse(storeSettings?.footerShopLinks || '[]');
  const companyPages = visiblePages.filter(p => p.footerGroup === 'company');
  const supportPages = visiblePages.filter(p => p.footerGroup === 'support');

  const showShop    = (storeSettings?.showFooterShop    ?? true) !== false;
  const showCompany = (storeSettings?.showFooterCompany ?? true) !== false;
  const showSupport = (storeSettings?.showFooterSupport ?? true) !== false;

  return (
    <footer className="bg-neutral-950">
      <Container>

        {/* ── Main columns ───────────────────────────── */}
        <div className="pt-14 pb-10 grid grid-cols-2 md:grid-cols-12 gap-8 border-b border-neutral-800/60">

          {/* Brand */}
          <div className="col-span-2 md:col-span-4 space-y-5">
            <Link href="/">
              <span className="text-[12px] font-bold tracking-[0.2em] text-white uppercase hover:opacity-60 transition-opacity">
                {storeSettings?.storeName || 'Elevanza'}
              </span>
            </Link>
            <p className="text-[12px] text-neutral-500 leading-relaxed max-w-[220px]">
              Luxury fashion curated for the discerning modern lifestyle.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-5 pt-1">
                {socialLinks.map((link, i) => (
                  <Link
                    key={i}
                    href={link.url}
                    className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600 hover:text-neutral-300 transition-colors"
                  >
                    {link.platform}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Shop */}
          {showShop && shopLinks.length > 0 && (
            <div className="md:col-span-2 space-y-4">
              <FooterHeading>Shop</FooterHeading>
              <ul className="space-y-3">
                {shopLinks.map((link, i) => (
                  <FooterLink key={i} href={link.href}>{link.label}</FooterLink>
                ))}
              </ul>
            </div>
          )}

          {/* Company */}
          {showCompany && companyPages.length > 0 && (
            <div className="md:col-span-2 space-y-4">
              <FooterHeading>Company</FooterHeading>
              <ul className="space-y-3">
                {companyPages.map(p => (
                  <FooterLink key={p.slug} href={`/pages/${p.slug}`}>{p.title}</FooterLink>
                ))}
              </ul>
            </div>
          )}

          {/* Support */}
          {showSupport && supportPages.length > 0 && (
            <div className="md:col-span-2 space-y-4">
              <FooterHeading>Support</FooterHeading>
              <ul className="space-y-3">
                {supportPages.map(p => (
                  <FooterLink key={p.slug} href={`/pages/${p.slug}`}>{p.title}</FooterLink>
                ))}
              </ul>
            </div>
          )}

          {/* Newsletter (footer version) */}
          {(storeSettings?.showFooterNewsletter ?? true) !== false && (
            <div className="col-span-2 md:col-span-2 space-y-4">
              <FooterHeading>Stay in touch</FooterHeading>
              <form className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 bg-white/6 border border-white/8 text-neutral-300 placeholder:text-neutral-600 text-xs rounded-lg focus:outline-none focus:border-white/20 transition-colors"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-semibold rounded-lg transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ── Bottom bar ─────────────────────────────── */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-neutral-700 font-medium">
            © <Copyright /> {storeSettings?.storeName?.toUpperCase() || 'ELEVANZA MODERNE'}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/pages/privacy" className="text-[11px] text-neutral-700 hover:text-neutral-400 transition-colors font-medium">
              Privacy Policy
            </Link>
            <Link href="/pages/terms" className="text-[11px] text-neutral-700 hover:text-neutral-400 transition-colors font-medium">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
      {children}
    </h3>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[12px] font-normal text-neutral-600 hover:text-neutral-300 transition-colors leading-relaxed">
        {children}
      </Link>
    </li>
  );
}

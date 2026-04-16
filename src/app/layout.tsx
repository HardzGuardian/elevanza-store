import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import AuthContext from "@/core/auth/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import { SupabaseRealtimeProvider } from "@/core/realtime/SupabaseRealtimeProvider";
import { AdminRealtimeListener } from '@/features/admin/components/AdminRealtimeListener';
import { cn } from "@/core/utils";
import { EmergencyBanner } from "@/components/layout/EmergencyBanner";
import { FestivalBanner } from "@/components/layout/FestivalBanner";
import { getStorefrontShell } from "@/features/shop/services/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { storeSettings } = await getStorefrontShell();
  return {
    title: {
      default: storeSettings?.storeName || "Elevanza Moderne",
      template: `%s | ${storeSettings?.storeName || "Elevanza Moderne"}`
    },
    description: storeSettings?.heroSubtitle || "Premium luxury fashion and accessories.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { storeSettings, activeFestival, categories } = await getStorefrontShell();

  const storeName = storeSettings?.storeName || "Elevanza Moderne";
  const navCategories = storeSettings?.showNavCategories
    ? categories.map(c => ({ name: c.name, slug: c.slug }))
    : [];

  // Design Logic
  const primary = activeFestival?.primaryColor || storeSettings?.primaryColor || '#4f46e5';
  const accent = activeFestival?.accentColor || storeSettings?.accentColor || '#818cf8';
  const preset = activeFestival?.slug || storeSettings?.themePreset || 'default';

  // Generate dynamic styles based on brand/festival colors
  const dynamicStyles = `
    :root {
      --primary: ${primary};
      --accent: ${accent};
      --indigo-600: ${primary};
      --indigo-500: ${primary}CC;
      --indigo-400: ${accent};
    }
    
    ${preset === 'diwali' ? `
      body::before {
        content: '';
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background-image: radial-gradient(circle at 2px 2px, rgba(234, 179, 8, 0.05) 1px, transparent 0);
        background-size: 24px 24px;
        pointer-events: none;
        z-index: 100;
      }
    ` : ''}

  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col ${preset !== 'default' ? `theme-${preset}` : ''}`}
      >
        <AuthContext>
          <SupabaseRealtimeProvider>
            <Toaster position="top-right" />
            {storeSettings?.showEmergencyNotice && storeSettings?.emergencyNoticeText && (
              <EmergencyBanner message={storeSettings.emergencyNoticeText} />
            )}
            {activeFestival && activeFestival.promoMessage && (
              <FestivalBanner message={activeFestival.promoMessage} />
            )}
            <Suspense fallback={<div className="h-16 bg-white" />}>
              <Navbar storeName={storeName} categories={navCategories} />
            </Suspense>
            <main className={cn("flex-grow pt-16", preset === 'diwali' && "bg-amber-50/10")}>
              <Suspense fallback={<div className="animate-pulse bg-neutral-50 h-[60vh] rounded-xl m-8" />}>
                {children}
              </Suspense>
            </main>
            <Suspense fallback={<div className="h-64 bg-neutral-50" />}>
              <Footer />
            </Suspense>
          </SupabaseRealtimeProvider>
        </AuthContext>
      </body>
    </html>
  );
}

import NextAuth from "next-auth";
import { authConfig } from "@/core/auth/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

/**
 * Global Middleware: Next.js Auth v5
 * Uses the base authConfig to provide edge-compatible session verification.
 */
export default auth;


export const config = {
  /**
   * Optimize matcher to avoid running on static assets.
   * This improves site performance and Time to First Byte (TTFB).
   */
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|woff2?|map|json|txt)$).*)'],
};


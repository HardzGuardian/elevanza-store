'use client';

import { useEffect, useState } from 'react';

/**
 * A small utility component to display the current year.
 * Prevents hydration mismatches and Next.js 16 prerender errors.
 */
export function Copyright() {
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <span>{year}</span>;
}

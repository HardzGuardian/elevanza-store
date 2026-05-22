'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

interface RealtimeContextType {
  supabase: SupabaseClient;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function SupabaseRealtimeProvider({ children }: { children: React.ReactNode }) {
  return (
    <RealtimeContext.Provider value={{ supabase }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export const useSupabaseRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useSupabaseRealtime must be used within a SupabaseRealtimeProvider');
  }
  return context.supabase;
};

/**
 * Hook to listen for database changes on a specific table and event.
 */
export function useTableSubscription(
  tableName: string, 
  eventName: 'INSERT' | 'UPDATE' | 'DELETE' | '*', 
  callback: (payload: any) => void
) {
  const supabase = useSupabaseRealtime();

  // Keep a ref to the latest callback so the subscription effect never needs
  // to re-run when the caller passes a new inline arrow function. Without this,
  // every render would teardown and recreate the WebSocket channel.
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const channel = supabase
      .channel(`public:${tableName}:${eventName}`)
      .on(
        'postgres_changes',
        { event: eventName, schema: 'public', table: tableName },
        (payload) => callbackRef.current(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // callback is intentionally omitted: the callbackRef sync effect above
    // keeps callbackRef.current up-to-date on every render without causing
    // this subscription effect to re-run and churn the WebSocket channel.
  }, [supabase, tableName, eventName]);
}

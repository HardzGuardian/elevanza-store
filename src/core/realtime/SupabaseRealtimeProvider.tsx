'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    const channel = supabase
      .channel(`public:${tableName}:${eventName}`)
      .on(
        'postgres_changes', 
        { event: eventName, schema: 'public', table: tableName }, 
        (payload) => callback(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, tableName, eventName, callback]);
}

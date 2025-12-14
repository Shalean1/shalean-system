/**
 * Server-side booking data functions
 * Uses server-side Supabase client for use in server components
 */

import { createClient } from '@/lib/supabase/server';
import type { AdditionalService } from './booking-data';

/**
 * Fetch all active additional services/extras (server-side)
 */
export async function getAdditionalServicesServer(): Promise<AdditionalService[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('additional_services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching additional services:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching additional services:', error);
    return [];
  }
}

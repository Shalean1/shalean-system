/**
 * Client-side Booking Data Functions
 * For use in Client Components only
 */

import { createClient } from '@/lib/supabase/client';

// Type definition (duplicated from booking-data.ts to avoid importing server-only code)
export interface ServiceCategoryPricing {
  id: string;
  category_id: string;
  category_name: string;
  display_price: number;
  description?: string;
  display_order: number;
  is_active: boolean;
}

// Fallback pricing if database fetch fails
export const FALLBACK_SERVICE_CATEGORY_PRICING: Record<string, number> = {
  "residential-cleaning": 500,
  "commercial-cleaning": 800,
  "specialized-cleaning": 900,
};

/**
 * Fetch all active service category pricing (Client-side)
 * Use this in Client Components
 */
export async function getServiceCategoryPricingClient(): Promise<ServiceCategoryPricing[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('service_category_pricing')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      // Check if table doesn't exist (common error code: 42P01)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn(
          'service_category_pricing table does not exist. Please run migration 057_service_category_pricing.sql'
        );
      } else {
        console.error('Error fetching service category pricing (client):', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
      }
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching service category pricing (client):', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      error: error,
    });
    return [];
  }
}


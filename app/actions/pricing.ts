"use server";

import { PricingConfig } from "@/lib/pricing";
import { fetchPricingConfig } from "@/lib/pricing-server";

/**
 * Server action to fetch pricing configuration
 * Use this in Client Components instead of importing fetchPricingConfig directly
 */
export async function getPricingConfig(): Promise<PricingConfig> {
  return await fetchPricingConfig();
}


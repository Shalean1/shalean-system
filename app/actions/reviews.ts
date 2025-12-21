"use server";

import { createClient } from "@/lib/supabase/server";

export interface Review {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_image_url: string | null;
  rating: number;
  review_text: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  is_featured: boolean;
  display_order: number;
  booking_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewInput {
  customer_name: string;
  customer_email?: string;
  customer_image_url?: string;
  rating: number;
  review_text: string;
  status?: 'pending' | 'approved' | 'rejected' | 'archived';
  is_featured?: boolean;
  display_order?: number;
  booking_id?: string;
  published_at?: string;
}

export interface ReviewFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'archived';
  rating?: number;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'published_at' | 'rating' | 'display_order';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get all reviews with optional filters
 */
export async function getReviews(filters: ReviewFilters = {}): Promise<{
  reviews: Review[];
  total: number;
}> {
  const supabase = await createClient();
  
  let query = supabase
    .from('reviews')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.rating) {
    query = query.eq('rating', filters.rating);
  }

  if (filters.search) {
    query = query.or(`customer_name.ilike.%${filters.search}%,review_text.ilike.%${filters.search}%`);
  }

  // Sorting
  const sortBy = filters.sortBy || 'created_at';
  const sortOrder = filters.sortOrder || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Pagination
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching reviews:', error);
    return { reviews: [], total: 0 };
  }

  return {
    reviews: (data as Review[]) || [],
    total: count || 0,
  };
}

/**
 * Get a single review by ID
 */
export async function getReviewById(id: string): Promise<Review | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching review:', error);
    return null;
  }

  return data as Review;
}

/**
 * Create a new review
 */
export async function createReview(input: ReviewInput): Promise<{
  success: boolean;
  data?: Review;
  error?: string;
}> {
  const supabase = await createClient();
  
  // Set published_at if status is approved
  const reviewData: any = {
    ...input,
    published_at: input.status === 'approved' && !input.published_at 
      ? new Date().toISOString() 
      : input.published_at || null,
  };

  const { data, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Review };
}

/**
 * Update a review
 */
export async function updateReview(
  id: string,
  input: Partial<ReviewInput>
): Promise<{
  success: boolean;
  data?: Review;
  error?: string;
}> {
  const supabase = await createClient();
  
  // If status is being changed to approved and published_at is not set, set it
  const updateData: any = { ...input };
  if (input.status === 'approved') {
    const currentReview = await getReviewById(id);
    if (currentReview && !currentReview.published_at && !input.published_at) {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from('reviews')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating review:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Review };
}

/**
 * Delete a review
 */
export async function deleteReview(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting review:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Approve a review (set status to approved and publish)
 */
export async function approveReview(id: string): Promise<{
  success: boolean;
  data?: Review;
  error?: string;
}> {
  return updateReview(id, {
    status: 'approved',
    published_at: new Date().toISOString(),
  });
}

/**
 * Get featured reviews (for display on homepage)
 */
export async function getFeaturedReviews(limit: number = 10): Promise<Review[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'approved')
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured reviews:', error);
    return [];
  }

  return (data as Review[]) || [];
}

/**
 * Get approved reviews (for public display)
 */
export async function getApprovedReviews(limit: number = 50): Promise<Review[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'approved')
    .order('display_order', { ascending: true })
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching approved reviews:', error);
    return [];
  }

  return (data as Review[]) || [];
}

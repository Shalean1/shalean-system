"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { generateSlug, generateUniqueSlug } from "@/lib/utils/slug-generator";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  author_id: string | null;
  author_name: string;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  focus_keyword: string | null;
  reading_time: number;
  views: number;
  category: string | null;
  tags: string[] | null;
  canonical_url: string | null;
  og_image_url: string | null;
  schema_data: Record<string, any> | null;
  internal_links: string[] | null;
  related_post_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostInput {
  title: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  status?: 'draft' | 'published' | 'archived';
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  focus_keyword?: string;
  category?: string;
  tags?: string[];
  canonical_url?: string;
  og_image_url?: string;
  internal_links?: string[];
  related_post_ids?: string[];
}

export interface BlogPostFilters {
  status?: 'draft' | 'published' | 'archived';
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'published_at' | 'views' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get all blog posts with optional filters
 */
export async function getBlogPosts(filters: BlogPostFilters = {}): Promise<{
  posts: BlogPost[];
  total: number;
}> {
  const supabase = await createClient();
  
  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
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
    console.error('Error fetching blog posts:', error);
    throw new Error('Failed to fetch blog posts');
  }

  return {
    posts: (data as BlogPost[]) || [],
    total: count || 0,
  };
}

/**
 * Get a single blog post by slug (public)
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching blog post:', error);
    throw new Error('Failed to fetch blog post');
  }

  return data as BlogPost;
}

/**
 * Get a single blog post by ID (admin)
 */
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching blog post:', error);
    throw new Error('Failed to fetch blog post');
  }

  return data as BlogPost;
}

/**
 * Create a new blog post
 */
export async function createBlogPost(input: BlogPostInput): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Generate slug
  const { data: existingPosts } = await supabase
    .from('blog_posts')
    .select('slug');
  
  const existingSlugs = existingPosts?.map(p => p.slug) || [];
  const slug = generateUniqueSlug(input.title, existingSlugs);

  // Calculate reading time
  const readingTime = calculateReadingTime(input.content);

  // Set published_at if status is published
  const publishedAt = input.status === 'published' ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      slug,
      title: input.title,
      excerpt: input.excerpt || null,
      content: input.content,
      featured_image_url: input.featured_image_url || null,
      author_id: user.id,
      author_name: user.user_metadata?.name || 'Bokkie Cleaning Services',
      status: input.status || 'draft',
      published_at: publishedAt,
      seo_title: input.seo_title || null,
      seo_description: input.seo_description || null,
      seo_keywords: input.seo_keywords || [],
      focus_keyword: input.focus_keyword || null,
      reading_time: readingTime,
      category: input.category || null,
      tags: input.tags || [],
      canonical_url: input.canonical_url || null,
      og_image_url: input.og_image_url || null,
      internal_links: input.internal_links || [],
      related_post_ids: input.related_post_ids || [],
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating blog post:', error);
    return { success: false, error: error.message };
  }

  return { success: true, id: data.id };
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(
  id: string,
  input: BlogPostInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Get existing post to check slug
  const existingPost = await getBlogPostById(id);
  if (!existingPost) {
    return { success: false, error: 'Post not found' };
  }

  // Update slug if title changed
  let slug = existingPost.slug;
  if (input.title !== existingPost.title) {
    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('slug')
      .neq('id', id);
    
    const existingSlugs = existingPosts?.map(p => p.slug) || [];
    slug = generateUniqueSlug(input.title, existingSlugs);
  }

  // Calculate reading time
  const readingTime = calculateReadingTime(input.content);

  // Set published_at if status changed to published
  let publishedAt = existingPost.published_at;
  if (input.status === 'published' && existingPost.status !== 'published') {
    publishedAt = new Date().toISOString();
  }

  const { error } = await supabase
    .from('blog_posts')
    .update({
      slug,
      title: input.title,
      excerpt: input.excerpt !== undefined ? input.excerpt : existingPost.excerpt,
      content: input.content,
      featured_image_url: input.featured_image_url !== undefined ? input.featured_image_url : existingPost.featured_image_url,
      status: input.status !== undefined ? input.status : existingPost.status,
      published_at: publishedAt,
      seo_title: input.seo_title !== undefined ? input.seo_title : existingPost.seo_title,
      seo_description: input.seo_description !== undefined ? input.seo_description : existingPost.seo_description,
      seo_keywords: input.seo_keywords !== undefined ? input.seo_keywords : existingPost.seo_keywords,
      focus_keyword: input.focus_keyword !== undefined ? input.focus_keyword : existingPost.focus_keyword,
      reading_time: readingTime,
      category: input.category !== undefined ? input.category : existingPost.category,
      tags: input.tags !== undefined ? input.tags : existingPost.tags,
      canonical_url: input.canonical_url !== undefined ? input.canonical_url : existingPost.canonical_url,
      og_image_url: input.og_image_url !== undefined ? input.og_image_url : existingPost.og_image_url,
      internal_links: input.internal_links !== undefined ? input.internal_links : existingPost.internal_links,
      related_post_ids: input.related_post_ids !== undefined ? input.related_post_ids : existingPost.related_post_ids,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating blog post:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog post:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Publish a draft blog post
 */
export async function publishBlogPost(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const publishedAt = new Date().toISOString();

  const { error } = await supabase
    .from('blog_posts')
    .update({
      status: 'published',
      published_at: publishedAt,
    })
    .eq('id', id);

  if (error) {
    console.error('Error publishing blog post:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Increment view counter for a blog post
 */
export async function incrementBlogViews(slug: string): Promise<void> {
  const supabase = await createClient();
  
  // Get current views and increment
  const { data: post } = await supabase
    .from('blog_posts')
    .select('views')
    .eq('slug', slug)
    .single();

  if (post) {
    await supabase
      .from('blog_posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('slug', slug);
  }
}

/**
 * Get related blog posts
 */
export async function getRelatedPosts(
  postId: string,
  category?: string,
  tags?: string[],
  limit: number = 3
): Promise<BlogPost[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .neq('id', postId)
    .limit(limit);

  // Prioritize posts with same category
  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  return (data as BlogPost[]) || [];
}

/**
 * Get all blog categories
 */
export async function getBlogCategories(): Promise<Array<{ id: string; name: string; slug: string; description: string | null }>> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('blog_categories')
    .select('id, name, slug, description')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all blog tags
 */
export async function getBlogTags(): Promise<Array<{ id: string; name: string; slug: string; usage_count: number }>> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('blog_tags')
    .select('id, name, slug, usage_count')
    .order('usage_count', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return data || [];
}

/**
 * Search blog posts (full-text search)
 */
export async function searchBlogPosts(query: string, limit: number = 20): Promise<BlogPost[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching blog posts:', error);
    return [];
  }

  return (data as BlogPost[]) || [];
}

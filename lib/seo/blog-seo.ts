/**
 * Blog-specific SEO utilities
 */

import type { Metadata } from 'next';
import { siteConfig, truncateTitle } from '@/lib/seo';

export interface BlogSEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export function generateBlogSEOMetadata(
  postTitle: string,
  postDescription: string,
  slug: string,
  customTitle?: string,
  customDescription?: string,
  keywords: string[] = [],
  ogImage?: string,
  publishedTime?: string,
  modifiedTime?: string,
  author?: string,
  category?: string,
  tags: string[] = []
): Metadata {
  const baseUrl = siteConfig.url;
  const postUrl = `${baseUrl}/blog/${slug}`;
  
  // Use custom SEO fields if provided, otherwise use post fields
  const seoTitle = customTitle || postTitle;
  const seoDescription = customDescription || postDescription;
  
  // Ensure title is within limits (60 chars) - truncate for template
  const finalTitle = truncateTitle(seoTitle);
  
  // Ensure description is within limits (155 chars)
  const finalDescription = seoDescription.length > 155
    ? `${seoDescription.substring(0, 152)}...`
    : seoDescription;

  const ogImageUrl = ogImage 
    ? (ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`)
    : `${baseUrl}/og-image.jpg`;

  const metadata: Metadata = {
    title: { default: finalTitle },
    description: finalDescription,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      type: 'article',
      locale: 'en_ZA',
      url: postUrl,
      siteName: siteConfig.name,
      title: finalTitle,
      description: finalDescription,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
      ...(publishedTime && {
        publishedTime,
      }),
      ...(modifiedTime && {
        modifiedTime,
      }),
      ...(author && {
        authors: [author],
      }),
      ...(category && {
        section: category,
      }),
      ...(tags.length > 0 && {
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      images: [ogImageUrl],
      creator: '@bokkiecleaning',
      site: '@bokkiecleaning',
    },
    other: {
      'article:published_time': publishedTime || '',
      'article:modified_time': modifiedTime || '',
      ...(author && { 'article:author': author }),
      ...(category && { 'article:section': category }),
      ...(tags.length > 0 && { 'article:tag': tags.join(', ') }),
    },
  };

  return metadata;
}

export function generateBlogListingSEOMetadata(): Metadata {
  return {
    title: { default: 'Blog' },
    description: 'Read our latest blog posts about cleaning tips, home maintenance, and professional cleaning services in Cape Town.',
    openGraph: {
      type: 'website',
      locale: 'en_ZA',
      url: `${siteConfig.url}/blog`,
      siteName: siteConfig.name,
      title: 'Blog | Bokkie Cleaning Services',
      description: 'Read our latest blog posts about cleaning tips, home maintenance, and professional cleaning services in Cape Town.',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Bokkie Cleaning Services Blog',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog | Bokkie Cleaning Services',
      description: 'Read our latest blog posts about cleaning tips, home maintenance, and professional cleaning services in Cape Town.',
      images: [`${siteConfig.url}/og-image.jpg`],
    },
  };
}

export function optimizeImageAlt(imageType: string, focusKeyword?: string, location?: string): string {
  let alt = `Bokkie Cleaning Services - ${imageType}`;
  
  if (focusKeyword) {
    alt += ` - ${focusKeyword}`;
  }
  
  if (location) {
    alt += ` in ${location}, Cape Town`;
  } else {
    alt += ' in Cape Town';
  }
  
  return alt;
}

export function generateSitemapEntry(
  slug: string,
  lastModified: Date,
  priority: number = 0.7,
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly'
) {
  return {
    url: `https://www.bokkiecleaning.co.za/blog/${slug}`,
    lastModified,
    changeFrequency,
    priority,
  };
}

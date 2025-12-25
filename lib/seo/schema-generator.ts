/**
 * Generate Schema.org structured data for blog posts
 */

export interface BlogPostSchema {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image?: string | string[];
  datePublished: string;
  dateModified: string;
  author: {
    '@type': string;
    name: string;
    url?: string;
  };
  publisher: {
    '@type': string;
    name: string;
    logo?: {
      '@type': string;
      url: string;
    };
  };
  mainEntityOfPage: {
    '@type': string;
    '@id': string;
  };
  keywords?: string | string[];
  articleSection?: string;
  articleBody?: string;
  wordCount?: number;
  timeRequired?: string;
}

export interface BreadcrumbSchema {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item: string;
  }>;
}

export function generateBlogPostSchema(
  title: string,
  description: string,
  url: string,
  imageUrl: string | undefined,
  authorName: string,
  publishedDate: string,
  modifiedDate: string,
  keywords: string[] = [],
  category?: string,
  content?: string,
  readingTime?: number
): BlogPostSchema {
  const baseUrl = 'https://www.bokkiecleaning.co.za';
  
  const schema: BlogPostSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bokkie Cleaning Services',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/bokkie-logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  if (imageUrl) {
    schema.image = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
  }

  if (keywords.length > 0) {
    schema.keywords = keywords.join(', ');
  }

  if (category) {
    schema.articleSection = category;
  }

  if (content) {
    const textContent = content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.trim().split(/\s+/).filter(w => w.length > 0).length;
    schema.articleBody = textContent.substring(0, 500); // First 500 chars
    schema.wordCount = wordCount;
  }

  if (readingTime) {
    schema.timeRequired = `PT${readingTime}M`; // ISO 8601 duration format
  }

  return schema;
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateArticleSchema(
  title: string,
  description: string,
  url: string,
  imageUrl: string | undefined,
  authorName: string,
  publishedDate: string,
  modifiedDate: string
): BlogPostSchema {
  const baseUrl = 'https://www.bokkiecleaning.co.za';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`) : undefined,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bokkie Cleaning Services',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/bokkie-logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

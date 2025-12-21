/**
 * Calculate reading time for blog posts
 * Based on average reading speed of 200 words per minute
 */

export function calculateReadingTime(content: string): number {
  if (!content || content.trim().length === 0) {
    return 1; // Minimum 1 minute
  }

  // Remove HTML tags if present
  const textContent = content.replace(/<[^>]*>/g, '');
  
  // Count words (split by whitespace)
  const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Average reading speed: 200 words per minute
  const readingTime = Math.ceil(wordCount / 200);

  // Return at least 1 minute
  return Math.max(1, readingTime);
}

export function getWordCount(content: string): number {
  if (!content || content.trim().length === 0) {
    return 0;
  }

  // Remove HTML tags if present
  const textContent = content.replace(/<[^>]*>/g, '');
  
  // Count words (split by whitespace)
  const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
  
  return words.length;
}

export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return '1 min read';
  }
  return `${minutes} min read`;
}

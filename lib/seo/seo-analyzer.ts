/**
 * SEO Analyzer - Calculate SEO scores and provide recommendations
 */

export interface SEOAnalysis {
  score: number; // 0-100
  title: {
    score: number;
    length: number;
    hasKeyword: boolean;
    recommendations: string[];
  };
  description: {
    score: number;
    length: number;
    hasKeyword: boolean;
    recommendations: string[];
  };
  content: {
    score: number;
    wordCount: number;
    keywordDensity: number;
    hasKeywordInFirst100: boolean;
    headingCount: { h1: number; h2: number; h3: number };
    recommendations: string[];
  };
  images: {
    score: number;
    count: number;
    hasAltText: boolean;
    recommendations: string[];
  };
  links: {
    score: number;
    internalCount: number;
    externalCount: number;
    recommendations: string[];
  };
  schema: {
    score: number;
    hasSchema: boolean;
    recommendations: string[];
  };
  overallRecommendations: string[];
}

export function calculateSEOScore(
  title: string,
  description: string,
  content: string,
  focusKeyword: string,
  seoTitle?: string,
  seoDescription?: string,
  images: Array<{ alt?: string }> = [],
  internalLinks: string[] = [],
  externalLinks: string[] = [],
  hasSchema: boolean = false
): SEOAnalysis {
  const analysis: SEOAnalysis = {
    score: 0,
    title: { score: 0, length: 0, hasKeyword: false, recommendations: [] },
    description: { score: 0, length: 0, hasKeyword: false, recommendations: [] },
    content: {
      score: 0,
      wordCount: 0,
      keywordDensity: 0,
      hasKeywordInFirst100: false,
      headingCount: { h1: 0, h2: 0, h3: 0 },
      recommendations: [],
    },
    images: { score: 0, count: 0, hasAltText: false, recommendations: [] },
    links: { score: 0, internalCount: 0, externalCount: 0, recommendations: [] },
    schema: { score: 0, hasSchema: false, recommendations: [] },
    overallRecommendations: [],
  };

  const displayTitle = seoTitle || title;
  const displayDescription = seoDescription || description;
  const keyword = focusKeyword?.toLowerCase() || '';

  // Analyze Title (20% weight)
  analysis.title.length = displayTitle.length;
  analysis.title.hasKeyword = keyword ? displayTitle.toLowerCase().includes(keyword) : false;
  
  if (displayTitle.length >= 50 && displayTitle.length <= 60) {
    analysis.title.score = 20;
  } else if (displayTitle.length >= 40 && displayTitle.length < 50) {
    analysis.title.score = 15;
  } else if (displayTitle.length > 60 && displayTitle.length <= 70) {
    analysis.title.score = 12;
  } else {
    analysis.title.score = 5;
  }

  if (!analysis.title.hasKeyword && keyword) {
    analysis.title.score = Math.max(0, analysis.title.score - 5);
    analysis.title.recommendations.push('Include focus keyword in title');
  }

  if (displayTitle.length < 50) {
    analysis.title.recommendations.push('Title should be 50-60 characters');
  } else if (displayTitle.length > 60) {
    analysis.title.recommendations.push('Title should be 50-60 characters (currently too long)');
  }

  // Analyze Description (15% weight)
  analysis.description.length = displayDescription.length;
  analysis.description.hasKeyword = keyword ? displayDescription.toLowerCase().includes(keyword) : false;
  
  if (displayDescription.length >= 140 && displayDescription.length <= 155) {
    analysis.description.score = 15;
  } else if (displayDescription.length >= 120 && displayDescription.length < 140) {
    analysis.description.score = 12;
  } else if (displayDescription.length > 155 && displayDescription.length <= 170) {
    analysis.description.score = 10;
  } else {
    analysis.description.score = 5;
  }

  if (!analysis.description.hasKeyword && keyword) {
    analysis.description.score = Math.max(0, analysis.description.score - 3);
    analysis.description.recommendations.push('Include focus keyword in meta description');
  }

  if (displayDescription.length < 140) {
    analysis.description.recommendations.push('Meta description should be 140-155 characters');
  } else if (displayDescription.length > 155) {
    analysis.description.recommendations.push('Meta description should be 140-155 characters (currently too long)');
  }

  // Analyze Content (30% weight)
  const textContent = content.replace(/<[^>]*>/g, '');
  const words = textContent.trim().split(/\s+/).filter(w => w.length > 0);
  analysis.content.wordCount = words.length;

  // Check keyword in first 100 words
  const first100Words = words.slice(0, 100).join(' ').toLowerCase();
  analysis.content.hasKeywordInFirst100 = keyword ? first100Words.includes(keyword) : false;

  // Calculate keyword density
  if (keyword && words.length > 0) {
    const keywordMatches = textContent.toLowerCase().match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'));
    const keywordCount = keywordMatches ? keywordMatches.length : 0;
    analysis.content.keywordDensity = (keywordCount / words.length) * 100;
  }

  // Count headings
  const h1Matches = content.match(/<h1[^>]*>|^#\s+/gim);
  const h2Matches = content.match(/<h2[^>]*>|^##\s+/gim);
  const h3Matches = content.match(/<h3[^>]*>|^###\s+/gim);
  analysis.content.headingCount.h1 = h1Matches ? h1Matches.length : 0;
  analysis.content.headingCount.h2 = h2Matches ? h2Matches.length : 0;
  analysis.content.headingCount.h3 = h3Matches ? h3Matches.length : 0;

  // Content scoring
  if (analysis.content.wordCount >= 1000) {
    analysis.content.score = 30;
  } else if (analysis.content.wordCount >= 500) {
    analysis.content.score = 20;
  } else if (analysis.content.wordCount >= 300) {
    analysis.content.score = 15;
  } else {
    analysis.content.score = 5;
    analysis.content.recommendations.push('Content should be at least 1000 words for best SEO');
  }

  if (!analysis.content.hasKeywordInFirst100 && keyword) {
    analysis.content.score = Math.max(0, analysis.content.score - 5);
    analysis.content.recommendations.push('Include focus keyword in first 100 words');
  }

  if (analysis.content.keywordDensity < 0.5 && keyword) {
    analysis.content.recommendations.push('Keyword density is low (aim for 1-2%)');
  } else if (analysis.content.keywordDensity > 3 && keyword) {
    analysis.content.recommendations.push('Keyword density is too high (aim for 1-2%)');
  }

  if (analysis.content.headingCount.h1 === 0) {
    analysis.content.recommendations.push('Add at least one H1 heading');
  }
  if (analysis.content.headingCount.h2 === 0) {
    analysis.content.recommendations.push('Add H2 headings to structure content');
  }

  // Analyze Images (10% weight)
  analysis.images.count = images.length;
  const imagesWithAlt = images.filter(img => img.alt && img.alt.trim().length > 0);
  analysis.images.hasAltText = images.length === 0 || imagesWithAlt.length === images.length;
  
  if (images.length === 0) {
    analysis.images.score = 5;
    analysis.images.recommendations.push('Add images to improve engagement');
  } else if (analysis.images.hasAltText) {
    analysis.images.score = 10;
  } else {
    analysis.images.score = 5;
    analysis.images.recommendations.push('Add alt text to all images');
  }

  // Analyze Links (15% weight)
  analysis.links.internalCount = internalLinks.length;
  analysis.links.externalCount = externalLinks.length;
  
  if (internalLinks.length >= 3 && internalLinks.length <= 5) {
    analysis.links.score = 15;
  } else if (internalLinks.length >= 1 && internalLinks.length < 3) {
    analysis.links.score = 10;
    analysis.links.recommendations.push('Add 3-5 internal links for better SEO');
  } else if (internalLinks.length > 5) {
    analysis.links.score = 12;
    analysis.links.recommendations.push('Too many internal links (aim for 3-5)');
  } else {
    analysis.links.score = 5;
    analysis.links.recommendations.push('Add internal links to related content');
  }

  if (externalLinks.length === 0) {
    analysis.links.recommendations.push('Consider adding external links to authoritative sources');
  }

  // Analyze Schema (10% weight)
  analysis.schema.hasSchema = hasSchema;
  analysis.schema.score = hasSchema ? 10 : 0;
  if (!hasSchema) {
    analysis.schema.recommendations.push('Add structured data (schema markup)');
  }

  // Calculate overall score
  analysis.score = Math.round(
    analysis.title.score +
    analysis.description.score +
    analysis.content.score +
    analysis.images.score +
    analysis.links.score +
    analysis.schema.score
  );

  // Overall recommendations
  if (analysis.score < 50) {
    analysis.overallRecommendations.push('Focus on improving title, description, and content length');
  } else if (analysis.score < 70) {
    analysis.overallRecommendations.push('Good start! Improve keyword usage and internal linking');
  } else if (analysis.score < 90) {
    analysis.overallRecommendations.push('Excellent! Minor improvements needed');
  } else {
    analysis.overallRecommendations.push('Perfect SEO optimization!');
  }

  return analysis;
}

export function analyzeKeywords(content: string, focusKeyword: string): {
  density: number;
  count: number;
  positions: number[];
} {
  if (!focusKeyword) {
    return { density: 0, count: 0, positions: [] };
  }

  const textContent = content.replace(/<[^>]*>/g, '');
  const words = textContent.trim().split(/\s+/).filter(w => w.length > 0);
  const keywordLower = focusKeyword.toLowerCase();
  
  const positions: number[] = [];
  let count = 0;
  
  words.forEach((word, index) => {
    if (word.toLowerCase().includes(keywordLower)) {
      count++;
      positions.push(index);
    }
  });

  const density = words.length > 0 ? (count / words.length) * 100 : 0;

  return { density, count, positions };
}

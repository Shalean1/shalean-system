"use client";

import { calculateSEOScore, type SEOAnalysis } from "@/lib/seo/seo-analyzer";
import { CheckCircle2, XCircle, AlertCircle, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface SEOAnalyzerProps {
  title: string;
  description: string;
  content: string;
  focusKeyword: string;
  seoTitle?: string;
  seoDescription?: string;
  images: Array<{ alt?: string }>;
  internalLinks: string[];
  externalLinks: string[];
  hasSchema?: boolean;
}

export default function SEOAnalyzer({
  title,
  description,
  content,
  focusKeyword,
  seoTitle,
  seoDescription,
  images,
  internalLinks,
  externalLinks,
  hasSchema = false,
}: SEOAnalyzerProps) {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);

  useEffect(() => {
    const result = calculateSEOScore(
      title,
      description,
      content,
      focusKeyword,
      seoTitle,
      seoDescription,
      images,
      internalLinks,
      externalLinks,
      hasSchema
    );
    setAnalysis(result);
  }, [title, description, content, focusKeyword, seoTitle, seoDescription, images, internalLinks, externalLinks, hasSchema]);

  if (!analysis) {
    return <div>Analyzing...</div>;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className={`p-6 rounded-lg ${getScoreBgColor(analysis.score)} border-2 ${getScoreColor(analysis.score)} border-current`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">SEO Score</h3>
          <span className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
            {analysis.score}/100
          </span>
        </div>
        <div className="w-full bg-white rounded-full h-2 mt-4">
          <div
            className={`h-2 rounded-full ${
              analysis.score >= 80
                ? "bg-green-600"
                : analysis.score >= 60
                ? "bg-yellow-600"
                : "bg-red-600"
            }`}
            style={{ width: `${analysis.score}%` }}
          />
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Score Breakdown</h4>

        {/* Title */}
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Title</span>
            <span className="text-sm font-semibold text-gray-900">
              {analysis.title.score}/20
            </span>
          </div>
          <div className="text-xs text-gray-600 mb-2">
            Length: {analysis.title.length} chars
            {analysis.title.hasKeyword && focusKeyword && (
              <span className="ml-2 text-green-600">✓ Keyword included</span>
            )}
          </div>
          {analysis.title.recommendations.length > 0 && (
            <ul className="space-y-1">
              {analysis.title.recommendations.map((rec, idx) => (
                <li key={idx} className="text-xs text-yellow-600 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Description */}
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Meta Description</span>
            <span className="text-sm font-semibold text-gray-900">
              {analysis.description.score}/15
            </span>
          </div>
          <div className="text-xs text-gray-600 mb-2">
            Length: {analysis.description.length} chars
            {analysis.description.hasKeyword && focusKeyword && (
              <span className="ml-2 text-green-600">✓ Keyword included</span>
            )}
          </div>
          {analysis.description.recommendations.length > 0 && (
            <ul className="space-y-1">
              {analysis.description.recommendations.map((rec, idx) => (
                <li key={idx} className="text-xs text-yellow-600 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Content */}
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Content</span>
            <span className="text-sm font-semibold text-gray-900">
              {analysis.content.score}/30
            </span>
          </div>
          <div className="text-xs text-gray-600 mb-2 space-y-1">
            <div>Words: {analysis.content.wordCount}</div>
            {focusKeyword && (
              <div>
                Keyword density: {analysis.content.keywordDensity.toFixed(2)}%
                {analysis.content.keywordDensity >= 1 &&
                  analysis.content.keywordDensity <= 2 && (
                    <span className="ml-2 text-green-600">✓ Optimal</span>
                  )}
              </div>
            )}
            <div>
              Headings: H1({analysis.content.headingCount.h1}) H2({analysis.content.headingCount.h2}) H3({analysis.content.headingCount.h3})
            </div>
            {analysis.content.hasKeywordInFirst100 && focusKeyword && (
              <div className="text-green-600">✓ Keyword in first 100 words</div>
            )}
          </div>
          {analysis.content.recommendations.length > 0 && (
            <ul className="space-y-1">
              {analysis.content.recommendations.map((rec, idx) => (
                <li key={idx} className="text-xs text-yellow-600 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Images */}
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Images</span>
            <span className="text-sm font-semibold text-gray-900">
              {analysis.images.score}/10
            </span>
          </div>
          <div className="text-xs text-gray-600 mb-2">
            Count: {analysis.images.count}
            {analysis.images.hasAltText && (
              <span className="ml-2 text-green-600">✓ All have alt text</span>
            )}
          </div>
          {analysis.images.recommendations.length > 0 && (
            <ul className="space-y-1">
              {analysis.images.recommendations.map((rec, idx) => (
                <li key={idx} className="text-xs text-yellow-600 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Links */}
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Links</span>
            <span className="text-sm font-semibold text-gray-900">
              {analysis.links.score}/15
            </span>
          </div>
          <div className="text-xs text-gray-600 mb-2">
            Internal: {analysis.links.internalCount} | External: {analysis.links.externalCount}
          </div>
          {analysis.links.recommendations.length > 0 && (
            <ul className="space-y-1">
              {analysis.links.recommendations.map((rec, idx) => (
                <li key={idx} className="text-xs text-yellow-600 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Schema */}
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Schema Markup</span>
            <span className="text-sm font-semibold text-gray-900">
              {analysis.schema.score}/10
            </span>
          </div>
          {analysis.schema.hasSchema ? (
            <div className="text-xs text-green-600">✓ Schema markup enabled</div>
          ) : (
            <div className="text-xs text-yellow-600">
              Schema markup will be added automatically when published
            </div>
          )}
        </div>
      </div>

      {/* Overall Recommendations */}
      {analysis.overallRecommendations.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recommendations
          </h4>
          <ul className="space-y-1">
            {analysis.overallRecommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-blue-800">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

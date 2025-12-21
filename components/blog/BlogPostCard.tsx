import Link from "next/link";
import Image from "next/image";
import { formatReadingTime } from "@/lib/utils/reading-time";
import { Calendar, Clock } from "lucide-react";

interface BlogPostCardProps {
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  publishedAt: string | null;
  readingTime: number;
  category: string | null;
}

export default function BlogPostCard({
  slug,
  title,
  excerpt,
  featuredImageUrl,
  publishedAt,
  readingTime,
  category,
}: BlogPostCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="group">
      <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        {featuredImageUrl && (
          <div className="relative w-full h-48 bg-gray-200">
            <Image
              src={featuredImageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="p-6">
          {category && (
            <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">
              {category}
            </span>
          )}
          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {title}
          </h2>
          {excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-3">{excerpt}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(publishedAt).toLocaleDateString()}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatReadingTime(readingTime)}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

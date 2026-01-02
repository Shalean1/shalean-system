"use client";

interface SEOPreviewProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
}

export default function SEOPreview({
  title,
  description,
  url,
  imageUrl,
}: SEOPreviewProps) {
  const baseUrl = "https://bokkiecleaning.co.za";
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  const displayImage = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${baseUrl}${imageUrl}`
    : `${baseUrl}/og-image.jpg`;

  return (
    <div className="space-y-6">
      {/* Google Search Preview */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Google Search Result</h3>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="text-xs text-gray-500 mb-1">{fullUrl}</div>
          <div className="text-xl text-blue-600 mb-1 line-clamp-1">{title}</div>
          <div className="text-sm text-gray-600 line-clamp-2">{description}</div>
        </div>
      </div>

      {/* Facebook Preview */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Facebook Share</h3>
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white max-w-md">
          {displayImage && (
            <div className="w-full h-48 bg-gray-200">
              <img
                src={displayImage}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          <div className="p-3">
            <div className="text-xs text-gray-500 uppercase mb-1">bokkiecleaning.co.za</div>
            <div className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
              {title}
            </div>
            <div className="text-sm text-gray-600 line-clamp-2">{description}</div>
          </div>
        </div>
      </div>

      {/* Twitter Preview */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Twitter Card</h3>
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white max-w-md">
          {displayImage && (
            <div className="w-full h-48 bg-gray-200">
              <img
                src={displayImage}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          <div className="p-3">
            <div className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
              {title}
            </div>
            <div className="text-sm text-gray-600 line-clamp-2 mb-2">{description}</div>
            <div className="text-xs text-gray-500">{fullUrl}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

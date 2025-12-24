"use client";

import { useState } from "react";
import Image from "next/image";

interface ServiceImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function ServiceImage({ src, alt, className = "", priority = false }: ServiceImageProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 ${className}`} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={priority}
      onError={() => setImageError(true)}
    />
  );
}


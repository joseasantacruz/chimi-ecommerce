"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { product_images } from "@prisma/client";

interface ImageGalleryProps {
  images: product_images[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const primary = images.find((i) => i.is_primary) ?? images[0];
  const [selected, setSelected] = useState(primary?.url ?? "");

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-muted-foreground">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={selected}
          alt={productName}
          fill
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelected(img.url)}
              className={cn(
                "relative w-16 h-16 rounded-md overflow-hidden border-2 transition-colors",
                selected === img.url ? "border-primary" : "border-transparent"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt_text ?? productName}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

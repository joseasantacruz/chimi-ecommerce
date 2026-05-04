"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageItem {
  id: string;
  url: string;
  alt_text?: string | null;
  is_primary: boolean;
}

interface ImageGalleryProps {
  images: ImageItem[];
  name: string;
  aspectRatio?: "square" | "video";
}

export function ImageGallery({ images, name, aspectRatio = "square" }: ImageGalleryProps) {
  const primary = images.find((i) => i.is_primary) ?? images[0];
  const [selected, setSelected] = useState(primary?.url ?? "");

  if (images.length === 0) {
    return (
      <div className={cn("rounded-lg bg-gray-100 flex items-center justify-center text-muted-foreground", aspectRatio === "square" ? "aspect-square" : "aspect-video")}>
        Sin imagen
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={cn("relative rounded-lg overflow-hidden bg-gray-100", aspectRatio === "square" ? "aspect-square" : "aspect-video")}>
        <Image src={selected} alt={name} fill className="object-cover" priority />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelected(img.url)}
              className={cn(
                "relative w-16 h-16 rounded-md overflow-hidden border-2 transition-colors",
                selected === img.url ? "border-primary" : "border-transparent hover:border-muted-foreground/40"
              )}
            >
              <Image src={img.url} alt={img.alt_text ?? name} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

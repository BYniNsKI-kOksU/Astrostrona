import { AstroImage } from "@/types";
import ImageCard from "./ImageCard";

interface ImageGridProps {
  images: AstroImage[];
}

export default function ImageGrid({ images }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <span className="text-4xl mb-4 block">📷</span>
        <h3 className="text-lg font-semibold text-night-300 mb-2">
          Brak zdjęć
        </h3>
        <p className="text-sm text-night-500">
          Nie znaleziono zdjęć. Bądź pierwszą osobą, która doda zdjęcie!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {images.map((image) => (
        <ImageCard key={image.id} image={image} />
      ))}
    </div>
  );
}

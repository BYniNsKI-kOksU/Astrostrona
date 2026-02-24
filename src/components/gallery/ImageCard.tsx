import Link from "next/link";
import {
  HiOutlineHeart,
  HiOutlineEye,
  HiOutlineChatBubbleLeft,
} from "react-icons/hi2";
import { AstroImage } from "@/types";
import { formatNumber, getMoonPhaseIcon, getObjectTypeLabel } from "@/lib/utils";

interface ImageCardProps {
  image: AstroImage;
}

export default function ImageCard({ image }: ImageCardProps) {
  return (
    <Link
      href={`/gallery/${image.id}`}
      className="glass-card-hover overflow-hidden group"
    >
      {/* Miniatura */}
      <div className="relative aspect-square bg-night-800 flex items-center justify-center">
        <span className="text-6xl opacity-30 group-hover:opacity-50 transition-opacity">
          🌌
        </span>

        {/* Overlay z danymi na hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-3 text-xs text-night-200">
              <span className="flex items-center gap-1">
                <HiOutlineHeart className="h-3.5 w-3.5" />
                {formatNumber(image.likes)}
              </span>
              <span className="flex items-center gap-1">
                <HiOutlineChatBubbleLeft className="h-3.5 w-3.5" />
                {formatNumber(image.comments)}
              </span>
              <span className="flex items-center gap-1">
                <HiOutlineEye className="h-3.5 w-3.5" />
                {formatNumber(image.views)}
              </span>
            </div>
          </div>
        </div>

        {/* Badge typu obiektu */}
        <div className="absolute top-2 left-2">
          <span className="tag bg-night-900/80 text-night-200 border-night-700/50 text-xs backdrop-blur-sm">
            {getObjectTypeLabel(image.objectType)}
          </span>
        </div>

        {/* Faza księżyca */}
        <div className="absolute top-2 right-2 text-lg" title={`Faza księżyca: ${image.moonPhase}%`}>
          {getMoonPhaseIcon(image.moonPhase)}
        </div>
      </div>

      {/* Informacje */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-night-100 truncate mb-1">
          {image.title}
        </h3>
        <p className="text-xs text-night-400 truncate mb-2">
          {image.objectName} • {image.constellation}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-cosmos-500/30 flex items-center justify-center text-cosmos-300 text-[10px] font-bold">
              {image.authorName.charAt(0)}
            </div>
            <span className="text-xs text-night-400">{image.authorName}</span>
          </div>
          <span className="text-xs text-night-500">
            {image.equipment.telescope.split(" ")[0]}
          </span>
        </div>
      </div>
    </Link>
  );
}

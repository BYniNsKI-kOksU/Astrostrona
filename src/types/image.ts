// =============================================
// Typy zdjęć astronomicznych (dane jak na Astrobin)
// =============================================

export type ObjectType =
  | "galaxy"
  | "nebula"
  | "star_cluster"
  | "planetary_nebula"
  | "supernova_remnant"
  | "comet"
  | "planet"
  | "moon"
  | "sun"
  | "wide_field"
  | "other";

export type Hemisphere = "north" | "south";

export interface AstroImage {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;

  // Dane obiektu
  objectName: string;
  objectType: ObjectType;
  constellation: string;

  // Dane techniczne
  equipment: EquipmentData;
  acquisitionData: AcquisitionData;

  // Warunki
  location: string;
  hemisphere: Hemisphere;
  date: string;
  moonPhase: number; // 0-100%
  bortleScale: number; // 1-9

  // Obraz
  resolution: { width: number; height: number };
  imageScale: number; // arc sec per pixel
  fileSize: string;

  // Social
  likes: number;
  comments: number;
  saves: number;
  views: number;
  isLiked: boolean;
  isSaved: boolean;

  tags: string[];
  createdAt: string;
}

export interface EquipmentData {
  telescope: string;
  camera: string;
  mount: string;
  filters: string[];
  accessories: string[];
  software: string[];
}

export interface AcquisitionData {
  totalExposure: string; // np. "12h 30min"
  subExposures: SubExposure[];
  gain: number;
  offset: number;
  coolingTemp: number; // °C
  darks: number;
  flats: number;
  bias: number;
}

export interface SubExposure {
  filter: string;
  exposureTime: number; // sekundy
  count: number;
}

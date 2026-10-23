export interface PlaceCategory {
  id: number;
  name: string;
  description?: string | null;
  status?: string;
}

export interface Place {
  id: number;
  name: string;
  short_description?: string | null;
  categories: PlaceCategory[];
  distance_km: number | null;
  entrance_fee: number | null;
  opening_hours: string | null;
  first_image_url: string | null;
  image_url: string | null;
  average_rating: number | null;
  latitude: number;
  longitude: number;
}

export interface FilterCategory {
  id: number;
  name: string;
  places_count: number;
  count: number;
}

export interface FilterMetadata {
  categories: FilterCategory[];
  min_distance: number;
  max_distance: number;
  max_fee: number;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface AppliedFilters {
  q?: string | null;
  category?: string | null;
  max_distance?: number | string | null;
  max_fee?: number | string | null;
  free?: number | string | null;
  sort?: string | null;
  page?: number | string | null;
}

export interface PlacesApiResponse {
  data: Place[];
  meta: PaginationMeta;
  filters?: AppliedFilters;
  message?: string;
}

export interface PlaceImage {
  id: number;
  url: string;
  caption?: string | null;
}

export interface NearbyPlace {
  id: number;
  name: string;
  categories?: string[];
  category_names?: string[];
  distance_from_here_km: number;
  first_image?: string | null;
  first_image_url?: string | null;
  image_url?: string | null;
  is_restaurant?: boolean;
  is_recreation?: boolean;
}

export interface PlaceDetail {
  id: number;
  name: string;
  categories: PlaceCategory[];
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  distance_km: number | null;
  opening_hours: string | null;
  entrance_fee: number | null;
  is_free: boolean;
  facilities: string[] | string | null;
  activities: string[] | string | null;
  travel_tips: string | null;
  visitor_guidelines: string | null;
  contact_info: string | null;
  images: PlaceImage[];
  average_rating: number | null;
  reviews_count: number;
  nearby: NearbyPlace[];
}

export interface PlaceDetailApiResponse {
  data: PlaceDetail;
  message?: string;
}

export interface MapPlace {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  category_names: string[];
  categories?: PlaceCategory[];
  distance_km: number | null;
  first_image_url: string | null;
  image_url?: string | null;
  opening_hours: string | null;
}

export interface MapPlacesApiResponse {
  data: MapPlace[];
  total: number;
  message?: string;
}


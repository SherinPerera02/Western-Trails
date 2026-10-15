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

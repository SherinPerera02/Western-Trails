export interface PlanAttraction {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance_km: number | null;
  opening_hours: string | null;
  first_image_url: string | null;
  status: string;
  categories?: { id: number; name: string }[];
}

export interface LegToNext {
  distance_km: number;
  estimated_minutes: number;
  from_attraction_id: number;
  to_attraction_id: number;
}

export interface PlanItemDetail {
  id: number;
  sequence: number;
  start_time: string | null;
  notes: string | null;
  attraction_id: number;
  unavailable: boolean;
  opening_hours: string | null;
  visit_hours_hint: string | null;
  attraction: PlanAttraction | null;
  leg_to_next: LegToNext | null;
}

export interface TripLeg {
  from_item_id: number;
  to_item_id: number;
  from_attraction_id: number;
  to_attraction_id: number;
  from_name: string;
  to_name: string;
  distance_km: number;
  estimated_minutes: number;
}

export interface VisitPlanDetail {
  id: number;
  plan_name: string;
  visit_date: string | null;
  items_count: number;
  total_distance_km: number;
  total_estimated_travel_minutes: number;
  disclaimer: string;
  items: PlanItemDetail[];
  legs: TripLeg[];
  created_at?: string;
  updated_at?: string;
}

export interface SavedPlanSummary {
  id: number;
  plan_name: string;
  visit_date: string | null;
  items_count: number;
  total_distance_km: number;
  created_at?: string;
  updated_at?: string;
}

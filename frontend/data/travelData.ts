export interface Destination {
  id: string;
  name: string;
  location: string;
  category: "Beaches" | "Nature" | "Historical" | "Cultural" | "Religious" | "Adventure" | "Food & Dining" | "Family";
  description: string;
  rating: number;
  reviewsCount: number;
  distance: string;
  image: string;
  tag: string;
  highlights: string[];
}

export interface TravelCategory {
  id: string;
  name: "Beaches" | "Nature" | "Historical" | "Cultural" | "Religious" | "Adventure" | "Food & Dining" | "Family";
  description: string;
  placesCount: string;
  iconName: string;
}

export interface DayTrip {
  id: string;
  title: string;
  startLocation: string;
  destinations: string[];
  distance: string;
  duration: string;
  placesCount: number;
  image: string;
  tag: string;
}

export interface WhyFeature {
  title: string;
  description: string;
  iconName: string;
}

export const POPULAR_DESTINATIONS: Destination[] = [
  {
    id: "panadura-beach",
    name: "Panadura Beach",
    location: "Panadura, West Coast",
    category: "Beaches",
    description: "Broad golden shore where the coastal train runs parallel to the waves. Renowned for spectacular sunsets, fresh sea breezes, and local street eats.",
    rating: 4.8,
    reviewsCount: 184,
    distance: "0.8 km from town",
    image: "/images/panadura-beach.jpg",
    tag: "Sunset Spot",
    highlights: ["Sunset viewing", "Walking promenade", "Local snack stalls"],
  },
  {
    id: "bolgoda-lake",
    name: "Bolgoda Lake",
    location: "Moratuwa / Panadura Inland",
    category: "Nature",
    description: "Sri Lanka's largest natural freshwater basin. Features peaceful shaded waterfronts, boat excursions through mangrove channels, and scenic lakeside dining.",
    rating: 4.9,
    reviewsCount: 215,
    distance: "7.5 km inland",
    image: "/images/bolgoda-lake.jpg",
    tag: "Waterfront",
    highlights: ["Boat safaris", "Birdwatching", "Lakeside seafood"],
  },
  {
    id: "wadduwa-beach",
    name: "Wadduwa Beach",
    location: "Wadduwa, South of Panadura",
    category: "Beaches",
    description: "Calm, expansive golden shoreline flanked by graceful coconut palms and traditional outrigger fishing canoes. Ideal for quiet morning strolls.",
    rating: 4.7,
    reviewsCount: 129,
    distance: "6.2 km south",
    image: "/images/wadduwa-beach.jpg",
    tag: "Quiet Shore",
    highlights: ["Palm groves", "Secluded beach", "Fishing culture"],
  },
  {
    id: "kalutara-bodhiya",
    name: "Kalutara Bodhiya",
    location: "Kalutara South Bridge",
    category: "Religious",
    description: "Venerated sacred Buddhist shrine situated where the Kalu River meets the ocean. Home to an iconic hollow white stupa adorned with intricate frescoes.",
    rating: 4.9,
    reviewsCount: 340,
    distance: "16 km south",
    image: "/images/kalutara-bodhiya.jpg",
    tag: "Sacred Landmark",
    highlights: ["Hollow stupa dome", "River estuary views", "Sacred Bodhi tree"],
  },
  {
    id: "richmond-castle",
    name: "Richmond Castle",
    location: "Kalutara Inland",
    category: "Historical",
    description: "Grand 1910 Edwardian mansion estate built by Mudaliyar Don Arthur de Silva. Boasts imported timber woodwork, colored glass, and manicured tropical orchards.",
    rating: 4.7,
    reviewsCount: 162,
    distance: "18.5 km south",
    image: "/images/richmond-castle.jpg",
    tag: "Colonial Heritage",
    highlights: ["Edwardian architecture", "Heritage grounds", "Historic teak woodwork"],
  },
  {
    id: "rankoth-viharaya",
    name: "Rankoth Viharaya",
    location: "Panadura Historic Quarter",
    category: "Religious",
    description: "Centuries-old historic Buddhist temple complex featuring an elegant white pagoda, quiet sandy courtyard, and ornate monastic heritage pavilions.",
    rating: 4.8,
    reviewsCount: 98,
    distance: "1.8 km from center",
    image: "/images/rankoth-viharaya.jpg",
    tag: "Cultural Heritage",
    highlights: ["Ancient stupa", "Tranquil courtyard", "Meditation sanctuary"],
  },
];

export const TRAVEL_CATEGORIES: TravelCategory[] = [
  {
    id: "beaches",
    name: "Beaches",
    description: "Golden shores, ocean sunsets & coastal breezes",
    placesCount: "12 Places",
    iconName: "Waves",
  },
  {
    id: "nature",
    name: "Nature",
    description: "Lakes, mangrove channels & biodiversity",
    placesCount: "9 Places",
    iconName: "Trees",
  },
  {
    id: "historical",
    name: "Historical",
    description: "Colonial mansions, fortresses & vintage estates",
    placesCount: "7 Places",
    iconName: "Landmark",
  },
  {
    id: "cultural",
    name: "Cultural",
    description: "Local traditions, art studios & handicraft trails",
    placesCount: "8 Places",
    iconName: "Sparkles",
  },
  {
    id: "religious",
    name: "Religious",
    description: "Sacred Buddhist stupas, temples & shrines",
    placesCount: "11 Places",
    iconName: "Church",
  },
  {
    id: "adventure",
    name: "Adventure",
    description: "Kayaking, coastal cycling & nature hikes",
    placesCount: "6 Places",
    iconName: "Compass",
  },
  {
    id: "food-dining",
    name: "Food & Dining",
    description: "Authentic coastal seafood & traditional cuisine",
    placesCount: "14 Places",
    iconName: "Utensils",
  },
  {
    id: "family",
    name: "Family",
    description: "Child-friendly picnic parks & safe waterfronts",
    placesCount: "8 Places",
    iconName: "Users",
  },
];

export const WHY_FEATURES: WhyFeature[] = [
  {
    title: "Discover Nearby",
    description: "Find interesting destinations and attractions near your location with zero guesswork.",
    iconName: "Compass",
  },
  {
    title: "Easy Planning",
    description: "Build your own itinerary and organize your day trip with ease and logical route order.",
    iconName: "Calendar",
  },
  {
    title: "Save Your Favorites",
    description: "Keep your favorite destinations in one place for future weekend adventures.",
    iconName: "Heart",
  },
  {
    title: "Travel Information",
    description: "Get useful information about opening hours, visitor etiquette, and tips before you visit.",
    iconName: "Info",
  },
];

export const FEATURED_DAY_TRIPS: DayTrip[] = [
  {
    id: "coastal-sunset-trail",
    title: "West Coast Sunset Promenade",
    startLocation: "Panadura Town",
    destinations: ["Panadura Beach", "Wadduwa Beach", "Sunset Shore"],
    distance: "9.5 km",
    duration: "4.5 Hours",
    placesCount: 3,
    image: "/images/panadura-beach.jpg",
    tag: "Coastal Route",
  },
  {
    id: "heritage-shrines-trail",
    title: "Sacred Heritage & Grand Castle",
    startLocation: "Panadura Clock Tower",
    destinations: ["Rankoth Viharaya", "Kalutara Bodhiya", "Richmond Castle"],
    distance: "21.0 km",
    duration: "6.0 Hours",
    placesCount: 3,
    image: "/images/kalutara-bodhiya.jpg",
    tag: "Cultural Route",
  },
  {
    id: "lake-mangrove-safari",
    title: "Lagoon Safari & Lakeside Lunch",
    startLocation: "Bolgoda Waterfront",
    destinations: ["Bolgoda Lake", "Mangrove Trail", "Lakeside Dining"],
    distance: "14.2 km",
    duration: "5.0 Hours",
    placesCount: 3,
    image: "/images/bolgoda-lake.jpg",
    tag: "Nature Route",
  },
];

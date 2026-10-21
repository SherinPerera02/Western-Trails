export const PANADURA_COORDS: [number, number] = [6.7133, 79.9026];
export const RADIUS_25KM_METERS = 25000;

export interface CategoryStyle {
  label: string;
  color: string;
  bg: string;
  border: string;
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Beach: {
    label: "Beach & Coast",
    color: "#0284C7", // Sky blue
    bg: "#E0F2FE",
    border: "#BAE6FD",
  },
  Religious: {
    label: "Religious & Sacred",
    color: "#D97706", // Saffron / Amber
    bg: "#FEF3C7",
    border: "#FDE68A",
  },
  Nature: {
    label: "Nature & Lake",
    color: "#15803D", // Forest green
    bg: "#DCFCE7",
    border: "#BBF7D0",
  },
  Heritage: {
    label: "Heritage & History",
    color: "#C2410C", // Terracotta
    bg: "#FFEDD5",
    border: "#FED7AA",
  },
  Restaurant: {
    label: "Food & Dining",
    color: "#E11D48", // Crimson spice
    bg: "#FFE4E6",
    border: "#FECDD3",
  },
  Resort: {
    label: "Resorts & Stays",
    color: "#0D9488", // Teal
    bg: "#CCFBF1",
    border: "#99F6E4",
  },
  Recreation: {
    label: "Recreation & Parks",
    color: "#7C3AED", // Violet
    bg: "#F3E8FF",
    border: "#DDD6FE",
  },
  Other: {
    label: "General Attraction",
    color: "#174D44", // Deep emerald
    bg: "#EAE4D7",
    border: "#D8D0BE",
  },
};

/**
 * Identify the primary category style from an array of category names or objects.
 */
export function getCategoryStyle(categories?: string[] | { name: string }[]): CategoryStyle {
  if (!categories || categories.length === 0) {
    return CATEGORY_STYLES.Other;
  }

  for (const item of categories) {
    const name = typeof item === "string" ? item : item?.name;
    if (!name) continue;

    const matchedKey = Object.keys(CATEGORY_STYLES).find(
      (key) => key.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(key.toLowerCase())
    );

    if (matchedKey && CATEGORY_STYLES[matchedKey]) {
      return CATEGORY_STYLES[matchedKey];
    }
  }

  return CATEGORY_STYLES.Other;
}

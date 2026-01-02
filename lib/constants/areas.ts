// Shared list of Cape Town service areas
export const capeTownAreas = [
  "Sea Point",
  "Camps Bay",
  "Claremont",
  "Green Point",
  "V&A Waterfront",
  "Constantia",
  "Newlands",
  "Rondebosch",
  "Observatory",
  "Woodstock",
  "City Bowl",
  "Gardens",
  "Tamboerskloof",
  "Oranjezicht",
  "Vredehoek",
  "Devil's Peak",
  "Mouille Point",
  "Three Anchor Bay",
  "Bantry Bay",
  "Fresnaye",
  "Bakoven",
  "Llandudno",
  "Hout Bay",
  "Wynberg",
  "Kenilworth",
  "Plumstead",
  "Diep River",
  "Bergvliet",
  "Tokai",
  "Steenberg",
  "Muizenberg",
  "Kalk Bay",
  "Fish Hoek",
  "Simon's Town",
];

export function getLocationSlug(areaName: string): string {
  return areaName
    .toLowerCase()
    .replace(/&/g, "") // Remove ampersands (e.g., "V&A" -> "va")
    .replace(/\s+/g, "-");
}

export function formatLocationName(slug: string): string {
  // Find the original area name using the same slug generation logic
  const originalArea = capeTownAreas.find(
    (area) => getLocationSlug(area) === slug
  );
  
  if (originalArea) {
    return originalArea;
  }
  
  // Fallback: format the slug
  return slug
    .split("-")
    .map((word) => {
      // Handle special cases
      if (word === "va") return "V&A"; // Handle "va" as it comes from "V&A" after ampersand removal
      if (word === "devil's") return "Devil's";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}


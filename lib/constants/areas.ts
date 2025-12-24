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

export function formatLocationName(slug: string): string {
  // Find the original area name
  const originalArea = capeTownAreas.find(
    (area) => area.toLowerCase().replace(/\s+/g, "-") === slug
  );
  
  if (originalArea) {
    return originalArea;
  }
  
  // Fallback: format the slug
  return slug
    .split("-")
    .map((word) => {
      // Handle special cases
      if (word === "v&a") return "V&A";
      if (word === "devil's") return "Devil's";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function getLocationSlug(areaName: string): string {
  return areaName.toLowerCase().replace(/\s+/g, "-");
}


/**
 * Fallback data constants
 * These are safe to import in client components
 */

export const FALLBACK_LOCATIONS = [
  "Sea Point", "Camps Bay", "Claremont", "Green Point", "V&A Waterfront",
  "Constantia", "Newlands", "Rondebosch", "Observatory", "Woodstock",
  "City Bowl", "Gardens", "Tamboerskloof", "Oranjezicht", "Vredehoek",
  "Devils Peak", "Mouille Point", "Three Anchor Bay", "Bantry Bay", "Fresnaye",
  "Bakoven", "Llandudno", "Hout Bay", "Wynberg", "Kenilworth",
  "Plumstead", "Diep River", "Bergvliet", "Tokai", "Steenberg",
  "Muizenberg", "Kalk Bay", "Fish Hoek", "Simons Town"
];

export const FALLBACK_EXTRAS = [
  { id: "inside-fridge", name: "Inside Fridge", icon: "Refrigerator" },
  { id: "inside-oven", name: "Inside Oven", icon: "ChefHat" },
  { id: "inside-cabinets", name: "Inside Cabinets", icon: "Boxes" },
  { id: "interior-windows", name: "Interior Windows", icon: "Grid" },
  { id: "interior-walls", name: "Interior Walls", icon: "Paintbrush" },
  { id: "laundry", name: "Laundry & Ironing", icon: "Shirt" },
];

export const FALLBACK_TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

export const FALLBACK_CLEANERS = [
  { id: "no-preference", name: "No preference", rating: undefined },
  { id: "natasha-m", name: "Natasha M.", rating: 4.7 },
  { id: "estery-p", name: "Estery P.", rating: 4.6 },
  { id: "beaul", name: "Beaul", rating: 3.1 },
];

export const FALLBACK_TEAMS = [
  { id: "team-a", name: "Team A" },
  { id: "team-b", name: "Team B" },
  { id: "team-c", name: "Team C" },
];

export const FALLBACK_FREQUENCIES = [
  { id: "one-time", name: "One-time", discount: "" },
  { id: "weekly", name: "Weekly", discount: "Save 15%" },
  { id: "bi-weekly", name: "Bi-weekly", discount: "Save 10%" },
  { id: "monthly", name: "Monthly", discount: "Save 5%" },
];

export const FALLBACK_SERVICE_PRICING = {
  standard: 250,
  deep: 400,
  "move-in-out": 500,
  airbnb: 350,
  office: 300,
  holiday: 450,
};

export const FALLBACK_ROOM_PRICING: Record<string, { bedroom: number; bathroom: number }> = {
  standard: { bedroom: 20, bathroom: 30 },
  deep: { bedroom: 180, bathroom: 250 },
  "move-in-out": { bedroom: 160, bathroom: 220 },
  airbnb: { bedroom: 18, bathroom: 26 },
  office: { bedroom: 30, bathroom: 40 },
  holiday: { bedroom: 30, bathroom: 40 },
};

export const FALLBACK_SERVICE_CATEGORY_PRICING: Record<string, number> = {
  "residential-cleaning": 500,
  "commercial-cleaning": 800,
  "specialized-cleaning": 900,
};


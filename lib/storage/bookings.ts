import { Booking } from "@/lib/types/booking";
import { promises as fs } from "fs";
import path from "path";

const BOOKINGS_FILE = path.join(process.cwd(), "data", "bookings.json");

/**
 * Ensure data directory exists
 */
async function ensureDataDirectory(): Promise<void> {
  const dataDir = path.dirname(BOOKINGS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

/**
 * Read all bookings from file
 */
export async function getBookings(): Promise<Booking[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(BOOKINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, return empty array
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

/**
 * Save a booking to file
 */
export async function saveBooking(booking: Booking): Promise<void> {
  await ensureDataDirectory();
  const bookings = await getBookings();
  bookings.push(booking);
  await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

/**
 * Generate a unique booking reference
 */
export function generateBookingReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BOK-${timestamp}-${random}`;
}

/**
 * Generate a unique booking ID
 */
export function generateBookingId(): string {
  return `booking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Find booking by reference
 */
export async function getBookingByReference(reference: string): Promise<Booking | null> {
  const bookings = await getBookings();
  return bookings.find((b) => b.bookingReference === reference) || null;
}

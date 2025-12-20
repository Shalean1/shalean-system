/**
 * Script to check assigned cleaners for bookings (past, today, upcoming)
 * Run with: node scripts/check-assigned-cleaners.js
 */

// Try to load dotenv if available
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv not available, will use process.env directly
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAssignedCleaners() {
  console.log('='.repeat(80));
  console.log('CHECKING ASSIGNED CLEANERS FOR BOOKINGS');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Get all bookings with cleaner information
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        booking_reference,
        scheduled_date,
        scheduled_time,
        service_type,
        contact_first_name,
        contact_last_name,
        contact_email,
        contact_phone,
        cleaner_preference,
        assigned_cleaner_id,
        status,
        payment_status,
        total_amount,
        created_at,
        cleaners:assigned_cleaner_id (
          name,
          cleaner_id
        )
      `)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (error) {
      throw error;
    }

    if (!bookings || bookings.length === 0) {
      console.log('No bookings found in the database.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Categorize bookings
    const pastBookings = [];
    const todayBookings = [];
    const upcomingBookings = [];

    bookings.forEach(booking => {
      const bookingDate = new Date(booking.scheduled_date);
      bookingDate.setHours(0, 0, 0, 0);

      if (bookingDate < today) {
        pastBookings.push(booking);
      } else if (bookingDate.getTime() === today.getTime()) {
        todayBookings.push(booking);
      } else {
        upcomingBookings.push(booking);
      }
    });

    // Display results
    console.log('📊 SUMMARY');
    console.log('-'.repeat(80));
    console.log(`Total bookings: ${bookings.length}`);
    console.log(`Past bookings: ${pastBookings.length}`);
    console.log(`Today's bookings: ${todayBookings.length}`);
    console.log(`Upcoming bookings: ${upcomingBookings.length}`);
    console.log('');

    // Count bookings with/without assigned cleaners
    const withCleaner = bookings.filter(b => b.assigned_cleaner_id).length;
    const withoutCleaner = bookings.length - withCleaner;
    console.log(`Bookings WITH assigned cleaner: ${withCleaner}`);
    console.log(`Bookings WITHOUT assigned cleaner: ${withoutCleaner}`);
    console.log('');

    // Display past bookings
    if (pastBookings.length > 0) {
      console.log('='.repeat(80));
      console.log('📅 PAST BOOKINGS');
      console.log('='.repeat(80));
      pastBookings.forEach(booking => {
        const cleanerName = booking.cleaners?.name || 'NO CLEANER ASSIGNED';
        const cleanerId = booking.assigned_cleaner_id || 'NULL';
        console.log(`\nReference: ${booking.booking_reference}`);
        console.log(`  Date: ${booking.scheduled_date} at ${booking.scheduled_time}`);
        console.log(`  Service: ${booking.service_type}`);
        console.log(`  Customer: ${booking.contact_first_name} ${booking.contact_last_name}`);
        console.log(`  Email: ${booking.contact_email}`);
        console.log(`  Phone: ${booking.contact_phone}`);
        console.log(`  Cleaner Preference: ${booking.cleaner_preference}`);
        console.log(`  Assigned Cleaner ID: ${cleanerId}`);
        console.log(`  Assigned Cleaner Name: ${cleanerName}`);
        console.log(`  Status: ${booking.status}`);
        console.log(`  Payment Status: ${booking.payment_status}`);
        console.log(`  Total Amount: R${booking.total_amount}`);
      });
      console.log('');
    }

    // Display today's bookings
    if (todayBookings.length > 0) {
      console.log('='.repeat(80));
      console.log('📅 TODAY\'S BOOKINGS');
      console.log('='.repeat(80));
      todayBookings.forEach(booking => {
        const cleanerName = booking.cleaners?.name || 'NO CLEANER ASSIGNED';
        const cleanerId = booking.assigned_cleaner_id || 'NULL';
        console.log(`\nReference: ${booking.booking_reference}`);
        console.log(`  Date: ${booking.scheduled_date} at ${booking.scheduled_time}`);
        console.log(`  Service: ${booking.service_type}`);
        console.log(`  Customer: ${booking.contact_first_name} ${booking.contact_last_name}`);
        console.log(`  Email: ${booking.contact_email}`);
        console.log(`  Phone: ${booking.contact_phone}`);
        console.log(`  Cleaner Preference: ${booking.cleaner_preference}`);
        console.log(`  Assigned Cleaner ID: ${cleanerId}`);
        console.log(`  Assigned Cleaner Name: ${cleanerName}`);
        console.log(`  Status: ${booking.status}`);
        console.log(`  Payment Status: ${booking.payment_status}`);
        console.log(`  Total Amount: R${booking.total_amount}`);
      });
      console.log('');
    }

    // Display upcoming bookings
    if (upcomingBookings.length > 0) {
      console.log('='.repeat(80));
      console.log('📅 UPCOMING BOOKINGS');
      console.log('='.repeat(80));
      upcomingBookings.forEach(booking => {
        const cleanerName = booking.cleaners?.name || 'NO CLEANER ASSIGNED';
        const cleanerId = booking.assigned_cleaner_id || 'NULL';
        console.log(`\nReference: ${booking.booking_reference}`);
        console.log(`  Date: ${booking.scheduled_date} at ${booking.scheduled_time}`);
        console.log(`  Service: ${booking.service_type}`);
        console.log(`  Customer: ${booking.contact_first_name} ${booking.contact_last_name}`);
        console.log(`  Email: ${booking.contact_email}`);
        console.log(`  Phone: ${booking.contact_phone}`);
        console.log(`  Cleaner Preference: ${booking.cleaner_preference}`);
        console.log(`  Assigned Cleaner ID: ${cleanerId}`);
        console.log(`  Assigned Cleaner Name: ${cleanerName}`);
        console.log(`  Status: ${booking.status}`);
        console.log(`  Payment Status: ${booking.payment_status}`);
        console.log(`  Total Amount: R${booking.total_amount}`);
      });
      console.log('');
    }

    // Summary by cleaner
    console.log('='.repeat(80));
    console.log('📊 SUMMARY BY CLEANER');
    console.log('='.repeat(80));
    
    const cleanerSummary = {};
    bookings.forEach(booking => {
      const cleanerKey = booking.assigned_cleaner_id || 'NO CLEANER ASSIGNED';
      if (!cleanerSummary[cleanerKey]) {
        cleanerSummary[cleanerKey] = {
          name: booking.cleaners?.name || 'NO CLEANER ASSIGNED',
          past: 0,
          today: 0,
          upcoming: 0,
          total: 0,
          references: []
        };
      }
      
      const bookingDate = new Date(booking.scheduled_date);
      bookingDate.setHours(0, 0, 0, 0);
      
      if (bookingDate < today) {
        cleanerSummary[cleanerKey].past++;
      } else if (bookingDate.getTime() === today.getTime()) {
        cleanerSummary[cleanerKey].today++;
      } else {
        cleanerSummary[cleanerKey].upcoming++;
      }
      
      cleanerSummary[cleanerKey].total++;
      cleanerSummary[cleanerKey].references.push(booking.booking_reference);
    });

    Object.entries(cleanerSummary).forEach(([cleanerId, summary]) => {
      console.log(`\n${summary.name} (${cleanerId}):`);
      console.log(`  Past: ${summary.past}`);
      console.log(`  Today: ${summary.today}`);
      console.log(`  Upcoming: ${summary.upcoming}`);
      console.log(`  Total: ${summary.total}`);
    });

    console.log('');
    console.log('='.repeat(80));
    console.log('✅ Check complete!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('Error fetching bookings:', error);
    process.exit(1);
  }
}

checkAssignedCleaners();

#!/usr/bin/env python3
"""
Script to import bookings data from old schema format to new schema format.
This script reads the SQL file, transforms the data, and generates a migration-ready SQL file.
"""

import re
import json
import sys
from pathlib import Path

def split_name(full_name):
    """Split customer name into first and last name."""
    if not full_name:
        return '', ''
    parts = full_name.strip().split(' ', 1)
    if len(parts) == 1:
        return parts[0], ''
    return parts[0], parts[1]

def normalize_service_type(service_type):
    """Normalize service type to lowercase."""
    if not service_type:
        return 'standard'
    return service_type.lower().strip()

def normalize_frequency(frequency):
    """Normalize frequency values."""
    if not frequency or frequency.strip() == '':
        return 'one-time'
    freq = frequency.lower().strip()
    if freq == 'custom-weekly':
        return 'weekly'
    return freq

def extract_from_price_snapshot(price_snapshot_str, key):
    """Extract value from price_snapshot JSON string."""
    if not price_snapshot_str or price_snapshot_str == 'null':
        return None
    try:
        snapshot = json.loads(price_snapshot_str)
        if key == 'bedrooms':
            return snapshot.get('service', {}).get('bedrooms', 0)
        elif key == 'bathrooms':
            return snapshot.get('service', {}).get('bathrooms', 1)
        elif key == 'extras':
            extras = snapshot.get('extras', [])
            return json.dumps(extras) if extras else "'[]'::jsonb"
        return None
    except:
        return None

def parse_sql_file(file_path):
    """Parse the SQL INSERT statement and extract booking data."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the VALUES part
    match = re.search(r'VALUES\s+(.+);', content, re.DOTALL)
    if not match:
        print("Error: Could not find VALUES clause in SQL file")
        return []
    
    values_str = match.group(1)
    
    # Split by ), ( to get individual rows
    # This is a simplified parser - for production, use a proper SQL parser
    rows = []
    current_row = []
    current_value = ''
    in_string = False
    string_char = None
    paren_depth = 0
    
    i = 0
    while i < len(values_str):
        char = values_str[i]
        
        if char in ("'", '"') and (i == 0 or values_str[i-1] != '\\'):
            if not in_string:
                in_string = True
                string_char = char
            elif char == string_char:
                in_string = False
                string_char = None
            current_value += char
        elif not in_string:
            if char == '(':
                paren_depth += 1
                if paren_depth == 1:
                    current_value = ''
                    continue
                current_value += char
            elif char == ')':
                paren_depth -= 1
                if paren_depth == 0:
                    current_row.append(current_value.strip())
                    rows.append(current_row)
                    current_row = []
                    current_value = ''
                    # Skip comma and whitespace after closing paren
                    i += 1
                    while i < len(values_str) and values_str[i] in (',', ' ', '\n', '\r', '\t'):
                        i += 1
                    continue
                current_value += char
            elif char == ',' and paren_depth == 1:
                current_row.append(current_value.strip())
                current_value = ''
            else:
                current_value += char
        else:
            current_value += char
        
        i += 1
    
    return rows

def transform_row(row_data):
    """Transform a single row from old schema to new schema."""
    if len(row_data) < 35:
        return None
    
    try:
        # Extract fields (simplified - adjust indices based on actual structure)
        booking_id = row_data[0].strip("'")
        cleaner_id_uuid = row_data[1].strip("'") if row_data[1] != 'null' else None
        booking_date = row_data[2].strip("'")
        booking_time = row_data[3].strip("'")
        service_type = row_data[4].strip("'")
        customer_name = row_data[5].strip("'")
        customer_email = row_data[6].strip("'")
        customer_phone = row_data[7].strip("'")
        address_line1 = row_data[8].strip("'")
        address_suburb = row_data[9].strip("'")
        address_city = row_data[10].strip("'")
        payment_reference = row_data[11].strip("'")
        status = row_data[12].strip("'")
        created_at = row_data[13].strip("'")
        total_amount = row_data[15].strip("'")
        service_fee = row_data[16].strip("'")
        frequency = row_data[17].strip("'") if row_data[17] != 'null' else None
        price_snapshot = row_data[19] if row_data[19] != 'null' else None
        tip_amount = row_data[32].strip("'") if row_data[32] != 'null' else '0'
        cleaner_earnings = row_data[24].strip("'") if row_data[24] != 'null' else None
        updated_at = row_data[31].strip("'") if row_data[31] != 'null' else created_at
        
        # Transform data
        first_name, last_name = split_name(customer_name)
        normalized_service = normalize_service_type(service_type)
        normalized_frequency = normalize_frequency(frequency)
        
        # Extract from price_snapshot
        bedrooms = 0
        bathrooms = 1
        extras = "'[]'::jsonb"
        
        if price_snapshot and price_snapshot != 'null':
            try:
                snapshot = json.loads(price_snapshot)
                service_info = snapshot.get('service', {})
                bedrooms = service_info.get('bedrooms', 0)
                bathrooms = service_info.get('bathrooms', 1)
                extras_list = snapshot.get('extras', [])
                if extras_list:
                    extras = f"'{json.dumps(extras_list)}'::jsonb"
            except:
                pass
        
        # Convert amounts from cents to rands
        total_amount_decimal = float(total_amount) / 100.0 if total_amount else 0
        tip_amount_decimal = float(tip_amount) / 100.0 if tip_amount and tip_amount != '0' else 0
        cleaner_earnings_decimal = float(cleaner_earnings) / 100.0 if cleaner_earnings else None
        
        # Map cleaner UUID to cleaner_id (this will need to be done in SQL with a lookup)
        cleaner_id_text = f"(SELECT cleaner_id FROM cleaners WHERE id = '{cleaner_id_uuid}'::UUID LIMIT 1)" if cleaner_id_uuid else 'NULL'
        
        # Build SQL values
        return f"""('{booking_id}', '{booking_id}', '{booking_date}', '{booking_time}', '{normalized_service}', '{normalized_frequency}', {bedrooms}, {bathrooms}, {extras}, '{address_line1.replace("'", "''")}', '{address_suburb.replace("'", "''")}', '{address_city.replace("'", "''")}', {cleaner_id_text}, '{first_name.replace("'", "''")}', '{last_name.replace("'", "''")}', '{customer_email}', '{customer_phone.replace("'", "''")}', '{payment_reference}', '{status.lower()}', CASE WHEN '{status.lower()}' = 'completed' THEN 'completed' ELSE 'pending' END, {total_amount_decimal}, {tip_amount_decimal}, '{created_at}', '{updated_at}', {cleaner_earnings_decimal if cleaner_earnings_decimal else 'NULL'})"""
    
    except Exception as e:
        print(f"Error transforming row: {e}", file=sys.stderr)
        return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python import_bookings.py <input_sql_file> [output_sql_file]")
        sys.exit(1)
    
    input_file = Path(sys.argv[1])
    output_file = Path(sys.argv[2]) if len(sys.argv) > 2 else Path('supabase/migrations/055_import_bookings_data_transformed.sql')
    
    if not input_file.exists():
        print(f"Error: Input file {input_file} does not exist")
        sys.exit(1)
    
    print(f"Reading {input_file}...")
    rows = parse_sql_file(input_file)
    print(f"Found {len(rows)} booking records")
    
    print("Transforming data...")
    transformed_rows = []
    for i, row in enumerate(rows):
        if i % 100 == 0:
            print(f"Processing row {i}/{len(rows)}...")
        transformed = transform_row(row)
        if transformed:
            transformed_rows.append(transformed)
    
    print(f"Transformed {len(transformed_rows)} records")
    
    # Generate SQL file
    print(f"Writing to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("-- Migration: Import Bookings Data (Transformed)\n")
        f.write("-- Generated from import_bookings.py script\n\n")
        f.write("INSERT INTO bookings (\n")
        f.write("  id, booking_reference, scheduled_date, scheduled_time, service_type, frequency,\n")
        f.write("  bedrooms, bathrooms, extras, street_address, suburb, city, assigned_cleaner_id,\n")
        f.write("  contact_first_name, contact_last_name, contact_email, contact_phone,\n")
        f.write("  payment_reference, status, payment_status, total_amount, tip_amount,\n")
        f.write("  created_at, updated_at, cleaner_earnings\n")
        f.write(") VALUES\n")
        f.write(",\n".join(transformed_rows))
        f.write("\nON CONFLICT (id) DO UPDATE SET\n")
        f.write("  booking_reference = EXCLUDED.booking_reference,\n")
        f.write("  scheduled_date = EXCLUDED.scheduled_date,\n")
        f.write("  scheduled_time = EXCLUDED.scheduled_time,\n")
        f.write("  service_type = EXCLUDED.service_type,\n")
        f.write("  frequency = EXCLUDED.frequency,\n")
        f.write("  bedrooms = EXCLUDED.bedrooms,\n")
        f.write("  bathrooms = EXCLUDED.bathrooms,\n")
        f.write("  extras = EXCLUDED.extras,\n")
        f.write("  street_address = EXCLUDED.street_address,\n")
        f.write("  suburb = EXCLUDED.suburb,\n")
        f.write("  city = EXCLUDED.city,\n")
        f.write("  assigned_cleaner_id = EXCLUDED.assigned_cleaner_id,\n")
        f.write("  contact_first_name = EXCLUDED.contact_first_name,\n")
        f.write("  contact_last_name = EXCLUDED.contact_last_name,\n")
        f.write("  contact_email = EXCLUDED.contact_email,\n")
        f.write("  contact_phone = EXCLUDED.contact_phone,\n")
        f.write("  payment_reference = EXCLUDED.payment_reference,\n")
        f.write("  status = EXCLUDED.status,\n")
        f.write("  payment_status = EXCLUDED.payment_status,\n")
        f.write("  total_amount = EXCLUDED.total_amount,\n")
        f.write("  tip_amount = EXCLUDED.tip_amount,\n")
        f.write("  updated_at = EXCLUDED.updated_at,\n")
        f.write("  cleaner_earnings = EXCLUDED.cleaner_earnings;\n")
    
    print(f"Done! Generated {output_file} with {len(transformed_rows)} records")

if __name__ == '__main__':
    main()


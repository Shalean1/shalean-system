-- Migration: Create recurring_schedules table and insert data
-- Created: 2025-01-XX
-- Description: Creates the recurring_schedules table and inserts initial data

-- ============================================================================
-- CREATE RECURRING SCHEDULES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "public"."recurring_schedules" (
  "id" UUID PRIMARY KEY,
  "customer_id" UUID NOT NULL,
  "service_type" TEXT NOT NULL,
  "frequency" TEXT NOT NULL,
  "day_of_week" TEXT,
  "day_of_month" INTEGER,
  "preferred_time" TIME NOT NULL,
  "bedrooms" TEXT NOT NULL,
  "bathrooms" TEXT NOT NULL,
  "extras" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "notes" TEXT DEFAULT '',
  "address_line1" TEXT NOT NULL,
  "address_suburb" TEXT NOT NULL,
  "address_city" TEXT NOT NULL,
  "cleaner_id" UUID,
  "is_active" BOOLEAN DEFAULT true,
  "start_date" DATE NOT NULL,
  "end_date" DATE,
  "last_generated_month" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),
  "days_of_week" TEXT[],
  "earnings_override" TEXT DEFAULT 'false',
  "total_amount" DECIMAL(10, 2),
  "cleaner_earnings" DECIMAL(10, 2)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_customer_id ON "public"."recurring_schedules"("customer_id");
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_cleaner_id ON "public"."recurring_schedules"("cleaner_id");
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_is_active ON "public"."recurring_schedules"("is_active");
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_start_date ON "public"."recurring_schedules"("start_date");
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_frequency ON "public"."recurring_schedules"("frequency");

-- ============================================================================
-- INSERT DATA
-- ============================================================================

INSERT INTO "public"."recurring_schedules" (
  "id", "customer_id", "service_type", "frequency", "day_of_week", "day_of_month", 
  "preferred_time", "bedrooms", "bathrooms", "extras", "notes", "address_line1", 
  "address_suburb", "address_city", "cleaner_id", "is_active", "start_date", 
  "end_date", "last_generated_month", "created_at", "updated_at", "days_of_week", 
  "earnings_override", "total_amount", "cleaner_earnings"
) VALUES 
('003adfc6-6b07-484f-ac10-3ada8a2779d3', '6890fb8e-cde4-4be2-beef-bbef53878707', 'Standard', 'bi-weekly', '5', null, '09:00:00', '2', '2', ARRAY[]::TEXT[], '', '39 Harvey Rd,', 'Claremont', 'Capetown', '2231fa06-1ba5-43d6-bf2d-ca757368a05a', 'true', '2025-12-05', '2025-12-26', '2025-12', '2025-10-24 08:13:52.721083+00', '2025-12-04 19:33:25.426677+00', null, 'false', '40000', '28000'),
('18c35190-f94e-42de-8c4d-c525966be322', 'a471b29d-bf51-4a5f-a67b-664c7ca21eab', 'Standard', 'custom-weekly', null, null, '09:00:00', '3', '2', ARRAY['laundry']::TEXT[], '', '7 Worcester Road', 'Walmer Estate', 'Capetown', '72642f1a-4745-47e1-9a13-1edbb19b20d0', 'true', '2025-12-01', '2025-12-31', '2025-12', '2025-10-24 08:40:12.637145+00', '2025-12-04 19:04:13.018845+00', ARRAY['3','6']::TEXT[], 'false', '33000', '25000'),
('2a56551b-f3d0-4de5-ba64-cb45cb7ea396', '51a5993f-238e-4911-9774-3df1c5930d8c', 'Standard', 'custom-weekly', null, '1', '09:00:00', '1', '1', ARRAY[]::TEXT[], '', 'Cape Town CBD', 'Capetown', 'Capetown', 'c0771cf5-3a83-4299-99ee-b0e399e8745f', 'true', '2025-10-01', null, '2025-12', '2025-10-23 21:30:52.94705+00', '2025-11-30 20:47:10.842447+00', ARRAY['1','3','5']::TEXT[], 'false', '52750', '28000'),
('2a7b5ced-b765-42ea-9043-6ed2bf8d98f2', '7fc6461d-5457-41e1-898e-611833693414', 'Standard', 'weekly', '3', null, '09:00:00', '2', '2', ARRAY['oven','windows']::TEXT[], '', '21 Avenue St Charles', 'SeaPoint', 'Capetown', '53f7c0c0-684a-4cbe-aeec-8aa9758940c3', 'true', '2025-12-03', '2025-12-31', '2025-12', '2025-10-24 07:13:40.679699+00', '2025-12-04 19:36:02.61179+00', null, 'false', '45000', null),
('342e50dd-099b-4fb9-b02c-3582cf4fb79c', 'cb0684f4-e790-40de-b746-15b4b4ec3055', 'Standard', 'custom-weekly', null, '1', '08:30:00', '2', '2', ARRAY['laundry']::TEXT[], '', '1 Basset Road', 'Claremont', 'Capetown', '22304709-7c94-4d6b-b4bc-ed35e1c26fce', 'true', '2025-11-01', '2025-11-30', '2025-11', '2025-11-01 01:01:25.928265+00', '2025-11-01 01:01:26.364627+00', ARRAY['2','5']::TEXT[], 'false', null, null),
('51e92878-7452-4c8f-9f82-c5897bbce68e', 'caa503ed-56ef-4f2d-9e6e-bb5e40fe171b', 'Standard', 'weekly', '4', '1', '09:00:00', '1', '1', ARRAY[]::TEXT[], '', '17 Milano Way Strandfointein', 'Strandfontein', 'Capetown', '2ba4ac8f-f271-4ce3-9811-58dbca218dc1', 'true', '2025-10-01', null, '2025-12', '2025-10-23 21:34:58.210671+00', '2025-11-30 20:41:33.203024+00', null, 'false', '45156', '30000'),
('59cdaa33-3912-41db-af78-100903160b5c', 'e75042c8-b757-4123-9156-a09c3b5fb48d', 'Standard', 'weekly', '4', null, '08:00:00', '2', '3', ARRAY[]::TEXT[], '', '23 Starboard Cresent', 'Strandfontein', 'Capetown', '2231fa06-1ba5-43d6-bf2d-ca757368a05a', 'true', '2025-12-01', '2025-12-31', '2025-12', '2025-12-04 17:35:28.894792+00', '2025-12-04 18:19:24.073926+00', null, 'false', '41500', '28000'),
('672e21cf-c965-463b-9315-c2b881b471f1', 'c3b61e64-199c-4e33-8d1d-c6c6adca765c', 'Standard', 'custom-weekly', null, '1', '09:00:00', '1', '1', ARRAY[]::TEXT[], '', 'Claremont', 'Claremont', 'Claremont', '914b3acf-40e8-4ad5-a5a2-9e2de711849a', 'true', '2025-10-01', null, '2025-12', '2025-10-23 21:31:46.23086+00', '2025-12-04 17:11:28.315334+00', ARRAY['1','4']::TEXT[], 'false', '30600', '25000'),
('77cdfd37-6c1a-4016-bb02-02827f7400e8', 'c3b61e64-199c-4e33-8d1d-c6c6adca765c', 'Standard', 'custom-weekly', null, null, '09:00:00', '1', '1', ARRAY[]::TEXT[], null, 'Claremont', 'Claremont', 'Claremont', '796e3ad7-07f3-44eb-b4cf-bed439a59f8b', 'true', '2025-10-01', null, null, '2025-11-30 20:08:45.105758+00', '2025-11-30 20:33:51.247669+00', ARRAY['1','4']::TEXT[], 'false', '30700', '25000'),
('77dfbe7c-4a15-4386-ae67-fbc646e326a1', '22752d2c-e114-47be-acb2-51696dd11461', 'Standard', 'bi-weekly', '1', null, '09:00:00', '1', '1', ARRAY[]::TEXT[], '', '8 Northgate Park', 'Brooklyn', 'Capetown', '2231fa06-1ba5-43d6-bf2d-ca757368a05a', 'false', '2025-10-24', null, '2025-12', '2025-10-24 07:06:37.058521+00', '2025-12-08 05:14:18.92272+00', null, 'false', null, null),
('82240d78-3ca6-4d70-915c-57c45c7011be', '6f28f0a8-77a3-490f-9ccc-2776bafeb442', 'Standard', 'weekly', '4', '1', '09:00:00', '2', '2', ARRAY[]::TEXT[], '', '15 Worcester Road', 'Sea Point', 'Capetown', 'c0771cf5-3a83-4299-99ee-b0e399e8745f', 'true', '2025-10-02', '2025-10-30', '2025-10', '2025-10-24 07:37:08.098921+00', '2025-11-30 21:24:43.332076+00', null, 'false', '38800', '25000'),
('94ade276-80dd-4b16-b0f1-9483d33f06a1', '14b6c819-ef6a-4654-8485-a4d0323c1df2', 'Standard', 'custom-weekly', null, '1', '07:00:00', '1', '1', ARRAY[]::TEXT[], '', '123 Main Road', 'Constatia ', 'Capetown', '04d5ae12-5f78-464b-92c8-46d61df5b5cd', 'true', '2025-10-01', null, '2025-12', '2025-10-23 21:29:28.098859+00', '2025-11-30 20:54:49.62705+00', ARRAY['1','3','5']::TEXT[], 'false', '50000', '28000'),
('aa060440-0967-4d77-a64b-35ca51034cd6', 'cb0684f4-e790-40de-b746-15b4b4ec3055', 'Standard', 'custom-weekly', null, '1', '08:30:00', '2', '2', ARRAY[]::TEXT[], '', '1 Basset Road', 'Claremont', 'Capetown', '22304709-7c94-4d6b-b4bc-ed35e1c26fce', 'true', '2025-10-01', '2025-10-31', null, '2025-10-24 08:30:53.078094+00', '2025-11-30 21:28:41.86731+00', ARRAY['2','5']::TEXT[], 'false', '35000', '25000'),
('ad907b04-2d02-491a-9cd1-5b9faf426595', 'e4b56cd2-791e-4d09-a2df-4d26e5a84d72', 'Standard', 'bi-weekly', '6', '1', '09:00:00', '1', '1', ARRAY['laundry','windows']::TEXT[], '', '16 Bradwell road', 'SeaPoint', 'Capetown', '2231fa06-1ba5-43d6-bf2d-ca757368a05a', 'true', '2025-10-25', null, '2025-12', '2025-10-24 07:31:21.996625+00', '2025-11-30 21:04:24.878877+00', null, 'false', '46400', '27000'),
('bf9fae18-5e31-4777-9849-28bd6e1a9281', 'e75042c8-b757-4123-9156-a09c3b5fb48d', 'Standard', 'weekly', '4', '1', '08:00:00', '3', '2', ARRAY['windows']::TEXT[], '', '23 Starboard crescent', 'Strandfontein', 'Capetown', null, 'true', '2025-10-01', '2025-10-31', '2025-10', '2025-10-24 08:27:42.61831+00', '2025-10-24 08:27:42.825075+00', null, 'false', null, null),
('ca01ff0e-5e13-4218-896e-8d4846625c6b', '7599ea2a-5538-4404-beec-bf5d4535131b', 'Standard', 'bi-weekly', '2', '1', '09:00:00', '1', '1', ARRAY[]::TEXT[], '', '33 Sea Otter Road Rocklands', 'Mitchal''s Plain', 'Cape Town', '19e3eb27-5be0-4e8e-a654-e42d27586ada', 'true', '2025-11-08', '2025-11-30', null, '2025-11-18 15:09:27.465712+00', '2025-11-30 21:17:24.424643+00', null, 'false', '42000', '25000'),
('e51a6a62-acb9-4cf5-a972-6c0c8468787e', '7fe5c6ea-45af-416a-b3f3-d8b8a9a82125', 'Standard', 'bi-weekly', '2', '1', '08:30:00', '1', '1', ARRAY['laundry']::TEXT[], '', '9 Nottingham Square', 'Milnerton', 'Capetown', 'e7e2e61a-608d-4fc7-b7d7-865988039d4a', 'true', '2025-10-01', '2025-10-31', '2025-10', '2025-10-25 09:44:00.675215+00', '2025-10-25 09:44:00.895603+00', null, 'false', null, null),
('fdc2a011-cc0f-4083-b5e4-2aa8a8435de8', '0ba9ae2a-9220-4499-820b-bdfd601a0ac8', 'Standard', 'weekly', '4', '1', '09:00:00', '3', '2', ARRAY['laundry']::TEXT[], '', '16 Bradwell road', 'Tokai', 'Capetown', '53f7c0c0-684a-4cbe-aeec-8aa9758940c3', 'true', '2025-10-01', '2025-10-31', '2025-10', '2025-10-29 18:05:10.653544+00', '2025-11-30 20:58:39.694024+00', null, 'false', '40051', '28000')
ON CONFLICT ("id") DO NOTHING;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE "public"."recurring_schedules" ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view all recurring schedules (admin access)
DROP POLICY IF EXISTS "Authenticated users can view recurring schedules" ON "public"."recurring_schedules";
CREATE POLICY "Authenticated users can view recurring schedules" ON "public"."recurring_schedules"
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert recurring schedules
DROP POLICY IF EXISTS "Authenticated users can insert recurring schedules" ON "public"."recurring_schedules";
CREATE POLICY "Authenticated users can insert recurring schedules" ON "public"."recurring_schedules"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update recurring schedules
DROP POLICY IF EXISTS "Authenticated users can update recurring schedules" ON "public"."recurring_schedules";
CREATE POLICY "Authenticated users can update recurring schedules" ON "public"."recurring_schedules"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete recurring schedules
DROP POLICY IF EXISTS "Authenticated users can delete recurring schedules" ON "public"."recurring_schedules";
CREATE POLICY "Authenticated users can delete recurring schedules" ON "public"."recurring_schedules"
  FOR DELETE
  TO authenticated
  USING (true);

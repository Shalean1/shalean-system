-- Migration: Create customers table and insert data
-- Created: 2025-01-XX
-- Description: Creates the customers table and inserts customer records

-- ============================================================================
-- CREATE CUSTOMERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "public"."customers" (
  "id" UUID PRIMARY KEY,
  "email" TEXT,
  "phone" TEXT,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "address_line1" TEXT,
  "address_suburb" TEXT,
  "address_city" TEXT,
  "total_bookings" TEXT DEFAULT '0',
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),
  "auth_user_id" UUID,
  "role" TEXT DEFAULT 'customer'
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON "public"."customers"("email");
CREATE INDEX IF NOT EXISTS idx_customers_phone ON "public"."customers"("phone");
CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id ON "public"."customers"("auth_user_id");
CREATE INDEX IF NOT EXISTS idx_customers_role ON "public"."customers"("role");

-- Enable Row Level Security
ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view all customers (admin access)
DROP POLICY IF EXISTS "Authenticated users can view customers" ON "public"."customers";
CREATE POLICY "Authenticated users can view customers" ON "public"."customers"
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert customers
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON "public"."customers";
CREATE POLICY "Authenticated users can insert customers" ON "public"."customers"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update customers
DROP POLICY IF EXISTS "Authenticated users can update customers" ON "public"."customers";
CREATE POLICY "Authenticated users can update customers" ON "public"."customers"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_customers_updated_at ON "public"."customers";
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON "public"."customers"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INSERT CUSTOMER DATA
-- ============================================================================

INSERT INTO "public"."customers" (
  "id", "email", "phone", "first_name", "last_name", "address_line1", 
  "address_suburb", "address_city", "total_bookings", "created_at", 
  "updated_at", "auth_user_id", "role"
) VALUES 
('017a3460-43eb-461e-9fe7-7019bb0c5c2a', 'delacruz.mandy1@gmail.com', ' 0848706819', 'Mandy', 'Delacruz', '16 Monica Way', 'Lotus River', 'Capetown', '1', '2025-10-25 11:44:34.811526+00', '2025-12-14 14:19:08.674442+00', null, 'customer'),
('05b37402-9481-43a1-8cd7-5e2d6f37771c', 'bokkieclean@gmail.com', '0810768318', 'Bokkie', 'Services', '20 Warbreck Road', 'Cape Town', 'Cape Town', '10', '2025-11-14 10:59:33.735064+00', '2025-11-30 07:40:54.855018+00', null, 'customer'),
('088ee6a6-8156-43c9-9228-674dd302d57c', 'zkubheka95@gmail.com', '0606163063', 'Zanele', 'Kubheka', 'Esplanade Road, Waters Edge Apartments unit 204', 'Century City', 'Cape Town', '1', '2025-11-05 06:54:04.037784+00', '2025-11-05 06:54:04.037784+00', 'eea98f84-5c15-45ed-a16d-2dbe101d92e9', 'customer'),
('0ba95dcb-9d25-4009-a097-78ddde14ddf0', 'karenadams446@gmail.com', '0734186671', 'Karen', 'Adams', '5 Cone Road', 'Retreat', 'Cape Town', '1', '2025-12-03 15:41:53.896892+00', '2025-12-03 15:41:53.896892+00', null, 'customer'),
('0ba9ae2a-9220-4499-820b-bdfd601a0ac8', 'meganbowren@gmail.com', '0833492963', 'Megan', 'Bowren', '16 Bradwell road', 'Tokai', 'Capetown', '0', '2025-10-23 15:15:59.505313+00', '2025-10-23 15:15:59.505313+00', null, 'customer'),
('109936ef-0ccd-4d1a-9000-b59696f5ed27', 'eksteen.neil@gmail.com', '0713527807', 'Neil', 'Eksteen', '7 Greenfield road, Kenilworth, Cape Town', 'Kenilworth', 'Cape Town', '1', '2025-12-12 08:56:23.450541+00', '2025-12-12 08:56:23.450541+00', null, 'customer'),
('10f9783a-9875-49d5-9e8f-1df76b4cb0c3', 'lusiaryn@icloud.com', '0810191667', 'Lusia', 'Dekock', 'B105 Bosmans crossing, distillery road', 'Onder Pappagaaiberg', 'Stellenbosch ', '1', '2025-11-06 10:28:13.335078+00', '2025-11-06 10:28:13.335078+00', null, 'customer'),
('11de05e0-6a05-44ce-86da-c8527733c206', 'finance@solarcapital.co.za', '0827299998', 'Cape', 'Royale', 'Cape Royale', 'Green Point', 'Cape Town', '2', '2025-12-10 16:12:30.71122+00', '2025-12-18 05:40:20.981228+00', null, 'customer'),
('14b6c819-ef6a-4654-8485-a4d0323c1df2', 'mongezib@arcfyre.com', ' 0646053173', 'Mongezi', 'Mongezi', '123 Main Road', 'Constatia ', 'Capetown', '0', '2025-10-22 01:00:52.399363+00', '2025-10-29 13:26:57.801526+00', 'ac48a619-e5ca-4b3d-a4cc-c7c6baf0de94', 'customer'),
('168f8326-3850-4f73-a88a-0346ba6253a7', 'bothadt@aol.com', '0835628272', 'Toby', 'Botha', '56 Bowwood Road, Unit 1', 'Claremont', 'Cape Town', '1', '2025-11-06 17:13:47.535948+00', '2025-11-06 17:13:47.535948+00', null, 'customer'),
('1ac51118-7556-4f7d-83f4-0a344e930e56', 'peter@harrisontrain.net', '0834088189', 'Peter', 'Harrison', '2 Rodwell Road St James', 'Muizenburg', 'Cape Town', '0', '2025-11-18 17:51:33.254837+00', '2025-11-18 17:51:33.254837+00', null, 'customer'),
('22752d2c-e114-47be-acb2-51696dd11461', 'meegan@ikonalu.co.za', '  0607164511', 'Meagan', 'Ikonalu', '8 Northgate Park', 'Brooklyn', 'Capetown', '0', '2025-10-24 07:02:07.878262+00', '2025-10-24 07:02:07.878262+00', null, 'customer'),
('236e34aa-1e2d-4dae-adab-097606ce6d3b', 'beaullachemugarira@gmail.com', '0810768318', 'Beaulla', 'Chemugarira', '20 Warbreck Road', 'Cape Town', 'Cape Town', '1', '2025-10-23 17:25:15.936031+00', '2025-10-23 17:40:48.031546+00', '4e634df5-a49c-4573-93aa-ce1013bc677a', 'customer'),
('26aa4856-7fb1-448f-af10-0d7a762c23fe', 'barryjoshua520@gmail.com', '0720393039', 'Joshua', 'Barry', '105 Kloff Bantry By', 'SeaPoint', 'Cape Town', '1', '2025-12-03 16:27:09.31187+00', '2025-12-03 16:27:09.31187+00', null, 'customer'),
('26ae93a7-1a58-408d-acb0-fd083cb82ab4', 'bindiyaravjee@gmail.com', '0797285437', 'Bindiya', 'Ravjee', '34 Albion Road, Rondebosch, 7700', 'Rondebosch', 'Cape Town', '1', '2025-11-20 09:47:09.533421+00', '2025-11-20 09:47:09.533421+00', null, 'customer'),
('26faedc8-e62b-45bc-be27-08670152b0ab', 'kiyana.seyed@gmail.com', '0847599243', 'Kiyana', 'Seyed', '404 Robyndale Apartments Complex', 'Kenilworth ', 'Cape Town', '1', '2025-12-18 05:48:25.66008+00', '2025-12-18 05:48:25.66008+00', null, 'customer'),
('2720e332-0a0b-4c99-bb3a-35fe55554111', 'lehandri.rabie@corporatetraveller.co.za', '+27747439438', 'Lehandri', 'Rabie', '19 Langverwacht Road', 'Kuils River', 'Cape Town', '1', '2025-11-05 09:22:12.397697+00', '2025-11-05 09:22:12.397697+00', null, 'customer'),
('311973d6-06ed-422d-bf7a-9a0b1948bac6', 'anees.teladia11@gmail.com', '0834927520', 'Anees', 'Teladia', '56 St Athans Road Sunnyside', 'Athlone', 'Capetown', '0', '2025-10-28 05:54:30.342917+00', '2025-10-28 05:54:30.342917+00', null, 'customer'),
('319c832a-892c-4170-9d8f-9ca9be6de214', 'jane.bourne.sa@gmail.com', '0829288976', 'Jane', 'Bourne', '21 Farmrdge Pekalmy Road', 'Bergvliet', 'Cape Town', '1', '2025-12-05 20:28:20.831494+00', '2025-12-05 20:28:20.831494+00', null, 'customer'),
('35a23fab-ba05-42be-9777-5f16cd31d5bb', 'shalocleaner@gmail.com', '0825915525', 'Farai', 'Chitekedza', '20 Warbreck Road', 'Cape Town CBD (8001)', 'Cape Town CBD (8001)', '5', '2025-10-18 04:58:42.643685+00', '2025-11-25 18:04:08.231682+00', '2031c7f7-4ffb-452a-9169-fa5e3a7b8d9a', 'customer'),
('36d8ffcb-71bb-4154-9e7c-77148623204d', 'mamie@gmail.com', null, 'Natasha', 'Account', null, null, null, '0', '2025-11-13 02:51:44.101229+00', '2025-11-13 02:51:44.101229+00', '73d794eb-813f-4e04-8b67-f8573a9c3560', 'customer'),
('381e1472-8b8e-4df6-b37d-c10763b0bb04', 'sediqah@yahoo.com', '0733723388', 'Sediqah', 'Masoet', '13 Falcon Crescent', 'Pelican Park', 'Cape Town', '1', '2025-10-28 07:36:02.317349+00', '2025-10-28 07:36:02.317349+00', null, 'customer'),
('38a9ad95-8b94-435a-8107-0e858b5b4d05', 'kellypayton@zohomail.com', '0783280089', 'Kelly', 'Payton', '8 Nansen Street', 'Claremont', 'Cape Town', '4', '2025-12-03 15:22:01.75931+00', '2025-12-08 07:06:55.327302+00', null, 'customer'),
('3acc9435-7b10-4ec6-a67a-22e71d57b352', 'yvonne@cck.org.za', '0826897380', 'Yvonne', 'Kane', '110 Prince George Drive, Plumstead', 'Plumstead', 'Cape Town', '1', '2025-12-02 15:21:08.638126+00', '2025-12-02 15:21:08.638126+00', null, 'customer'),
('3ad7e248-b51a-46a0-b518-52cfdc9dc881', 'smithyt2803@gmail.com', '0749742205', 'Smithy', 'Smithy', '7 Saasveld', 'Kuils River', 'Capetown', '0', '2025-10-25 09:57:49.824661+00', '2025-10-25 09:57:49.824661+00', null, 'customer'),
('41c3aa55-3a35-4aa9-aea6-fb834c85f205', 'france@beyersonline.com', '0836586393', 'France', 'Beyers', '13 Wesley Harfield Village', 'Cl', 'Cape Town', '1', '2025-11-30 17:37:17.065553+00', '2025-11-30 17:37:17.065553+00', null, 'customer'),
('433f960e-f532-436d-9457-da9c146f9ea4', 'kowiedebruyn@gmail.com', null, 'kowiedebruyn', 'Account', null, null, null, '0', '2025-11-12 08:19:44.367747+00', '2025-11-12 08:19:44.367747+00', '165acc20-53a3-4208-a2f6-4a395d09cce0', 'customer'),
('46c7e83f-3837-492b-8c1d-111f6031ded5', 'nicole.hillebrand29@gmail.com', '0832823691', 'Nicole', 'Hillebrand', 'Cape Royale', 'Green Point', 'Capetown', '0', '2025-11-03 13:42:35.285456+00', '2025-11-03 13:42:35.285456+00', null, 'customer'),
('47d90cd6-a1bd-4270-a09e-d9574600662b', 'normstorm009@gmail.com', '+27763541646', 'Norman', 'Roberts', 'Unit 55 Greyville Apartments ', 'Kenilworth', 'Capetown', '0', '2025-10-25 10:11:30.644052+00', '2025-10-25 10:11:30.644052+00', null, 'customer'),
('4897f11f-6564-4c1e-85a8-6dea05724e0f', 'nadinemcmanus@me.com', '0719460056', 'Nadine', 'Mcmanus', '9 Valley Cul De Sac', 'Gordons Bay', 'Capetown', '0', '2025-10-25 10:16:50.697949+00', '2025-10-25 10:16:50.697949+00', null, 'customer'),
('4e737f73-3413-4585-a979-1e43e4a03588', 'hadebezr11@gmail.com', ' 0760391207', 'Zandile', 'Hadebe', '4 De Wet Street ', 'Goodwood', 'Capetown', '0', '2025-10-25 09:22:25.149943+00', '2025-10-25 09:22:25.149943+00', null, 'customer'),
('504af3aa-93e5-4f3d-a322-230d9bf2ac73', 'kundaimtshakazi@gmail.com', '0764501807', 'Kundai', 'Mtshakazi', '143 First Avenue Saint Claire', 'Kenilworth', 'Capetown', '0', '2025-10-25 10:56:12.958264+00', '2025-10-25 10:56:12.958264+00', null, 'customer'),
('51a5993f-238e-4911-9774-3df1c5930d8c', 'admin@bokkiecleaning.co.za', '0825915525', 'Bokkie', 'Team', '39 Harvey road', 'Claremont', 'Cape Town', '1', '2025-10-23 08:07:09.699558+00', '2025-10-23 08:07:09.699558+00', null, 'customer'),
('520a0bb9-1143-4c62-b6f5-2103d731cc36', 'meg.klaasen@gmail.com', '0820464099', 'Meg', 'Klaasen', '86 Edison Drive ', 'Meadowridge', 'Cape Town', '1', '2025-12-04 18:50:38.829933+00', '2025-12-04 18:50:38.829933+00', null, 'customer'),
('52315356-4543-4be7-8641-1f2e9a89dfb1', 'sedi2004@icloud.com', '0656189366', 'Lesedi', 'Lekati', '4 Boundary Road', 'Newlands', 'Capetown', '0', '2025-11-06 17:50:46.521639+00', '2025-11-06 17:50:46.521639+00', null, 'customer'),
('523ea256-3c93-434c-86b2-ffd447afdb78', 'eddieruach@live.com', null, 'Edward', 'Claasen', null, null, null, '0', '2025-11-15 07:59:46.765317+00', '2025-11-15 07:59:46.765317+00', '2c683a57-90f2-4b39-b9cf-bd6597954d41', 'customer'),
('53b4bd12-7fa3-4b58-9f6b-737bdfa5f535', 'sandraernesto21@yahoo.com', '+491715624534', 'Sandra', 'Enersto', 'Cape Town CBD', 'Capetown', 'Capetown', '0', '2025-10-22 05:15:43.155997+00', '2025-10-22 05:15:43.155997+00', null, 'customer'),
('56fcde29-a481-4414-9b06-a3ac498d1ddb', 'rob@aspiring.co.za', null, 'rob', 'Account', null, null, null, '0', '2025-11-12 11:47:16.67197+00', '2025-11-12 11:47:16.67197+00', '35e55cb3-0f3a-4784-88be-eed53c13cbdb', 'customer'),
('571904e2-461c-4926-afcb-639b873f2e66', 'zareena-khan@hotmail.com', '0838667453', 'Zareena', 'Khan', '34 4th Avenue  ', 'Rondebosch East', 'Cape Town', '3', '2025-10-25 10:22:06.028239+00', '2025-12-18 05:42:09.01846+00', null, 'customer'),
('622ae9cd-9c45-48be-ab4a-7ce2bbe891ae', 'brucesherwoodct@gmail.com', '0826376066', 'Bruce', 'Sherwood', '7 Chene close Constantia ', 'Constantia', 'Cape Town', '1', '2025-12-14 07:19:44.931822+00', '2025-12-14 07:19:44.931822+00', null, 'customer'),
('625a36c4-03ba-47c7-9628-2aec10e9ffcb', 'farai@bokkiecleaning.co.za', '0825915525', 'Farai', 'Chitekedza', '39 Havery Road', 'Cape Town', 'Cape Town', '1', '2025-10-27 23:41:11.527934+00', '2025-10-27 23:41:11.527934+00', null, 'customer'),
('64093a2f-f390-4466-bb17-36642e4a98d3', 'liz.botes2909@gmail.com', '0835545585', 'Liz', 'Botes', '5 York Road ', 'Rosebank', 'Cape Town', '1', '2025-11-30 17:25:37.488698+00', '2025-11-30 17:25:37.488698+00', null, 'customer'),
('64c47012-3ba1-4f15-80cc-939c6d2fa35c', 'vickyjaneswart@gmail.com', '0828119809', 'Victoria', 'Swart', '26 Strawberry Lane', 'Constantia', 'Cape Town', '1', '2025-11-30 17:18:16.968792+00', '2025-11-30 17:18:16.968792+00', null, 'customer'),
('64d89248-4fb6-4a5b-9cfc-67ed56ceadad', 'patriciacowie1@gmail.com', '+447906264284', 'Patricia', 'Cowie', '3 Marston Court ', 'Diep River', 'Capetown', '0', '2025-10-29 17:38:43.680574+00', '2025-10-29 17:38:43.680574+00', null, 'customer'),
('6555eaf8-b573-40ee-9e53-60a87579babd', 'karina.bahryi@yahoo.com', '0781493144', 'Karina', 'Bahryi', '179 The Point', 'SeaPoint', 'Cape Town', '10', '2025-10-23 14:45:37.287461+00', '2025-12-18 13:10:59.886343+00', null, 'customer'),
('668ce495-1a5b-46f3-bebf-acb6adb6bcf3', 'paul.e@lycos.com', '0619606060', 'Paul', 'Lycos', '8 Balintore Road Unit 5', 'Rondebosch', 'Cape Town', '1', '2025-12-13 10:18:24.980899+00', '2025-12-13 10:18:24.980899+00', null, 'customer'),
('66d79272-8603-4860-8552-5c203e54cc3a', 'ursula_lefever@hotmail.com', '+27829250287', 'Edith', 'Ueberberg', '17 Valentyn Road, Tijgerhof', 'Tijgerhof', 'Cape Town', '1', '2025-11-17 16:32:47.577454+00', '2025-11-17 16:32:47.577454+00', null, 'customer'),
('6890fb8e-cde4-4be2-beef-bbef53878707', 'jennygith@gmail.com', '0712307596', 'Jennifer', 'Girth', '39 Harvey Rd,', 'Claremont', 'Capetown', '0', '2025-10-23 15:24:32.385934+00', '2025-10-23 15:24:32.385934+00', null, 'customer'),
('6a1c4896-27b3-4b15-b546-295e3d3dbd99', 'markb@kristenskickass.co.za', '0725637870', 'Mark', 'Buttress', '6 Alphen Drive', 'Constantia', 'Cape Town', '1', '2025-11-12 04:08:35.920227+00', '2025-11-12 04:08:35.920227+00', null, 'customer'),
('6aaf1057-1645-4b73-920e-4258026f26c7', 'maureen.dodo@gmail.com', '0836841892', 'Maureen', 'Dodo', '50 Gie Road Unit 190 Heron Cove', 'Tableview', 'Cape Town', '1', '2025-12-13 09:11:19.960257+00', '2025-12-13 09:11:19.960257+00', null, 'customer'),
('6b60c931-fd6a-4228-a03f-77358930c731', 'info@bokkiecleaning.co.za', '0810768318', 'Daniko', 'Chitekedza', '20 Warbreck Road', 'Lansdowne', 'Lansdowne', '1', '2025-11-06 17:56:48.521761+00', '2025-11-25 17:27:37.938417+00', null, 'customer'),
('6f28f0a8-77a3-490f-9ccc-2776bafeb442', 'abrahamsalan@yahoo.com', ' +1(267)241-6098', 'Alan', 'Abrahams', '15 Worcester Road', 'Sea Point', 'Capetown', '0', '2025-10-23 14:57:50.948476+00', '2025-10-23 14:57:50.948476+00', null, 'customer'),
('6fb55634-92e5-4c5b-acad-a27d2e0fbe27', 'sarahinskip27@gmail.com', '0722353515', 'Sarah', 'Hinskip', '39 Mount Rhodes Drive', 'Hout Bay', 'Capetown', '0', '2025-10-29 17:49:00.615329+00', '2025-10-29 17:49:00.615329+00', null, 'customer'),
('74c87281-5941-4e08-977d-9523fa426c61', 'natashasaidi2000@gmail.com', '0826898675', 'Phillip', 'Liebenberg', '1 Gerties Way', 'Noordhoek', 'Cape Town', '1', '2025-12-10 16:21:01.49762+00', '2025-12-10 16:21:01.49762+00', null, 'customer'),
('757313a6-e9cb-436f-b47c-fec466a34f9e', 'info@moreiramusic.com', '+27837028139', 'Lesley', 'Wells', 'Vredhoek', 'Capetown ', 'Cape Town', '1', '2025-12-18 06:09:09.036474+00', '2025-12-18 06:09:09.036474+00', null, 'customer'),
('7599ea2a-5538-4404-beec-bf5d4535131b', 'behardienbasheerah@gmail.com', null, 'Basheerah', 'Behardien', null, null, null, '0', '2025-11-05 07:11:59.344239+00', '2025-11-05 07:11:59.344239+00', '954bca35-58ad-467d-aab5-1cbd65b005dd', 'customer'),
('78f8baf6-a3e3-4e08-96a6-af1966bd7689', 'marleniqueg@gmail.com', '+27846214459', 'Marlenique', 'Gelderblom', '29 Dorking Crescent', 'Parklands North', 'Cape Town', '1', '2025-11-06 11:38:04.205725+00', '2025-11-06 11:38:04.205725+00', null, 'customer'),
('7a4b9754-9631-4853-b454-6a74b66fc0f9', 'ntsk@mweb.co.za', '0761715227', 'Nozuko', 'Nozuko', '30 JW Theron Street ', 'Panorama', 'Capetown ', '1', '2025-10-24 19:12:45.628284+00', '2025-12-08 06:16:46.780125+00', null, 'customer'),
('7cb31959-0bef-458f-bdb3-ea081efd1b16', 'christa.sasolburg@gmail.com', '0829648231', 'Christa', 'Sasolburg', 'Beach Boulavard', 'Milnerton', 'Capetown', '0', '2025-10-29 18:22:55.816404+00', '2025-10-29 18:22:55.816404+00', null, 'customer'),
('7da89238-c986-4793-a71f-5f88a49cfac4', 'princess@bokkiecleaning.co.za', '0829077767', 'Amita', 'Rusternburg', '15 Phillips Road', 'Rondebosch', 'Cape Town', '0', '2025-11-18 17:58:42.722745+00', '2025-11-18 17:58:42.722745+00', null, 'customer'),
('7fc6461d-5457-41e1-898e-611833693414', '722nicole@gmail.com', '0825644473', 'Nicole', 'Fresnaye', '21 Avenue St Charles', 'SeaPoint', 'Capetown', '1', '2025-10-23 15:14:45.96099+00', '2025-12-13 10:51:48.799659+00', null, 'customer'),
('7fe5c6ea-45af-416a-b3f3-d8b8a9a82125', 'nadine.vandriel@gmail.com', '0824577172', 'Nadine', 'Vandriel', '9 Nottingham Square', 'Milnerton', 'Capetown', '0', '2025-10-23 15:07:38.083089+00', '2025-10-23 15:07:38.083089+00', null, 'customer'),
('809fecf4-58cf-427e-939d-798a3f47ef93', 'jbkotze@worldonline.co.za', '0822977776', 'Jill', 'Kotze', 'Arbor Road, Newlands', 'Newlands', 'Cape Town', '2', '2025-12-04 09:56:37.579247+00', '2025-12-10 17:22:42.951264+00', null, 'customer'),
('83a4dccc-7fb0-4aa8-9615-3ab5b56dee98', 'tvannierop@gmail.com', '0834075022', 'Joan', 'Van Der Wal', '33 Valley Road ', 'Hout Bay', 'Capetown', '0', '2025-10-25 10:26:15.308645+00', '2025-10-25 10:26:15.308645+00', null, 'customer'),
('83d271c2-2433-479d-a38b-46394088737d', 'jeff@jeffkatz.co.za', '0832744474', 'Jeff', 'Katz', '4 Riesling Road The Vines', 'Constantia', 'Cape Town', '1', '2025-12-03 15:28:33.436885+00', '2025-12-03 15:28:33.436885+00', null, 'customer'),
('883c695c-90e3-4bc3-89fe-d52defa9ffa6', 'mernier.myriam@gmail.com', '0795597221', 'Myriam ', 'Mernier ', '8 rooivalk cl', 'Durbanville', 'Cape Town', '2', '2025-12-11 05:49:45.35122+00', '2025-12-13 06:20:27.571427+00', null, 'customer'),
('89805d1d-bdd7-4417-b6d6-b590ea0327a1', 'management@deepsouthproperty.co.za', '0677409876', 'Oliver', 'Dehning', '4 Bethel Road', 'Clovelly', 'Capetown', '3', '2025-12-13 10:31:39.123878+00', '2025-12-14 14:50:10.099941+00', null, 'customer'),
('8ac50b29-47b4-4b8e-8536-4cf6cb445574', 'dawid@constantiaglen.com', '0836524638', 'Dawid', 'Van Aswegen', 'Apartment 3, 20 Victoria Road, Clifton', 'Clifton', 'Cape Town', '1', '2025-12-03 09:05:33.888468+00', '2025-12-03 09:05:33.888468+00', null, 'customer'),
('8b2c3260-ce1e-4fe0-a983-864d2036d7aa', 'nicole.arter01@gmail.com', '0814246398', 'Nicole', 'Arter', '29 Honeyside Street Rustdale', 'Athlone', 'Cape Town', '1', '2025-12-13 08:44:10.757314+00', '2025-12-13 08:44:10.757314+00', null, 'customer'),
('96f9ca8e-cfa2-423f-98d2-3bedd51c8d4a', 'hawajj2020@gmail.com', '0825551061', 'Hawaj', 'Jamal ', '136 Sandown road 7th Avenue ', 'Rondebosch East', 'Cape Town', '1', '2025-12-18 12:59:18.869156+00', '2025-12-18 12:59:18.869156+00', null, 'customer'),
('98a35ac0-c770-4702-98f2-9c89b03489a8', 'tinasheimani@gmail.com', '0649474451', 'Tinashe', 'Imani', '14 Wemberly Road', 'Gardens', 'Cape Town', '1', '2025-12-10 17:36:43.83125+00', '2025-12-10 17:36:43.83125+00', null, 'customer'),
('9babb423-d5ba-4b68-8bf6-c0cbdf0aafb6', 'wisdomfreedom265@gmail.com', null, 'Wisdom', 'Freedom', null, null, null, '0', '2025-10-22 23:00:58.793467+00', '2025-10-22 23:00:58.793467+00', '806593cc-6d3f-4497-a9dd-987ec59f1f06', 'customer'),
('9c025d27-a002-42f8-b30e-9d922dd871e3', 'lindaharris@remaxpa.co.za', '0726081449', 'Linda', 'Harris', '601 Lancaster, Marlborough Park, Bath road, Claremont', 'Claremont', 'Cape Town', '2', '2025-12-09 16:33:22.412572+00', '2025-12-09 16:38:16.803556+00', null, 'customer'),
('9e1d115a-72c7-4b6d-b030-43db0542b84e', 'maliehemamello@gmail.com', '0796606951', 'Mamello', 'Maliehema', '232 Main Road', 'Observetory', 'Capetown', '0', '2025-10-25 09:34:22.233032+00', '2025-10-25 09:34:22.233032+00', null, 'customer'),
('9fb99988-a587-44a5-aff0-39e9015a7353', 'zgalada1@yahoo.com', '0670190631', 'Galada', 'Galada', '40 Blackhawk Cresent Sunningdale', 'Blouburg', 'Capetown', '0', '2025-11-07 18:07:48.186272+00', '2025-11-07 18:07:48.186272+00', null, 'customer'),
('a471b29d-bf51-4a5f-a67b-664c7ca21eab', 'lankyemmanuel@gmail.com', ' 0763819913', 'Lanky', 'Emmanuel', '7 Worcester Road', 'Walmer Estate', 'Capetown', '1', '2025-10-23 15:00:31.20246+00', '2025-12-13 08:51:21.594669+00', null, 'customer'),
('a48f0439-cad0-44fd-b5e1-6aaf7fe54e11', 'georgiakeogh123@icloud.com', '0726439916', 'Georgia', 'Keogh', '75 Nottingham close', 'Parklands ', 'Cape Town ', '1', '2025-11-03 10:50:57.636293+00', '2025-11-03 10:50:57.636293+00', null, 'customer'),
('a5c906ac-5714-47ae-ace4-828185124fd2', 'shoneez.gani@gmail.com', '0846278344', 'Shoneez', 'Gani', 'Unit 411 Wemberly Square', 'Capetown', 'Capetown', '0', '2025-10-25 09:38:58.177125+00', '2025-10-25 09:38:58.177125+00', null, 'customer'),
('a63d92cf-df7d-4041-832c-5f32f413b943', 'meganmtoms@gmail.com', '0824672507', 'Megan', 'Toms', '14 Herschel Walk ', 'Claremont', 'Cape Town', '1', '2025-12-16 05:24:17.367827+00', '2025-12-16 05:24:17.367827+00', null, 'customer'),
('aaf803bf-3cd0-4eec-a140-6294a889b0e4', 'leeannsaville@gmail.com', '0822942341', 'Leeane', 'Saville', 'The Newlands Peak', 'Newlands', 'Cape Town', '1', '2025-12-08 06:24:17.965227+00', '2025-12-08 06:24:17.965227+00', null, 'customer'),
('ad11cd08-b2f5-4b36-8ab6-95365ed1f8b3', 'nthaby.sodladla@gmail.com', '0719562556', 'Nthabiseng', 'Fortunia', '338 mainroad Clivedon Court', 'Diep River', 'Capetown', '0', '2025-10-30 17:07:50.977708+00', '2025-10-30 17:07:50.977708+00', null, 'customer'),
('b0485ec8-7842-4cd0-8d0e-5d8fa4bf3a42', 'esme.bernise@gmail.com', '0727297575', 'Bernice', 'Schubert', '509 Hall Road', 'Sea Point', 'Capetown', '1', '2025-10-25 10:36:17.574051+00', '2025-12-16 06:48:04.7501+00', null, 'customer'),
('b281ef9b-dd59-4f96-8c4e-788f2c5158b3', 'rushda.adams@gmail.com', '0796970490', 'Rushda', 'Adams', '14 Wesley Street  Heatherdale', 'Belgravia', 'Cape Town', '1', '2025-12-18 13:16:41.918596+00', '2025-12-18 13:16:41.918596+00', null, 'customer'),
('b38c6193-044e-43a6-97f9-78b9f7b917f3', 'kim@theschoepflins.com', '0826793342', 'Kim', 'Schoepflins', '51 Klaasens Road', 'Bishopscourt', 'Cape Town', '1', '2025-12-03 16:15:00.509881+00', '2025-12-03 16:15:00.509881+00', null, 'customer'),
('bde1d47a-fa3d-4494-9650-3f09441addbe', 'jessica@designinabox.co.za', '0832904800', 'Jessica', 'September', '23 Charme Street La Pastorale', 'Stellenbosch', 'Capetown', '0', '2025-10-29 17:44:00.017397+00', '2025-10-29 17:44:00.017397+00', null, 'customer'),
('c1d1dd42-e4ac-4cfa-a1c4-fdbcade8c47c', 'susanf@wol.co.za', '0833774284', 'Susan', 'Farrell', 'Camargue Unit 37, 2 Kerner Close', 'Lakeside', 'Cape Town', '1', '2025-11-01 19:54:58.293698+00', '2025-11-01 19:54:58.293698+00', null, 'customer'),
('c27810b6-694b-4cab-9edf-a57ac5129f2f', 'kriu@telkomsa.net', '0827990403', 'Praphola', ' Gordhan', '604 Montclare Apartments', 'Claremont', 'Capetown', '1', '2025-10-25 10:03:40.262122+00', '2025-12-14 14:14:23.433759+00', null, 'customer'),
('c3b61e64-199c-4e33-8d1d-c6c6adca765c', 'lynthorpe@gmail.com', '0828216092', 'Lynne', 'Thorpe', 'Claremont', 'Claremont', 'Claremont', '0', '2025-10-22 06:17:00.754974+00', '2025-10-22 06:17:00.754974+00', null, 'customer'),
('c4d3bb83-17a3-4b16-9582-f45770fbe08a', 'ndwaby@gmail.com', '0820774877', 'Sithembiso ', 'Ndwandwe ', '8 Groeneveld Rd', 'Rondebosch', 'Cape Town', '1', '2025-11-29 10:31:40.012818+00', '2025-11-29 10:31:40.012818+00', null, 'customer'),
('c8258385-fe97-4a83-831b-4199f134aa57', 'kegan.bell01@gmail.com', '083 751 5151', 'Kegan', 'Becker', '8 Barnard street', 'Monte Vista', 'Cape Town ', '1', '2025-11-03 08:25:27.777847+00', '2025-11-03 08:25:27.777847+00', null, 'customer'),
('c8f8f452-8873-41e3-89fd-675589a54bd7', 'angusbpaul@gmail.com', '0761322864', 'Angus', 'Paul', 'Compagniesdrift Farm', 'Baden Powell', 'Capetown', '0', '2025-11-05 17:18:50.214416+00', '2025-11-05 17:18:50.214416+00', null, 'customer'),
('c97fb299-f10a-4f1d-a60c-317004d3fe50', 'erin22wright@gmail.com', '0608280805', 'Erin', 'Wright', '56 Pilansberg Close Stonehurst Mountain Estate', 'Tokai', 'Cape Town', '1', '2025-12-09 15:26:56.085785+00', '2025-12-09 15:26:56.085785+00', null, 'customer'),
('caa503ed-56ef-4f2d-9e6e-bb5e40fe171b', 'walied44@gmail.com', '082 820 1562', 'Walied', 'Cookson', '17 Milano Way Strandfointein', 'Strandfontein', 'Capetown', '0', '2025-10-23 14:49:12.576783+00', '2025-10-23 14:49:12.576783+00', null, 'customer'),
('cb0684f4-e790-40de-b746-15b4b4ec3055', 'rogen@iafrica.com', '0832608336', 'Rogen', 'Moodley', '1 Basset Road', 'Claremont', 'Capetown', '0', '2025-10-23 14:51:53.870766+00', '2025-10-23 14:51:53.870766+00', null, 'customer'),
('cb6412f0-dd0c-4ce0-a4cc-0ecfc5fc3f7e', 'dwasleydee@gmail.com', '0826620680', 'Denise', 'Wasley', '27 Brompton Avenue', 'BANTRY BAY', 'Cape Town', '1', '2025-12-08 13:00:42.852512+00', '2025-12-08 13:00:42.852512+00', null, 'customer'),
('cc648b1c-b920-49ca-906a-7a8fcecacadf', 'zn.kubheka@outlook.com', '0606163063', 'Zanele', 'Kubheka', 'Esplanade road', 'Century City', 'Cape Town', '1', '2025-11-17 06:30:46.014382+00', '2025-11-17 06:30:46.014382+00', null, 'customer'),
('cf9be490-4f38-463b-80b0-4ee05e79280f', 'eveshenlnaidoo@gmail.com', '0795253585', 'Eveshen', 'Naidoo ', '10A Neave Street ', 'Claremont ', 'Cape Town', '1', '2025-12-18 14:39:38.102236+00', '2025-12-18 14:39:38.102236+00', null, 'customer'),
('d0304cb8-4862-4bc5-953d-64a6c752eb8e', 'jeanwyn44@gmail.com', '0822567921`', 'Jean', 'Wyngaardt', '4 Plumbago Close Flora Acres', 'Ottery', 'Capetown', '0', '2025-11-02 09:32:26.215085+00', '2025-11-02 09:32:26.215085+00', null, 'customer'),
('d5566402-4786-46cc-9552-e5efc5d363c1', 'support@bokkiecleaning.co.za', '+27728596860', 'Daniko', 'Daniko', '10 Sloop Street', 'Strandfontein', 'Cape Town', '3', '2025-10-28 00:21:06.743483+00', '2025-10-29 16:43:06.768055+00', null, 'customer'),
('d61246cd-89db-4e9f-a0f8-4b3cfd9f5497', 'peter.bigelow42@gmail.com', '0769543014', 'Peter', 'Bigelow', '64 Newlands Road ', 'Claremont', 'Cape Town', '2', '2025-12-03 15:35:40.643959+00', '2025-12-18 05:50:51.883805+00', null, 'customer')
ON CONFLICT ("id") DO NOTHING;

-- ============================================================================
-- NOTE: Foreign Key Constraint
-- ============================================================================
-- The auth_user_id column does not have a foreign key constraint to auth.users
-- because some customer records reference users that may not exist in auth.users
-- (e.g., users that were deleted or never created). If you want to enforce
-- referential integrity in the future, you can add the constraint with:
--
-- ALTER TABLE "public"."customers" 
-- ADD CONSTRAINT customers_auth_user_id_fkey 
-- FOREIGN KEY ("auth_user_id") REFERENCES auth.users(id) ON DELETE SET NULL;
--
-- However, you would need to first clean up any invalid auth_user_id references.

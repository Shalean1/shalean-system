-- Migration: Import Cleaners Data
-- Created: 2025-01-XX
-- Description: Import cleaner data from external SQL file with proper schema mapping,
--              cleaner_id generation, and conflict handling

-- ============================================================================
-- HELPER FUNCTION: Generate cleaner_id from name
-- ============================================================================
-- Creates a URL-friendly slug from cleaner name (e.g., "Natasha Magashito" -> "natasha-magashito")
CREATE OR REPLACE FUNCTION generate_cleaner_id_from_name(p_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  base_slug := lower(regexp_replace(
    regexp_replace(p_name, '[^a-zA-Z0-9\s]', '', 'g'), -- Remove special characters
    '\s+', '-', 'g' -- Replace spaces with hyphens
  ));
  
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure it's not empty
  IF base_slug = '' THEN
    base_slug := 'cleaner-' || substr(md5(random()::text), 1, 8);
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM cleaners WHERE cleaner_id = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- IMPORT CLEANER DATA
-- ============================================================================
-- Uses ON CONFLICT to update existing records or insert new ones
-- Preserves existing cleaner_id values, generates new ones for new records
-- Maps photo_url to avatar_url, handles type conversions

INSERT INTO public.cleaners (
  id,
  cleaner_id,
  name,
  avatar_url, -- Maps from photo_url in source data
  rating,
  areas,
  bio,
  years_experience,
  specialties,
  phone,
  email,
  is_active,
  created_at,
  updated_at,
  password_hash,
  auth_provider,
  is_available,
  last_location_lat,
  last_location_lng,
  last_location_updated,
  otp_code,
  otp_expires_at,
  otp_attempts,
  otp_last_sent,
  available_monday,
  available_tuesday,
  available_wednesday,
  available_thursday,
  available_friday,
  available_saturday,
  available_sunday,
  hire_date
)
SELECT
  source.id::UUID,
  -- Generate cleaner_id if record doesn't exist, preserve existing if it does
  COALESCE(
    (SELECT cleaner_id FROM cleaners WHERE id = source.id::UUID),
    generate_cleaner_id_from_name(source.name)
  ) as cleaner_id,
  source.name,
  -- Map photo_url to avatar_url, preserve existing avatar_url if present
  COALESCE(
    (SELECT avatar_url FROM cleaners WHERE id = source.id::UUID),
    NULLIF(source.photo_url, '')
  ) as avatar_url,
  source.rating::DECIMAL(3, 2),
  source.areas,
  NULLIF(source.bio, ''),
  NULLIF(source.years_experience::INTEGER, 0),
  source.specialties,
  NULLIF(source.phone, ''),
  NULLIF(source.email, ''),
  -- Convert string booleans to actual booleans
  CASE 
    WHEN source.is_active::TEXT IN ('true', 't', '1', 'yes') THEN true
    WHEN source.is_active::TEXT IN ('false', 'f', '0', 'no', '') THEN false
    ELSE true
  END as is_active,
  source.created_at::TIMESTAMPTZ,
  source.updated_at::TIMESTAMPTZ,
  NULLIF(source.password_hash, ''),
  NULLIF(source.auth_provider, ''),
  CASE 
    WHEN source.is_available::TEXT IN ('true', 't', '1', 'yes') THEN true
    WHEN source.is_available::TEXT IN ('false', 'f', '0', 'no', '') THEN false
    ELSE true
  END as is_available,
  source.last_location_lat::DECIMAL(10, 8),
  source.last_location_lng::DECIMAL(11, 8),
  source.last_location_updated::TIMESTAMPTZ,
  NULLIF(source.otp_code, ''),
  source.otp_expires_at::TIMESTAMPTZ,
  COALESCE(NULLIF(source.otp_attempts::INTEGER, 0), 0),
  source.otp_last_sent::TIMESTAMPTZ,
  -- Convert availability day strings to booleans
  CASE WHEN source.available_monday::TEXT IN ('true', 't', '1', 'yes') THEN true ELSE false END,
  CASE WHEN source.available_tuesday::TEXT IN ('true', 't', '1', 'yes') THEN true ELSE false END,
  CASE WHEN source.available_wednesday::TEXT IN ('true', 't', '1', 'yes') THEN true ELSE false END,
  CASE WHEN source.available_thursday::TEXT IN ('true', 't', '1', 'yes') THEN true ELSE false END,
  CASE WHEN source.available_friday::TEXT IN ('true', 't', '1', 'yes') THEN true ELSE false END,
  CASE WHEN source.available_saturday::TEXT IN ('true', 't', '1', 'yes') THEN true ELSE false END,
  CASE WHEN source.available_sunday::TEXT IN ('true', 't', '1', 'yes') THEN true ELSE false END,
  source.hire_date::DATE
FROM (VALUES
  ('04d5ae12-5f78-464b-92c8-46d61df5b5cd'::UUID, 'Silibaziso Moyo', '', '4.7', ARRAY['Claremont','Wynberg','Kenilworth','Cape Town','Constantia'], 'Experienced cleaner serving the Cape Winelands area. Specializes in luxury properties.', '1', ARRAY['Luxury cleaning','Wine estate cleaning','Deep cleaning'], '+27845559202', '', 'true', '2025-10-17 19:38:30.924719+00', '2025-10-17 19:38:30.924719+00', '$2a$10$NSGukyJeIMDM2LXvaFjkHOoBYwduVvhh9uTKRYzrF8hUdwFTsZrpa', 'both', 'true', '-33.99210630', '18.50631440', '2025-11-16 16:49:07.081+00', null, null, '0', null, 'false', 'true', 'false', 'false', 'false', 'false', 'false', null),
  ('19e3eb27-5be0-4e8e-a654-e42d27586ada'::UUID, 'Natasha Magashito', '', '4.7', ARRAY['Cape Town','Stellenbosch','Paarl'], 'Experienced cleaner serving the Cape Winelands area. Specializes in luxury properties.', '1', ARRAY['Luxury cleaning','Wine estate cleaning','Deep cleaning'], '+27678316466', '', 'true', '2025-10-16 22:22:13.815891+00', '2025-10-16 22:22:13.815891+00', '$2a$10$1eU7EHDVizm5dmXBybM.Eeza3K3COZWxVB6jKnhLVmzLeZS/O.9WC', 'both', 'true', '-33.88991600', '18.63281490', '2025-10-31 18:21:08.008+00', null, null, '0', null, 'true', 'true', 'true', 'false', 'true', 'true', 'true', null),
  ('21c9ed33-7054-49af-b91a-396a40746a51', 'Ngwira Madalitso', null, '5.0', ARRAY['Claremont'], null, null, null, '+27680582573', null, 'true', '2025-12-05 02:00:28.101478+00', '2025-12-05 02:00:28.101478+00', '$2a$10$.6NarDx6CQIXs4uJ4xP1g.9zkaFQHLAw8KgYn3OapN2uMyabv2CXS', 'both', 'true', null, null, null, null, null, '0', null, 'true', 'true', 'true', 'true', 'true', 'true', 'true', null),
  ('22304709-7c94-4d6b-b4bc-ed35e1c26fce', 'Lucia Pazvakavambwa', '', '4.9', ARRAY['Muizenberg','Constantia','Hout Bay','Clifton','Bantry Bay','Tamboerskloof','City Bowl','St James','Kalk Bay','Lakeside','False Bay','Woodstock','Rondebosch','Rosebank','Mowbary','Observatory','Cape Town','Green Point'], 'Experienced cleaner who takes pride in attention to detail. Great with move-in/out cleaning.', '1', ARRAY['Move-in/out','Office cleaning','Post-construction'], '+27812736804', '', 'true', '2025-10-17 19:38:30.924719+00', '2025-10-17 19:38:30.924719+00', '$2a$10$3REWZwPMjFhiKR12n9NmFOt37cXpiDUSj/vgd1hox5EuanK1KqF7C', 'both', 'true', '-33.96784620', '18.51188280', '2025-10-29 15:07:51.451+00', null, null, '0', null, 'false', 'true', 'true', 'true', 'true', 'true', 'false', null),
  ('2231fa06-1ba5-43d6-bf2d-ca757368a05a', 'Normatter Mazhinji', '', '4.8', ARRAY['Camps Bay','Sea Point','Green Point','Woodstock','Gardens','V&A Waterfront','Claremont','Newlands','Rondebosch','Observatory'], 'Professional cleaner with 5 years experience. Specializes in eco-friendly cleaning products.', '5', ARRAY['Eco-friendly','Deep cleaning','Airbnb prep'], '+27742649775', '', 'true', '2025-10-17 19:38:30.924719+00', '2025-12-04 17:32:48.487+00', '$2a$10$LdOp7Pk5PvbtvJjBOmDcQ.0oSr0IUKCPRImPj6gp0y1FntfLw3hsW', 'both', 'true', '-34.07353810', '18.58004430', '2025-11-13 09:14:29.252+00', null, null, '0', null, 'true', 'true', 'false', 'true', 'true', 'true', 'false', null),
  ('2a92664c-7e6c-4cbc-9d1b-6387f1c2b021', 'Beaulla Chemugarira', '', '3.0', ARRAY['Cape Town'], '', '1', ARRAY[]::TEXT[], '+27810768318', 'beaullachemugarira@gmail.com', 'true', '2025-10-19 12:45:52.990962+00', '2025-10-19 12:45:52.990962+00', '$2a$10$PIliBblMAKKBK5pCjnrwl.0eiRqkXmZarKd8TFLD4wWMcslWzu2mK', 'both', 'true', '-33.95420160', '18.58273280', '2025-11-15 21:18:57.182+00', null, null, '0', null, 'true', 'true', 'true', 'true', 'true', 'true', 'true', null),
  ('2ba4ac8f-f271-4ce3-9811-58dbca218dc1', 'Magaret Jiri', null, '4.9', ARRAY['Fish Hoek','Kalk Bay','Simon''s Town','Kenilworth','Wynberg','Plumstead','Bishopscourt','Tokai','Bergvliet','Diep River'], 'Detail-oriented cleaner with excellent organizational skills. Perfect for busy households.', '1', ARRAY['Organizing','Deep cleaning','Regular maintenance'], '+27658193061', null, 'true', '2025-10-17 19:38:30.924719+00', '2025-12-07 03:29:48.801+00', '$2a$10$0OiDYu67OTGB7PFiIRn6x.5gQWoYAkr6XQIxt6KQQ9GgCR.0vtSpi', 'both', 'true', '-33.99210320', '18.50631480', '2025-11-16 17:57:36.256+00', null, null, '0', null, 'false', 'true', 'false', 'true', 'false', 'true', 'true', null),
  ('45427254-968d-4115-9285-b5f1b03010eb', 'Princess Saidi', '', '5.0', ARRAY['Seapoint','Capetown','Rosebank','Rondebocsh','Claremont','Newlands'], 'My name is Princess Saidi, a professional cleaner from Zimbabwe with five years of experience. As an English speaker, I specialize in delivering exceptional cleaning services with meticulous attention to detail. I am committed to maintaining high hygiene standards and ensuring client satisfaction through reliable and friendly service.', '5', ARRAY[]::TEXT[], '+27738111327', '', 'true', '2025-11-07 18:25:30.82194+00', '2025-11-07 18:25:30.82194+00', '$2a$10$Ox8c1uIBv3jy.jZf9EWOEuXN6dXXjoqnhENx20AaE9D02PxQ5qM3a', 'both', 'true', null, null, null, null, null, '0', null, 'true', 'true', 'true', 'true', 'true', 'true', 'true', null),
  ('53f7c0c0-684a-4cbe-aeec-8aa9758940c3', 'Nicole James', '', '4.8', ARRAY['Gardens','V&A Waterfront','Claremont','Newlands','Rondebosch','Observatory','Muizenberg','Constantia','Hout Bay','Clifton'], 'Premium cleaning service provider. Available across major cities with high-end service.', '1', ARRAY['Premium cleaning','Eco-friendly','Commercial','Residential'], '+27694069060', '', 'true', '2025-10-17 19:38:30.924719+00', '2025-10-17 19:38:30.924719+00', '$2a$10$Ilft/t28X7MET.3eeqTSX.xVTpKkcn2iWrzgB6zhrT7Fgisq779vK', 'both', 'true', '-33.93832843', '18.54384685', '2025-11-12 20:56:47.393+00', null, null, '0', null, 'false', 'false', 'false', 'false', 'true', 'false', 'false', null),
  ('555cf8fc-9669-4d86-8857-570fc667e3f0', 'Emarald Nyamoto', '', '4.6', ARRAY['Plumstead','Claremont','Kenilworth','Fishhoek','Heatfiled','Muizernberg','Wynberg','Begivliet','Deipriver','Lakeside','Westlake','Tokai'], 'Professional cleaner specializing in commercial and residential spaces.', '1', ARRAY['Commercial cleaning','Residential','Carpet cleaning'], '+27719382131', '', 'true', '2025-10-16 22:22:13.815891+00', '2025-10-16 22:22:13.815891+00', '$2a$10$OD4Eb.W3Nidk/8z7lRiXCOtJ3V7veDEjFHR7jJGFK5073rU1k6pQW', 'both', 'true', '-34.07207207', '18.46755817', '2025-11-11 04:12:57.084+00', '701635', '2025-12-03 17:41:56.609+00', '2', '2025-12-03 17:36:56.609+00', 'true', 'true', 'true', 'true', 'false', 'true', 'false', null),
  ('5d31128f-8508-40e7-b63f-b37ccb166cdf', 'Sinikiwe Murire', null, '5.0', ARRAY['Claremont'], null, null, null, '+27843640805', null, 'true', '2025-12-05 01:56:05.84902+00', '2025-12-05 01:56:05.84902+00', '$2a$10$A7JMs4ED1UUVjYZlF0DHDOQgMj4RRhyq3NKf2yNk/nS352h1E5.76', 'both', 'true', null, null, null, null, null, '0', null, 'true', 'true', 'true', 'true', 'true', 'true', 'true', null),
  ('6fd4f144-92a8-44fd-bcd6-64005a5d0ba6', 'Chrissy Roman', null, '5.0', ARRAY['Capetown'], null, null, null, '+27752175328', 'jagadrey@gmail.com', 'true', '2025-12-05 02:04:43.018937+00', '2025-12-08 18:14:04.362+00', '$2a$10$RSx8ckAiYgHkxzJe5WXjUeFmI/064h3jI2lRm8vOinblRd05uCMWm', 'both', 'true', null, null, null, null, null, '0', null, 'true', 'true', 'true', 'true', 'true', 'true', 'true', null),
  ('72642f1a-4745-47e1-9a13-1edbb19b20d0', 'Lucia Chiuta', '', '4.6', ARRAY['Bishopscourt','Tokai','Bergvliet','Diep River','Lakeside','Noordhoek','Kommetjie','Scarborough','Camps Bay','Sea Point'], 'Professional cleaner specializing in commercial and residential spaces.', '1', ARRAY['Commercial cleaning','Residential','Carpet cleaning'], '+27785567309', '', 'true', '2025-10-17 19:38:30.924719+00', '2025-10-17 19:38:30.924719+00', '$2a$10$vD83iT..y9XrlGEHfx4JBeg9yUK8a0kZYlKf7PjemClAU01oKRsx2', 'both', 'false', '-34.12972930', '18.37927480', '2025-11-03 19:43:29.025+00', null, null, '0', null, 'true', 'true', 'false', 'true', 'false', 'false', 'false', null),
  ('74ddb79f-8cdc-4483-954a-1e6d5ab562eb', 'Ruvarashe Pazvakavambwa', '', '4.7', ARRAY['Bellville','Parow','Somerset West','Strand','Fish Hoek','Kalk Bay','Simon''s Town','Kenilworth','Wynberg','Plumstead'], 'Reliable and thorough cleaner. Perfect for regular maintenance and special occasions.', '1', ARRAY['Regular cleaning','Deep cleaning','Window cleaning'], '+27627958190', '', 'true', '2025-10-17 19:38:30.924719+00', '2025-10-17 19:38:30.924719+00', '$2a$10$EIOMawVmpAJixkttxgR09OAxzupFG3Mx1BF66WJN5TJZtTdxjpi6C', 'both', 'true', '-34.08668030', '18.48786310', '2025-11-16 15:07:36.41+00', null, null, '0', null, 'true', 'true', 'true', 'true', 'true', 'true', 'true', null),
  ('7590892c-6177-4efe-8c5f-7263b7bf19cd', 'Tsungaimunashe Mbera', '', '4.9', ARRAY['Muizenberg','Retreat','Begviliet','Deipriver','Heathfield','Wynberg','Kenilworth','Claremont','Westlake','Lakeside'], 'Detail-oriented cleaner with excellent organizational skills. Perfect for busy households.', '1', ARRAY['Organizing','Deep cleaning','Regular maintenance'], '+27699192765', '', 'true', '2025-10-16 22:22:13.815891+00', '2025-10-16 22:22:13.815891+00', '$2a$10$k8aJudooGV8ae/4mF/YOIu.Zxt3.YrIE07D69lUoyDuuxj1aff2Y2', 'both', 'true', '-34.08236140', '18.48535720', '2025-10-31 20:38:50.715+00', null, null, '0', null, 'true', 'true', 'true', 'true', 'true', 'true', 'true', null),
  ('796e3ad7-07f3-44eb-b4cf-bed439a59f8b', 'Nyasha Mudani', '', '4.6', ARRAY['Simon''s Town','Kenilworth','Wynberg','Plumstead','Bishopscourt','Tokai','Bergvliet','Diep River','Lakeside','Noordhoek'], 'Professional cleaner with focus on customer satisfaction and quality results.', '4', ARRAY['Quality cleaning','Customer service','Regular maintenance'], '+27697567515', '', 'true', '2025-10-17 19:38:30.924719+00', '2025-10-17 19:38:30.924719+00', '$2a$10$4u89SOx7ibT3AzYtLhYmGOd6o/7l4uM61QelLkRi2FnvkoO2J6KeG', 'both', 'true', '-34.00707720', '18.59464430', '2025-11-13 19:48:24.072+00', null, null, '0', null, 'true', 'false', 'false', 'true', 'false', 'false', 'false', null),
  ('869b80b9-00e2-4b34-9e42-7b87d42b4aac', 'Mary Mugari', null, '4.7', ARRAY['Table View','Parklands','Cape Town','Sea Point','Century City','Blouberg','Brooklyn'], 'Professional cleaner with extensive experience in coastal properties.', '1', ARRAY['Coastal cleaning','Regular maintenance','Deep cleaning'], '+27814857486', null, 'false', '2025-10-17 19:38:30.924719+00', '2025-10-17 19:38:30.924719+00', '$2a$10$t1MzFqfJvS78rcrvbgw3Ou.KVXRAE00PCi6gZcTsuGgf4FZP.Geva', 'both', 'false', '-33.87387387', '18.51136826', '2025-11-02 05:24:31.913+00', null, null, '0', null, 'false', 'true', 'true', 'true', 'false', 'true', 'false', null),
  ('8aabdbfb-1428-44d5-8ff9-7661a0b355aa', 'Shyleen Pfende', '', '4.9', ARRAY['Bergvliet','Diep River','Lakeside','Noordhoek','Kommetjie','Westlake','Plumstead','Fishhoek','Wynberg','Claremont','Rondebosch','Muizenberg','Kalkbay','Tokai'], 'Reliable and efficient cleaner. Specializes in move-in/out and Airbnb preparation.', '1', ARRAY['Move-in/out','Airbnb prep','Deep cleaning'], '+27641940583', '', 'true', '2025-10-17 19:38:30.924719+00', '2025-10-17 19:38:30.924719+00', '$2a$10$K/EeoHBEBRJ9onxoHJDguuzI7GQJB48qjlciy2MnGhXtl4FnVkwxO', 'both', 'true', '-34.08667570', '18.48789490', '2025-11-16 17:12:25.961+00', null, null, '0', null, 'true', 'false', 'false', 'true', 'false', 'true', 'false', null),
  ('91068f7f-bb91-476f-ad73-ddfe376d5e4c', 'Jacqueline Maphosa', '', '4.8', ARRAY['Wynberg','Claremont','Diepriver','Muizenberg','Lansdowne','Steernberg','Plumstead','Ottery','Kenilworth','Constantia','Retreat'], 'Experienced cleaner with a focus on customer satisfaction and quality work.', '1', ARRAY['Move-in/out','Post-renovation','Eco-friendly'], '+27693893953', '', 'true', '2025-10-17 19:38:30.924719+00', '2025-10-17 19:38:30.924719+00', '$2a$10$tX/JSb0lPqq3p2O9fTO23OkfS7majHa/U/ueZ.Q081DFYhQnddFsG', 'both', 'true', '-34.11815780', '18.86969220', '2025-11-03 13:22:35.126+00', null, null, '0', null, 'true', 'true', 'true', 'true', 'true', 'true', 'true', null),
  ('914b3acf-40e8-4ad5-a5a2-9e2de711849a', 'Ethel Chizombe', '', '4.8', ARRAY['Claremont','Newlands','Rondebosch','Observatory','Muizenberg','Constantia','Hout Bay','Clifton','Bantry Bay','Tamboerskloof'], 'Professional cleaner with great attention to detail. Reliable and punctual service.', '1', ARRAY['Regular cleaning','Move-in/out','Post-construction'], '+27743214943', '', 'true', '2025-10-17 19:38:30.924719+00', '2025-10-17 19:38:30.924719+00', '$2a$10$VRqI1TdedAY3b1SFRe8We.CcTSsl8g5ZRwWFYIdfw5B0Ftm2uOsYK', 'both', 'true', '-33.94273200', '18.64537370', '2025-11-11 15:04:06.399+00', null, null, '0', null, 'false', 'true', 'false', 'false', 'false', 'false', 'false', null),
  ('ac73ea99-48b3-4c30-9d6b-5a8beab40f33', 'Mavis Thandeka Gurajena', '', '4.9', ARRAY['Green Point','Woodstock','Gardens','V&A Waterfront','Claremont','Newlands','Rondebosch','Observatory','Muizenberg','Constantia'], 'Detail-oriented cleaner with excellent customer reviews. Great with Airbnb properties.', '1', ARRAY['Airbnb cleaning','Deep cleaning','Organizing'], '+27629474955', '', 'true', '2025-10-17 19:38:30.924719+00', '2025-10-17 19:38:30.924719+00', '$2a$10$eZdLOyBnVbr.pXSPmfq50O0qa7MluRQZbmusOJYmrtwjvP6Bg1EVu', 'both', 'true', '-34.08669930', '18.48787120', '2025-11-14 03:46:29.254+00', null, null, '0', null, 'true', 'true', 'true', 'true', 'false', 'true', 'true', null),
  ('b748ccf2-983e-43aa-9ab2-7ff27882fbe4', 'Primrose Chinohamba', '', '4.8', ARRAY['Cape Town','Camps Bay','Sea Point'], 'Professional cleaner with 5 years experience. Specializes in eco-friendly cleaning products.', '1', ARRAY['Eco-friendly','Deep cleaning','Airbnb prep'], '+27815404023', '', 'true', '2025-10-16 22:22:13.815891+00', '2025-10-16 22:22:13.815891+00', '$2a$10$nVYhlW6a97TEPqnxpUf5JewoNSHts79ms7aY2vIbALfYllXcpdOi.', 'both', 'true', '-33.94435381', '18.64691477', '2025-10-30 03:43:49.079+00', null, null, '0', null, 'false', 'true', 'true', 'true', 'false', 'true', 'true', null),
  ('c0771cf5-3a83-4299-99ee-b0e399e8745f', 'Mitchell Piyo', '', '4.9', ARRAY['City Bowl','Table View','Bloubergstrand','Milnerton','Bellville','Parow','Somerset West','Strand','Fish Hoek','Kalk Bay'], 'Experienced cleaner with excellent customer service. Specializes in residential properties.', '1', ARRAY['Residential cleaning','Deep cleaning','Regular maintenance'], '+27607222189', '', 'true', '2025-10-17 19:38:30.924719+00', '2025-10-17 19:38:30.924719+00', '$2a$10$FU/FrEzgHX4eQgDYbpS7MeeZQNI/fD.0ARUy7Dqrfz6QhJIUkiY/S', 'both', 'true', '-33.92857150', '18.41405900', '2025-11-14 06:55:15.096+00', null, null, '0', null, 'true', 'false', 'true', 'true', 'true', 'true', 'true', null),
  ('d8a75570-4b3f-44bc-848a-ad9f33857c91', 'Estery Phiri', '', '4.6', ARRAY['Muizenberg','Constantia','Hout Bay','Clifton','Bantry Bay','Tamboerskloof','City Bowl','St James','Kalk Bay','Lakeside','False Bay','Woodstock','Rondebosch','Rosebank','Mowbary','Observatory','Cape Town','Green Point'], 'Professional cleaner with focus on eco-friendly products and sustainable cleaning methods.', '1', ARRAY['Eco-friendly','Sustainable cleaning','Regular maintenance'], '+27691445709', '', 'true', '2025-10-17 19:38:30.924719+00', '2025-10-17 19:38:30.924719+00', '$2a$10$.6cW9l5TUtRZpnqloH8EN.iEzJDWBhVI42Kd0T2rOoSRkum37WYK6', 'both', 'true', '-34.08568900', '18.48722470', '2025-11-14 19:31:51.559+00', null, null, '0', null, 'true', 'true', 'true', 'true', 'true', 'true', 'true', null),
  ('e7e2e61a-608d-4fc7-b7d7-865988039d4a', 'Rutendo Shamba', '', '4.9', ARRAY['Century City','Bothasig','Parklands','Richwood','Milnerton','Sundown','Burgundy Estate','Blouberg','Sunningdale','bigbay'], 'Experienced cleaner who takes pride in attention to detail. Great with move-in/out cleaning.', '1', ARRAY['Move-in/out','Office cleaning','Post-construction'], '+27842676534', '', 'true', '2025-10-16 22:22:13.815891+00', '2025-12-14 17:48:20.888+00', '$2a$10$88fwoph1T13/XIDSDr6o1O9AeKWdK10G4iLBbvmUX7jvDDn2i5aU2', 'both', 'true', '-33.87387387', '18.51136826', '2025-11-15 05:52:07.426+00', null, null, '0', null, 'false', 'false', 'false', 'false', 'false', 'true', 'true', null),
  ('f781f062-dbed-4a33-84eb-f3bef3493063', 'Marvellous Muneri', null, '5.0', ARRAY['Capetown'], null, null, null, '+27603634903', null, 'true', '2025-12-04 19:58:11.739+00', '2025-12-04 19:58:11.739+00', '$2a$10$LjUEg8Dew7rQXHT1GXYxhe/loEEG12Jbzq3T0mbdjU0i/KwGUXc.S', 'both', 'true', null, null, null, null, null, '0', null, 'true', 'true', 'true', 'true', 'true', 'true', 'true', null)
) AS source(
  id, name, photo_url, rating, areas, bio, years_experience, specialties, phone, email, 
  is_active, created_at, updated_at, password_hash, auth_provider, is_available,
  last_location_lat, last_location_lng, last_location_updated, otp_code, otp_expires_at,
  otp_attempts, otp_last_sent, available_monday, available_tuesday, available_wednesday,
  available_thursday, available_friday, available_saturday, available_sunday, hire_date
)
ON CONFLICT (id) DO UPDATE SET
  -- Cast id to UUID for conflict resolution
  -- Preserve existing cleaner_id, only update if NULL
  cleaner_id = COALESCE(cleaners.cleaner_id, EXCLUDED.cleaner_id),
  -- Update name if changed
  name = EXCLUDED.name,
  -- Update avatar_url only if current is NULL or empty, prefer new photo_url
  avatar_url = COALESCE(NULLIF(cleaners.avatar_url, ''), EXCLUDED.avatar_url),
  -- Update rating
  rating = EXCLUDED.rating,
  -- Update arrays (replace if provided)
  areas = COALESCE(EXCLUDED.areas, cleaners.areas),
  specialties = COALESCE(EXCLUDED.specialties, cleaners.specialties),
  -- Update bio if provided
  bio = COALESCE(NULLIF(EXCLUDED.bio, ''), cleaners.bio),
  -- Update years_experience
  years_experience = COALESCE(EXCLUDED.years_experience, cleaners.years_experience),
  -- Update contact info
  phone = COALESCE(NULLIF(EXCLUDED.phone, ''), cleaners.phone),
  email = COALESCE(NULLIF(EXCLUDED.email, ''), cleaners.email),
  -- Update status fields
  is_active = EXCLUDED.is_active,
  is_available = EXCLUDED.is_available,
  -- Update timestamps (preserve created_at, update updated_at)
  updated_at = EXCLUDED.updated_at,
  -- Update auth fields
  password_hash = COALESCE(NULLIF(EXCLUDED.password_hash, ''), cleaners.password_hash),
  auth_provider = COALESCE(NULLIF(EXCLUDED.auth_provider, ''), cleaners.auth_provider),
  -- Update location
  last_location_lat = COALESCE(EXCLUDED.last_location_lat, cleaners.last_location_lat),
  last_location_lng = COALESCE(EXCLUDED.last_location_lng, cleaners.last_location_lng),
  last_location_updated = COALESCE(EXCLUDED.last_location_updated, cleaners.last_location_updated),
  -- Update OTP fields
  otp_code = COALESCE(NULLIF(EXCLUDED.otp_code, ''), cleaners.otp_code),
  otp_expires_at = COALESCE(EXCLUDED.otp_expires_at, cleaners.otp_expires_at),
  otp_attempts = COALESCE(EXCLUDED.otp_attempts, cleaners.otp_attempts),
  otp_last_sent = COALESCE(EXCLUDED.otp_last_sent, cleaners.otp_last_sent),
  -- Update availability days
  available_monday = EXCLUDED.available_monday,
  available_tuesday = EXCLUDED.available_tuesday,
  available_wednesday = EXCLUDED.available_wednesday,
  available_thursday = EXCLUDED.available_thursday,
  available_friday = EXCLUDED.available_friday,
  available_saturday = EXCLUDED.available_saturday,
  available_sunday = EXCLUDED.available_sunday,
  -- Update hire_date
  hire_date = COALESCE(EXCLUDED.hire_date, cleaners.hire_date);

-- ============================================================================
-- CLEANUP: Drop helper function (optional, can keep for future use)
-- ============================================================================
-- DROP FUNCTION IF EXISTS generate_cleaner_id_from_name(TEXT);















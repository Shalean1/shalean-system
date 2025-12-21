-- Migration: Insert quotes data
-- Created: 2025-01-XX
-- Description: Updates quotes table schema and inserts historical quote data

-- ============================================================================
-- UPDATE QUOTES TABLE SCHEMA TO MATCH DATA STRUCTURE
-- ============================================================================

-- Helper function to convert JSONB array to TEXT array
CREATE OR REPLACE FUNCTION jsonb_array_to_text_array(jsonb_val JSONB)
RETURNS TEXT[] AS $$
DECLARE
  result TEXT[];
BEGIN
  IF jsonb_val IS NULL OR jsonb_typeof(jsonb_val) != 'array' THEN
    RETURN ARRAY[]::TEXT[];
  END IF;
  
  SELECT ARRAY_AGG(value::TEXT)
  INTO result
  FROM jsonb_array_elements_text(jsonb_val);
  
  RETURN COALESCE(result, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Change id column from UUID to TEXT if needed (only if column doesn't already exist as TEXT)
DO $$
BEGIN
  -- Convert id column from UUID to TEXT if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' 
    AND column_name = 'id' 
    AND data_type = 'uuid'
  ) THEN
    -- Drop the default first
    ALTER TABLE quotes ALTER COLUMN id DROP DEFAULT;
    -- Convert UUID to TEXT
    ALTER TABLE quotes ALTER COLUMN id TYPE TEXT USING id::TEXT;
  END IF;

  -- Check if id column is UUID type, if so we need to handle it differently
  -- For now, we'll assume the table might need these columns added/modified
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'service_type'
  ) THEN
    -- Add service_type column (rename from service if it exists)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'quotes' AND column_name = 'service'
    ) THEN
      ALTER TABLE quotes RENAME COLUMN service TO service_type;
    ELSE
      ALTER TABLE quotes ADD COLUMN service_type TEXT;
    END IF;
  END IF;

  -- Add extras column (rename from additional_services if it exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'extras'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'quotes' AND column_name = 'additional_services'
    ) THEN
      -- Check the current data type
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'additional_services' 
        AND data_type = 'jsonb'
      ) THEN
        -- Rename and convert JSONB to TEXT[]
        -- First drop the default, convert type, then set new default
        ALTER TABLE quotes RENAME COLUMN additional_services TO extras;
        ALTER TABLE quotes ALTER COLUMN extras DROP DEFAULT;
        ALTER TABLE quotes ALTER COLUMN extras TYPE TEXT[] USING jsonb_array_to_text_array(extras);
        ALTER TABLE quotes ALTER COLUMN extras SET DEFAULT ARRAY[]::TEXT[];
      ELSE
        -- Just rename if it's already TEXT[]
        ALTER TABLE quotes RENAME COLUMN additional_services TO extras;
      END IF;
    ELSE
      ALTER TABLE quotes ADD COLUMN extras TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
  END IF;

  -- Add estimated_price column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'estimated_price'
  ) THEN
    ALTER TABLE quotes ADD COLUMN estimated_price DECIMAL(10, 2);
  END IF;

  -- Add notes column (rename from note if it exists)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'notes'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'quotes' AND column_name = 'note'
    ) THEN
      ALTER TABLE quotes RENAME COLUMN note TO notes;
    ELSE
      ALTER TABLE quotes ADD COLUMN notes TEXT;
    END IF;
  END IF;

  -- Make location nullable or add default if it's required but missing from INSERT data
  -- Since the INSERT doesn't include location, we'll make it nullable temporarily
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quotes' AND column_name = 'location' 
    AND is_nullable = 'NO'
  ) THEN
    -- Make location nullable for historical data insertion
    ALTER TABLE quotes ALTER COLUMN location DROP NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- INSERT QUOTES DATA
-- ============================================================================
-- Note: If id column is UUID, you may need to modify the INSERT to use uuid_generate_v4()
-- or convert the QT-* IDs. This assumes the table accepts TEXT IDs.

INSERT INTO "public"."quotes" ("id", "service_type", "bedrooms", "bathrooms", "extras", "first_name", "last_name", "email", "phone", "status", "estimated_price", "notes", "created_at", "updated_at") VALUES 
('QT-1760739429595', 'Move In/Out', '0', '1', ARRAY[]::TEXT[], 'Eric nhantumbo', 'Nhantumbo', 'Eric Nhantumbo@gmali.com', '0695756772', 'contacted', '1200', '', '2025-10-17 22:17:10.268994+00', '2025-10-19 16:34:38.337+00'), 
('QT-1760827574731', 'Standard', '4', '4', ARRAY['Interior Windows']::TEXT[], 'Zintle ', 'Roto', 'asithandemnini@gmail.com', '0639689615', 'contacted', '490', '', '2025-10-18 22:46:14.88242+00', '2025-10-19 16:34:10.168+00'), 
('QT-1760872590019', 'Deep', '2', '2', ARRAY['Inside Fridge','Inside Oven','Interior Windows']::TEXT[], 'Marek', 'Raciborski', 'mraciborski@gmail.com', '+27826248098', 'contacted', '2160', '', '2025-10-19 11:16:30.350089+00', '2025-10-19 16:33:50.029+00'), 
('QT-1760895075452', 'Standard', '2', '2', ARRAY[]::TEXT[], 'Patricia ', 'Thys', 'suzannethys8@gmail.com', '0780715883', 'contacted', '350', '', '2025-10-19 17:31:15.531888+00', '2025-10-19 22:07:23.938+00'), 
('QT-1761085714391', 'Airbnb', '2', '1', ARRAY['Inside Oven']::TEXT[], 'Nomazizi ', 'Dlula', 'dlulanomazizi70@gmail.com', '0631077524', 'contacted', '322', '', '2025-10-21 22:28:34.482595+00', '2025-10-27 04:09:41.517+00'), 
('QT-1761086464196', 'Standard', '3', '3', ARRAY['Ironing','Interior Windows']::TEXT[], 'Valerie ', 'van der Ross ', 'vanderrossvalerie@g.mail.com', '0747670849', 'contacted', '475', '', '2025-10-21 22:41:04.334992+00', '2025-10-27 04:09:50.181+00'), 
('QT-1761093717557', 'Standard', '0', '1', ARRAY[]::TEXT[], 'Lorenzo ', 'Fritz ', 'renrealest7@gmail.com', '737787238', 'contacted', '280', '', '2025-10-22 00:41:57.644499+00', '2025-10-27 04:09:59.733+00'), 
('QT-1761146447681', 'Deep', '1', '1', ARRAY[]::TEXT[], 'Shannon', 'Cupido', 'shannoncupido@hotmail.co.za', '0835072214', 'contacted', '1630', '', '2025-10-22 15:20:48.187491+00', '2025-10-27 04:10:11.302+00'), 
('QT-1761151454620', 'Deep', '4', '1', ARRAY['Inside Oven','Inside Fridge','Inside Cabinets','Interior Windows','Interior Walls']::TEXT[], 'Eudocha', 'BARRY', 'eudocha.barry@gmail.com', '+27745595578', 'contacted', '2335', '', '2025-10-22 16:44:14.874159+00', '2025-10-27 04:10:19.459+00'), 
('QT-1761196553074', 'Deep', '2', '3', ARRAY['Ironing']::TEXT[], 'Name', 'Surbame', 'namesurname@gmail.com', '0825553256', 'contacted', '2345', '', '2025-10-23 05:15:53.40165+00', '2025-10-27 04:10:27.124+00'), 
('QT-1761261622050', 'Move In/Out', '0', '1', ARRAY[]::TEXT[], 'Lorghan', 'Titus', 'larishatitus77@gmail.com', '+27713589557', 'contacted', '1200', '', '2025-10-23 23:20:22.635783+00', '2025-10-27 04:10:43.473+00'), 
('QT-1761264722904', 'Standard', '5', '3', ARRAY['Inside Fridge','Interior Windows']::TEXT[], 'Sinazo', 'Langeni ', 'sinazolangeni26@gmail.com', '7178426161', 'contacted', '510', '', '2025-10-24 00:12:03.374507+00', '2025-10-27 04:10:50.632+00'), 
('QT-1761377380382', 'Move In/Out', '3', '1', ARRAY['Interior Windows','Inside Cabinets','Inside Oven']::TEXT[], 'Darren', 'Naidoo', 'darren.latchmana@gmail.com', '+27793126742', 'contacted', '1780', '', '2025-10-25 07:29:40.846275+00', '2025-10-27 04:10:58.204+00'), 
('QT-1761377382885', 'Move In/Out', '3', '1', ARRAY['Interior Windows','Inside Cabinets','Inside Oven']::TEXT[], 'Darren', 'Naidoo', 'darren.latchmana@gmail.com', '+27793126742', 'contacted', '1780', '', '2025-10-25 07:29:42.938495+00', '2025-10-27 04:11:05.934+00'), 
('QT-1761377422806', 'Move In/Out', '2', '2', ARRAY['Interior Windows']::TEXT[], 'Lindsay', 'Quail', 'lindsay@computravel.co.za', '+27846740246', 'contacted', '1780', '', '2025-10-25 07:30:22.889988+00', '2025-10-27 04:11:13.248+00'), 
('QT-1761377455290', 'Move In/Out', '3', '1', ARRAY['Inside Oven','Inside Cabinets','Interior Walls']::TEXT[], 'Darren', 'Naidoo', 'darren.latchmana@gmail.com', '+27793126742', 'contacted', '1775', '', '2025-10-25 07:30:55.535953+00', '2025-10-27 04:11:24.004+00'), 
('QT-1761387967684', 'Standard', '6', '5', ARRAY['Interior Walls']::TEXT[], 'Nontlahla', 'Rhubheni', 'nontlahlarhubheni@gmail.com', '0814948051', 'contacted', '555', '', '2025-10-25 10:26:07.710793+00', '2025-10-27 04:11:35.88+00'), 
('QT-1761496699280', 'Deep', '3', '1', ARRAY['Inside Oven','Inside Cabinets','Interior Walls','Interior Windows','Laundry']::TEXT[], 'Arcanjo', 'Cassoba', 'ArcanjoCassoba@hotmail.com', '+27659375787', 'contacted', '2165', '', '2025-10-26 16:38:19.350456+00', '2025-10-27 04:11:43.325+00'), 
('QT-1761572037343', 'Move In/Out', '0', '1', ARRAY[]::TEXT[], 'Marlene', 'Botha', 'bothamarlene60@gmail.com', '0812864897', 'contacted', '1200', '', '2025-10-27 13:33:57.845393+00', '2025-10-28 15:41:01.127+00'), 
('QT-1761638773518', 'Deep', '2', '1', ARRAY['Interior Walls','Interior Windows','Inside Cabinets']::TEXT[], 'Tessa', 'Hille', 'tem.hille@gmail.com', '+27721130173', 'converted', '1915', '', '2025-10-28 08:06:13.765278+00', '2025-10-28 14:54:48.789+00'), 
('QT-1761650403813', 'Standard', '3', '1', ARRAY['Inside Cabinets','Inside Oven','Interior Walls']::TEXT[], 'Jean', 'Wyngaardt', 'jeanwyn44@gmail.com', '+27822567921', 'converted', '435', '', '2025-10-28 11:20:04.237504+00', '2025-10-28 18:53:19.265+00'), 
('QT-1761714700567', 'Standard', '0', '1', ARRAY[]::TEXT[], 'Masibonge', 'Mbovane', 'mbovanemasibonge34@gmail.com', '+27734122409', 'contacted', '280', '', '2025-10-29 05:11:40.690465+00', '2025-10-29 13:06:52.942+00'), 
('QT-1761718630632', 'Standard', '2', '1', ARRAY[]::TEXT[], 'Rhay', 'Mc Mahon ', 'rhaymcmahon@gmail.com', '0820933579', 'contacted', '320', '', '2025-10-29 06:17:11.216983+00', '2025-10-29 17:54:41.144+00'), 
('QT-1761757064360', 'Standard', '3', '2', ARRAY['Inside Fridge','Inside Oven','Inside Cabinets','Interior Windows']::TEXT[], 'Kristen', 'Lingervelder', 'kristenmostert@gmail.com', '+27628321985', 'contacted', '500', '', '2025-10-29 16:57:44.505393+00', '2025-10-29 17:54:32.552+00'), 
('QT-1761761332461', 'Move In/Out', '1', '1', ARRAY[]::TEXT[], 'Nthabiseng ', 'Sodladla', 'nthaby.sodladla@gmail.com', '0719562556', 'converted', '1360', '', '2025-10-29 18:08:52.517653+00', '2025-10-30 16:23:19.163+00'), 
('QT-1761772149443', 'Move In/Out', '2', '2', ARRAY['Inside Oven','Inside Cabinets','Inside Fridge','Interior Windows','Interior Walls','Laundry']::TEXT[], 'Aleya', 'Banwari', 'aleyaramparsadbanwari@gmail.com', '0761410594', 'contacted', '1945', NULL, '2025-10-29 21:09:09.741422+00', '2025-11-22 19:45:36.83+00'), 
('QT-1761801841646', 'Standard', '0', '1', ARRAY[]::TEXT[], 'Danielle', 'Campbell', 'danielle.campbell@mediclinic.co.za', '0760590878', 'contacted', '280', '', '2025-10-30 05:24:02.132155+00', '2025-10-30 17:12:44.664+00'), 
('QT-1761809226037', 'Deep', '2', '1', ARRAY['Inside Oven','Inside Cabinets','Interior Windows','Interior Walls']::TEXT[], 'Emlyn', 'Foord', 'emlyn.foord@gmail.com', '0610593854', 'contacted', '1945', '', '2025-10-30 07:27:06.125682+00', '2025-10-30 17:12:27.837+00'), 
('QT-1761904238342', 'Standard', '2', '2', ARRAY['Inside Oven','Interior Windows']::TEXT[], 'Basheerah', 'Behardien', 'behardienbasheerah@gmail.com', '0737227876', 'converted', '420', NULL, '2025-10-31 09:50:38.670711+00', '2025-11-22 19:47:37.246+00'), 
('QT-1761995597659', 'Move In/Out', '3', '2', ARRAY['Interior Windows','Inside Oven','Inside Cabinets']::TEXT[], 'Hayden', 'Callaghan', 'hockhrc@gmail.com', '27812712764', 'contacted', '2000', NULL, '2025-11-01 11:13:17.988665+00', '2025-11-22 19:45:59.629+00'), 
('QT-1762008710541', 'Standard', '2', '1', ARRAY[]::TEXT[], 'Juan', 'Swanepoel', 'juan_swanepoel@hotmail.com', '+27848435335', 'pending', '320', NULL, '2025-11-01 14:51:51.279192+00', '2025-11-01 14:51:51.279192+00'), 
('QT-1762024635526', 'Deep', '3', '3', ARRAY['Inside Fridge','Inside Oven','Inside Cabinets','Interior Windows','Interior Walls']::TEXT[], 'Maxine ', 'Du Preez', 'maxinedupreez@gmail.com', '0842500773', 'pending', '2655', NULL, '2025-11-01 19:17:15.995783+00', '2025-11-01 19:17:15.995783+00'), 
('QT-1762076696246', 'Deep', '2', '2', ARRAY[]::TEXT[], 'Therése', 'Conradie van der Westhuizen', 'thereseconr@gmail.com', '0825489185', 'pending', '2060', NULL, '2025-11-02 09:44:56.279286+00', '2025-11-02 09:44:56.279286+00'), 
('QT-1762086460588', 'Deep', '1', '1', ARRAY['Inside Fridge','Interior Windows','Inside Oven','Inside Cabinets','Interior Walls','Laundry']::TEXT[], 'Ouma Beauty', 'Makofane', 'makofanebeauty27@gmail.com', '0834500634', 'pending', '1835', NULL, '2025-11-02 12:27:40.669001+00', '2025-11-02 12:27:40.669001+00'), 
('QT-1762098545881', 'Deep', '0', '1', ARRAY[]::TEXT[], 'Nomthandazo', 'Stefaans', 'thandithandi822@gmail.com', '+27766941455', 'pending', '1450', NULL, '2025-11-02 15:49:06.243827+00', '2025-11-02 15:49:06.243827+00'), 
('QT-1762152340040', 'Move In/Out', '2', '2', ARRAY['Interior Walls','Interior Windows','Inside Cabinets']::TEXT[], 'Annemi', 'Grewar', 'annemigrewar@gmail.com', '0767146027', 'pending', '1845', NULL, '2025-11-03 06:45:40.330085+00', '2025-11-03 06:45:40.330085+00'), 
('QT-1762155856098', 'Standard', '3', '2', ARRAY['Laundry']::TEXT[], 'Ibrahiem', 'Lewis', 'Ibrahiemlewis@gmail.com', '0724071077', 'pending', '410', NULL, '2025-11-03 07:44:16.396191+00', '2025-11-03 07:44:16.396191+00'), 
('QT-1762163082346', 'Move In/Out', '3', '2', ARRAY['Inside Oven','Inside Cabinets']::TEXT[], 'Georgia', 'Keogh', 'georgiakeogh123@icloud.com', '0726439916', 'pending', '1960', NULL, '2025-11-03 09:44:42.58034+00', '2025-11-03 09:44:42.58034+00'), 
('QT-1762166824498', 'Deep', '0', '2', ARRAY[]::TEXT[], 'Nic', 'Geraghty ', 'nicgeraghty@hotmail.com.', '06826335', 'pending', '1700', NULL, '2025-11-03 10:47:05.244623+00', '2025-11-03 10:47:05.244623+00'), 
('QT-1762167144677', 'Move In/Out', '1', '1', ARRAY['Interior Walls','Interior Windows','Inside Cabinets','Inside Oven','Inside Fridge']::TEXT[], 'Isabella-Rose ', 'Hardiman ', 'isabelroseman@outlook.com', '0836844588', 'pending', '1525', NULL, '2025-11-03 10:52:24.876177+00', '2025-11-03 10:52:24.876177+00'), 
('QT-1762171755753', 'Deep', '2', '2', ARRAY['Inside Fridge','Inside Oven','Inside Cabinets','Interior Walls','Interior Windows']::TEXT[], 'Angus', 'Paul', 'angusbpaul@gmail.com', '0761322864', 'pending', '2225', NULL, '2025-11-03 12:09:15.790836+00', '2025-11-03 12:09:15.790836+00'), 
('QT-1762186884527', 'Deep', '2', '1', ARRAY['Interior Windows','Interior Walls','Laundry']::TEXT[], 'Farai', 'Chitekedza', 'chitekedzaf@gmail.com', '+27825915525', 'pending', '1925', NULL, '2025-11-03 16:21:24.806596+00', '2025-11-03 16:21:24.806596+00'), 
('QT-1762187739680', 'Standard', '0', '1', ARRAY['Inside Cabinets']::TEXT[], 'Farai', 'Chitekedza', 'farai@shalean.com', '+27825915525', 'pending', '310', NULL, '2025-11-03 16:35:39.909783+00', '2025-11-03 16:35:39.909783+00'), 
('QT-1762188284356', 'Deep', '0', '1', ARRAY[]::TEXT[], 'Farai', 'Chitekedza', 'farai@shalean.com', '+27825915525', 'pending', '1450', NULL, '2025-11-03 16:44:44.590794+00', '2025-11-03 16:44:44.590794+00'), 
('QT-1762192153773', 'Deep', '2', '2', ARRAY['Inside Oven','Inside Cabinets','Interior Windows','Interior Walls']::TEXT[], 'Juliet', 'Roux', 'julietwalsh@gmail.com', '0730069576', 'pending', '2195', NULL, '2025-11-03 17:49:13.99306+00', '2025-11-03 17:49:13.99306+00'), 
('QT-1762234167620', 'Deep', '2', '1', ARRAY['Inside Oven','Interior Windows','Ironing','Inside Cabinets','Interior Walls','Inside Fridge']::TEXT[], 'Thandi', 'Kgosana', 'tkhosa2@gmail.com', '+27798868235', 'pending', '2010', NULL, '2025-11-04 05:29:28.077615+00', '2025-11-04 05:29:28.077615+00'), 
('QT-1762237430643', 'Deep', '6', '5', ARRAY['Inside Fridge','Inside Oven','Inside Cabinets','Interior Windows']::TEXT[], 'Jan', 'Schoepflin', 'Jan@theschoepflins.com', '+27715793190', 'pending', '3660', NULL, '2025-11-04 06:23:52.490191+00', '2025-11-04 06:23:52.490191+00'), 
('QT-1762283685768', 'Deep', '3', '3', ARRAY[]::TEXT[], 'Lauryn', 'Benny', 'lauryn.benny7@gmail.com', '0845085412', 'pending', '2490', NULL, '2025-11-04 19:14:45.844186+00', '2025-11-04 19:14:45.844186+00'), 
('QT-1762284862694', 'Standard', '0', '1', ARRAY[]::TEXT[], 'Roselyn Vanessa', 'Porthen ', 'porthenroselyn088@gmail.com', '0740567427', 'pending', '280', NULL, '2025-11-04 19:34:22.943066+00', '2025-11-04 19:34:22.943066+00'), 
('QT-1762325793445', 'Deep', '2', '2', ARRAY['Inside Fridge','Inside Oven','Inside Cabinets']::TEXT[], 'Zanele', 'Kubheka', 'zkubheka95@gmail.com', '0606163063', 'pending', '2150', NULL, '2025-11-05 06:56:33.575717+00', '2025-11-05 06:56:33.575717+00'), 
('QT-1762334245396', 'Standard', '3', '2', ARRAY['Inside Fridge','Interior Windows']::TEXT[], 'Kaley', 'Klaassen', 'kalyshaklaassen@gmail.vom', '0711104780', 'pending', '440', NULL, '2025-11-05 09:17:25.874324+00', '2025-11-05 09:17:25.874324+00'), 
('QT-1762342761189', 'Standard', '1', '1', ARRAY[]::TEXT[], 'Anne ', 'De Bruyn ', 'annedebruyn.turku@gmail.com', '+27720580967', 'pending', '300', NULL, '2025-11-05 11:39:21.616296+00', '2025-11-05 11:39:21.616296+00'), 
('QT-1762364235882', 'Deep', '4', '4', ARRAY['Inside Oven','Interior Windows','Inside Cabinets']::TEXT[], 'Kurt', 'Rakowski', 'ek_rakowski@gmx.net', '+27718668762', 'pending', '3020', NULL, '2025-11-05 17:37:15.926931+00', '2025-11-05 17:37:15.926931+00'), 
('QT-1762408119963', 'Deep', '0', '1', ARRAY[]::TEXT[], 'Siraaj', 'Adonis', 'siraaj.adonis@gmail.com', '+27723437379', 'pending', '1450', NULL, '2025-11-06 05:48:40.721531+00', '2025-11-06 05:48:40.721531+00'), 
('QT-1762438825127', 'Standard', '2', '1', ARRAY['Inside Fridge','Inside Oven','Inside Cabinets','Interior Windows','Interior Walls','Ironing','Laundry']::TEXT[], 'Mandi', 'Heroldt ', 'mandi.heroldt23@gmail.com', '0792739000', 'pending', '560', NULL, '2025-11-06 14:20:25.582131+00', '2025-11-06 14:20:25.582131+00'), 
('QT-1762446793461', 'Move In/Out', '6', '1', ARRAY['Interior Walls']::TEXT[], 'Ntokozo ', 'Mavityo ', 'mavityontokozo@gmail.com', '0649450736', 'pending', '2195', NULL, '2025-11-06 16:33:13.605872+00', '2025-11-06 16:33:13.605872+00'), 
('QT-1762449349657', 'Standard', '3', '2', ARRAY[]::TEXT[], 'Charmaine ', 'Weiner', 'charmaine.weiner@gmail.com', '0832935919', 'pending', '370', NULL, '2025-11-06 17:15:49.717732+00', '2025-11-06 17:15:49.717732+00'), 
('QT-1762459436896', 'Deep', '4', '1', ARRAY['Inside Cabinets','Interior Walls','Interior Windows']::TEXT[], 'Irene', 'Ferendinos ', 'irene.ferendinos@gmail.com', '+27608015111', 'pending', '2275', NULL, '2025-11-06 20:03:57.123684+00', '2025-11-06 20:03:57.123684+00'), 
('QT-1762498681525', 'Move In/Out', '3', '2', ARRAY['Inside Fridge','Inside Oven','Inside Cabinets','Interior Windows']::TEXT[], 'Berenice ', 'Smit ', 'berenicesmith95@gmail.com', '0751358441', 'pending', '2030', NULL, '2025-11-07 06:58:01.921964+00', '2025-11-07 06:58:01.921964+00'), 
('QT-1762499248429', 'Standard', '1', '1', ARRAY[]::TEXT[], 'Elsa', 'Mahne', 'elsamahne@gmail.com', '0832768311', 'pending', '300', NULL, '2025-11-07 07:07:28.709668+00', '2025-11-07 07:07:28.709668+00'), 
('QT-1762533812292', 'Move In/Out', '3', '2', ARRAY['Inside Oven','Inside Cabinets','Interior Windows','Interior Walls']::TEXT[], 'Demira', 'Harry', 'demira.s.harry@gmail.com', '071 641 4129', 'pending', '2035', NULL, '2025-11-07 16:43:32.352424+00', '2025-11-07 16:43:32.352424+00'), 
('QT-1762589740085', 'Standard', '3', '2', ARRAY[]::TEXT[], 'Christelle', 'Van Zyl', 'christellevanzyl72@gmail.com', '0827893812', 'pending', '370', NULL, '2025-11-08 08:15:40.862037+00', '2025-11-08 08:15:40.862037+00'), 
('QT-1762590910157', 'Deep', '3', '2', ARRAY['Laundry']::TEXT[], 'Christelle', 'Van Zyl', 'starfair223@outlook com', '0827893812', 'pending', '2280', NULL, '2025-11-08 08:35:10.658038+00', '2025-11-08 08:35:10.658038+00'), 
('QT-1762621543219', 'Move In/Out', '3', '2', ARRAY['Interior Windows']::TEXT[], 'Shamila ', 'Jamali ', 'shamilajamali@gmail.com', '0752685621', 'pending', '1940', NULL, '2025-11-08 17:05:43.50363+00', '2025-11-08 17:05:43.50363+00'), 
('QT-1762760622091', 'Deep', '3', '2', ARRAY['Inside Fridge','Inside Oven','Inside Cabinets','Interior Windows','Interior Walls']::TEXT[], 'Sheena', 'Gleeson', 'sheenagleeson@yahoo.com', '+27745757370', 'pending', '2405', NULL, '2025-11-10 07:43:42.735051+00', '2025-11-10 07:43:42.735051+00'), 
('QT-1762778625449', 'Standard', '3', '2', ARRAY['Inside Oven','Inside Fridge']::TEXT[], 'Amanda ', 'Booyens ', 'amandabooyens01@gmail.com', '+27665741216', 'pending', '430', NULL, '2025-11-10 12:43:46.124979+00', '2025-11-10 12:43:46.124979+00'), 
('QT-1762786091664', 'Move In/Out', '2', '1', ARRAY[]::TEXT[], 'Hannah', 'Counihan', 'hannahcounihan26@gmail.com', '0722065081', 'pending', '1520', NULL, '2025-11-10 14:48:12.590289+00', '2025-11-10 14:48:12.590289+00'), 
('QT-1762843116187', 'Deep', '2', '1', ARRAY['Inside Fridge','Inside Oven','Inside Cabinets','Interior Windows','Interior Walls']::TEXT[], 'Wiesaal', 'Kriel', 'wiesaalk@gmail.com', '0662006300', 'pending', '1975', NULL, '2025-11-11 06:38:36.346582+00', '2025-11-11 06:38:36.346582+00'), 
('QT-1762849841418', 'Move In/Out', '1', '1', ARRAY['Inside Oven','Inside Cabinets']::TEXT[], 'Jessica', 'de Bod', 'jessicadebod@gmail.com', '0796872469', 'pending', '1420', NULL, '2025-11-11 08:30:41.694462+00', '2025-11-11 08:30:41.694462+00'), 
('QT-1763307479314', 'Deep', '3', '1', ARRAY['Inside Fridge','Inside Oven']::TEXT[], 'Kristen', 'Birch-Jeacocks', 'kristenbirch10@gmail.com', '0799006259', 'pending', '2100', NULL, '2025-11-16 15:37:59.424709+00', '2025-11-16 15:37:59.424709+00'), 
('QT-1763970780041', 'Standard', '5', '5', ARRAY['Inside Oven','Inside Fridge']::TEXT[], 'Gus', 'Klohn', 'gus.klohn@gmail.com', '0834451274', 'pending', '610', NULL, '2025-11-24 07:53:00.154457+00', '2025-11-24 07:53:00.154457+00'), 
('QT-1764018465795', 'Deep', '2', '1', ARRAY['Inside Oven','Interior Windows','Interior Walls']::TEXT[], 'Rose', 'Dallas', 'rosemarydallas@gmail.com', '+27828529586', 'pending', '1965', NULL, '2025-11-24 21:07:45.916453+00', '2025-11-24 21:07:45.916453+00'), 
('QT-1764138764990', 'Move In/Out', '4', '3', ARRAY['Inside Oven','Inside Cabinets','Interior Windows','Interior Walls']::TEXT[], 'Debbie', 'Brooks', 'debbiebrooks1@gmail.com', '0827164142', 'pending', '2465', NULL, '2025-11-26 06:32:45.108623+00', '2025-11-26 06:32:45.108623+00'), 
('QT-1764143863544', 'Deep', '2', '2', ARRAY['Interior Windows']::TEXT[], 'Liezel', 'Castleman', 'castlemanliezel@gmail.com', '+27824587232', 'pending', '2150', NULL, '2025-11-26 07:57:43.832705+00', '2025-11-26 07:57:43.832705+00'), 
('QT-1764484587062', 'Deep', '2', '2', ARRAY['Inside Fridge','Inside Oven']::TEXT[], 'Kristen', 'Birch-Jeacocks', 'kristenbirch10@gmail.com', '0799006259', 'pending', '2170', NULL, '2025-11-30 06:36:27.627783+00', '2025-11-30 06:36:27.627783+00'), 
('QT-1764518260153', 'Standard', '2', '1', ARRAY['Inside Oven']::TEXT[], 'Demi', 'Stoffberg', 'dstoffberg23@gmail.com', '+27721563834', 'pending', '400', NULL, '2025-11-30 15:57:40.227115+00', '2025-11-30 15:57:40.227115+00'), 
('QT-1764747518359', 'Deep', '1', '1', ARRAY['Inside Oven','Inside Cabinets','Interior Windows','Interior Walls']::TEXT[], 'MELANIE', 'YASFI', 'melanie.yasfi@gmail.com', '+27607323663', 'pending', '1815', NULL, '2025-12-03 07:38:38.483669+00', '2025-12-03 07:38:38.483669+00'), 
('QT-1765035504193', 'Deep', '3', '1', ARRAY['Inside Fridge','Inside Oven','Inside Cabinets','Interior Windows','Ironing']::TEXT[], 'Caren', 'Aggenbacht', 'carenaggenbacht@gmail.com', '0832285002', 'pending', '217000', NULL, '2025-12-06 15:38:24.371683+00', '2025-12-06 15:38:24.371683+00'), 
('QT-1765197226123', 'Move In/Out', '3', '2', ARRAY['Inside Oven','Inside Cabinets','Interior Windows','Interior Walls']::TEXT[], 'Nolean', 'Ramcharan', 'noleanchetty@yahoo.com', '+27843143767', 'pending', '208500', NULL, '2025-12-08 12:33:46.753077+00', '2025-12-08 12:33:46.753077+00'), 
('QT-1765198214635', 'Airbnb', '1', '1', ARRAY['Inside Fridge','Inside Oven']::TEXT[], 'Hope', 'Hlungwani ', 'hopenonhlanhla308@gmail.com', '829249623', 'pending', '38400', NULL, '2025-12-08 12:50:14.790976+00', '2025-12-08 12:50:14.790976+00'), 
('QT-1765285752316', 'Standard', '3', '2', ARRAY['Inside Fridge','Interior Windows','Laundry']::TEXT[], 'Rabia', 'Samsoodeen', 'rabia.sams786@gmail.com', '0637213261', 'pending', '49000', NULL, '2025-12-09 13:09:12.597985+00', '2025-12-09 13:09:12.597985+00'), 
('QT-1765285817832', 'Deep', '3', '2', ARRAY['Inside Cabinets','Interior Walls','Interior Windows','Inside Fridge']::TEXT[], 'RABIA', 'SAMSOODEEN', 'rabia.sams786@gmail.com', '+27637213261', 'pending', '242500', NULL, '2025-12-09 13:10:18.132399+00', '2025-12-09 13:10:18.132399+00'), 
('QT-1765292549367', 'Standard', '4', '3', ARRAY['Interior Windows']::TEXT[], 'Marietjie', 'Lourens', 'mlourens65@gmail.com', '+27813111896', 'pending', '51000', NULL, '2025-12-09 15:02:29.886445+00', '2025-12-09 15:02:29.886445+00'), 
('QT-1765298091334', 'Deep', '0', '1', ARRAY[]::TEXT[], 'Evelyn', 'Kuchitale', 'Evelyn.kuchitale@example.com', '+27815753828', 'pending', '150000', NULL, '2025-12-09 16:34:51.639464+00', '2025-12-09 16:34:51.639464+00'), 
('QT-1765436023788', 'Deep', '2', '2', ARRAY['Inside Fridge','Inside Oven','Inside Cabinets','Interior Windows']::TEXT[], 'Reece', 'Jefthas', 'reece.jefthas@gmail.com', '078 889 2566', 'pending', '224000', NULL, '2025-12-11 06:53:43.876994+00', '2025-12-11 06:53:43.876994+00'), 
('QT-1765464868730', 'Deep', '2', '1', ARRAY['Inside Cabinets','Interior Windows','Interior Walls']::TEXT[], 'Allerick', 'Arendse', 'aarendse@mhg.co.za', '+27837875653', 'pending', '196500', NULL, '2025-12-11 14:54:29.441684+00', '2025-12-11 14:54:29.441684+00'), 
('QT-1765535832260', 'Deep', '6', '3', ARRAY['Interior Windows','Inside Cabinets','Interior Walls']::TEXT[], 'Debbie', 'Van Der Westhuizen', 'debbie.vdw15@gmail.com', '+27749652478', 'pending', '318500', NULL, '2025-12-12 10:37:12.670778+00', '2025-12-12 10:37:12.670778+00'), 
('QT-1765603236191', 'Standard', '4', '3', ARRAY['Inside Cabinets','Interior Windows','Interior Walls']::TEXT[], 'Farai', 'Chitekedza', 'chitekedzaf@gmail.com', '888888', 'pending', '57500', NULL, '2025-12-13 05:20:36.27275+00', '2025-12-13 05:20:36.27275+00'), 
('QT-1765965931863', 'Move In/Out', '3', '3', ARRAY['Inside Cabinets']::TEXT[], 'BREANN', 'JACOBS', 'breann@playonart.co.za', '+27825759981', 'pending', '220000', NULL, '2025-12-17 10:05:32.065572+00', '2025-12-17 10:05:32.065572+00'), 
('QT-1766146041603', 'Deep', '3', '2', ARRAY['Interior Windows','Interior Walls','Inside Cabinets']::TEXT[], 'Daniela', 'Du Plessis', 'daniela.duplessis@tysonprop.co.za', '0795271863', 'pending', '239500', NULL, '2025-12-19 12:07:22.275497+00', '2025-12-19 12:07:22.275497+00'), 
('QT-1766222379374', 'Deep', '1', '1', ARRAY['Interior Windows']::TEXT[], 'Alan', 'Pearson', 'info@be-secure.co.za', '+27825764542', 'pending', '172000', NULL, '2025-12-20 09:19:39.511121+00', '2025-12-20 09:19:39.511121+00'), 
('QT-1766293914984', 'Standard', '0', '1', ARRAY[]::TEXT[], 'Ackim', 'Chikwangwani', 'ackimchikwangwani57@gmail.com', '+27682755849', 'pending', '33000', NULL, '2025-12-21 05:11:55.031664+00', '2025-12-21 05:11:55.031664+00')
ON CONFLICT (id) DO NOTHING;

-- Note: The helper function jsonb_array_to_text_array() is kept for potential future use.
-- If you want to remove it, you can run: DROP FUNCTION IF EXISTS jsonb_array_to_text_array(JSONB);

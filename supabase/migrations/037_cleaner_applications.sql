-- Migration: Cleaner Applications System
-- Created: 2025-01-XX
-- Description: Create table for cleaner job applications

-- ============================================================================
-- 1. CREATE CLEANER_APPLICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaner_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Applicant Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Application Details
  experience_years INTEGER DEFAULT 0,
  previous_experience TEXT,
  availability TEXT,
  preferred_areas TEXT[], -- Array of preferred service areas
  languages TEXT[], -- Array of languages spoken
  references_info TEXT, -- References contact information
  additional_info TEXT, -- Any additional information from applicant
  
  -- Application Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected', 'hired')),
  admin_notes TEXT, -- Internal notes from admin
  
  -- Review Information
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_cleaner_applications_status ON cleaner_applications(status);
CREATE INDEX IF NOT EXISTS idx_cleaner_applications_email ON cleaner_applications(email);
CREATE INDEX IF NOT EXISTS idx_cleaner_applications_created_at ON cleaner_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cleaner_applications_reviewed_by ON cleaner_applications(reviewed_by);

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE cleaner_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users (admins) can view all applications
DROP POLICY IF EXISTS "Admins can view all applications" ON cleaner_applications;
CREATE POLICY "Admins can view all applications" ON cleaner_applications
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Anyone can create applications (public form)
DROP POLICY IF EXISTS "Anyone can create applications" ON cleaner_applications;
CREATE POLICY "Anyone can create applications" ON cleaner_applications
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can update applications
DROP POLICY IF EXISTS "Admins can update applications" ON cleaner_applications;
CREATE POLICY "Admins can update applications" ON cleaner_applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 4. CREATE UPDATE TRIGGER FOR updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_cleaner_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cleaner_applications_updated_at ON cleaner_applications;
CREATE TRIGGER trigger_update_cleaner_applications_updated_at
  BEFORE UPDATE ON cleaner_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_cleaner_applications_updated_at();

-- ============================================================================
-- 5. CREATE APPLICATIONS TABLE (Legacy/Alternative Structure)
-- ============================================================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  position TEXT,
  cover_letter TEXT,
  work_experience TEXT,
  certifications TEXT,
  availability TEXT,
  reference_contacts TEXT,
  resume_url TEXT,
  transportation_details TEXT,
  languages_spoken TEXT,
  criminal_background_consent TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for applications table
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Enable RLS for applications table
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users (admins) can view all applications
DROP POLICY IF EXISTS "Admins can view all applications" ON applications;
CREATE POLICY "Admins can view all applications" ON applications
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Anyone can create applications (public form)
DROP POLICY IF EXISTS "Anyone can create applications" ON applications;
CREATE POLICY "Anyone can create applications" ON applications
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can update applications
DROP POLICY IF EXISTS "Admins can update applications" ON applications;
CREATE POLICY "Admins can update applications" ON applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create update trigger for applications table
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_applications_updated_at ON applications;
CREATE TRIGGER trigger_update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_applications_updated_at();

-- ============================================================================
-- 6. INSERT APPLICATION DATA
-- ============================================================================
INSERT INTO "public"."applications" ("id", "first_name", "last_name", "email", "phone", "position", "cover_letter", "work_experience", "certifications", "availability", "reference_contacts", "resume_url", "transportation_details", "languages_spoken", "criminal_background_consent", "status", "created_at", "updated_at") VALUES ('00db4248-5d29-400d-98af-ec4a8f58eded', 'Tabeth', 'Nyanzira ', 'tabethnyanzira@gmail.com', '0622120203', 'Residential Cleaner', 'Because i was working only 3days ', 'I was working as a domestic worker ', 'I don''t have certificate ', 'weekdays', 'Nicole 
', null, 'public-transport', 'English', 'true', 'pending', '2025-10-25 11:18:10.920258+00', '2025-10-25 11:18:10.920258+00'), ('1314371f-b9a6-44c3-a3c7-8cbbee29d9bc', 'yonela', 'mase', 'makhaya370@gmail.com', '075 460 6456 ', 'Residential Cleaner', 'want to join the shalean team becose I''m hard working person and if you can give me chance I can show that and I''m desperate for job I''m Mather of 4 want to take care of my children and I have clening experience from sweepsouth and marvelous.......', 'clening from sweepsouth 3years and marvelous clening for 2years', 'homemanagement', 'weekends', 'Mrs Jessica my supervisor from sweepsouth 083 789 8519 and maverlous Mrs Jana 069 965 9413 ', null, 'public-transport', 'Xhosa', 'true', 'pending', '2025-10-24 05:02:00.846331+00', '2025-10-24 05:02:00.846331+00'), ('172201d9-0f46-4a8a-b5fe-8550fa7d44ab', 'Natasha', 'James ', 'natashabettinajames@gmail.com', '0787532977', 'Residential Cleaner', 'I need money for to support my family ', 'Cleaner at clean rite ', 'House keeping ', 'weekdays', 'Nicole James 069 406 9060 sister 
Clemence Riva 0750005038 husband
tinasheclementriva@Gmail.com', null, 'public-transport', 'English', 'true', 'pending', '2025-10-23 08:05:29.299342+00', '2025-10-23 08:05:29.299342+00'), ('1760e3f2-094f-46d1-afb4-d99cf207b199', 'Jelina ', 'Kanyika ', 'jelinakameck@gmail.com', '081-427-9643', 'Other', 'I join that because I''m looking for a job ', '3 years', 'Training', 'weekdays', null, null, 'public-transport', 'English', 'true', 'pending', '2025-10-23 06:11:52.616246+00', '2025-10-23 06:11:52.616246+00'), ('1c6f04ff-1b1a-482f-aea0-69136a6c09d3', 'SIPHOSETHU', 'VENGANE', 'venganesiphosethu@gmail.com', '0786821615', 'Other', 'As a motivated individual with a passion for creating spotless environments, I''m excited about the opportunity to join the Shalean cleaning team. With a keen eye for detail and a strong work ethic, I''m confident in my ability to deliver high-quality results and contribute to a positive team dynamic. I''m drawn to roles that require attention to detail and a commitment to excellence, and I''m excited about the prospect of being part of a team that values hard work and dedication. I''m looking forward to bringing my enthusiasm and strong work ethic to the Shalean team and helping to create a clean and welcoming environment for everyone. 
', 'With experience in a cleaning or hospitality role, I''ve developed a strong attention to detail and a commitment to delivering high-quality results. In my previous position, I worked for a short-term period, where I was responsible for maintaining cleanliness and organization, ensuring a positive experience for clients or customers. Although it was a brief stint, I gained valuable skills and insights that would enable me to make a positive contribution to a cleaning team like Shalean. I''m eager to apply my skills and experience in a new role and contribute to a team that values hard work and dedication.', null, 'weekdays', 'SIPHOSETHU ISHMAEL VENGANE
0786821615
venganesiphosethu@gmail.com
single 
', null, 'need-assistance', 'English, Zulu, Xhosa, Other: Setswana, Sesotho.', 'true', 'pending', '2025-10-22 23:39:43.691252+00', '2025-10-22 23:39:43.691252+00'), ('2ab1f97c-cf19-40fa-8ed6-cf94cf8753b5', 'Nomthandazo', 'Stefaans', 'thandithandi822@gmail.com', '+27766941455', 'Airbnb Cleaner', 'I want to be more good in this industry ', 'I was working at school as a cleaner for two years l good in cleanig', null, 'fullTime', null, null, 'public-transport', 'English, Xhosa', 'true', 'pending', '2025-11-02 15:55:18.641604+00', '2025-11-02 15:55:18.641604+00'), ('2eba3354-7ed9-422b-aabe-b3bdc8d3564b', 'Mariam', 'Yunusu', 'mariamyunusu@gmail.com', '+27 81 455 9084', 'Deep Cleaning Specialist', 'I am very hard working,conscientious,honest and trustworthy and understand my performance as a cleaner needs to be consistently high un order for your business to succeed', 'I have performed a wide range of cleaning tasks,including dusting,vacuming,mopping  and sanitizing surfaces.
My experience includes deep cleaning kitchens abd bathrooms. ', null, 'fullTime', 'Sir Alick 0617947759 alickmwamadi@gmail.com
Sir Robert 0820705821
Robert@gmail.com', null, 'public-transport', 'English', 'true', 'pending', '2025-10-26 19:52:43.98423+00', '2025-10-26 19:52:43.98423+00'), ('30f93224-936d-48a3-b979-159b279bd220', 'Shamiso', 'MOHAMMED', 'xamiegambiza0@gmail.com', '+27787152449', 'Residential Cleaner', 'Hard you are a goood people', '

Person Attributes 
Am a hardworking woman 
Am able to do any work properly under minimum supervision 

I am loyal ,displine and a very dedicated person 
I can cook ,wash ,iron and take good care of the kids play with them prepared their food  etc
I always work hard to finish all I have started,  I''m also very attentive ', 'I lost it', 'fullTime', 'My sister mophen chitonga
0737165584', null, 'public-transport', 'English', 'true', 'pending', '2025-10-27 03:36:05.109004+00', '2025-10-27 03:36:05.109004+00'), ('38055c8e-8aa5-4268-a576-469c642f00fc', 'Fadzie ', 'Hize', 'hizefadzie@gmail.com', '0611829583', 'Commercial Cleaner', 'Understand the mission and environment ', 'Housekeeping ', 'Cleaner', 'weekdays', '073991136 fowzia.      064405759.  Shafeeka', null, 'public-transport', 'English', 'true', 'pending', '2025-10-23 05:07:53.060979+00', '2025-10-23 05:07:53.060979+00'), ('461a3123-ce16-4c2d-b7fb-92b024ec77d1', 'Chikondi ', 'Chiona', 'chikondichiona31@gmail.com', '071248816', 'Other', 'The are good n help people for their need s', 'It''s very nice ', 'Caregiver n nanny ', 'weekdays', 'Jenny zwaan....08844276636 as a caregiver reference..

Victoria..0659458049....as a Nanny reference.', null, 'public-transport', 'English', 'true', 'pending', '2025-10-24 07:25:09.148543+00', '2025-10-24 07:25:09.148543+00'), ('4befc09f-b812-408f-89cc-e0a95d93da17', 'Blessed ', 'Bepe ', 'bepeblessed@gmail.com', '0793743045', 'Commercial Cleaner', '

''I want this job because I have clear skills that will help me achieve...'' 


''This role will give me the opportunity to combine both my skills 
  
', 'I love (job role specific task) and my last job took me away from that .So now, I''m looking to find a role that will let me get back to working on projects I really enjoy and after looking at the job spec I think this role would be perfect with that.', null, 'weekdays', 'Mr Fortune Mbezi 0699191731 

Mr Gogwe Pana 0604649921', null, 'public-transport', 'English, Other', 'true', 'pending', '2025-10-23 17:45:25.578652+00', '2025-10-23 17:45:25.578652+00'), ('5127a0f3-7706-4ae8-82ae-f2ea13afddb7', 'Martha ', 'Pahlela ', 'itaipahlela@gmail.com', '0749443234', 'Commercial Cleaner', 'I heard about you .you pay better money', 'I have 5 years experience ', 'No', 'fullTime', 'Guy - 0836447516
 Clair - 0836805677', null, 'need-assistance', 'English, Other', 'true', 'pending', '2025-10-29 11:13:54.771508+00', '2025-10-29 11:13:54.771508+00'), ('5a69d604-9d65-4c37-ab12-7751f0e09efe', 'Heather ', 'Muroyi ', 'heathermoyo5@gmail.com', '+27 65 800 9631', 'Airbnb Cleaner', 'i find satisfaction  in transforming  a dirty or messy place into a clean and fresh smelling space,however  i desire to help maintain a clean place making it comfortable for others,im punctual  and dependable but also  have the ability  to teamwork', 'Have been working as a cleaner at pronto since 2020 till 2025', 'None', 'weekdays, fullTime', 'Grace Mhangami
gracemhangami03@gmail.com
+27 78 509 4025
Mother
Pronto Kleen Supervisor (parow)
Mr Isaacs
0816615749
 tisaacspk@gmail.com


', null, 'public-transport', 'English, Xhosa', 'true', 'pending', '2025-10-22 14:31:14.424839+00', '2025-10-22 14:31:14.424839+00'), ('61689ab5-254e-43e6-b406-eb8c5b9f9044', 'Chrissy', 'Roman', 'jagadrey@gmail.com', '+27752175328', 'Residential Cleaner', 'My name is chrissy Roman Malawian lady.. I want to join cleaning services couse i have experience in cleaning residentials.. ', 'I have 2 years experience in cleaning residentials ', 'MSCE level ', 'weekdays, weekends, fullTime, partTime', '0603685147 grey faindi

0683275114 tinos plumbing ', null, 'public-transport', 'English, Other: Chewa', 'true', 'pending', '2025-10-28 04:28:46.314194+00', '2025-10-28 04:28:46.314194+00'), ('6287454e-c8b9-4f09-83ea-d0306324f23f', 'Farai', 'Chitekedza', 'shalocleaner@gmail.com', '+27825915525', 'Residential Cleaner', 'dggdgdgdgdgdgdgdgdb', 'gsgsgsgsgsg', 'gsgdgdgdhgdhdhd', 'weekdays, weekends, fullTime', 'ddgdgdgdgdgdg', null, 'public-transport', 'English, Xhosa', 'true', 'rejected', '2025-10-21 19:47:56.246545+00', '2025-10-21 21:18:53.005788+00'), ('69294710-2b06-4895-aff7-c30721e06d57', 'Olwethu ', 'Lwethu ', 'oolwethu684@gmail.com', '0657135909', 'Residential Cleaner', 'I am a hard worker, and I know how to work as a team worker ', 'I am cleaning toilets, mall entrance,outside the building nd the parkings', 'I have training certificate for cleaning ', 'weekdays, weekends, fullTime', 'Essential office
Number :021 448 1705 ', null, 'public-transport', 'English, Xhosa', 'true', 'under_review', '2025-11-03 20:02:00.128658+00', '2025-11-22 19:15:53.727058+00'), ('77bb5daa-096f-428b-a60d-332a8cc85e3f', 'Nikita Jade', 'Van Der Ven ', 'vandervennikita@gmail.com', '0783115594', 'Residential Cleaner', 'Looking for a job. 
I love cleaning.
i was a temp for bidvest and was working in a nursing home.

I have heard good things about Shaleen cleaning services ', 'I worked for M&R in epping and was a temp for Bidvest in plumstead', null, 'weekdays, weekends, fullTime', 'Kaylynn Williams 
0659261101', null, 'public-transport', 'English, Afrikaans', 'true', 'pending', '2025-11-03 13:04:07.740691+00', '2025-11-03 13:04:07.740691+00'), ('78fc063e-56b1-4afa-b614-a487759172c5', 'Joyce', 'Chinyama ', 'chinyamajoyce593@gmail.com', '+27749075285', 'Other', 'I''m passionate about my work, honest, hardworking. I''m looking forward to work with you guys and also to learn more', 'It was amazing and I love everything.it was 2bedroom house with 2bathrooms and there was a 12years daughter.I work there for 5 months then those people move to Canada since then I''m looking for a job ', 'None of the above ', 'weekdays', '0814081273 Alias Bolt this was my boss ', null, 'public-transport', 'English, Other: Shona ', 'true', 'pending', '2025-10-22 17:10:01.475061+00', '2025-10-22 17:10:01.475061+00'), ('79f963d4-6050-4c56-9cb2-3dbde3ee0b6a', 'Chrisy ', 'Roman', 'jagadrey@gmail.com', '0603685147', 'Residential Cleaner', 'I am a every good cleaner and hard working lady..', 'I have 3years of working experience and i know how to use cleaning tools like vacuum and more', 'Msce level', 'weekdays, weekends, fullTime, partTime', '06832275114 Grey faindi', null, 'public-transport', 'English, Other: Chewa', 'true', 'pending', '2025-10-26 08:55:55.164186+00', '2025-10-26 08:55:55.164186+00'), ('80406d1a-f92a-4ec9-9ce4-23422f5f3142', 'Heather ', 'Muroyi ', 'heathermoyo5@gmail.com', '+27 65 800 9631', 'Commercial Cleaner', 'i find satisfaction  in transforming  a dirty or messy place into a clean and fresh smelling space,however  i desire to help maintain a clean place making it comfortable for others,im punctual  and dependable but also  have the ability  to teamwork', 'Pronto kleen from 2020 to 2025', 'None', 'weekdays, fullTime', 'Grace Mhangami
gracemhangami3@gmail.com
+27 78 509 4025
Mother
Pronto kleen Supervisor (parow)
Mr Isaacs 
0816615749
tisaacspk@gmail.com
Moesha 
Friend
0693444019
moeshakimberly04@gmail.com ', null, 'public-transport', 'English, Xhosa', 'true', 'pending', '2025-10-22 14:36:14.481882+00', '2025-10-22 14:36:14.481882+00'), ('8206f8c6-3a61-48e6-a3f8-1273710b54b2', 'Fadzie ', 'Hize', 'hizefadzie@gmail.com', '0611829583', 'Commercial Cleaner', 'Understand their mission values and work environment ', 'Housekeeping ', 'Housekeeping ', 'weekdays', '0738991136 fowzia  shafeeka  064405759', null, 'public-transport', 'English', 'true', 'pending', '2025-10-23 08:30:37.145195+00', '2025-10-23 08:30:37.145195+00'), ('840d1c66-9d4a-4747-a59c-f6df27a837c9', 'Masibonge', 'Mbovane', 'mbovanemasibonge34@gmail.com', '+27734122409', 'Airbnb Cleaner', 'I''m flexible and dedicated ', 'No experience ', 'Matric', 'fullTime', '0734122409', null, 'need-assistance', 'Xhosa', 'true', 'pending', '2025-10-29 05:13:35.853846+00', '2025-10-29 05:13:35.853846+00'), ('8637ff5d-4822-409c-957d-a452352bc4d2', 'Gladys', 'Bhobho', 'gladys.bhobuo@gmail.com', '0793583119', 'Residential Cleaner', 'It''s good cleaning service company and I''m a hard worker', '6years', null, 'fullTime', 'Henille leach 0827738625,Tania MacMahon 0832836610', null, 'public-transport', 'English', 'true', 'pending', '2025-10-29 15:31:38.219196+00', '2025-10-29 15:31:38.219196+00'), ('9394b246-72b5-4305-928c-17e26a00134d', 'Nomatter', 'Chapinduka', 'nomatterchapinduka02@gmail.com', '2774654219', 'Residential Cleaner', 'Because l want more money and get experience ', '2years', 'Housekeeping and nanny ', 'weekdays', '0742317921 Laura
0744349676 Anelle', null, 'public-transport', 'English', 'true', 'pending', '2025-10-27 15:41:55.390164+00', '2025-10-27 15:41:55.390164+00'), ('968dd194-bb38-4097-b091-9ebd4d88089a', 'Eliza', 'Phiri', 'phirilorraine66@gmail.com', '0622390944', 'Residential Cleaner', 'I want to be part of the team and I love working so joining Shalean is really good for me ', ' 3 years ', null, 'weekdays, weekends', 'Mrs Nyakuchena ;+27 84 670 1353

Ms Riconciliation Emerald :+27 65 947 9702', null, 'public-transport', 'English', 'true', 'pending', '2025-10-24 10:10:58.399454+00', '2025-10-24 10:10:58.399454+00'), ('98ca60d0-aacc-4786-86cc-ce4711d5f65d', 'Nomatter ', 'Chapinduka ', 'nomatterchapinduka02@gmail.com', '27746542219', 'Residential Cleaner', 'Because I want to work my own money and I am a hardworking  and reliable person ', '2 years of experience in cleaning company ', 'Housekeeping and nanny ', 'weekdays, fullTime', '0742417921  Candice my 
previous boss
0744349676  Laura my previous boss ', null, 'public-transport', 'English, Other: Shona', 'true', 'pending', '2025-10-24 11:36:27.305307+00', '2025-10-24 11:36:27.305307+00'), ('9bf6c27a-1271-4584-bdd8-26e16f0c2b4f', 'Denzel', 'Mashongera', 'mashongeradenzel2@gmail.com', '+27626845472', 'Airbnb Cleaner', 'Because i want to work and take care of my family.i want to be independent', 'I worked for Mercedes Benz Garage  before as a general worker ', 'Non', 'weekdays', 'Mercedes Benz Garage ', null, 'public-transport', 'English', 'true', 'pending', '2025-10-22 14:58:59.727684+00', '2025-10-22 14:58:59.727684+00'), ('a6263cd5-81ef-45cd-acc2-d4373194b6dc', 'Nothando ', 'Ncube', 'matititi.ncube.060@gmail.com', '+27761001033', 'Residential Cleaner', 'I am hard working woman with excellent attendance and punctuality record and to gain more experience with team ', 'House cleaning &cleaning guest rooms, Hotel 
Nanny 
Restaurants 
Plastic company ', 'Child care Certificate ', 'weekdays', 'Bukelwa monqo 0780108706
Elizabeth 0721911846
Akhona ', null, 'public-transport', 'English, Xhosa, Other: Ndebele ', 'true', 'under_review', '2025-11-05 07:12:56.268821+00', '2025-11-22 19:12:54.366192+00'), ('a6c56632-4817-405d-a488-883edc0a5d61', 'Zusange', 'Gcinani ', 'zusanges5@gmail.com', '0781991337', 'Residential Cleaner', 'It''s because I need job and I''m interested to be a cleaner 
', 'I was a cleaner in ShopRite center and I''m a professional cleaner ', 'I trained in ShopRite center in Cape town ', 'weekdays, fullTime', 'Zusange Gcinani 0781991337', null, 'need-assistance', 'English, Xhosa', 'true', 'pending', '2025-10-26 00:57:28.44784+00', '2025-10-26 00:57:28.44784+00'), ('b64dc78d-7bcc-41ab-a95e-2af8f384eca8', 'Masibonge', 'Mbovane', 'mbovanemasibonge34@gmail.com', '+27734122409', 'Residential Cleaner', 'I''m flexible and dedicated to my job', 'No experience ', 'Matric', 'weekdays, fullTime', '0734122409', null, 'need-assistance', 'Xhosa', 'true', 'pending', '2025-10-29 05:15:21.589664+00', '2025-10-29 05:15:21.589664+00'), ('ba1d6292-c9db-40b8-9ba6-11595e17cd35', 'Chrissy', 'Roman', 'jagadrey@gmail.com', '+27752175328', 'Residential Cleaner', 'I know how to clean residential. ', '3 years of experience i know how to clean and how to use power tools', 'MSCE level ', 'weekdays, weekends, fullTime, partTime', '0603685147 grey faindi
Tionos plumbing 0683275114 ', null, 'public-transport', 'English, Other: Chewa', 'true', 'pending', '2025-10-27 04:42:24.170034+00', '2025-10-27 04:42:24.170034+00'), ('bd79eb51-497a-446b-8975-1fe5e2cb4c6b', 'Chrissy', 'Roman', 'jagadrey@gmail.com', '+27752175328', 'Residential Cleaner', 'Because they are the best on cleaning services ', 'I have 2 years experience of cleaning and i know how to use cleaning tools', 'MSCE level ', 'weekdays, weekends, fullTime, partTime', '0603685147 Grey faindi
Tionos plumbing  0683275114 ', null, 'public-transport', 'English, Other: Chewa', 'true', 'rejected', '2025-10-26 10:00:17.043971+00', '2025-11-22 19:15:31.347887+00'), ('be9f3c15-d3aa-489e-a22d-c42c9607b62f', 'Valerie ', 'van der Ross ', 'vanderrossvalerie@g.mail.com', '0747670849', 'Residential Cleaner', 'I want to join shalean because I need this job. I have been looking for a job and I saw this one online. I am willing to work and earn money. I have a child to provide for ', 'my first job was at a arts and craft job I was a cleaner there. and I was also packing orders for customers ', 'none', 'weekdays', 'Charmaine Mitchell
0722344534

was my manager at arts and craft workplace. 
charmainemitchell@g.mail.com

', null, 'public-transport', 'English, Afrikaans', 'true', 'accepted', '2025-10-21 23:00:17.739245+00', '2025-11-06 12:05:32.55627+00'), ('c227fed5-52bb-407d-8067-4c4c79c2eb11', 'Natasha ', 'Magashito', 'magashitonatasha8@gmail.com', '0678316466', 'Residential Cleaner', 'I''m natasha a young lady l like to clean the house ', 'I was working as a domestic worker but my former boss she moved to overseas ', null, 'weekdays, fullTime', null, null, 'public-transport', 'English', 'true', 'rejected', '2025-10-24 19:23:27.692132+00', '2025-10-24 22:09:36.679411+00'), ('d2c1d36e-9bb1-4081-8930-1b16e2f964b1', 'Clopas ', 'Dhliwayo ', 'clopasdhliwayo@gmail.com', '0626796272', 'Residential Cleaner', 'To help me', 'Five years', null, 'weekdays', ' 07254789910
0834599708', null, 'public-transport', 'English', 'true', 'pending', '2025-10-31 20:16:50.441164+00', '2025-10-31 20:16:50.441164+00'), ('d8f73c7e-36cf-46da-bb28-b1c455495ff4', 'SIPHOSETHU', 'VENGANE', 'venganesiphosethu@gmail.com', '0786821615', 'Commercial Cleaner', 'As a motivated individual with a passion for creating spotless environments, I''m excited about the opportunity to join the Shalean cleaning team. With a keen eye for detail and a strong work ethic, I''m confident in my ability to deliver high-quality results and contribute to a positive team dynamic. I''m drawn to roles that require attention to detail and a commitment to excellence, and I''m excited about the prospect of being part of a team that values hard work and dedication. I''m looking forward to bringing my enthusiasm and strong work ethic to the Shalean team and helping to create a clean and welcoming environment for everyone.', 'With experience in a cleaning or hospitality role, I''ve developed a strong attention to detail and a commitment to delivering high-quality results. In my previous position, I worked for a short-term period, where I was responsible for maintaining cleanliness and organization, ensuring a positive experience for clients or customers. Although it was a brief stint, I gained valuable skills and insights that would enable me to make a positive contribution to a cleaning team like Shalean. I''m eager to apply my skills and experience in a new role and contribute to a team that values hard work and dedication.', null, 'weekdays', 'SIPHOSETHU ISHMAEL VENGANE
0786821615
venganesiphosethu@gmail.com
single', null, 'need-assistance', 'Zulu, Xhosa, Other: Setswana, Sesotho', 'true', 'pending', '2025-10-22 23:46:48.27899+00', '2025-10-22 23:46:48.27899+00'), ('dc40d6a0-8361-4afd-952d-616097f9936d', 'Melisa ', 'Zhaime ', 'melissazhaime@gmail.com', '+27746697415', 'Residential Cleaner', 'For the job ', 'Hard working person ', null, 'fullTime', null, null, 'public-transport', 'English', 'true', 'pending', '2025-11-01 20:33:58.95618+00', '2025-11-01 20:33:58.95618+00'), ('e67ac0fc-aaf8-4fe8-b9b8-de76ae15166b', 'Natasha ', 'Magashito ', 'magashitonatasha8@gmail.com', '0678316466', 'Residential Cleaner', 'I like to work with them that team is a good people l appetite ', 'I was working for Puma garage for years but my former boss he selling the garage ', null, 'weekdays, fullTime', 'Mr Brandon Ndoma manager Puma Kensington 0749415015 brendonndoma@gmail.com', null, 'public-transport', 'English', 'true', 'rejected', '2025-10-24 19:43:00.16359+00', '2025-10-24 22:09:31.522334+00'), ('e8f5d5e1-6521-4e58-8507-b7a143fb02ad', 'Flossy ', 'Type ', 'flossytype3@gmail.com', '+27 60 288 7124', 'Residential Cleaner', 'Being unemployed for a quite while now made me start asking people how are they findings jobs. So one of my friends has this application and she showed me how it works. And i was really interested ', 'I was once working in a restaurant, so we were making sure everyone cleaned and smart ', 'Malawi school certification of education (MSCE) ', 'weekdays', 'Wisdom
Wisdomfreedom265@gmail.com
0694070977
Spouse. ', null, 'public-transport', 'English, Other: Chewa', 'true', 'pending', '2025-10-22 22:57:35.083725+00', '2025-10-22 22:57:35.083725+00'), ('e92753ed-c68c-42ff-822f-f89d312356c9', 'Chrissy', 'Roman', 'jagadrey@gmail.com', '+27752175328', 'Residential Cleaner', 'I have experience on cleaning residentials.. So to join your team will be good for me ', 'I have 3 years of experience cleaning experience.. Hard working girls from Malawi ', 'MSCE level ', 'weekdays, weekends, fullTime, partTime', '0603685147 Grey faindi

Tinos plumbing 0683275114 ', null, 'public-transport', 'English, Other: Chewa', 'true', 'rejected', '2025-10-26 09:09:27.263834+00', '2025-10-27 10:53:13.942099+00'), ('e9c19461-fc3c-4895-915b-8abfdd2abc04', 'Alicha', 'Bruintjies', 'aliciabruintjies4@gmail.com', '0789832395', 'Residential Cleaner', 'I am seeking a position as a maid/housekeeper in Cape Town, leveraging my relevant experience and passion for cleaning. With a strong background in maintaining tidy and organized spaces, I am confident in my ability to provide exceptional cleaning services. Cleaning is not only a task for me, but also a hobby that I enjoy, ensuring that I approach my work with enthusiasm and dedication.', null, null, 'weekdays', 'Jaiden bruintjies +27 62 790 9029 brother ', null, 'need-assistance', 'English, Afrikaans', 'true', 'pending', '2025-10-24 01:49:53.661105+00', '2025-10-24 01:49:53.661105+00'), ('f39d0707-b988-40d1-9ea3-5841d820d009', 'SHAMISO', 'MOHAMMED', 'xamiegambiza0@gmail.com', '+27787152449', 'Residential Cleaner', 'Because l need a job work for my family', '
Am a hardworking woman 
Am able to do any work properly under minimum supervision 

I am loyal ,displine and a very dedicated person 
I can cook ,wash ,iron and take good care of the kids play with them prepared their food  etc
I always work hard to finish all I have started,  I''m also very attent

', null, 'weekdays', 'My sister mephen chitonga
737165584', null, 'public-transport', 'English', 'true', 'rejected', '2025-10-27 03:59:28.37582+00', '2025-10-27 10:52:59.271706+00'), ('f47f6d86-86e7-44ca-9450-b54bc3ff3f85', 'Jelina ', 'Kanyika ', 'jelinakameck@gmail.com', '+27814279643', 'Other', 'Because I''m looking for a job 
', null, null, 'weekdays', null, null, 'public-transport', 'English', 'true', 'pending', '2025-10-28 10:47:26.979641+00', '2025-10-28 10:47:26.979641+00'), ('f92d4218-15dc-4e81-bce2-b204bc1bd334', 'Morson ', 'Banda ', 'morsonmasina5@gmail.com', '0724873569', 'Commercial Cleaner', 'To find jobs easy ', 'More than 1 year ', null, 'weekdays', 'Peter phiri', null, 'public-transport', 'English', 'true', 'pending', '2025-10-24 23:20:02.920696+00', '2025-10-24 23:20:02.920696+00'), ('fa8c91d6-5fb6-4d2b-bb31-716b07a8b1f3', 'Natasha ', 'Weale', 'natashaweale41@gmail.com', '+27817196655', 'Airbnb Cleaner', 'I''d love to join Airbnb as a cleaner because I take pride in creating welcoming, spotless spaces where guests feel comfortable and cared for. I enjoy paying attention to detail and making every stay a positive experience.

', 'Strong background in hospitality with hands on experience in customer service,food preparation,cash handling and team supervision ', null, 'partTime', 'Kimchi Restaurant 
Ms T Mlambo(manager)
0644081770



Noodles Buns And Bones
Mr T Dzinamarira(Manager)
0754464388
', null, 'public-transport', 'English', 'true', 'pending', '2025-10-22 15:37:29.620899+00', '2025-10-22 15:37:29.620899+00'), ('fb562d31-00f9-4d74-b69f-d2de65e17e1b', 'Niahm', 'Rivers', 'beautychemuga1497@gmail.com', '0724162547', 'Deep Cleaning Specialist', 'Leisure ', '5years', 'Masters in Deep Cleaning ', 'fullTime', null, null, 'bicycle', 'English, Afrikaans, Zulu, Xhosa', 'true', 'rejected', '2025-10-24 21:42:34.236515+00', '2025-10-24 22:09:27.507519+00'), ('fc9248d3-573a-4e39-935e-642174a90f6e', 'Marvellous', 'Muneri', 'marvellousmuneri48@gmail.com', '0603634903', 'Deep Cleaning Specialist', 'To connect skills and career goals to the company''s specific needs values. ', 'I''m a seasoned cleaner with a thorough understanding deep cleaning techniques. I''m an effective communicator who gets along well with other and can proffetionaly obey orders', 'Care giver', 'weekdays, partTime', 'Mkivantombekhaya6@gmail. Com
Ntoshi
06719827867
Employer

Muneritalent@gmail.com
0730488295
Talent
Workmatee
073', null, 'public-transport', 'English, Xhosa', 'true', 'under_review', '2025-11-04 18:22:42.642884+00', '2025-11-22 19:13:19.740168+00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE cleaner_applications IS 'Stores job applications from people wanting to become cleaners';
COMMENT ON COLUMN cleaner_applications.status IS 'Application status: pending, reviewed, approved, rejected, or hired';
COMMENT ON COLUMN cleaner_applications.preferred_areas IS 'Array of preferred service areas/locations';
COMMENT ON COLUMN cleaner_applications.languages IS 'Array of languages the applicant speaks';
COMMENT ON TABLE applications IS 'Legacy applications table storing cleaner job applications with detailed information';
COMMENT ON COLUMN applications.status IS 'Application status: pending, under_review, accepted, or rejected';

-- Create pageviews table to track user page views
CREATE TABLE IF NOT EXISTS pageviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_pageviews_user_id ON pageviews(user_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_user_email ON pageviews(user_email);
CREATE INDEX IF NOT EXISTS idx_pageviews_created_at ON pageviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pageviews_page_path ON pageviews(page_path);

-- Enable Row Level Security
ALTER TABLE pageviews ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own pageviews
CREATE POLICY "Users can view own pageviews" ON pageviews
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' = user_email
  );

-- Policy: Users can insert their own pageviews
CREATE POLICY "Users can insert own pageviews" ON pageviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' = user_email
  );

-- Policy: Service role can insert pageviews (for server-side tracking)
CREATE POLICY "Service role can insert pageviews" ON pageviews
  FOR INSERT
  WITH CHECK (true);














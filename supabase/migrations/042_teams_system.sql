-- Teams System Migration
-- This migration creates teams for Deep Cleaning and Move In/Out services
-- Each team can have one booking per day

-- ============================================================================
-- 1. TEAMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id TEXT NOT NULL UNIQUE, -- e.g., "team-a", "team-b", "team-c"
  name TEXT NOT NULL, -- e.g., "Team A", "Team B", "Team C"
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_team_id ON teams(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_teams_order ON teams(display_order);

-- ============================================================================
-- 2. TEAM MEMBERS TABLE (links cleaners to teams)
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id TEXT NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
  cleaner_id TEXT NOT NULL REFERENCES cleaners(cleaner_id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, cleaner_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_cleaner_id ON team_members(cleaner_id);

-- ============================================================================
-- 3. UPDATE BOOKINGS TABLE
-- ============================================================================

-- Add team_id column to bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS team_id TEXT REFERENCES teams(team_id);

-- Add index for team availability checks (team_id + scheduled_date)
CREATE INDEX IF NOT EXISTS idx_bookings_team_date ON bookings(team_id, scheduled_date) 
WHERE team_id IS NOT NULL;

-- Update cleaner_preference CHECK constraint to include team options
-- First, drop the existing constraint
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_cleaner_preference_check;

-- Add new constraint with team options
ALTER TABLE bookings 
ADD CONSTRAINT bookings_cleaner_preference_check 
CHECK (cleaner_preference IN (
  'no-preference', 
  'natasha-m', 
  'estery-p', 
  'beaul',
  'team-a',
  'team-b',
  'team-c'
));

-- ============================================================================
-- 4. INSERT TEAMS
-- ============================================================================
INSERT INTO teams (team_id, name, display_order, is_active) VALUES
  ('team-a', 'Team A', 1, true),
  ('team-b', 'Team B', 2, true),
  ('team-c', 'Team C', 3, true)
ON CONFLICT (team_id) DO NOTHING;

-- ============================================================================
-- 5. COMMENTS
-- ============================================================================
COMMENT ON TABLE teams IS 'Teams available for Deep Cleaning and Move In/Out services';
COMMENT ON TABLE team_members IS 'Links cleaners to teams (many-to-many relationship)';
COMMENT ON COLUMN bookings.team_id IS 'Team assigned to this booking (for deep/move-in-out services)';

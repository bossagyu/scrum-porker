-- rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  card_set VARCHAR(50) DEFAULT 'fibonacci',
  auto_reveal BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- participants table
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  display_name VARCHAR(100) NOT NULL,
  is_facilitator BOOLEAN DEFAULT false,
  is_observer BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id),
  UNIQUE(room_id, display_name)
);

-- voting_sessions table
CREATE TABLE voting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  topic TEXT NOT NULL DEFAULT '',
  is_revealed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES voting_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  card_value VARCHAR(10) NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, participant_id)
);

-- indexes
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_active ON rooms(is_active, expires_at);
CREATE INDEX idx_participants_room ON participants(room_id);
CREATE INDEX idx_participants_user ON participants(user_id);
CREATE INDEX idx_voting_sessions_room ON voting_sessions(room_id);
CREATE INDEX idx_votes_session ON votes(session_id);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms
CREATE POLICY "Anyone can create rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view active rooms" ON rooms FOR SELECT USING (is_active = true);
CREATE POLICY "Room creator can update" ON rooms FOR UPDATE USING (created_by = auth.uid());

-- RLS Policies for participants
CREATE POLICY "Anyone can join rooms" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Room participants can view" ON participants FOR SELECT USING (
  room_id IN (SELECT room_id FROM participants WHERE user_id = auth.uid())
);
CREATE POLICY "Participants can update self" ON participants FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for voting_sessions
CREATE POLICY "Anyone can create sessions" ON voting_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Room participants can view sessions" ON voting_sessions FOR SELECT USING (
  room_id IN (SELECT room_id FROM participants WHERE user_id = auth.uid())
);
CREATE POLICY "Facilitator can update sessions" ON voting_sessions FOR UPDATE USING (
  room_id IN (SELECT room_id FROM participants WHERE user_id = auth.uid() AND is_facilitator = true)
);

-- RLS Policies for votes
CREATE POLICY "Participants can vote" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Room participants can view votes" ON votes FOR SELECT USING (
  session_id IN (
    SELECT vs.id FROM voting_sessions vs
    JOIN participants p ON p.room_id = vs.room_id
    WHERE p.user_id = auth.uid()
  )
);
CREATE POLICY "Voters can update own votes" ON votes FOR UPDATE USING (
  participant_id IN (SELECT id FROM participants WHERE user_id = auth.uid())
);
CREATE POLICY "Voters can delete own votes" ON votes FOR DELETE USING (
  participant_id IN (SELECT id FROM participants WHERE user_id = auth.uid())
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE voting_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

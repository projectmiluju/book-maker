CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drafts_user_updated_at
  ON drafts (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_drafts_user_created_at
  ON drafts (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS draft_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (draft_id, entry_id),
  UNIQUE (draft_id, position)
);

CREATE INDEX IF NOT EXISTS idx_draft_entries_draft_position
  ON draft_entries (draft_id, position ASC);

CREATE INDEX IF NOT EXISTS idx_draft_entries_entry_id
  ON draft_entries (entry_id);

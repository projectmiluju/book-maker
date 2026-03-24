export const ENTRY_STATUSES = ['draft', 'completed', 'archived'] as const;

export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export type EntryRecord = {
  id: string;
  userId: string;
  title: string | null;
  body: string;
  status: EntryStatus;
  createdAt: Date;
  updatedAt: Date;
  lastSavedAt: Date;
};

export type PublicEntry = {
  id: string;
  title: string | null;
  body: string;
  status: EntryStatus;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string;
};

export function toPublicEntry(entry: EntryRecord): PublicEntry {
  return {
    id: entry.id,
    title: entry.title,
    body: entry.body,
    status: entry.status,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    lastSavedAt: entry.lastSavedAt.toISOString(),
  };
}

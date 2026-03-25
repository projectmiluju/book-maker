export const ENTRY_STATUSES = ['draft', 'completed', 'archived'] as const;

export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export type PublicEntry = {
  id: string;
  title: string | null;
  body: string;
  status: EntryStatus;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string;
};

export type EntryInput = {
  title: string;
  body: string;
  status: EntryStatus;
};

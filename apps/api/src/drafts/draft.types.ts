import { PublicEntry, toPublicEntry } from '../entries/entry.types';

export const DRAFT_STATUSES = ['active', 'archived'] as const;

export type DraftStatus = (typeof DRAFT_STATUSES)[number];

export type DraftRecord = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: DraftStatus;
  createdAt: Date;
  updatedAt: Date;
  entryCount: number;
};

export type DraftEntryRecord = {
  id: string;
  position: number;
  createdAt: Date;
  entry: {
    id: string;
    userId: string;
    title: string | null;
    body: string;
    status: PublicEntry['status'];
    createdAt: Date;
    updatedAt: Date;
    lastSavedAt: Date;
  };
};

export type DraftDetailRecord = DraftRecord & {
  entries: DraftEntryRecord[];
};

export type PublicDraft = {
  id: string;
  title: string;
  description: string | null;
  status: DraftStatus;
  entryCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicDraftEntry = {
  id: string;
  position: number;
  createdAt: string;
  entry: PublicEntry;
};

export type PublicDraftDetail = PublicDraft & {
  entries: PublicDraftEntry[];
};

export function toPublicDraft(draft: DraftRecord): PublicDraft {
  return {
    id: draft.id,
    title: draft.title,
    description: draft.description,
    status: draft.status,
    entryCount: draft.entryCount,
    createdAt: draft.createdAt.toISOString(),
    updatedAt: draft.updatedAt.toISOString(),
  };
}

export function toPublicDraftDetail(draft: DraftDetailRecord): PublicDraftDetail {
  return {
    ...toPublicDraft(draft),
    entries: draft.entries.map((draftEntry) => ({
      id: draftEntry.id,
      position: draftEntry.position,
      createdAt: draftEntry.createdAt.toISOString(),
      entry: toPublicEntry(draftEntry.entry),
    })),
  };
}

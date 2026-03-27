import type { PublicEntry } from './entries';

export const DRAFT_STATUSES = ['active', 'archived'] as const;

export type DraftStatus = (typeof DRAFT_STATUSES)[number];

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

export type PublicDraftPreview = {
  id: string;
  title: string;
  description: string | null;
  updatedAt: string;
  entries: Array<{
    id: string;
    position: number;
    title: string | null;
    body: string;
  }>;
};

export type CreateDraftInput = {
  title: string;
  description?: string;
  status?: DraftStatus;
};

export type ReorderDraftEntriesInput = {
  entryIds: string[];
};

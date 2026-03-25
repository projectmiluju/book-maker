import type { PublicEntry } from '../types/entries';

export type ArchiveMonthGroup = {
  key: string;
  label: string;
  entries: Array<{
    entry: PublicEntry;
    dayLabel: string;
    preview: string;
  }>;
};

export function groupEntriesByMonth(entries: PublicEntry[]): ArchiveMonthGroup[] {
  const monthFormatter = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
  });
  const dayFormatter = new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
  });

  const groups = new Map<string, ArchiveMonthGroup>();

  for (const entry of entries) {
    const date = new Date(entry.updatedAt);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: monthFormatter.format(date),
        entries: [],
      });
    }

    groups.get(key)?.entries.push({
      entry,
      dayLabel: dayFormatter.format(date).replace('. ', '.').replace('.', '.'),
      preview: buildEntryPreview(entry.body),
    });
  }

  return [...groups.values()];
}

export function buildEntryPreview(body: string): string {
  const normalized = body.replace(/\s+/g, ' ').trim();

  if (normalized.length === 0) {
    return '아직 본문이 없는 기록입니다.';
  }

  return normalized.length > 88 ? `${normalized.slice(0, 88)}...` : normalized;
}

export function formatEntryDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

export function formatEntryDateTime(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

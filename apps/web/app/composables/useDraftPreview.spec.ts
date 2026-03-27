import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { useDraftPreview } from './useDraftPreview';

describe('useDraftPreview', () => {
  it('loads draft preview data', async () => {
    const draftPreview = useDraftPreview({
      api: {
        getDraftPreview: vi.fn().mockResolvedValue({
          id: 'draft-1',
          title: '고요가 머무는 자리',
          description: '바다를 따라 읽는 초안',
          updatedAt: '2026-03-27T00:00:00.000Z',
          entries: [
            {
              id: 'entry-1',
              position: 1,
              title: '첫 기록',
              body: '첫 문장',
            },
          ],
        }),
      },
    });

    const preview = await draftPreview.loadPreview('draft-1');

    expect(preview?.title).toBe('고요가 머무는 자리');
    expect(draftPreview.previewState.value).toBe('loaded');
    expect(draftPreview.preview.value?.entries).toHaveLength(1);
  });

  it('exposes an error when preview loading fails', async () => {
    const draftPreview = useDraftPreview({
      api: {
        getDraftPreview: vi.fn().mockRejectedValue(new Error('boom')),
      },
    });

    await draftPreview.loadPreview('draft-1');

    expect(draftPreview.previewState.value).toBe('error');
    expect(draftPreview.previewError.value).toContain('초안 미리보기를 불러오지 못했습니다');
  });
});

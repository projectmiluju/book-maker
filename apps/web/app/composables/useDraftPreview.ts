import { ref } from 'vue';

import type { PublicDraftPreview } from '../types/drafts';

export type DraftPreviewState = 'idle' | 'loading' | 'loaded' | 'error';

type DraftPreviewApi = {
  getDraftPreview(draftId: string): Promise<PublicDraftPreview>;
};

type UseDraftPreviewOptions = {
  api: DraftPreviewApi;
};

export function useDraftPreview(options: UseDraftPreviewOptions) {
  const preview = ref<PublicDraftPreview | null>(null);
  const previewState = ref<DraftPreviewState>('idle');
  const previewError = ref('');

  async function loadPreview(draftId: string) {
    previewState.value = 'loading';
    previewError.value = '';

    try {
      const nextPreview = await options.api.getDraftPreview(draftId);
      preview.value = nextPreview;
      previewState.value = 'loaded';

      return nextPreview;
    } catch {
      preview.value = null;
      previewState.value = 'error';
      previewError.value =
        '초안 미리보기를 불러오지 못했습니다. 초안 상세 화면에서 다시 시도해 주세요.';

      return null;
    }
  }

  return {
    preview,
    previewState,
    previewError,
    loadPreview,
  };
}

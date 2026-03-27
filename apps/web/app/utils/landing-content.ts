export const LANDING_FLOW_STEPS = [
  {
    number: '01',
    title: '짧게 기록하기',
    copy: '제목 없이 시작해도 됩니다. 오늘 떠오른 장면과 마음을 빠르게 남깁니다.',
    cta: '기록 화면으로',
    to: '/app/write',
  },
  {
    number: '02',
    title: '아카이브에 쌓기',
    copy: '흘러가지 않도록 내 기록을 다시 읽고, 날짜 흐름 안에서 이어 붙일 수 있습니다.',
    cta: '아카이브 보기',
    to: '/app/archive',
  },
  {
    number: '03',
    title: '초안으로 묶기',
    copy: '서로 닿는 기록을 골라 순서를 정리하면, 흩어진 글이 하나의 초안이 됩니다.',
    cta: '초안으로 이동',
    to: '/app/drafts',
  },
  {
    number: '04',
    title: '책처럼 읽기',
    copy: '편집 화면을 벗어나 읽기 모드에서 한 권의 시작처럼 흐름을 확인할 수 있습니다.',
    cta: '초안에서 이어 보기',
    to: '/app/drafts',
  },
] as const;

export const LANDING_LIVE_LINKS = [
  {
    label: '기록하기',
    copy: '짧은 글을 남기고 자동 저장 흐름을 확인합니다.',
    to: '/app/write',
  },
  {
    label: '아카이브',
    copy: '쌓인 기록을 다시 찾고 상세로 열어 봅니다.',
    to: '/app/archive',
  },
  {
    label: '초안',
    copy: '기록을 묶고 순서를 정리하며 초안을 다듬습니다.',
    to: '/app/drafts',
  },
] as const;

export const LANDING_PROOF_POINTS = [
  {
    kicker: 'Write',
    title: '자동 저장까지 연결된 기록 화면',
    copy: '짧은 기록을 남기고 같은 화면에서 저장 상태를 확인할 수 있습니다.',
  },
  {
    kicker: 'Archive',
    title: '다시 찾을 수 있는 개인 아카이브',
    copy: '지난 기록을 목록과 상세 화면에서 다시 읽고 이어 쓸 수 있습니다.',
  },
  {
    kicker: 'Draft',
    title: '모으고 정리하는 초안 흐름',
    copy: '기록을 초안에 담고 순서를 바꾸고 제외하면서 흐름을 다듬을 수 있습니다.',
  },
  {
    kicker: 'Preview',
    title: '읽기 모드로 확인하는 책의 시작',
    copy: '초안 제목과 본문을 연속 읽기 화면에서 확인하며 감정적 proof point를 만듭니다.',
  },
] as const;

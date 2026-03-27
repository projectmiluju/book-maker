import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  LANDING_FLOW_STEPS,
  LANDING_LIVE_LINKS,
  LANDING_PROOF_POINTS,
} from './landing-content';

describe('landing content', () => {
  it('describes the four MVP flow steps in order', () => {
    expect(LANDING_FLOW_STEPS).toHaveLength(4);
    expect(LANDING_FLOW_STEPS.map((step) => step.number)).toEqual(['01', '02', '03', '04']);
  });

  it('links only to currently available app routes', () => {
    expect(LANDING_LIVE_LINKS.map((link) => link.to)).toEqual([
      '/app/write',
      '/app/archive',
      '/app/drafts',
    ]);
  });

  it('keeps proof points focused on the current MVP loop', () => {
    expect(LANDING_PROOF_POINTS.map((point) => point.kicker)).toEqual([
      'Write',
      'Archive',
      'Draft',
      'Preview',
    ]);
  });
});

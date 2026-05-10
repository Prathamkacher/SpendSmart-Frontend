import { AnalyticsModule } from './analytics.module';

describe('AnalyticsModule', () => {
  it('creates the feature module', () => {
    expect(new AnalyticsModule()).toBeTruthy();
  });
});

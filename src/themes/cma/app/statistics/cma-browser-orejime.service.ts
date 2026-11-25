import { Injectable } from '@angular/core';
import { BrowserOrejimeService } from '@dspace/core/cookies/browser-orejime.service';
import { GOOGLE_ANALYTICS_OREJIME_KEY } from '@dspace/core/cookies/orejime-configuration';

/**
 * CMA cookie banner: the stock banner only lets Google Analytics start on the next page load
 * after the visitor accepts. This adds a consent callback to the Google Analytics entry that
 * starts tracking at once, through `window.initGoogleAnalytics`, which
 * {@link CmaGoogleAnalyticsService} sets.
 *
 * Swapped in for the stock service in src/modules/app/browser-app.config.ts (CMA hook line).
 * Browser only, so `window` is always there.
 */
@Injectable()
export class CmaBrowserOrejimeService extends BrowserOrejimeService {

  initialize() {
    const ga = this.orejimeConfig?.apps?.find((app) => app.name === GOOGLE_ANALYTICS_OREJIME_KEY);
    if (ga) {
      ga.callback = (consent: boolean) => {
        if (consent) {
          (window as any).initGoogleAnalytics?.();
        }
      };
    }
    super.initialize();
  }
}

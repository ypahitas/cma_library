import {
  DOCUMENT,
  Inject,
  Injectable,
} from '@angular/core';
import { OrejimeService } from '@dspace/core/cookies/orejime.service';
import { GOOGLE_ANALYTICS_OREJIME_KEY } from '@dspace/core/cookies/orejime-configuration';
import { ConfigurationDataService } from '@dspace/core/data/configuration-data.service';
import { getFirstCompletedRemoteData } from '@dspace/core/shared/operators';
import { isEmpty } from '@dspace/shared/utils/empty.util';
import {
  Angulartics2GoogleAnalytics,
  Angulartics2GoogleGlobalSiteTag,
} from 'angulartics2';
import { combineLatest } from 'rxjs';

import { GoogleAnalyticsService } from '../../../../app/statistics/google-analytics.service';

/**
 * CMA Google Analytics: same as the stock service (copied from DSpace 10.1), plus
 * - `window.initGoogleAnalytics`, called by {@link CmaBrowserOrejimeService} when the visitor accepts
 *   the cookie banner, so tracking starts on that page instead of the next one;
 * - a guard so the tracking snippet is never added twice.
 *
 * Swapped in for the stock service in src/modules/app/browser-app.config.ts (CMA hook line).
 * On a DSpace upgrade, compare with src/app/statistics/google-analytics.service.ts.
 */
@Injectable()
export class CmaGoogleAnalyticsService extends GoogleAnalyticsService {

  /** Set once the tracking snippet is on the page. */
  private trackingStarted = false;

  constructor(
    private cmaGoogleAnalytics: Angulartics2GoogleAnalytics,
    private cmaGoogleGlobalSiteTag: Angulartics2GoogleGlobalSiteTag,
    private cmaOrejimeService: OrejimeService,
    private cmaConfigService: ConfigurationDataService,
    @Inject(DOCUMENT) private cmaDocument: any,
  ) {
    super(cmaGoogleAnalytics, cmaGoogleGlobalSiteTag, cmaOrejimeService, cmaConfigService, cmaDocument);
  }

  addTrackingIdToPage(): void {
    const win = this.cmaDocument?.defaultView;
    if (win) {
      win.initGoogleAnalytics = () => this.loadTracking();
    }
    this.loadTracking();
  }

  private loadTracking(): void {
    if (this.trackingStarted) {
      return;
    }
    const googleKey$ = this.cmaConfigService.findByPropertyName('google.analytics.key').pipe(
      getFirstCompletedRemoteData(),
    );
    const preferences$ = this.cmaOrejimeService.getSavedPreferences();

    combineLatest([preferences$, googleKey$])
      .subscribe(([preferences, remoteData]) => {
        // make sure user has accepted Google Analytics consents
        if (isEmpty(preferences) || isEmpty(preferences[GOOGLE_ANALYTICS_OREJIME_KEY]) || !preferences[GOOGLE_ANALYTICS_OREJIME_KEY]) {
          return;
        }
        // make sure we got a success response from the backend
        if (!remoteData.hasSucceeded) {
          return;
        }
        const trackingId = remoteData.payload.values[0];
        // make sure we received a tracking id
        if (isEmpty(trackingId)) {
          return;
        }
        if (this.trackingStarted) {
          return;
        }
        this.trackingStarted = true;

        if (trackingId.startsWith('G-')) {
          // add GTag snippet to page
          const keyScript = this.cmaDocument.createElement('script');
          keyScript.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
          this.cmaDocument.body.appendChild(keyScript);

          const libScript = this.cmaDocument.createElement('script');
          libScript.innerHTML = `window.dataLayer = window.dataLayer || [];function gtag(){window.dataLayer.push(arguments);}
                               gtag('js', new Date());gtag('config', '${trackingId}');`;
          this.cmaDocument.body.appendChild(libScript);

          // start tracking
          this.cmaGoogleGlobalSiteTag.startTracking();
        } else {
          // add trackingId snippet to page
          const keyScript = this.cmaDocument.createElement('script');
          keyScript.innerHTML = `(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                              (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                              m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                              })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
                              ga('create', '${trackingId}', 'auto');`;
          this.cmaDocument.body.appendChild(keyScript);

          // start tracking
          this.cmaGoogleAnalytics.startTracking();
        }
      });
  }
}

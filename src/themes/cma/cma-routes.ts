import { Route } from '@angular/router';
import { endUserAgreementCurrentUserGuard } from '@dspace/core/end-user-agreement/end-user-agreement-current-user.guard';

import { CMACuratedSubjectsComponent } from './app/cma-curated-subjects-page/cma-curated-subjects.component';
import { CMAContactMeComponent } from './app/contact-me-page/contact-me.component';
import { CMAContributorsComponent } from './app/contributors-page/contributors.component';

/**
 * CMA pages, added to the site's top-level routes by the one hook line in src/app/app-routes.ts
 * (`...CMA_ROUTES,`). Keep CMA routes here so core routing stays stock for upgrades.
 */
export const CMA_ROUTES: Route[] = [
  {
    // The menu says "Συλλογές" and links here; same page as the stock /community-list (which still works)
    path: 'collection-list',
    loadChildren: () => import('../../app/community-list-page/community-list-page-routes')
      .then((m) => m.ROUTES),
    canActivate: [endUserAgreementCurrentUserGuard],
  },
  {
    path: 'curated-subjects',
    component: CMACuratedSubjectsComponent,
    canActivate: [endUserAgreementCurrentUserGuard],
  },
  {
    path: 'contact-me',
    component: CMAContactMeComponent,
    canActivate: [endUserAgreementCurrentUserGuard],
  },
  {
    path: 'contributors',
    component: CMAContributorsComponent,
    canActivate: [endUserAgreementCurrentUserGuard],
  },
];

import { Route } from '@angular/router';
import { i18nBreadcrumbResolver } from '@dspace/core/breadcrumbs/i18n-breadcrumb.resolver';
import { endUserAgreementCurrentUserGuard } from '@dspace/core/end-user-agreement/end-user-agreement-current-user.guard';

import { CMACuratedSubjectsComponent } from './app/cma-curated-subjects-page/cma-curated-subjects.component';
import { CMAContactMeComponent } from './app/contact-me-page/contact-me.component';
import { CmaBrowseByGeospatialDataComponent } from './app/browse-by/browse-by-geospatial-data/browse-by-geospatial-data.component';
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
    // CMA map browse page (same title and breadcrumb as the stock /browse/map, which this replaces)
    path: 'browse/map',
    component: CmaBrowseByGeospatialDataComponent,
    canActivate: [endUserAgreementCurrentUserGuard],
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'browse.map.page', breadcrumbKey: 'browse.metadata.map' },
  },
  {
    path: 'contributors',
    component: CMAContributorsComponent,
    canActivate: [endUserAgreementCurrentUserGuard],
  },
];

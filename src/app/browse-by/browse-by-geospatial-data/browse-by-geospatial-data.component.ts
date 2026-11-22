import {
  AsyncPipe,
  isPlatformBrowser,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  Params,
  RouterLink,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  combineLatest,
  Observable,
  of,
} from 'rxjs';
import {
  filter,
  map,
  switchMap,
  take,
} from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { BrowseService } from '../../core/browse/browse.service';
import { BrowseEntrySearchOptions } from '../../core/browse/browse-entry-search-options.model';
import { BrowseEntry } from '../../core/shared/browse-entry.model';
import {
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteDataPayload,
} from '../../core/shared/operators';
import { SearchService } from '../../core/shared/search/search.service';
import { SearchConfigurationService } from '../../core/shared/search/search-configuration.service';
import {
  hasValue,
  isNotEmpty,
} from '../../shared/empty.util';
import { GeospatialMapComponent } from '../../shared/geospatial-map/geospatial-map.component';
import { PaginationComponentOptions } from '../../shared/pagination/pagination-component-options.model';
import { FacetValues } from '../../shared/search/models/facet-values.model';
import { PaginatedSearchOptions } from '../../shared/search/models/paginated-search-options.model';

@Component({
  selector: 'ds-browse-by-geospatial-data',
  templateUrl: './browse-by-geospatial-data.component.html',
  styleUrls: ['./browse-by-geospatial-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    GeospatialMapComponent,
    RouterLink,
    TranslateModule,
  ],
  standalone: true,
})
/**
 * Component displaying a large 'browse map', which is really a geolocation few of the 'point' facet defined
 * in the geospatial discovery configuration.
 * The markers are clustered by location, and each individual marker will link to a search page for that point value
 * as a filter.
 *
 * @author Kim Shepherd
 */
export class BrowseByGeospatialDataComponent implements OnInit {

  protected readonly isPlatformBrowser = isPlatformBrowser;

  public facetValues$: Observable<FacetValues> = of(null);

  /**
   * Browse index listed under the map, alphabetically (Τοποθεσία, dc.coverage.spatial)
   */
  public readonly locationBrowseId = 'location';

  /**
   * All values of the location browse index within the current scope, with item counts
   */
  public locations$: Observable<BrowseEntry[]> = of([]);

  constructor(
    private searchConfigurationService: SearchConfigurationService,
    private searchService: SearchService,
    private browseService: BrowseService,
    protected route: ActivatedRoute,
  ) {}

  public scope$: Observable<string> ;

  ngOnInit(): void {
    this.scope$ = this.route.queryParams.pipe(
      map((params: Params) => params.scope),
    );
    this.facetValues$ = this.getFacetValues();
    this.locations$ = this.getLocations();
  }

  /**
   * Get every location browse entry (one page holds them all), in the index's alphabetical order
   */
  getLocations(): Observable<BrowseEntry[]> {
    return this.scope$.pipe(
      switchMap((scope) => {
        const pagination = Object.assign(new PaginationComponentOptions(), {
          id: 'map-locations',
          currentPage: 1,
          pageSize: 1000,
        });
        return this.browseService.getBrowseEntriesFor(
          new BrowseEntrySearchOptions(this.locationBrowseId, pagination, undefined, undefined, scope));
      }),
      getFirstCompletedRemoteData(),
      map((rd) => rd.hasSucceeded ? rd.payload.page : []),
    );
  }

  /**
   * Query params linking a location to its items on the location browse page
   */
  getLocationQueryParams(entry: BrowseEntry, scope: string): Params {
    return {
      value: entry.value,
      authority: entry.authority || undefined,
      scope: isNotEmpty(scope) ? scope : undefined,
    };
  }

  /**
   * Get facet values for use in rendering 'browse by' geospatial map
   */
  getFacetValues(): Observable<FacetValues> {
    return combineLatest([this.scope$, this.searchConfigurationService.getConfig(
      // If the geospatial configuration is not found, default will be returned and used
      '', environment.geospatialMapViewer.spatialFacetDiscoveryConfiguration).pipe(
      getFirstCompletedRemoteData(),
      getFirstSucceededRemoteDataPayload(),
      filter((searchFilterConfigs) => hasValue(searchFilterConfigs)),
      take(1),
      map((searchFilterConfigs) => searchFilterConfigs[0]),
      filter((searchFilterConfig) => hasValue(searchFilterConfig))),
    ],
    ).pipe(
      switchMap(([scope, searchFilterConfig]) => {
        // Get all points in one page, if possible
        searchFilterConfig.pageSize = 99999;
        const searchOptions: PaginatedSearchOptions = Object.assign({
          'configuration': environment.geospatialMapViewer.spatialFacetDiscoveryConfiguration,
          'scope': scope,
          'facetLimit': 99999,
        });
        return this.searchService.getFacetValuesFor(searchFilterConfig, 1, searchOptions,
          null, true);
      }),
      getFirstCompletedRemoteData(),
      getFirstSucceededRemoteDataPayload(),
    );
  }
}

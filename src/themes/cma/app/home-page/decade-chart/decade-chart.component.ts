import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  forkJoin,
  Observable,
  of,
} from 'rxjs';
import {
  catchError,
  map,
  switchMap,
} from 'rxjs/operators';
import {
  APP_CONFIG,
  AppConfig,
} from 'src/config/app-config.interface';

/** One bar: a decade and how many items visitors can find in it. */
export interface CmaDecade {
  start: number;
  end: number;
  count: number;
}

/**
 * CMA home page: "Recordings by decade". One bar per decade of dc.date.issued (the recording year),
 * each linking to the search page with that date range, the same filter as the search page's date slider.
 * Counts come from the public search API in the visitor's browser, so they only count what visitors can
 * see, and empty decades are left out. Nothing is shown if the counts can't be loaded.
 */
@Component({
  selector: 'ds-cma-decade-chart',
  templateUrl: './decade-chart.component.html',
  styleUrls: ['./decade-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TranslateModule,
  ],
})
export class CmaDecadeChartComponent implements OnInit {

  decades: CmaDecade[] = [];
  max = 0;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(APP_CONFIG) private appConfig: AppConfig,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // counts are fetched in the browser only, so server rendering is never slowed down
    }
    const api = `${this.appConfig.rest.baseUrl}/api/discover`;
    this.http.get<any>(`${api}/facets/dateIssued`, { params: { size: '50' } }).pipe(
      // the facet's own buckets are wider than a decade; only the overall first and last year are used
      map((facet) => {
        // (no Array.flatMap: the app's TS lib predates ES2019)
        const years: number[] = (facet?._embedded?.values || [])
          .reduce((all: string[], v) => all.concat(String(v.label).match(/\d{4}/g) || []), [])
          .map(Number);
        return years.length ? [Math.min(...years), Math.max(...years)] : null;
      }),
      switchMap((range): Observable<CmaDecade[]> => {
        if (!range) {
          return of([]);
        }
        const starts: number[] = [];
        for (let y = Math.floor(range[0] / 10) * 10; y <= range[1]; y += 10) {
          starts.push(y);
        }
        return forkJoin(starts.map((start) => this.http.get<any>(`${api}/search/objects`, {
          params: { 'dsoType': 'ITEM', 'size': '1', 'f.dateIssued': `[${start} TO ${start + 9}],equals` },
        }).pipe(
          map((res) => ({ start, end: start + 9, count: res?._embedded?.searchResult?.page?.totalElements || 0 })),
        )));
      }),
      catchError(() => of([])),
    ).subscribe((decades) => {
      this.decades = decades.filter((d) => d.count > 0);
      this.max = Math.max(0, ...this.decades.map((d) => d.count));
      this.cdr.markForCheck();
    });
  }

  /** Bar height in percent of the tallest; never so small that a bar with items disappears. */
  height(d: CmaDecade): number {
    return this.max ? Math.max(6, Math.round(100 * d.count / this.max)) : 0;
  }

  queryParams(d: CmaDecade) {
    return { 'f.dateIssued.min': d.start, 'f.dateIssued.max': d.end };
  }

  /** "1990–99" */
  label(d: CmaDecade): string {
    return `${d.start}–${String(d.end).slice(2)}`;
  }
}

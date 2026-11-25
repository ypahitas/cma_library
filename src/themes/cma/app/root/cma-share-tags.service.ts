import {
  Inject,
  Injectable,
} from '@angular/core';
import {
  Meta,
  Title,
} from '@angular/platform-browser';
import {
  NavigationEnd,
  Router,
} from '@angular/router';
import {
  APP_CONFIG,
  AppConfig,
} from '@dspace/config/app-config.interface';
import { filter } from 'rxjs/operators';

/**
 * CMA: per-page share tags (og:url, og:title, og:description) for Facebook/WhatsApp/LinkedIn previews,
 * and a fallback for pages that never set a title (e.g. /handle/... not found showed "DSpace").
 *
 * Core HeadTagService sets <title>, <meta name="title"> and <meta name="description"> per page.
 * Rather than override it, this mirrors those values into the og: tags by wrapping the
 * (singleton) Title and Meta services. The static og:image etc. live in config.yml headTags.
 */
@Injectable({ providedIn: 'root' })
export class CmaShareTagsService {

  static readonly DEFAULT_TITLE = 'CMA Library';
  static readonly DEFAULT_DESCRIPTION =
    'Ψηφιακή βιβλιοθήκη του Αρχείου Κυπριακής Μουσικής: ηχογραφήσεις, βίντεο και φωτογραφίες κυπριακής παραδοσιακής μουσικής.';
  /** DSpace's stock <title> (src/index.html now says CMA Library), i.e. "no page set a title". */
  static readonly INDEX_TITLE = 'DSpace';

  private started = false;

  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router,
    @Inject(APP_CONFIG) private appConfig: AppConfig,
  ) {
  }

  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.wrapTitleAndMeta();

    // Sync with whatever is already in the head (the first navigation may have finished before we started).
    this.setOg('og:title', this.title.getTitle());
    const description = this.meta.getTag('name="description"');
    this.setOg('og:description', description?.content || CmaShareTagsService.DEFAULT_DESCRIPTION);
    this.updateUrl();
    this.fallbackTitleSoon();

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
    ).subscribe(() => {
      this.updateUrl();
      this.fallbackTitleSoon();
    });
  }

  private wrapTitleAndMeta(): void {
    const title = this.title;
    const meta = this.meta;
    const setTitle = title.setTitle.bind(title);
    title.setTitle = (value: string) => {
      setTitle(value);
      this.setOg('og:title', value);
    };

    const addTag = meta.addTag.bind(meta);
    meta.addTag = (tag, forceCreation?) => {
      const el = addTag(tag, forceCreation);
      if (tag?.name === 'description' && tag.content) {
        this.setOg('og:description', tag.content);
      }
      return el;
    };

    const removeTag = meta.removeTag.bind(meta);
    meta.removeTag = (selector: string) => {
      removeTag(selector);
      if (selector.replace(/["']/g, '') === 'name=description') {
        this.setOg('og:description', CmaShareTagsService.DEFAULT_DESCRIPTION);
      }
    };
  }

  /** Runs after the route's own title logic (which may be async) has had its turn. */
  private fallbackTitleSoon(): void {
    setTimeout(() => {
      const current = this.title.getTitle();
      if (!current || current === CmaShareTagsService.INDEX_TITLE) {
        this.title.setTitle(CmaShareTagsService.DEFAULT_TITLE);
      }
    }, 0);
  }

  private updateUrl(): void {
    const base = this.appConfig.ui?.baseUrl?.replace(/\/+$/, '');
    if (!base) {
      return;
    }
    const path = this.router.url.split('#')[0];
    // the home page is routed as /home; share it as the site root
    this.setOg('og:url', base + (path === '/' || path === '/home' ? '/' : path));
  }

  private setOg(property: string, content: string): void {
    if (content) {
      this.meta.updateTag({ property, content }, `property='${property}'`);
    }
  }
}

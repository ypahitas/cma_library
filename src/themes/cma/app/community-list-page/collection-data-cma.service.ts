import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import {
  map,
  switchMap,
} from 'rxjs/operators';
import { RemoteDataBuildService } from 'src/app/core/cache/builders/remote-data-build.service';
import { ObjectCacheService } from 'src/app/core/cache/object-cache.service';
import { BitstreamDataService } from 'src/app/core/data/bitstream-data.service';
import { CollectionDataService } from 'src/app/core/data/collection-data.service';
import { CommunityDataService } from 'src/app/core/data/community-data.service';
import { DSOChangeAnalyzer } from 'src/app/core/data/dso-change-analyzer.service';
import { RequestService } from 'src/app/core/data/request.service';
import { Collection } from 'src/app/core/shared/collection.model';
import { Community } from 'src/app/core/shared/community.model';
import { HALEndpointService } from 'src/app/core/shared/hal-endpoint.service';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';


//Service written to get all communities for CMA - Cyprus Music Archive
@Injectable({ providedIn: 'root' })
export class CollectionDataCMAService extends CollectionDataService {
  protected errorTitle = 'collection.source.update.notifications.error.title';
  protected contentSourceError = 'collection.source.update.notifications.error.content';
  private apiUrl = '';

  constructor(
    protected http: HttpClient,
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected comparator: DSOChangeAnalyzer<Community>,
    protected notificationsService: NotificationsService,
    protected bitstreamDataService: BitstreamDataService,
    protected communityDataService: CommunityDataService,
    protected translate: TranslateService,
  ) {
    super(requestService, rdbService, objectCache, halService, comparator, notificationsService, bitstreamDataService,communityDataService,translate);
    this.getEndpoint().subscribe(response => {
      this.apiUrl = response;
    });
  }

  // this method is overridden in order to make it public
  getEndpoint() {
    return this.halService.getEndpoint(this.linkPath);
  }

  //CMA - no idea how dspace angular API calls work so did my own
  getCollections(): Observable<object[]> {
    return this.http.get<Collection[]>(this.apiUrl);
  }

  checkResponseIntegrity(data: object): boolean {
    if (!data || (typeof data !== 'object' || !data.hasOwnProperty('_embedded'))) {
      return false;
    } else {
      return true;
    }
  }
  //To parse JSON responses
  getNested(obj: any, path: string[]): any {
    return path.reduce((acc, key) => acc?.[key], obj);
  }


}

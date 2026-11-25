import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { PaginatedList } from '@dspace/core/data/paginated-list.model';
import { RemoteData } from '@dspace/core/data/remote-data';
import { Bitstream } from '@dspace/core/shared/bitstream.model';
import { followLink } from '@dspace/core/shared/follow-link-config.model';
import { hasValue } from '@dspace/shared/utils/empty.util';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import {
  filter,
  take,
} from 'rxjs/operators';

import { MediaViewerComponent as BaseComponent } from '../../../../../app/item-page/media-viewer/media-viewer.component';
import { ThemedMediaViewerImageComponent } from '../../../../../app/item-page/media-viewer/media-viewer-image/themed-media-viewer-image.component';
import { ThemedMediaViewerVideoComponent } from '../../../../../app/item-page/media-viewer/media-viewer-video/themed-media-viewer-video.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { VarDirective } from '../../../../../app/shared/utils/var.directive';
import { ThemedThumbnailComponent } from '../../../../../app/thumbnail/themed-thumbnail.component';

/**
 * Files fetched per item for the player list. The core component uses the REST default
 * page (20 files), so items with more (e.g. Τα Μαππουρέικα, 28 files) lost the rest.
 */
const CMA_MEDIA_PAGE_SIZE = 200;

@Component({
  selector: 'ds-themed-media-viewer',
  templateUrl: './media-viewer.component.html',
  //templateUrl: '../../../../../app/item-page/media-viewer/media-viewer.component.html',
  // styleUrls: ['./media-viewer.component.scss'],
  styleUrls: ['../../../../../app/item-page/media-viewer/media-viewer.component.scss'],
  imports: [
    AsyncPipe,
    ThemedLoadingComponent,
    ThemedMediaViewerImageComponent,
    ThemedMediaViewerVideoComponent,
    ThemedThumbnailComponent,
    TranslateModule,
    VarDirective,
  ],
})
export class MediaViewerComponent extends BaseComponent {

  /**
   * Same as the core method, but asks for up to CMA_MEDIA_PAGE_SIZE files instead of the default 20.
   * @param bundleName Bundle name
   */
  loadRemoteData(
    bundleName: string,
  ): Observable<RemoteData<PaginatedList<Bitstream>>> {
    return this.bitstreamDataService
      .findAllByItemAndBundleName(
        this.item,
        bundleName,
        { elementsPerPage: CMA_MEDIA_PAGE_SIZE },
        true,
        true,
        followLink('format'),
      )
      .pipe(
        filter(
          (bitstreamsRD: RemoteData<PaginatedList<Bitstream>>) =>
            hasValue(bitstreamsRD) &&
            (hasValue(bitstreamsRD.errorMessage) || hasValue(bitstreamsRD.payload)),
        ),
        take(1),
      );
  }
}

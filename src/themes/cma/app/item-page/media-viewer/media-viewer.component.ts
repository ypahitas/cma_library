import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { MediaViewerComponent as BaseComponent } from '../../../../../app/item-page/media-viewer/media-viewer.component';
import { MediaViewerItem } from '../../../../../app/core/shared/media-viewer-item.model';
import { ThemedMediaViewerImageComponent } from '../../../../../app/item-page/media-viewer/media-viewer-image/themed-media-viewer-image.component';
import { ThemedMediaViewerVideoComponent } from '../../../../../app/item-page/media-viewer/media-viewer-video/themed-media-viewer-video.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { VarDirective } from '../../../../../app/shared/utils/var.directive';
import { ThemedThumbnailComponent } from '../../../../../app/thumbnail/themed-thumbnail.component';

@Component({
  selector: 'ds-themed-media-viewer',
  templateUrl: './media-viewer.component.html',
  //templateUrl: '../../../../../app/item-page/media-viewer/media-viewer.component.html',
  // styleUrls: ['./media-viewer.component.scss'],
  styleUrls: ['../../../../../app/item-page/media-viewer/media-viewer.component.scss'],
  standalone: true,
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
   * Filter media list to get only videos and audio
   */
  getVideoMediaList(mediaList: MediaViewerItem[]): MediaViewerItem[] {
    if (!mediaList) {
      return [];
    }
    return mediaList.filter(media => ['audio', 'video'].includes(media.format));
  }

  /**
   * Filter media list to get only images
   */
  getImageMediaList(mediaList: MediaViewerItem[]): MediaViewerItem[] {
    if (!mediaList) {
      return [];
    }
    return mediaList.filter(media => media.format === 'image');
  }

  /**
   * Check if media list contains any videos or audio
   */
  hasVideoMedia(mediaList: MediaViewerItem[]): boolean {
    if (!mediaList || mediaList.length === 0) {
      return false;
    }
    return mediaList.some(media => ['audio', 'video'].includes(media.format));
  }

  /**
   * Check if media list contains any images
   */
  hasImageMedia(mediaList: MediaViewerItem[]): boolean {
    if (!mediaList || mediaList.length === 0) {
      return false;
    }
    return mediaList.some(media => media.format === 'image');
  }
}

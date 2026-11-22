import { AsyncPipe } from '@angular/common';
import {
  Component,
  OnChanges,
} from '@angular/core';
import { NgxGalleryModule } from '@kolkov/ngx-gallery';

import { MediaViewerImageComponent as BaseComponent } from '../../../../../../app/item-page/media-viewer/media-viewer-image/media-viewer-image.component';

@Component({
  selector: 'ds-themed-media-viewer-image',
  // templateUrl: './media-viewer-image.component.html',
  templateUrl: '../../../../../../app/item-page/media-viewer/media-viewer-image/media-viewer-image.component.html',
  // styleUrls: ['./media-viewer-image.component.scss'],
  styleUrls: ['../../../../../../app/item-page/media-viewer/media-viewer-image/media-viewer-image.component.scss'],
  imports: [
    AsyncPipe,
    NgxGalleryModule,
  ],
})
export class MediaViewerImageComponent extends BaseComponent implements OnChanges {

  ngOnChanges(): void {
    super.ngOnChanges();
    //Fix CMA thumbail missing. Loop through all images and attach image
    for (const image of this.galleryImages) {
      image.small = image.big;
      image.medium = image.big;
    }
  }
}

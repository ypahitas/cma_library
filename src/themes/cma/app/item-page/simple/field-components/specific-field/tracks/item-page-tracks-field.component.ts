import { DOCUMENT } from '@angular/common';
import {
  Component,
  Inject,
  Input,
  OnChanges,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { Item } from '../../../../../../../../app/core/shared/item.model';
import { MetadataFieldWrapperComponent } from '../../../../../../../../app/shared/metadata-field-wrapper/metadata-field-wrapper.component';

/**
 * One line of the track list: an optional start time (in seconds and as written) and its text
 */
interface TrackLine {
  time?: string;
  seconds?: number;
  text: string;
}

/**
 * CMA: the timestamped track list ("Περιεχόμενα", dc.description.tableofcontents).
 * Each line starting with a time (HH:MM:SS or MM:SS) gets a link-styled button that moves the item's
 * audio/video player to that time and starts playing.
 */
@Component({
  selector: 'ds-item-page-tracks-field',
  templateUrl: './item-page-tracks-field.component.html',
  styleUrls: ['./item-page-tracks-field.component.scss'],
  standalone: true,
  imports: [
    MetadataFieldWrapperComponent,
    TranslateModule,
  ],
})
export class ItemPageTracksFieldComponent implements OnChanges {

  @Input() item: Item;

  @Input() field = 'dc.description.tableofcontents';

  @Input() label = 'item.page.tracks';

  lines: TrackLine[] = [];

  private readonly TIME_AT_START = /^\s*((?:\d{1,2}:)?\d{1,2}:\d{2})\s*(.*)$/;

  constructor(@Inject(DOCUMENT) private document: Document) {
  }

  ngOnChanges(): void {
    const values = this.item?.allMetadataValues(this.field) || [];
    this.lines = values
      .reduce((lines, value) => lines.concat(value.split(/\r?\n/)), [] as string[])
      .filter((line) => line.trim().length > 0)
      .map((line) => this.parseLine(line));
  }

  private parseLine(line: string): TrackLine {
    const match = line.match(this.TIME_AT_START);
    if (!match) {
      return { text: line.trim() };
    }
    const seconds = match[1].split(':').reduce((total, part) => total * 60 + Number(part), 0);
    return { time: match[1], seconds, text: match[2] };
  }

  /**
   * Seek the page's media player (see the theme's media-viewer-video component) and play from there
   */
  playFrom(seconds: number): void {
    const player = this.document.querySelector<HTMLMediaElement>('#singleAudio, #singleVideo');
    if (!player) {
      return;
    }
    // With preload="none" this also starts loading; the browser seeks once it can
    player.currentTime = seconds;
    player.play()?.catch(() => undefined);
    const rect = player.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > (this.document.defaultView?.innerHeight || 0)) {
      player.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

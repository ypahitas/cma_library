import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

/**
 * This component representing the `PageNotFound` DSpace page.
 */
@Component({
  selector: 'cma-curated-subjects',
  styleUrls: ['./cma-curated-subjects.component.scss'],
  templateUrl: './cma-curated-subjects.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
  ],
})
export class CMACuratedSubjectsComponent implements OnInit {

  public urlPrefix = '/browse/subject';
  public curatedSubjects;

  constructor() {
    //CMA hardcoded for now . Need to see how to expose via config
    this. curatedSubjects = [
      //{ keyword:'Interviews',translationKey:'cma.theme.intereviews',descriptionKey:'cma.theme.intereviews.desc', image:'assets/cma/images/' },
      //{ keyword:'Video',translationKey:'cma.theme.video',descriptionKey:'cma.theme.video.desc', image:'assets/cma/images/' },
      //{ keyword:'Audio',translationKey:'cma.theme.audio',descriptionKey:'cma.theme.audio.desc', image:'assets/cma/images/' },
      //{ keyword:'Photographs',translationKey:'cma.theme.photo',descriptionKey:'cma.theme.photo.desc', image:'assets/cma/images/' },
      { keyword:'Tsiattista', translationKey:'cma.theme.tsiattista',descriptionKey:'cma.theme.tsiattista.desc', image:'assets/cma/images/48.JPEG' } ,
      { keyword:'Fones', translationKey:'cma.theme.fones',descriptionKey:'cma.theme.fones.desc',image:'assets/cma/images/5.JPG' },
      { keyword:'Songs',translationKey:'cma.theme.songs', descriptionKey:'cma.theme.songs.desc', image:'assets/cma/images/24.JPG' } ,
      { keyword:'Wedding',translationKey:'cma.theme.wedding',descriptionKey:'cma.theme.wedding.desc', image:'assets/cma/images/49.jpeg' },
      { keyword:'Instrumental',translationKey:'cma.theme.instrumental',descriptionKey:'cma.theme.instrumental.desc', image:'assets/cma/images/26.JPG' },
      { keyword:'Dances',translationKey:'cma.theme.dances',descriptionKey:'cma.theme.dances.desc', image:'assets/cma/images/23.JPG' },
      { keyword:'Lute',translationKey:'cma.theme.lute',descriptionKey:'cma.theme.lute.desc', image:'assets/cma/images/22.JPG' },
      { keyword:'Violin',translationKey:'cma.theme.violin',descriptionKey:'cma.theme.violin.desc', image:'assets/cma/images/19.JPG' },
      { keyword:'Tampuchia',translationKey:'cma.theme.tampuchia',descriptionKey:'cma.theme.tampuchia.desc', image:'assets/cma/images/17.JPG' },
      { keyword:'Daul',translationKey:'cma.theme.daul',descriptionKey:'cma.theme.daul.desc', image:'assets/cma/images/32.jpeg' },
      { keyword:'Flute',translationKey:'cma.theme.flute',descriptionKey:'cma.theme.flute.desc', image:'assets/cma/images/50.JPG' },
    ];
  }

  ngOnInit() {
  }

}

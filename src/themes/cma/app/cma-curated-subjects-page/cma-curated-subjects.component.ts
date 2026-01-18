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
      { keyword:'Interviews',translationKey:'cma.theme.intereviews',descriptionKey:'cma.theme.intereviews.desc', image:'../../assets/images/' },
      { keyword:'Video',translationKey:'cma.theme.video',descriptionKey:'cma.theme.video.desc', image:'../../assets/images/' },
      { keyword:'Audio',translationKey:'cma.theme.audio',descriptionKey:'cma.theme.audio.desc', image:'../../assets/images/' },
      { keyword:'Photographs',translationKey:'cma.theme.photo',descriptionKey:'cma.theme.photo.desc', image:'../../assets/images/' },
      { keyword:'Tsiattista', translationKey:'cma.theme.tsiattista',descriptionKey:'cma.theme.tsiattista.desc', image:'../../assets/images/' } ,
      { keyword:'Fones', translationKey:'cma.theme.fones',descriptionKey:'cma.theme.fones.desc',image:'../../assets/images/' },
      { keyword:'Songs',translationKey:'cma.theme.songs', descriptionKey:'cma.theme.songs.desc', image:'../../assets/images/' } ,
      { keyword:'Wedding',translationKey:'cma.theme.wedding',descriptionKey:'cma.theme.wedding.desc', image:'../../assets/images/' },
      { keyword:'Instrumental',translationKey:'cma.theme.instrumental',descriptionKey:'cma.theme.instrumental.desc', image:'../../assets/images/' },
      { keyword:'Dances',translationKey:'cma.theme.dances',descriptionKey:'cma.theme.dances.desc', image:'../../assets/images/' },
      { keyword:'Lute',translationKey:'cma.theme.lute',descriptionKey:'cma.theme.lute.desc', image:'../../assets/images/' },
      { keyword:'Violin',translationKey:'cma.theme.violin',descriptionKey:'cma.theme.violin.desc', image:'../../assets/images/' },
      { keyword:'Tampuchia',translationKey:'cma.theme.tampuchia',descriptionKey:'cma.theme.tampuchia.desc', image:'../../assets/images/' },
      { keyword:'Daul',translationKey:'cma.theme.daul',descriptionKey:'cma.theme.daul.desc', image:'../../assets/images/' },
      { keyword:'Flute',translationKey:'cma.theme.flute',descriptionKey:'cma.theme.flute.desc', image:'../../assets/images/' },
    ];
  }

  ngOnInit() {
  }

}

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
      { keyword:'Instruments',translationKey:'cma.theme.instruments',descriptionKey:'cma.theme.instruments.desc', image:'../../assets/images/' },
      { keyword:'Songs',translationKey:'cma.theme.songs', descriptionKey:'cma.theme.songs.desc', image:'../../assets/images/' } ,
      { keyword:'Tsiattista', translationKey:'cma.theme.tsiattista',descriptionKey:'cma.theme.tsiattista.desc', image:'../../assets/images/' } ,
      { keyword:'Fones', translationKey:'cma.theme.fones',descriptionKey:'cma.theme.instruments.fones',image:'../../assets/images/' }, 
    ];
  }


  ngOnInit() {
  }

}

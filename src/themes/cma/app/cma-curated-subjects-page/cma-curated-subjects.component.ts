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

  public urlPrefix = '/browse/subject?value=';
  public curatedSubjects;

  constructor() {
    //CMA hardcoded for now . Need to see how to expose via config
    this. curatedSubjects = [
      { keyword:'Instruments',translationKey:'cma.theme.instruments' },
      { keyword:'Songs',translationKey:'cma.theme.songs' } ,
      { keyword:'Tsiattista', translationKey:'cma.theme.tsiattista' } ,
      { keyword:'Fones', translationKey:'cma.theme.fones' }, 
    ];
  }


  ngOnInit() {
  }

}

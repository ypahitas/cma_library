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
    RouterLink,
    TranslateModule,
  ],
})
export class CMACuratedSubjectsComponent implements OnInit {

  /**
   * Initialize instance variables
   *
   * @param {AuthService} authservice
   * @param {ServerResponseService} responseService
   */
  constructor() {
  }


  ngOnInit() {
  }

}

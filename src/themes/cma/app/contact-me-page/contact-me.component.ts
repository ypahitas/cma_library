import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Contact Me component for CMA theme.
 */
@Component({
  selector: 'cma-contact-me',
  styleUrls: ['./contact-me.component.scss'],
  templateUrl: './contact-me.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
  ],
})
export class CMAContactMeComponent {
  public email = 'cyprusmusicarchive@gmail.com';
}

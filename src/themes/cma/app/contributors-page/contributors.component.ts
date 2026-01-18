import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Contributors component for CMA theme.
 */
@Component({
  selector: 'cma-contributors',
  styleUrls: ['./contributors.component.scss'],
  templateUrl: './contributors.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
  ],
})
export class CMAContributorsComponent {
}

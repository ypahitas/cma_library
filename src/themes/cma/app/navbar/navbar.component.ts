import {
  AsyncPipe,
  NgClass,
  NgComponentOutlet,
} from '@angular/common';
import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MenuSection } from 'src/app/shared/menu/menu-section.model';
import { ThemedUserMenuComponent } from 'src/app/shared/auth-nav-menu/user-menu/themed-user-menu.component';

import { NavbarComponent as BaseComponent } from '../../../../app/navbar/navbar.component';
import { slideMobileNav } from '../../../../app/shared/animations/slide';

@Component({
  selector: 'ds-themed-navbar',
  styleUrls: ['./navbar.component.scss'],
  //styleUrls: ['../../../../app/navbar/navbar.component.scss'],
  templateUrl: './navbar.component.html',
  //templateUrl: '../../../../app/navbar/navbar.component.html',
  animations: [slideMobileNav],
  imports: [
    AsyncPipe,
    NgbDropdownModule,
    NgClass,
    NgComponentOutlet,
    ThemedUserMenuComponent,
    TranslateModule,
  ],
})
export class NavbarComponent extends BaseComponent {
  /** CMA: the menu shows only the stock "Statistics" entry of the dynamic public menu. */
  isStatisticsSection(section: MenuSection): boolean {
    const model = section.model;
    return !!model && 'text' in model && model.text === 'menu.section.statistics';
  }
}

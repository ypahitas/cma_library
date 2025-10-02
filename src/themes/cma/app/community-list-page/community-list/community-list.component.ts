import { CdkTreeModule } from '@angular/cdk/tree';
import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { CommunityListComponent as BaseComponent } from '../../../../../app/community-list-page/community-list/community-list.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { TruncatableComponent } from '../../../../../app/shared/truncatable/truncatable.component';
import { TruncatablePartComponent } from '../../../../../app/shared/truncatable/truncatable-part/truncatable-part.component';
import { CommunityListService } from 'src/app/community-list-page/community-list-service';
import { DSONameService } from 'src/app/core/breadcrumbs/dso-name.service';

@Component({
  selector: 'ds-themed-community-list',
  // styleUrls: ['./community-list.component.scss'],
  templateUrl: './community-list.component.html',
  //templateUrl: '../../../../../app/community-list-page/community-list/community-list.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    CdkTreeModule,
    RouterLink,
    ThemedLoadingComponent,
    TranslateModule,
    TruncatableComponent,
    TruncatablePartComponent,
  ],
})
export class CommunityListComponent extends BaseComponent {
  constructor(
    protected communityListService: CommunityListService,
    public dsoNameService: DSONameService,
  ) {
    //call parent constructor
    super(communityListService,dsoNameService);
    //change items per page to remove limitations
    this.paginationConfig.elementsPerPage = 200;
  }
}

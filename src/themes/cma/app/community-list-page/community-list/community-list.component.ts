import { CdkTreeModule } from '@angular/cdk/tree';
import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommunityListService } from 'src/app/community-list-page/community-list-service';
import { DSONameService } from 'src/app/core/breadcrumbs/dso-name.service';

import { CommunityListComponent as BaseComponent } from '../../../../../app/community-list-page/community-list/community-list.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { TruncatableComponent } from '../../../../../app/shared/truncatable/truncatable.component';
import { TruncatablePartComponent } from '../../../../../app/shared/truncatable/truncatable-part/truncatable-part.component';
import { CollectionDataCMAService } from '../collection-data-cma.service';
import { Observable } from 'rxjs/internal/Observable';
import { Collection } from 'src/app/core/shared/collection.model';

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
  protected collectionList: Collection[];


  constructor(
    protected communityListService: CommunityListService,
    protected collectionDataCMAService: CollectionDataCMAService,
    public dsoNameService: DSONameService,
  ) {
    //call parent constructor
    super(communityListService,dsoNameService);
    //change items per page to remove limitations
    this.paginationConfig.elementsPerPage = 200;
  }

  ngOnInit(){
    super.ngOnInit();
    this.collectionDataCMAService.getCollections().subscribe(response => {
      if (this.collectionDataCMAService.checkResponseIntegrity(response)){
        const collectionsString = this.collectionDataCMAService.getNested(response,['_embedded','collections']);
        this.collectionList = collectionsString as Collection[];
      }
    });
  }



}

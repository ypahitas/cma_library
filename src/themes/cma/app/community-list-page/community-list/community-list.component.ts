import { CdkTreeModule } from '@angular/cdk/tree';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs/internal/Observable';
import { CommunityListService } from 'src/app/community-list-page/community-list-service';
import { FlatNode } from 'src/app/community-list-page/flat-node.model';
import { DSONameService } from 'src/app/core/breadcrumbs/dso-name.service';
import { ComcolPageLogoComponent } from 'src/app/shared/comcol/comcol-page-logo/comcol-page-logo.component';

import { CommunityListComponent as BaseComponent } from '../../../../../app/community-list-page/community-list/community-list.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { TruncatableComponent } from '../../../../../app/shared/truncatable/truncatable.component';
import { TruncatablePartComponent } from '../../../../../app/shared/truncatable/truncatable-part/truncatable-part.component';
import { Collection } from 'src/app/core/shared/collection.model';
import { Bitstream } from 'src/app/core/shared/bitstream.model';
import { HALEndpointService } from 'src/app/core/shared/hal-endpoint.service';

@Component({
  selector: 'ds-themed-community-list',
  styleUrls: ['./community-list.component.scss'],
  templateUrl: './community-list.component.html',
  //templateUrl: '../../../../../app/community-list-page/community-list/community-list.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    CdkTreeModule,
    ComcolPageLogoComponent,
    NgFor,
    NgIf,
    RouterLink,
    ThemedLoadingComponent,
    TranslateModule,
    TruncatableComponent,
    TruncatablePartComponent,
  ],
})
export class CommunityListComponent extends BaseComponent {
  communityList$: Observable<FlatNode[]>;
  communityListArray: FlatNode[];
  collectionTemp: Collection;

  constructor(
    protected http: HttpClient,
    protected communityListService: CommunityListService,
    public dsoNameService: DSONameService,
    protected halService: HALEndpointService,
    private cd: ChangeDetectorRef,
  ) {
    //call parent constructor
    super(communityListService,dsoNameService);
    //change items per page to remove limitations
    this.paginationConfig.elementsPerPage = 200;
  }

  ngOnInit(){
    super.ngOnInit();
    //connect to the data to get an observable
    this.communityList$ =  this.dataSource.connect(null);
    this.communityList$.subscribe(response => {
      //If it's empty toggle it once to fetch children - dSpace tree structure workaround
      if (response.length > 0){
        if (!this.communityListArray) {
          //save the value so that we don't go in this if again
          this.communityListArray = response;
          this.toggleExpanded(this.communityListArray[0]);
        } else {
          //now we got our full list for the first community. CMA will only be 1 community with many collections
          this.communityListArray = response;
          //trigger UI for update
          this.cd.markForCheck();
          //Now get their logos. CMA work around
          for (const communityUncasted of this.communityListArray) {
            if (communityUncasted.payload instanceof Collection){
              const collection: Collection = communityUncasted.payload as Collection;
              this.getCollectionLogo(collection);
              this.getNumberOfItemsInCollection(collection);
            }
          }
        }
      }
    });
  }

  //CMA - dspace image handling is not easy so did my own
  getCollectionLogo(collection: Collection){
    const logoInfoURL = collection._links.logo.href;
    if (logoInfoURL){
      this.http.get<Bitstream>(logoInfoURL).subscribe(response => {
        if (response){
          //getting image via collection id and updating it's source
          const imgElement = document.getElementById(collection.id) as HTMLImageElement | null;
          if (imgElement) {
            imgElement.src = response._links.content.href;
          }
          //update UI
          this.cd.markForCheck();
        }
      });
    }
  }
  //hacky way to get number of items in Collection
  getNumberOfItemsInCollection(collection: Collection) {
    //sample URL "href" : "http://localhost:8080/server/api/discover/search/objects?scope=1d6be871-990f-4af7-a50a-68ac1eb12c04&configuration=collection"
    const path = '/discover';
    this.halService.getEndpoint(path).subscribe(urlPrefix => {
      urlPrefix += '/search/objects?configuration=collection&scope=';
      const url = urlPrefix.concat(collection.id);
      this.http.get<any>(url).subscribe(response => {
        //Get it from the JSON response structure
        const totalElements = response._embedded?.searchResult?.page?.totalElements;
        collection.archivedItemsCount = totalElements;
        //Hacky way to update screen
        //TODO figure out a way to show value on screen
        //update UI
        this.cd.markForCheck();
      });
    }) ;
  }
}

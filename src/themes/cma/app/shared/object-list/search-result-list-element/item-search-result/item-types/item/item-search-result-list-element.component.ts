import {
  AsyncPipe,
  NgClass,
} from '@angular/common';
import { Component, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Context } from '../../../../../../../../../app/core/shared/context.model';
import { ViewMode } from '../../../../../../../../../app/core/shared/view-mode.model';
import { ThemedBadgesComponent } from '../../../../../../../../../app/shared/object-collection/shared/badges/themed-badges.component';
import { ItemSearchResult } from '@dspace/core/shared/object-collection/item-search-result.model';
import { MetadataDirective } from '../../../../../../../../../app/shared/metadata.directive';
import { listableObjectComponent } from '../../../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { ItemSearchResultListElementComponent as BaseComponent } from '../../../../../../../../../app/shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component';
import { TruncatableComponent } from '../../../../../../../../../app/shared/truncatable/truncatable.component';
import { TruncatablePartComponent } from '../../../../../../../../../app/shared/truncatable/truncatable-part/truncatable-part.component';
import { ThemedThumbnailComponent } from '../../../../../../../../../app/thumbnail/themed-thumbnail.component';
import { MetadataValue } from 'src/app/core/shared/metadata.models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TruncatableService } from 'src/app/shared/truncatable/truncatable.service';
import { DSONameService } from 'src/app/core/breadcrumbs/dso-name.service';
import { APP_CONFIG, AppConfig } from 'src/config/app-config.interface';

@listableObjectComponent('PublicationSearchResult', ViewMode.ListElement, Context.Any, 'cma')
@listableObjectComponent(ItemSearchResult, ViewMode.ListElement, Context.Any, 'cma')
@Component({
  selector: 'ds-item-search-result-list-element',
  // styleUrls: ['./item-search-result-list-element.component.scss'],
  styleUrls: ['../../../../../../../../../app/shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component.scss'],
  templateUrl: './item-search-result-list-element.component.html',
  // templateUrl: '../../../../../../../../../app/shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component.html',
  standalone: true,
  imports: [
    MetadataDirective,
    AsyncPipe,
    NgClass,
    RouterLink,
    ThemedBadgesComponent,
    ThemedThumbnailComponent,
    TruncatableComponent,
    TruncatablePartComponent,
    TranslateModule,
  ],
})
export class ItemSearchResultListElementComponent extends BaseComponent {
  private currentLang: string;

  constructor(private truncatableServiceBase: TruncatableService,
                     private dsoNameServiceBase: DSONameService,
                     private translate: TranslateService,
                     @Inject(APP_CONFIG) protected appConfigBase?: AppConfig) {
    super(truncatableServiceBase,dsoNameServiceBase,appConfigBase);
    // Get current language
    this.currentLang = this.translate.currentLang || this.translate.getDefaultLang();
  }

  ngOnInit(): void {
    super.ngOnInit();
    // Get current language
    this.dsoTitle = this.getTranslatedTitle();
  }

  //CMA code because it seems dspace angular is ignoring metadata language codes
  //Dspace needs to add it in the dsoName service method GetHighlights? or getname
  public getTranslatedTitle(): MetadataValue {
    const defaultName =  this.dsoTitle;
    if (this.object.indexableObject){
      const allTitles: MetadataValue[] = this.object.indexableObject.allMetadata('dc.title');
      for (const metaDataValueItem of allTitles){
        if (metaDataValueItem.language === this.currentLang){
          return metaDataValueItem;
        }
      }
    }
    return defaultName;
  }

  // Translating Author/Interviewee names
  //call base function for it to do it's processing and filter out
  public getTranslatedAuthors(){
    const allAuthors = this.allMetadataValues(['dc.contributor.author', 'dc.creator', 'dc.contributor.*']);
    const allAuthorsArray: MetadataValue[] = this.object.indexableObject.allMetadata('dc.contributor.author');
    let translatedAuthorArray: string[] = [];

    if (this.object.indexableObject){
      //Go through all the untranslated ones as prepared by the base component and only use the ones of the user's language
      for (const metaDataValueItem of allAuthorsArray){
        if (metaDataValueItem.language === this.currentLang){
          for (const untranslatedAuthor of allAuthors){
            if (metaDataValueItem.value === untranslatedAuthor){
              translatedAuthorArray.push(untranslatedAuthor);
              break;
            }
          }
        }
      }
      //return the filtered ones based on lang
      if (translatedAuthorArray.length === 0){
        translatedAuthorArray = allAuthors;
      }
      return translatedAuthorArray;
    }
    //If we reached this point return the original data
    return allAuthors;
  }

}

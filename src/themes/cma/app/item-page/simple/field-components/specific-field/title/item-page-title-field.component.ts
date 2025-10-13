import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ItemPageTitleFieldComponent as BaseComponent } from '../../../../../../../../app/item-page/simple/field-components/specific-field/title/item-page-title-field.component';
import { DSONameService } from 'src/app/core/breadcrumbs/dso-name.service';
import { MetadataValue } from 'src/app/core/shared/metadata.models';

@Component({
  selector: 'ds-themed-item-page-title-field',
  templateUrl: './item-page-title-field.component.html',
  // templateUrl: '../../../../../../../../app/item-page/simple/field-components/specific-field/title/item-page-title-field.component.html',
  standalone: true,
  imports: [
    TranslateModule,
  ],
})
export class ItemPageTitleFieldComponent extends BaseComponent {
  private currentLang: string;


  constructor(private translate: TranslateService,public dsoNameServiceSuper: DSONameService) {
    super(dsoNameServiceSuper);
    // Get current language
    this.currentLang = this.translate.currentLang || this.translate.getDefaultLang();
  }

  //CMA code because it seems dspace angular is ignoring metadata language codes
  public getTranslatedTitle(){
    const defaultName: string = this.dsoNameService.getName(this.item);
    if (this.item){
      const allTitles: MetadataValue[] = this.item.allMetadata('dc.title');
      for (const metaDataValueItem of allTitles){
        if (metaDataValueItem.language === this.currentLang){
          return metaDataValueItem.value;
        }
      }
    }
    return defaultName;
  }

}

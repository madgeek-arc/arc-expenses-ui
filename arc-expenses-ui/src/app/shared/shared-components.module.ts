import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsideHelpContentComponent, HelpContentComponent } from './help-content/help-content.component';
import { ReadMoreComponent } from './read-more/read-more.component';
import { FilterByTerm } from './search-term.pipe';
import { AnchorDirective } from './dynamic-loader-anchor-components/anchor.directive';
import { FormFieldComponent, FormUploadFileComponent, FormUploadFilesComponent } from './form-wrappers/form-wrappers.component';

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        HelpContentComponent,
        AsideHelpContentComponent,
        ReadMoreComponent,
        AnchorDirective,
        FilterByTerm,
        FormFieldComponent,
        FormUploadFileComponent,
        FormUploadFilesComponent
    ],
    exports: [
        HelpContentComponent,
        AsideHelpContentComponent,
        ReadMoreComponent,
        AnchorDirective,
        FilterByTerm,
        FormFieldComponent,
        FormUploadFileComponent,
        FormUploadFilesComponent
    ]
})
export class SharedComponentsModule {}

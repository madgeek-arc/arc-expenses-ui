import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsideHelpContentComponent, HelpContentComponent } from './help-content/help-content.component';
import { ReadMoreComponent } from './read-more/read-more.component';
import { Stage1FormComponent } from '../request-stage/stage1-form/stage1-form.component';
import { FilterByTerm } from './search-term.pipe';
import { AnchorDirective } from './dynamic-loader-anchor-components/anchor.directive';

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        HelpContentComponent,
        AsideHelpContentComponent,
        ReadMoreComponent,
        AnchorDirective,
        FilterByTerm
    ],
    exports: [
        HelpContentComponent,
        AsideHelpContentComponent,
        ReadMoreComponent,
        AnchorDirective,
        FilterByTerm
    ]
})
export class SharedComponentsModule {}

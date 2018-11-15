import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { AdminPageComponent } from './admin-page.component';
import { EditResourcesComponent } from './edit-resources-forms/edit-resources.components';
import { EditInstituteComponent } from './edit-resources-forms/edit-institute.component';
import { EditOrganizationComponent } from './edit-resources-forms/edit-organization.component';
import { EditProjectComponent } from './edit-resources-forms/edit-project.component';
import { ResourcesLoaderComponent } from './resources-dynamic-load/resources-loader.component';
import { EditPoiComponent } from './edit-resources-forms/edit-poi.component';
import { EditDelegateComponent } from './edit-resources-forms/edit-delegate.component';

@NgModule({
    declarations: [
        AdminPageComponent,
        EditResourcesComponent,
        EditProjectComponent,
        EditInstituteComponent,
        EditOrganizationComponent,
        EditPoiComponent,
        EditDelegateComponent,
        ResourcesLoaderComponent
    ],
    imports: [
        CommonModule,
        AdminRoutingModule,
        ReactiveFormsModule,
        SharedComponentsModule
    ],
    entryComponents: [
        EditResourcesComponent,
        EditProjectComponent,
        EditInstituteComponent,
        EditOrganizationComponent,
        EditPoiComponent,
        EditDelegateComponent
    ]
})
export class AdminModule {}

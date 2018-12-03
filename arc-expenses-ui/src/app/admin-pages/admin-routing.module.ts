import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from './admin-page.component';
import { AdminEditResourcePageComponent } from './admin-edit-resource-page.component';

const adminRoutes: Routes = [
    {
        path: '',
        component: AdminPageComponent,
    },
    {
        path: 'add',
        component: AdminEditResourcePageComponent
    },
    {
        path: 'edit/:resourceId',
        component: AdminEditResourcePageComponent
    }
];

@NgModule ({
    imports: [RouterModule.forChild(adminRoutes)],
    exports: [RouterModule]
})

export class AdminRoutingModule {}

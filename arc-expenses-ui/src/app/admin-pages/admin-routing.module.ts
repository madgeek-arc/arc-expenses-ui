import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from './admin-page.component';

const adminRoutes: Routes = [
    {
        path: '',
        component: AdminPageComponent,
        children: [
            {
                path: 'add-resource/:type'
            },
            {
                path: 'edit-resource/:type/:resourceId'
            }
        ]
    }
];

@NgModule ({
    imports: [RouterModule.forChild(adminRoutes)],
    exports: [RouterModule]
})

export class AdminRoutingModule {}

import { Component, OnInit } from '@angular/core';
import { AnchorItem } from '../shared/dynamic-loader-anchor-components/anchor-item';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectsListComponent } from './resources-lists/projects-list.component';
import { InstitutesListComponent } from './resources-lists/institutes-list.component';
import { OrganizationsListComponent } from './resources-lists/organizations-list.component';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html'
})
export class AdminPageComponent implements OnInit {
    errorMessage: string;
    showSpinner: boolean;

    title = 'Εγγραφές';
    addNewButtonLabel = 'Προσθήκη εγγραφής';
    resourceType: string;
    resource: any;

    constructor(private route: ActivatedRoute, private router: Router) {}

    ngOnInit() {
        if (this.route.snapshot.paramMap.has('type')) {
            this.resourceType = this.route.snapshot.paramMap.get('type');
            this.showResourceListComponent();
        }
    }

    showResourceListComponent() {
        if (this.resourceType === 'projects') {
            this.title = 'Έργα';
            this.addNewButtonLabel = 'Προσθήκη έργου';
            this.resource = new AnchorItem(ProjectsListComponent);
        } else if (this.resourceType === 'institutes') {
            this.title = 'Ινστιτούτα/Μονάδες';
            this.addNewButtonLabel = 'Προσθήκη ινστιτούτου/μονάδας';
            this.resource = new AnchorItem(InstitutesListComponent);
        } else if (this.resourceType === 'organizations') {
            this.title = 'Οργανισμοί';
            this.addNewButtonLabel = 'Προσθήκη οργανισμού';
            this.resource = new AnchorItem(OrganizationsListComponent);
        } else {
            this.router.navigate(['/home']);
        }
    }

}

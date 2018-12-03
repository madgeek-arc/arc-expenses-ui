import { Component, OnInit } from '@angular/core';
import { ManageResourcesService } from '../../services/manage-resources.service';
import { Organization } from '../../domain/operation';

@Component({
    selector: 'app-organizations-list',
    templateUrl: './organizations-list.component.html'
})
export class OrganizationsListComponent implements OnInit {
    errorMessage: string;
    showSpinner: boolean;
    organizations: Organization[] = [];

    constructor(private resourcesService: ManageResourcesService) {}

    ngOnInit() {
        this.getOrganizations();
    }

    getOrganizations() {
        this.errorMessage = '';
        this.showSpinner = true;
        this.resourcesService.getAllOrganizations().subscribe(
            orgs => {
                if (orgs.results) {
                    this.organizations = orgs.results;
                }
                this.errorMessage = '';
                this.showSpinner = false;
            },
            er => {
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα με την ανάκτηση των απαραίτητων πληροφοριών.';
                this.showSpinner = false;
                console.log(er);
            }
        );
    }
}

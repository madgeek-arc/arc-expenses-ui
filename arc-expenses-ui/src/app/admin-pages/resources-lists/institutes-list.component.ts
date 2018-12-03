import { Component, OnInit } from '@angular/core';
import { ManageResourcesService } from '../../services/manage-resources.service';
import { Institute } from '../../domain/operation';

@Component({
    selector: 'app-institutes-list',
    templateUrl: './institutes-list.component.html'
})
export class InstitutesListComponent implements OnInit {
    showSpinner: boolean;
    errorMessage: string;
    institutes: Institute[] = [];

    constructor(private resourcesService: ManageResourcesService) {}

    ngOnInit() {
        this.getInstitutes();
    }

    getInstitutes() {
        this.errorMessage = '';
        this.showSpinner = true;
        this.resourcesService.getAllInstitutes().subscribe(
            insts => {
                if (insts.results) {
                    this.institutes = insts.results;
                }
                this.errorMessage = '';
                this.showSpinner = false;
            },
            er => {
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα με την ανάκτηση των πληροφοριών.';
                this.showSpinner = false;
                console.log(er);
            }
        );
    }
}

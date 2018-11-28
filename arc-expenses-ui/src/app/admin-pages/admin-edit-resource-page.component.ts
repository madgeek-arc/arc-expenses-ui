import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Executive, Institute, Organization } from '../domain/operation';
import { AnchorItem } from '../shared/dynamic-loader-anchor-components/anchor-item';
import { EditProjectComponent } from './edit-resources-forms/edit-project.component';
import { ResourcesLoaderComponent } from './resources-dynamic-load/resources-loader.component';
import { EditInstituteComponent } from './edit-resources-forms/edit-institute.component';
import { EditOrganizationComponent } from './edit-resources-forms/edit-organization.component';
import { ManageProjectService } from '../services/manage-project.service';
import { ManageResourcesService } from '../services/manage-resources.service';
import { concatMap, tap } from 'rxjs/operators';

@Component({
    selector: 'app-admin-edit-resource',
    templateUrl: './admin-edit-resource-page.component.html'
})
export class AdminEditResourcePageComponent implements OnInit {
    errorMessage: string;
    showSpinner: boolean;

    title = 'Επεξεργασία εγγραφής';

    resourceType: string;
    resourceId: string;
    organizations: Organization[] = [];
    institutes: Institute[] = [];
    executives: Executive[] = [];
    currentResource: any;

    resource: any;

    @ViewChild('editResourceForm') editResourceForm: ResourcesLoaderComponent;

    constructor(private route: ActivatedRoute,
                private projectService: ManageProjectService,
                private resourcesService: ManageResourcesService) {}

    ngOnInit() {
        this.getDataLists();

        if (this.route.snapshot.paramMap.has('type')) {
            this.resourceType = this.route.snapshot.paramMap.get('type');
        }
        /* TODO: REMOVE WHEN getDataLists is activated */
        /*this.resourcesService.getAllExecutives().subscribe(
            res => this.executives = res,
            er => {
                console.log(er);
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα με την ανάκτηση των απαραίτητων πληροφοριών';
                this.showSpinner = false;
            },
            () => {
                this.showSpinner = false;
                if (this.resourceType) {
                    this.getCurrentResource();
                }
            }
        );*/
    }

    getCurrentResource() {
        if (this.route.snapshot.paramMap.has('resourceId')) {

            this.resourceId = this.route.snapshot.paramMap.get('resourceId');
        }

        this.createChildComponent();
    }

    createChildComponent() {
        if (this.resourceType === 'projects') {
            if (this.resourceId) {
                this.title = 'Επεξεργασία έργου';
                this.getProjectById();
            } else {
                this.title = 'Προσθήκη έργου';
                this.resource = new AnchorItem (
                    EditProjectComponent, [this.executives, this.institutes] );
            }
        } else if (this.resourceType === 'institutes') {
            if (this.resourceId) {
                this.title = 'Επεξεργασία ινστιτούτου/μονάδας';
                this.getInstituteById();
            } else {
                this.title = 'Προσθήκη ινστιτούτου/μονάδας';
                this.resource = new AnchorItem (
                    EditInstituteComponent, [this.executives, this.organizations] );
            }
        } else if (this.resourceType === 'organizations') {
            if (this.resourceId) {
                this.title = 'Επεξεργασία οργανισμού';
                this.getOrganizationById();
            } else {
                this.title = 'Προσθήκη οργανισμού';
                this.resource = new AnchorItem (
                    EditOrganizationComponent, [this.executives] );
            }
        }
    }

    getProjectById() {
        this.errorMessage = '';
        this.showSpinner = true;
        this.projectService.getProjectById(this.resourceId).subscribe(
            proj => {
                this.currentResource = proj;
                this.resource = new AnchorItem (EditProjectComponent, [this.executives, this.institutes, this.currentResource]);
                this.showSpinner = false;
            },
            er => {
                console.log(er);
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την ανάκτηση των πληροφοριών για το έργο';
                this.showSpinner = false;
            }
        );
    }

    getInstituteById() {
        this.errorMessage = '';
        this.showSpinner = true;
        this.resourcesService.getInstituteById(this.resourceId).subscribe(
            inst => {
                this.currentResource = inst;
                this.resource = new AnchorItem (EditProjectComponent, [this.executives, this.organizations, this.currentResource]);
                this.showSpinner = false;
            },
            er => {
                console.log(er);
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την ανάκτηση των πληροφοριών για το ινστιτούτο/μονάδα';
                this.showSpinner = false;
            }
        );
    }

    getOrganizationById() {
        this.errorMessage = '';
        this.showSpinner = true;
        this.resourcesService.getOrganizationById(this.resourceId).subscribe(
            org => {
                this.currentResource = org;
                this.resource = new AnchorItem (EditProjectComponent, [this.executives, this.currentResource]);
                this.showSpinner = false;
            },
            er => {
                console.log(er);
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την ανάκτηση των πληροφοριών για τον οργανισμό';
                this.showSpinner = false;
            }
        );
    }

    getDataLists() {
        this.errorMessage = '';
        this.showSpinner = true;
        this.resourcesService.getAllInstitutes().pipe(
            tap(res => this.institutes = res),
            concatMap(() => this.resourcesService.getAllOrganizations().pipe(
                tap(res => this.organizations = res),
                concatMap(() => this.resourcesService.getAllExecutives())
            ))
        ).subscribe(
            res => this.executives = res,
            er => {
                console.log(er);
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα με την ανάκτηση των απαραίτητων πληροφοριών';
                this.showSpinner = false;
            },
            () => {
                this.showSpinner = false;
                if ( (this.resourceType !== undefined) &&
                    (this.resourceType !== null) ) {

                    this.getCurrentResource();
                }
            }
        );
    }

}

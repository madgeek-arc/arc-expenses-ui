import { Component, OnInit, ViewChild } from '@angular/core';
import { ResourcesLoaderComponent } from './resources-dynamic-load/resources-loader.component';
import { AnchorItem } from '../shared/dynamic-loader-anchor-components/anchor-item';
import { ManageProjectService } from '../services/manage-project.service';
import { delegates, institutes, organizations, pois, project } from '../domain/mock_data';
import { EditProjectComponent } from './edit-resources-forms/edit-project.component';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html'
})
export class AdminPageComponent implements OnInit {
    title = 'Επεξεργασία/Προσθήκη εγγραφών στην βάση';
    selectedResourceType = 'project';
    resource: any;

    currentProject = project;
    pois = pois;
    delegates = delegates;
    organizations = organizations;
    institutes = institutes;

    constructor(projectService: ManageProjectService) {}

    ngOnInit() {
        this.resource = new AnchorItem(
            EditProjectComponent, [this.currentProject, this.delegates, this.pois, this.organizations, this.institutes] );
    }

    selectType(resourceType: string) {
        this.selectedResourceType = resourceType;
    }

    getProjects() {}

    getInstitutes() {}

    getOrganizations() {}

    addProject() {}

    updateProject() {}

    addInstitute() {}

    updateInstitute() {}

    addOrganization() {}

    updateOrganization() {}
}

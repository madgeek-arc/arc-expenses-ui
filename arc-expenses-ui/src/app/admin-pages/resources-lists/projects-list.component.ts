import { Component, OnInit } from '@angular/core';
import { Vocabulary } from '../../domain/operation';
import { ManageProjectService } from '../../services/manage-project.service';

@Component({
    selector: 'app-projects-list',
    templateUrl: './projects-list.component.html'
})
export class ProjectsListComponent implements OnInit {
    errorMessage: string;
    showSpinner: boolean;
    projects: Vocabulary[] = [];

    itemsPerPage = 10;
    currentPage = 0;
    totalPages = 0;

    constructor(private projectService: ManageProjectService) {}

    ngOnInit() {
        this.getProjects();
    }

    getProjects() {
        this.projects = [];
        this.errorMessage = '';
        this.showSpinner = true;
        const currentOffset = this.currentPage * this.itemsPerPage;
        this.projectService.getAllProjectsNames().subscribe(
            projs => {
                this.projects = projs;
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

    goToPreviousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
        }
    }

    goToNextPage() {
        if ( (this.currentPage + 1) < this.totalPages) {
            this.currentPage++;
        }
    }

    getItemsPerPage(event: any) {
        this.itemsPerPage = event.target.value;
        this.currentPage = 0;
        this.getProjects();
    }
}

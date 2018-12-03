import { Component, OnInit } from '@angular/core';
import { Project, Vocabulary } from '../../domain/operation';
import { ManageProjectService } from '../../services/manage-project.service';
import { SearchResults } from '../../domain/extraClasses';

@Component({
    selector: 'app-projects-list',
    templateUrl: './projects-list.component.html'
})
export class ProjectsListComponent implements OnInit {
    errorMessage: string;
    showSpinner: boolean;
    searchResults: SearchResults<Project>;
    projects: Project[] = [];

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
        this.projectService.getAllProjects(currentOffset, this.itemsPerPage).subscribe(
            projs => {
                this.searchResults = projs;
                if (projs.results) {
                    this.projects = projs.results;
                    this.totalPages = Math.ceil(this.searchResults.total / this.itemsPerPage);
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

    goToPreviousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.getProjects();
        }
    }

    goToNextPage() {
        if ( (this.currentPage + 1) < this.totalPages) {
            this.currentPage++;
            this.getProjects();
        }
    }

    getItemsPerPage(event: any) {
        this.itemsPerPage = event.target.value;
        this.currentPage = 0;
        this.getProjects();
    }
}

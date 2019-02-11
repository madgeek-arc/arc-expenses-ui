import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Request, Project, User, Vocabulary } from '../domain/operation';
import { ManageRequestsService } from '../services/manage-requests.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { DatePipe } from '@angular/common';
import { ManageProjectService } from '../services/manage-project.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { requesterPositions, requestTypes, supplierSelectionMethodsMap } from '../domain/stageDescriptions';

@Component({
    selector: 'app-new-request',
    templateUrl: './new-request.component.html',
    styleUrls: ['./new-request.component.scss']
})
export class NewRequestComponent implements OnInit {

    errorMessage: string;
    showSpinner: boolean;

    requestType: string;
    reqTypes = requestTypes;
    readonly amountLimit = 20000;
    readonly lowAmountLimit = 2500;
    isSupplierRequired = '';

    currentUser: User;

    newRequestForm: FormGroup;

    uploadedFiles: File[];

    requestedAmount: string;
    showWarning: boolean;
    searchTerm = '';

    projects: Vocabulary[] = [];
    chosenProgramID: string;

    chosenProject: Project;

    selMethods = supplierSelectionMethodsMap;
    reqPositions = requesterPositions;

    programSelected = false;
    isRequestOnBehalfOfOther = false;

    title = 'Δημιουργία νέου αιτήματος';

    datePipe = new DatePipe('el');

    constructor(private fb: FormBuilder,
                private requestService: ManageRequestsService,
                private projectService: ManageProjectService,
                private authService: AuthenticationService,
                private router: Router,
                private route: ActivatedRoute) {}


    ngOnInit() {
        console.log('in new-request, request type is:', this.route.snapshot.url[this.route.snapshot.url.length - 1].path );
        this.requestType = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
        this.requestType = this.requestType.toUpperCase();
        this.getUserInfo();
        this.getProjects();
    }

    getUserInfo() {
        this.currentUser = new User();
        this.currentUser.id = this.authService.getUserProp('id');
        this.currentUser.email = this.authService.getUserProp('email');
        this.currentUser.firstname = this.authService.getUserProp('firstname');
        this.currentUser.lastname = this.authService.getUserProp('lastname');
        this.currentUser.firstnameLatin = this.authService.getUserProp('firstnameLatin');
        this.currentUser.lastnameLatin = this.authService.getUserProp('lastnameLatin');
        console.log('this.currentUser is: ', this.currentUser);

        console.log('current type is:', this.requestType);
        this.title = this.reqTypes[this.requestType];
        this.createForm();
        if ( this.requestType === 'REGULAR') {
            this.isSupplierRequired = '(*)';
        }

    }

    getProjects() {
        this.showSpinner = true;
        this.errorMessage = '';
        this.projects = [];
        this.projectService.getAllProjectsNames().subscribe (
            projects => {
                this.projects = projects;
                console.log(this.projects);
            },
            error => {
                console.log(error);
                this.showSpinner = false;
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα με την ανάκτηση των απαραίτητων πληροφοριών.';
            },
            () => {
                this.showSpinner = false;
                this.errorMessage = '';
                if ( ((this.projects === null) || (this.projects === undefined)) ||
                     (this.projects.length === 0)) {
                    this.errorMessage = 'Παρουσιάστηκε πρόβλημα με την ανάκτηση των απαραίτητων πληροφοριών.';
                }
            }
        );
    }

    createForm() {
        this.newRequestForm = this.fb.group({
            name: [''],
            program: ['', Validators.required],
            institute: [''],
            position: ['', Validators.required],
            requestText: ['', Validators.required],
            supplier: [''],
            supplierSelectionMethod: [''],
            trip_firstname: [''],
            trip_lastname: [''],
            trip_email: [''],
            trip_destination: [''],
            amount: ['', [Validators.required, Validators.min(0), Validators.pattern('^\\d+(\\.\\d{1,2})?$')] ],
            sciCoord: ['']
        });
        this.newRequestForm.get('name').setValue(`${this.currentUser.firstname} ${this.currentUser.lastname}`);
        this.newRequestForm.get('name').disable();

        if (this.requestType === 'TRIP') {
            this.newRequestForm.get('trip_firstname').setValidators([Validators.required]);
            this.newRequestForm.get('trip_lastname').setValidators([Validators.required]);
            this.newRequestForm.get('trip_email').setValidators([Validators.required]);
            this.newRequestForm.get('trip_destination').setValidators([Validators.required]);
            this.newRequestForm.updateValueAndValidity();
        }
    }

    submitRequest() {
        this.errorMessage = '';
        if ((this.requestType === 'TRIP') && !this.isRequestOnBehalfOfOther) {
            this.newRequestForm.get('trip_firstname').clearValidators();
            this.newRequestForm.get('trip_lastname').clearValidators();
            this.newRequestForm.get('trip_email').clearValidators();
            this.newRequestForm.updateValueAndValidity();
        }

        if (this.newRequestForm.valid ) {
            if ( (+this.newRequestForm.get('amount').value > this.lowAmountLimit) &&
                 (+this.newRequestForm.get('amount').value <= this.amountLimit) &&
                 ( this.newRequestForm.get('supplierSelectionMethod').value === 'DIRECT' ) ) {

                this.errorMessage = 'Για αιτήματα άνω των 2.500 € η επιλογή προμηθευτή γίνεται μέσω διαγωνισμού ή έρευνας αγοράς.';

            } else if ( ( +this.newRequestForm.get('amount').value > this.amountLimit) && this.checkIfTrip() &&
                        ( this.newRequestForm.get('supplierSelectionMethod').value !== 'AWARD_PROCEDURE' ) ) {

                this.errorMessage = 'Για ποσά άνω των 20.000 € οι αναθέσεις πρέπει να γίνονται μέσω διαγωνισμού.';

            } else if ( this.checkIfTrip() &&
                        ( (this.newRequestForm.get('supplierSelectionMethod').value !== 'AWARD_PROCEDURE') &&
                          !this.newRequestForm.get('supplier').value )) {

                this.errorMessage = 'Τα πεδία που σημειώνονται με (*) είναι υποχρεωτικά.';

            } else if ( (( this.newRequestForm.get('supplierSelectionMethod').value !== 'DIRECT' ) &&
                           this.checkIfTrip() ) && (!this.uploadedFiles) ) {

                this.errorMessage = 'Για αναθέσεις μέσω διαγωνισμού ή έρευνας αγοράς η επισύναψη εγγράφων είναι υποχρεωτική.';

            } else if ( (this.requestType !== 'SERVICES_CONTRACT') &&
                        (+this.newRequestForm.get('amount').value > this.lowAmountLimit) &&
                        (this.uploadedFiles == null) ) {

                this.errorMessage = 'Για αιτήματα άνω των 2.500 € η επισύναψη εγγράφων είναι υποχρεωτική.';

            } else {
                const newRequest = new FormData();
                newRequest.append('type', this.requestType);
                newRequest.append('projectId', this.chosenProgramID);
                newRequest.append('requester_position', this.newRequestForm.get('position').value);
                newRequest.append('subject', this.newRequestForm.get('requestText').value);
                if ( this.checkIfTrip() ) {
                    newRequest.append('supplier', this.newRequestForm.get('supplier').value);
                    newRequest.append('supplier_selection_method', this.newRequestForm.get('supplierSelectionMethod').value);
                }
                newRequest.append('amount', this.newRequestForm.get('amount').value);

                if (this.requestType === 'TRIP') {
                    newRequest.append('destination', this.newRequestForm.get('trip_destination').value);
                    if (this.isRequestOnBehalfOfOther) {
                        newRequest.append('firstName', this.newRequestForm.get('trip_firstname').value);
                        newRequest.append('lastName', this.newRequestForm.get('trip_lastname').value);
                        newRequest.append('email', this.newRequestForm.get('trip_email').value);
                    }
                }
                if (this.uploadedFiles) {
                    for (const file of this.uploadedFiles) {
                        newRequest.append('files', file, file.name);
                    }
                }
                this.showSpinner = true;
                this.errorMessage = '';
                this.requestService.add<any>(newRequest).subscribe (
                    event => {
                        if (event.type === HttpEventType.UploadProgress) {
                            console.log('uploadAttachment responded: ', event.loaded);
                        } else if ( event instanceof HttpResponse) {
                            console.log('final event:', event.body);
                        }
                    },
                    error => {
                        console.log(error);
                        this.errorMessage = 'Παρουσιάστηκε πρόβλημα με την υποβολή της φόρμας.';
                        this.showSpinner = false;
                        window.scroll(1, 1);
                    },
                    () => {
                        this.errorMessage = '';
                        this.showSpinner = false;
                        this.router.navigate(['/requests']);
                    }
                );
            }

        } else {
            this.errorMessage = 'Τα πεδία που σημειώνονται με (*) είναι υποχρεωτικά.';
        }
        window.scroll(1, 1);
    }

    getProject() {
        this.errorMessage = '';
        if (this.newRequestForm.get('program').value) {
            this.showSpinner = true;

            this.newRequestForm.get('institute').setValue('');
            this.newRequestForm.get('sciCoord').setValue('');

            this.projectService.getProjectById(this.chosenProgramID).subscribe(
                res => {
                    this.chosenProject = res;
                    console.log(this.chosenProject);
                },
                error => {
                    console.log(error);
                    this.errorMessage = 'Παρουσιάστηκε πρόβλημα με την ανάκτηση των πληροφοριών για το έργο.';
                    this.showSpinner = false;
                    this.searchTerm = '';
                },
                () => {
                    this.errorMessage = '';
                    if ( this.chosenProject ) {
                        this.programSelected = true;
                        if (this.chosenProject.institute && this.chosenProject.institute.name) {
                            this.newRequestForm.get('institute').setValue(this.chosenProject.institute.name);
                        }
                        if (this.chosenProject && this.chosenProject.scientificCoordinator) {
                            this.newRequestForm.get('sciCoord').setValue(
                                this.chosenProject.scientificCoordinator.firstname + ' ' +
                                      this.chosenProject.scientificCoordinator.lastname);
                        }
                        this.newRequestForm.get('institute').disable();
                        this.newRequestForm.get('sciCoord').disable();
                    } else {
                        this.errorMessage = 'Παρουσιάστηκε πρόβλημα με την ανάκτηση των πληροφοριών για το έργο.';
                    }
                    this.searchTerm = '';
                    this.showSpinner = false;
                }
            );
        }
    }

    updateSearchTerm(event: any) {
        this.searchTerm = event.target.value;
        if ( (this.searchTerm === '') &&
             ((this.chosenProject !== undefined) && (this.chosenProject !== null)) ) {
            this.newRequestForm.get('program').setValue('');
            this.newRequestForm.get('institute').setValue('');
            this.newRequestForm.get('sciCoord').setValue('');
            this.newRequestForm.get('institute').enable();
            this.newRequestForm.get('sciCoord').enable();
        }
    }

    updateProgramInput(project: Vocabulary) {
        /*console.log(this.projects);*/
        this.newRequestForm.get('program').setValue(project.projectAcronym);
        this.chosenProgramID = project.projectID;
        console.log(this.newRequestForm.get('program').value);
        this.getProject();
    }

    show (event: any) {
        if (this.newRequestForm.get('program').value && !this.chosenProject) {
            this.getProject();
        }
    }

    getUploadedFiles(files: File[]) {
        this.uploadedFiles = files;
    }

    showAmount() {

        if ( (this.newRequestForm.get('amount').value.trim() !== null) &&
             this.newRequestForm.get('amount').value.trim().includes(',')) {

            const temp = this.newRequestForm.get('amount').value.replace(',', '.');
            this.newRequestForm.get('amount').setValue(temp);
        }

        this.newRequestForm.get('amount').updateValueAndValidity();
        if ( !isNaN(this.newRequestForm.get('amount').value.trim()) ) {
            this.requestedAmount = this.newRequestForm.get('amount').value.trim();
        }

        this.showWarning = ( this.newRequestForm.get('amount').value &&
                             (+this.newRequestForm.get('amount').value > this.lowAmountLimit) &&
                             (+this.newRequestForm.get('amount').value <= this.amountLimit) &&
                             (this.requestType === 'REGULAR') );
    }

    checkIfTrip() {
        return ((this.requestType !== 'TRIP') &&
                (this.requestType !== 'CONTRACT'));
    }

    checkIfSupplierIsRequired() {
        if ((this.newRequestForm.get('supplierSelectionMethod').value &&
            (this.newRequestForm.get('supplierSelectionMethod').value === 'AWARD_PROCEDURE')) ) {

                this.isSupplierRequired = '';
        } else {
            this.isSupplierRequired = '(*)';
        }
    }

    toggleOnBehalf(event: any) {
        this.isRequestOnBehalfOfOther = event.target.checked;
    }

}

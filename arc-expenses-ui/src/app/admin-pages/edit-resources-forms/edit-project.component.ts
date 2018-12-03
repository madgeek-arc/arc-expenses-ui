import { Component, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { Executive, Institute, Organization } from '../../domain/operation';
import { EditResourcesComponent } from './edit-resources.component';
import { FormBuilder, Validators } from '@angular/forms';
import { EditPoiComponent } from './edit-poi.component';
import { ManageProjectService } from '../../services/manage-project.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-edit-project',
    templateUrl: './edit-project.component.html',
    styleUrls: ['./edit-resources.component.scss']
})
export class EditProjectComponent extends EditResourcesComponent implements OnInit, OnChanges {

    inEditMode: boolean;

    totalCostAmount: string;

    executives: Executive[] = [];
    organizations: Organization[] = [];
    institutes: Institute[] = [];

    @ViewChild('scientificCoordinatorForm') scientificCoordinatorForm: EditPoiComponent;
    scientificCoordinatorFormData: any[] = [];
    @ViewChildren('operatorForms') operatorForms: QueryList<EditPoiComponent>;
    operatorFormsData: any[] = [];

    constructor(fb: FormBuilder, route: ActivatedRoute,
                private projectService: ManageProjectService) {
        super(fb);
    }

    ngOnInit() {
        this.resourceFormDefinition = {
            id: [''],
            name: ['', Validators.required],
            acronym: ['', Validators.required],
            institute: ['', Validators.required],
            parentProject: [''],
            scientificCoordinator: ['', Validators.required],
            operator: ['', Validators.required],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            totalCost: [''],
            scientificCoordinatorAsDiataktis: ['']
        };
        super.ngOnInit();
        this.parseData();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes && changes['data'] && changes['data'].currentValue) {

            if (this.resourceForm &&
                (changes[ 'data' ].currentValue !== changes[ 'data' ].previousValue)) {

                console.log('getting ready to parse data');
                this.parseData();
            }
        }
    }

    /*  expects to receive a list of Executives, a list of Institutes
        and maybe one Project (in edit mode) from the input data */
    parseData() {
        if (this.data && (this.data.length >= 2)) {
            this.executives = this.data[0];
            this.institutes = this.data[1];
            if (this.data[2]) {
                this.inEditMode = true;
                Object.keys(this.resourceFormDefinition).forEach(
                    key => this.resourceForm.patchValue({ [key]: this.data[2][key] })
                );
                if (this.data[2].institute) {
                    this.resourceForm.patchValue({institute: this.data[2].institute.id});
                }
                if (this.data[2].scientificCoordinator) {
                    this.scientificCoordinatorFormData = [this.executives, this.data[2].scientificCoordinator];
                    this.resourceForm.get('scientificCoordinator').setValue('');
                }
                if (this.data[2].operator) {
                    this.data[2].operator.forEach(
                        op => this.operatorFormsData.push([this.executives, op])
                    );
                    this.resourceForm.get('operator').setValue(['']);
                }
                this.resourceForm.updateValueAndValidity();
            } else {
                this.addPOI();
                this.addPOIToList();
            }
        }
    }

    addPOIToList(poi?: any) {
        if (poi) {
            this.operatorFormsData.push([this.executives, poi]);
        } else {
            this.operatorFormsData.push([this.executives]);
        }
    }

    addPOI(poi?: any) {
        if (poi) {
            this.scientificCoordinatorFormData = [this.executives, poi];
        } else {
            this.scientificCoordinatorFormData = [this.executives];
        }
    }

    saveChanges() {
        if (this.inEditMode) {
            this.updateProject();
        } else {
            this.addProject();
        }
        // console.log(JSON.stringify(this.exportFormValue(), null, 2));
    }

    exportFormValue() {
        this.resourceForm.patchValue({
            institute: this.institutes.filter(i => i.id === this.resourceForm.get('institute').value )[0]
        });
        this.resourceForm.patchValue({scientificCoordinator: this.scientificCoordinatorForm.exportFormValue()});
        const operators = [];
        for (const op of this.operatorForms.toArray()) {
            if (op.exportFormValue()) {
                operators.push(op.exportFormValue());
            }
        }
        this.resourceForm.patchValue({operator: operators});
        if (this.resourceForm.valid) {
            return this.resourceForm.value;
        } else {
            this.errorMessage = 'Παρακαλώ συμπληρώστε όλα τα απαιτούμενα πεδία.';
            window.scrollTo(1, 1);
            return '';
        }
    }

    showAmount() {
        if (this.resourceForm.get('totalCost').value.trim() &&
            this.resourceForm.get('totalCost').value.trim().includes(',')) {

            const temp = this.resourceForm.get('totalCost').value.replace(',', '.');
            this.resourceForm.get('totalCost').setValue(temp);
        }

        this.resourceForm.get('totalCost').updateValueAndValidity();
        if ( !isNaN(this.resourceForm.get('totalCost').value.trim()) ) {
            this.totalCostAmount = this.resourceForm.get('totalCost').value.trim();
        }
    }

    addProject() {
        this.errorMessage = '';
        this.successMessage = '';
        this.showSpinner = true;
        const project = this.exportFormValue();
        if (project !== '') {
            this.projectService.addProject(project).subscribe(
                proj => console.log(JSON.stringify(proj)),
                err => {
                    console.log(err);
                    this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                    window.scrollTo(1, 1);
                    this.showSpinner = false;
                },
                () => {
                    this.errorMessage = '';
                    this.successMessage = 'Το έργο προστέθηκε επιτυχώς.';
                    this.showSpinner = false;
                    window.scrollTo(1, 1);
                    window.location.href = window.location.origin + '/resources/projects';
                }
            );
        }
    }

    updateProject() {
        this.errorMessage = '';
        this.successMessage = '';
        this.showSpinner = true;
        const project = this.exportFormValue();
        if (project !== '') {
            this.projectService.updateProject(project).subscribe (
                proj => console.log(JSON.stringify(proj)),
                err => {
                    console.log(err);
                    this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                    window.scrollTo(1, 1);
                    this.showSpinner = false;
                },
                () => {
                    this.errorMessage = '';
                    this.successMessage = 'Το έργο ενημερώθηκε επιτυχώς.';
                    this.showSpinner = false;
                    window.scrollTo(1, 1);
                    window.location.href = window.location.origin + '/resources/projects';
                }
            );
        }
    }

}

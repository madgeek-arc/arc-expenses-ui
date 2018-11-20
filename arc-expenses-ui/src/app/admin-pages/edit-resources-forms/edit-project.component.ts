import { Component, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { Delegate, Institute, Organization, PersonOfInterest, Project } from '../../domain/operation';
import { isNullOrUndefined } from 'util';
import { EditResourcesComponent } from './edit-resources.components';
import { Validators } from '@angular/forms';
import { EditInstituteComponent } from './edit-institute.component';
import { EditPoiComponent } from './edit-poi.component';

@Component({
    selector: 'app-edit-project',
    templateUrl: './edit-project.component.html'
})
export class EditProjectComponent extends EditResourcesComponent implements OnInit, OnChanges {
    totalCostAmount: string;

    delegates: Delegate[] = [];
    pois: PersonOfInterest[] = [];
    organizations: Organization[] = [];
    institutes: Institute[] = [];

    /*@ViewChild('instituteForm') instituteForm: EditInstituteComponent;
    instituteFormData: any[] = [];*/
    @ViewChild('scientificCoordinatorForm') scientificCoordinatorForm: EditPoiComponent;
    scientificCoordinatorFormData: any[] = [];
    @ViewChildren('operatorForms') operatorForms: QueryList<EditPoiComponent>;
    operatorFormsData: any[] = [];

    searchForInstitute = '';
    searchForScientificCoordinator = '';
    searchForOperator = '';

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
        if (!isNullOrUndefined(changes) &&
            !isNullOrUndefined(changes['data']) &&
            !isNullOrUndefined((changes['data'].currentValue))) {

            if (!isNullOrUndefined(this.resourceForm) &&
                (changes[ 'data' ].currentValue !== changes[ 'data' ].previousValue)) {

                this.parseData();
            }
        }
    }

    parseData() {
        if (!isNullOrUndefined(this.data) && (this.data.length === 5)) {
            Object.keys(this.resourceFormDefinition).forEach(
                key => this.resourceForm
                    .patchValue({ [key]: this.data[0][key] })
            );
            this.delegates = this.data[1];
            this.pois = this.data[2];
            this.organizations = this.data[3];
            this.institutes = this.data[4];
            if (!isNullOrUndefined(this.data[0].institute)) {
                /*this.instituteFormData = [this.data[0].institute, this.delegates, this.pois, this.organizations];*/
                this.resourceForm.patchValue({institute: this.data[0].institute.id})
            }
            if (!isNullOrUndefined(this.data[0].scientificCoordinator)) {
                this.scientificCoordinatorFormData = [this.data[0].scientificCoordinator, this.delegates];
                this.resourceForm.get('scientificCoordinator').setValue('');
            }
            if (!isNullOrUndefined(this.data[0].operator)) {
                this.data[0].operator.forEach(
                    op => this.operatorFormsData.push([op, this.delegates])
                );
                this.resourceForm.get('operator').setValue(['']);
            }
        }
    }

    updateSearchTerm(event: any, searchFieldName: string) {
        this[searchFieldName] = event.target.value;
    }

    addPOIToList(poi?: any) {
        this.searchForOperator = '';
        if (!isNullOrUndefined(poi)) {
            this.operatorFormsData.push([poi, this.delegates]);
        } else {
            this.operatorFormsData.push([new PersonOfInterest(), this.delegates]);
        }
    }

    addPOI(poi?: any) {
        this.searchForScientificCoordinator = '';
        if (!isNullOrUndefined(poi)) {
            this.scientificCoordinatorFormData = [poi, this.delegates];
        } else {
            this.scientificCoordinatorFormData = [new PersonOfInterest(), this.delegates];
        }
    }

    /*addInstitute(institute?: any) {
        this.searchForInstitute = '';
        if (!isNullOrUndefined(institute)) {
            this.instituteFormData = [institute, this.delegates, this.pois, this.organizations];
        } else {
            this.instituteFormData = [new Institute(), this.delegates, this.pois, this.organizations];
        }
    }*/

    exportFormValue() {
        // this.resourceForm.patchValue({institute: this.instituteForm.exportFormValue()});
        this.resourceForm.patchValue({institute: this.institutes.filter(i => i.id === this.resourceForm.get('institute').value )[0]});
        this.resourceForm.patchValue({scientificCoordinator: this.scientificCoordinatorForm.exportFormValue()});
        const operators = [];
        for (const op of this.operatorForms.toArray()) {
            operators.push(op.exportFormValue());
        }
        this.resourceForm.patchValue({operator: operators});
        if (this.resourceForm.valid) {
            if (this.checkIfFormIsEmpty()) {
                return '';
            } else {
                return this.resourceForm.value;
            }
        }
    }

    showAmount() {
        if ( !isNullOrUndefined(this.resourceForm.get('totalCost').value.trim()) &&
            this.resourceForm.get('totalCost').value.trim().includes(',')) {

            const temp = this.resourceForm.get('totalCost').value.replace(',', '.');
            this.resourceForm.get('totalCost').setValue(temp);
        }

        this.resourceForm.get('totalCost').updateValueAndValidity();
        if ( !isNaN(this.resourceForm.get('totalCost').value.trim()) ) {
            this.totalCostAmount = this.resourceForm.get('totalCost').value.trim();
        }
    }

}

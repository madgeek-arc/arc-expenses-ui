import { Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { EditResourcesComponent } from './edit-resources.components';
import { Delegate, Organization, PersonOfInterest } from '../../domain/operation';
import { Validators } from '@angular/forms';
import { EditOrganizationComponent } from './edit-organization.component';
import { EditPoiComponent } from './edit-poi.component';
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'app-edit-institute',
    templateUrl: './edit-institute.component.html'
})
export class EditInstituteComponent extends EditResourcesComponent implements OnInit, OnChanges {
    delegates: Delegate[] = [];
    pois: PersonOfInterest[] = [];
    organizations: Organization[] = [];

    /*@ViewChild('organizationForm') organizationForm: EditOrganizationComponent;
    organizationFormData: any[] = [];*/
    @ViewChild('instDirectorForm') instDirectorForm: EditPoiComponent;
    instDirectorFormData: any[] = [];
    @ViewChild('accountingRegistrationForm') accountingRegistrationForm: EditPoiComponent;
    accountingRegistrationFormData: any[] = [];
    @ViewChild('accountingPaymentForm') accountingPaymentForm: EditPoiComponent;
    accountingPaymentFormData: any[] = [];
    @ViewChild('accountingDirectorForm') accountingDirectorForm: EditPoiComponent;
    accountingDirectorFormData: any[] = [];
    @ViewChild('diaugeiaForm') diaugeiaForm: EditPoiComponent;
    diaugeiaFormData: any[] = [];
    @ViewChild('suppliesOfficeForm') suppliesOfficeForm: EditPoiComponent;
    suppliesOfficeFormData: any[] = [];
    @ViewChild('travelManagerForm') travelManagerForm: EditPoiComponent;
    travelManagerFormData: any[] = [];
    @ViewChild('diataktisForm') diataktisForm: EditPoiComponent;
    diataktisFormData: any[] = [];

    searchForOrganization = '';
    searchForInstDirector = '';
    searchForAccountingRegistration = '';
    searchForAccountingPayment = '';
    searchForAccountingDirector = '';
    searchForDiaugeia = '';
    searchForSuppliesOffice = '';
    searchForTravelManager = '';
    searchForDiataktis = '';

    ngOnInit() {
        this.resourceFormDefinition = {
            id: [''],
            name: ['', Validators.required],
            organization: ['', Validators.required],
            director: ['', Validators.required],
            accountingRegistration: ['', Validators.required],
            accountingPayment: ['', Validators.required],
            accountingDirector: ['', Validators.required],
            diaugeia: ['', Validators.required],
            suppliesOffice: ['', Validators.required],
            travelManager: ['', Validators.required],
            diataktis: ['', Validators.required]
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
        if (!isNullOrUndefined(this.data) && (this.data.length === 4)) {
            Object.keys(this.resourceFormDefinition).forEach(
                key => this.resourceForm
                    .patchValue({ [key]: this.data[0][key] })
            );
            this.delegates = this.data[1];
            this.pois = this.data[2];
            this.organizations = this.data[3];
            if (!isNullOrUndefined(this.data[0].organization)) {
                // this.organizationFormData = [this.data[0].organization, this.delegates, this.pois];
                this.resourceForm.patchValue({organization: this.data[0].organization.id});
            }
            if (!isNullOrUndefined(this.data[0].director)) {
                this.instDirectorFormData = [this.data[0].director, this.delegates];
                this.resourceForm.get('director').setValue('');
            }
            if (!isNullOrUndefined(this.data[0].accountingRegistration)) {
                this.accountingRegistrationFormData = [this.data[0].accountingRegistration, this.delegates];
                this.resourceForm.get('accountingRegistration').setValue('');
            }
            if (!isNullOrUndefined(this.data[0].accountingPayment)) {
                this.accountingPaymentFormData = [this.data[0].accountingPayment, this.delegates];
                this.resourceForm.get('accountingPayment').setValue('');
            }
            if (!isNullOrUndefined(this.data[0].accountingDirector)) {
                this.accountingDirectorFormData = [this.data[0].accountingDirector, this.delegates];
                this.resourceForm.get('accountingDirector').setValue('');
            }
            if (!isNullOrUndefined(this.data[0].diaugeia)) {
                this.diaugeiaFormData = [this.data[0].diaugeia, this.delegates];
                this.resourceForm.get('diaugeia').setValue('');
            }
            if (!isNullOrUndefined(this.data[0].suppliesOffice)) {
                this.suppliesOfficeFormData = [this.data[0].suppliesOffice, this.delegates];
                this.resourceForm.get('suppliesOffice').setValue('');
            }
            if (!isNullOrUndefined(this.data[0].travelManager)) {
                this.travelManagerFormData = [this.data[0].travelManager, this.delegates];
                this.resourceForm.get('travelManager').setValue('');
            }
            if (!isNullOrUndefined(this.data[0].diataktis)) {
                this.diataktisFormData = [this.data[0].diataktis, this.delegates];
                this.resourceForm.get('diataktis').setValue('');
            }
        }
    }

    updateSearchTerm(event: any, searchFieldName: string) {
        this[searchFieldName] = event.target.value;
    }

    addPOI(searchFieldName: string, viewChildDataName: string, poi?: any) {
        this[searchFieldName] = '';
        if (!isNullOrUndefined(poi)) {
            this[viewChildDataName] = [poi, this.delegates];
        } else {
            this[viewChildDataName] = [new PersonOfInterest(), this.delegates];
        }
    }

    /*addOrganization(organization?: any) {
        this.searchForOrganization = '';
        if (!isNullOrUndefined(organization)) {
            this.organizationFormData = [organization, this.delegates, this.pois];
        } else {
            this.organizationFormData = [new Organization(), this.delegates, this.pois];
        }
    }*/


    exportFormValue() {
        /*this.resourceForm.patchValue({organization: this.organizationForm.exportFormValue()});*/
        this.resourceForm.patchValue({organization: this.organizations.filter(i => i.id === this.resourceForm.get('organization').value )[0]});
        this.resourceForm.patchValue({director: this.instDirectorForm.exportFormValue()});
        this.resourceForm.patchValue({accountingRegistration: this.accountingRegistrationForm.exportFormValue()});
        this.resourceForm.patchValue({accountingPayment: this.accountingPaymentForm.exportFormValue()});
        this.resourceForm.patchValue({accountingDirector: this.accountingDirectorForm.exportFormValue()});
        this.resourceForm.patchValue({diaugeia: this.diaugeiaForm.exportFormValue()});
        this.resourceForm.patchValue({suppliesOffice: this.suppliesOfficeForm.exportFormValue()});
        this.resourceForm.patchValue({travelManager: this.travelManagerForm.exportFormValue()});
        this.resourceForm.patchValue({diataktis: this.diataktisForm.exportFormValue()});
        if (this.resourceForm.valid) {
            if (this.checkIfFormIsEmpty()) {
                return '';
            } else {
                return this.resourceForm.value;
            }
        }
    }

}

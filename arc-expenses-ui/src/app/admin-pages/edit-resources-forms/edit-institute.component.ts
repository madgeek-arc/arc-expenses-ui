import { Component, OnInit, ViewChild } from '@angular/core';
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
export class EditInstituteComponent extends EditResourcesComponent implements OnInit {
    delegates: Delegate[] = [];
    pois: PersonOfInterest[] = [];
    organizations: Organization[] = [];

    @ViewChild('organizationForm') organizationForm: EditOrganizationComponent;
    organizationFormData: any[] = [];
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

    parseData() {
        if (!isNullOrUndefined(this.data) && (this.data.length === 4)) {
            this.resourceForm.setValue(this.data[0]);
            this.delegates = this.data[1];
            this.pois = this.data[2];
            this.organizations = this.data[3];
            if (!isNullOrUndefined(this.data[0].organization)) {
                this.organizationFormData = [this.data[0].organization, this.delegates, this.pois];
            }
            if (!isNullOrUndefined(this.data[0].director)) {
                this.instDirectorFormData = [this.data[0].director, this.delegates];
            }
            if (!isNullOrUndefined(this.data[0].accountingRegistration)) {
                this.accountingRegistrationFormData = [this.data[0].accountingRegistration, this.delegates];
            }
            if (!isNullOrUndefined(this.data[0].accountingPayment)) {
                this.accountingPaymentFormData = [this.data[0].accountingPayment, this.delegates];
            }
            if (!isNullOrUndefined(this.data[0].accountingDirector)) {
                this.accountingDirectorFormData = [this.data[0].accountingDirector, this.delegates];
            }
            if (!isNullOrUndefined(this.data[0].diaugeia)) {
                this.diaugeiaFormData = [this.data[0].diaugeia, this.delegates];
            }
            if (!isNullOrUndefined(this.data[0].suppliesOffice)) {
                this.suppliesOfficeFormData = [this.data[0].suppliesOffice, this.delegates];
            }
            if (!isNullOrUndefined(this.data[0].travelManager)) {
                this.travelManagerFormData = [this.data[0].travelManager, this.delegates];
            }
            if (!isNullOrUndefined(this.data[0].diataktis)) {
                this.diataktisFormData = [this.data[0].diataktis, this.delegates];
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

    addOrganization(organization?: any) {
        this.searchForOrganization = '';
        if (!isNullOrUndefined(organization)) {
            this.organizationFormData = [organization, this.delegates, this.pois];
        } else {
            this.organizationFormData = [new Organization(), this.delegates, this.pois];
        }
    }


    exportFormValue() {
        this.resourceForm.patchValue({organization: this.organizationForm.exportFormValue()});
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

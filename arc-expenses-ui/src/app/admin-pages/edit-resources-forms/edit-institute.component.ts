import { Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { EditResourcesComponent } from './edit-resources.component';
import { Executive, Organization } from '../../domain/operation';
import { FormBuilder, Validators } from '@angular/forms';
import { EditPoiComponent } from './edit-poi.component';
import { ManageResourcesService } from '../../services/manage-resources.service';

@Component({
    selector: 'app-edit-institute',
    templateUrl: './edit-institute.component.html',
    styleUrls: ['./edit-resources.component.scss']
})
export class EditInstituteComponent extends EditResourcesComponent implements OnInit, OnChanges {

    inEditMode: boolean;
    executives: Executive[] = [];
    organizations: Organization[] = [];

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

    constructor(fb: FormBuilder, private resourcesService: ManageResourcesService) {
        super(fb);
    }

    ngOnInit() {
        this.resourceFormDefinition = {
            id: ['', Validators.required],
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
        if ((changes !== undefined) && (changes !== null) &&
            (changes['data'] !== undefined) && (changes['data'] !== null) &&
            (changes['data'].currentValue !== undefined) && (changes['data'].currentValue !== null) ) {

            if ((this.resourceForm !== undefined) && (this.resourceForm !== null) &&
                (changes[ 'data' ].currentValue !== changes[ 'data' ].previousValue)) {

                this.parseData();
            }
        }
    }

    /*  expects to receive a list of Executives, a list of Organizations
        and maybe one Institute (in edit mode) from the input data */
    parseData() {
        if (this.data && (this.data.length >= 2)) {
            this.executives = this.data[0];
            this.organizations = this.data[1];

            if (this.data[2]) {
                this.inEditMode = true;
                Object.keys(this.resourceFormDefinition).forEach(
                    key => this.resourceForm
                        .patchValue({ [key]: this.data[2][key] })
                );
                if (this.data[2].organization) {
                    this.resourceForm.patchValue({organization: this.data[2].organization.id});
                }
                if (this.data[2].director) {
                    this.instDirectorFormData = [this.executives, this.data[2].director];
                    this.resourceForm.get('director').setValue('');
                }
                if (this.data[2].accountingRegistration) {
                    this.accountingRegistrationFormData = [this.executives, this.data[2].accountingRegistration];
                    this.resourceForm.get('accountingRegistration').setValue('');
                }
                if (this.data[2].accountingPayment) {
                    this.accountingPaymentFormData = [this.executives, this.data[2].accountingPayment];
                    this.resourceForm.get('accountingPayment').setValue('');
                }
                if (this.data[2].accountingDirector) {
                    this.accountingDirectorFormData = [this.executives, this.data[2].accountingDirector];
                    this.resourceForm.get('accountingDirector').setValue('');
                }
                if (this.data[2].diaugeia) {
                    this.diaugeiaFormData = [this.executives, this.data[2].diaugeia];
                    this.resourceForm.get('diaugeia').setValue('');
                }
                if (this.data[2].suppliesOffice) {
                    this.suppliesOfficeFormData = [this.executives, this.data[2].suppliesOffice];
                    this.resourceForm.get('suppliesOffice').setValue('');
                }
                if (this.data[2].travelManager) {
                    this.travelManagerFormData = [this.executives, this.data[2].travelManager];
                    this.resourceForm.get('travelManager').setValue('');
                }
                if (this.data[2].diataktis) {
                    this.diataktisFormData = [this.executives, this.data[2].diataktis];
                    this.resourceForm.get('diataktis').setValue('');
                }
            } else {
                this.resourceForm.patchValue({organization: 'ARC'});
                this.addPOI('instDirectorFormData');
                this.addPOI('accountingRegistrationFormData');
                this.addPOI('accountingPaymentFormData');
                this.addPOI('accountingDirectorFormData');
                this.addPOI('diaugeiaFormData');
                this.addPOI('suppliesOfficeFormData');
                this.addPOI('travelManagerFormData');
                this.addPOI('diataktisFormData');
            }
            this.resourceForm.updateValueAndValidity();
        }
    }

    updateSearchTerm(event: any, searchFieldName: string) {
        this[searchFieldName] = event.target.value;
    }

    addPOI(viewChildDataName: string, poi?: any) {
        if (poi) {
            this[viewChildDataName] = [this.executives, poi];
        } else {
            this[viewChildDataName] = [this.executives];
        }
    }

    saveChanges() {
        if (this.inEditMode) {
            this.updateInstitute();
        } else {
            this.addInstitute();
        }
        // console.log(JSON.stringify(this.exportFormValue(), null, 2));
    }

    exportFormValue() {
        /*this.resourceForm.patchValue({organization: this.organizationForm.exportFormValue()});*/
        this.resourceForm.patchValue({
                organization: this.organizations.filter(i => i.id === this.resourceForm.get('organization').value )[0]
        });
        this.resourceForm.patchValue({director: this.instDirectorForm.exportFormValue()});
        this.resourceForm.patchValue({accountingRegistration: this.accountingRegistrationForm.exportFormValue()});
        this.resourceForm.patchValue({accountingPayment: this.accountingPaymentForm.exportFormValue()});
        this.resourceForm.patchValue({accountingDirector: this.accountingDirectorForm.exportFormValue()});
        this.resourceForm.patchValue({diaugeia: this.diaugeiaForm.exportFormValue()});
        this.resourceForm.patchValue({suppliesOffice: this.suppliesOfficeForm.exportFormValue()});
        this.resourceForm.patchValue({travelManager: this.travelManagerForm.exportFormValue()});
        this.resourceForm.patchValue({diataktis: this.diataktisForm.exportFormValue()});
        if (this.resourceForm.valid) {
            return this.resourceForm.value;
        } else {
            this.errorMessage = 'Παρακαλώ συμπληρώστε όλα τα απαιτούμενα πεδία.';
            window.scrollTo(1, 1);
            return '';
        }
    }

    addInstitute() {
        const institute = this.exportFormValue();
        if (institute !== '') {
            this.errorMessage = '';
            this.successMessage = '';
            this.showSpinner = true;
            this.resourcesService.addInstitute(institute).subscribe(
                inst => console.log(JSON.stringify(inst)),
                err => {
                    console.log(err);
                    this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                    window.scrollTo(1, 1);
                    this.showSpinner = false;
                },
                () => {
                    this.errorMessage = '';
                    this.successMessage = 'Το ινστιτούτο προστέθηκε επιτυχώς.';
                    this.showSpinner = false;
                    window.scrollTo(1, 1);
                    window.location.href = window.location.origin + '/resources/institutes';
                }
            );
        }
    }

    updateInstitute() {
        const institute = this.exportFormValue();
        if (institute !== '') {
            this.errorMessage = '';
            this.successMessage = '';
            this.showSpinner = true;
            this.resourcesService.updateInstitute(institute).subscribe(
                inst => console.log(JSON.stringify(inst)),
                err => {
                    console.log(err);
                    this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                    window.scrollTo(1, 1);
                    this.showSpinner = false;
                },
                () => {
                    this.errorMessage = '';
                    this.successMessage = 'Το ινστιτούτο ενημερώθηκε επιτυχώς.';
                    this.showSpinner = false;
                    window.scrollTo(1, 1);
                    window.location.href = window.location.origin + '/resources/institutes';
                }
            );
        }
    }
}

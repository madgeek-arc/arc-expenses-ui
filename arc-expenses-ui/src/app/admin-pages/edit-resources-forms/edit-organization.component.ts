import { Component, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { EditResourcesComponent } from './edit-resources.component';
import { FormBuilder, Validators } from '@angular/forms';
import { Executive } from '../../domain/operation';
import { EditPoiComponent } from './edit-poi.component';
import { ManageResourcesService } from '../../services/manage-resources.service';

@Component({
    selector: 'app-edit-organization',
    templateUrl: './edit-organization.component.html',
    styleUrls: ['./edit-resources.component.scss']
})
export class EditOrganizationComponent extends EditResourcesComponent implements OnInit, OnChanges {

    inEditMode: boolean;
    executives: Executive[] = [];

    @ViewChild('poyForm') poyForm: EditPoiComponent;
    poyFormData: any[] = [];
    @ViewChild('directorForm') directorForm: EditPoiComponent;
    directorFormData: any[] = [];
    @ViewChild('viceDirectorForm') viceDirectorForm: EditPoiComponent;
    viceDirectorFormData: any[] = [];
    @ViewChildren('inspectionTeamForms') inspectionTeamForms: QueryList<EditPoiComponent>;
    inspectionTeamFormsData: any[] = [];
    @ViewChild('dioikitikoSumvoulioForm') dioikitikoSumvoulioForm: EditPoiComponent;
    dioikitikoSumvoulioFormData: any[] = [];

    constructor(fb: FormBuilder, private resourcesService: ManageResourcesService) {
        super(fb);
    }

    ngOnInit() {
        this.resourceFormDefinition = {
            id: ['', Validators.required],
            name: ['', Validators.required],
            poy: ['', Validators.required],
            director: ['', Validators.required],
            viceDirector: ['', Validators.required],
            inspectionTeam: ['', Validators.required],
            dioikitikoSumvoulio: ['', Validators.required]
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

    /*  expects to receive a list of Executives
        and maybe one Organization (in edit mode) from the input data */
    parseData() {
        if ((this.data !== undefined) && (this.data !== null) && (this.data.length >= 1)) {
            this.executives = this.data[0];

            if ((this.data[1] !== undefined) && (this.data[1] !== null)) {
                this.inEditMode = true;
                Object.keys(this.resourceFormDefinition).forEach(
                    key => this.resourceForm
                        .patchValue({ [key]: this.data[1][key] })
                );
                if (this.data[1].poy) {
                    this.poyFormData = [this.executives, this.data[1].poy];
                }
                if (this.data[1].director) {
                    this.directorFormData = [this.executives, this.data[1].director];
                }
                if (this.data[1].viceDirector) {
                    this.viceDirectorFormData = [this.executives, this.data[1].viceDirector];
                }
                if (this.data[1].inspectionTeam) {
                    this.data[1].inspectionTeam.forEach(
                        insp => this.inspectionTeamFormsData.push([this.executives, insp])
                    );
                    this.resourceForm.get('inspectionTeam').setValue(['']);
                }
                if (this.data[1].dioikitikoSumvoulio) {
                    this.dioikitikoSumvoulioFormData = [this.executives, this.data[1].dioikitikoSumvoulio];
                }
                this.resourceForm.updateValueAndValidity();
            } else {
                this.addPOIToList();
                this.addPOI('poyFormData');
                this.addPOI('directorFormData');
                this.addPOI('viceDirectorFormData');
                this.addPOI('dioikitikoSumvoulioFormData');
            }
        }
    }

    addPOIToList(poi?: any) {
        if (poi !== undefined) {
            this.inspectionTeamFormsData.push([this.executives, poi]);
        } else {
            this.inspectionTeamFormsData.push([this.executives]);
        }
    }

    addPOI(viewChildDataName: string, poi?: any) {
        if (poi !== undefined) {
            this[viewChildDataName] = [this.executives, poi];
        } else {
            this[viewChildDataName] = [this.executives];
        }
    }

    saveChanges() {
        if (this.inEditMode) {
            this.updateOrganization();
        } else {
            this.addOrganization();
        }
    }

    exportFormValue() {
        this.resourceForm.patchValue({poy: this.poyForm.exportFormValue()});
        this.resourceForm.patchValue({director: this.directorForm.exportFormValue()});
        this.resourceForm.patchValue({viceDirector: this.viceDirectorForm.exportFormValue()});
        const inspectionTeamFormArrayValue = [];
        for (const del of this.inspectionTeamForms.toArray()) {
            if (del.exportFormValue()) {
                inspectionTeamFormArrayValue.push(del.exportFormValue());
            }
        }
        this.resourceForm.patchValue({inspectionTeam: inspectionTeamFormArrayValue});
        this.resourceForm.patchValue({dioikitikoSumvoulio: this.dioikitikoSumvoulioForm.exportFormValue()});
        if (this.resourceForm.valid) {
            if (this.checkIfFormIsEmpty()) {
                return '';
            } else {
                return this.resourceForm.value;
            }
        } else {
            return '';
        }
    }


    addOrganization() {
        this.errorMessage = '';
        this.successMessage = '';
        this.showSpinner = true;
        const organization = this.exportFormValue();
        if (organization !== '') {
            this.resourcesService.addOrganization(organization).subscribe(
                org => console.log('add organization responded', JSON.stringify(org)),
                err => {
                    console.log(err);
                    this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                    this.showSpinner = false;
                },
                () => {
                    this.errorMessage = '';
                    this.successMessage = 'Ο οργανισμός προστέθηκε επιτυχώς.';
                    this.showSpinner = false;
                    window.scrollTo(1, 1);
                    window.location.href = window.location.origin + '/resources/organizations';
                }
            );
        }
    }

    updateOrganization() {
        this.errorMessage = '';
        this.successMessage = '';
        this.showSpinner = true;
        const organization = this.exportFormValue();
        if (organization !== '') {
            this.resourcesService.updateOrganization(organization).subscribe(
                org => console.log('update organization responded', JSON.stringify(org)),
                err => {
                    console.log(err);
                    this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                    this.showSpinner = false;
                },
                () => {
                    this.errorMessage = '';
                    this.successMessage = 'Ο οργανισμός ενημερώθηκε επιτυχώς.';
                    this.showSpinner = false;
                    window.scrollTo(1, 1);
                }
            );
        }
    }

}

import { Component, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { EditResourcesComponent } from './edit-resources.components';
import { Validators } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { Delegate, PersonOfInterest } from '../../domain/operation';
import { EditPoiComponent } from './edit-poi.component';

@Component({
    selector: 'app-edit-organization',
    templateUrl: './edit-organization.component.html'
})
export class EditOrganizationComponent extends EditResourcesComponent implements OnInit, OnChanges {
    delegates: Delegate[] = [];
    pois: PersonOfInterest[] = [];

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

    searchForPOY = '';
    searchForDirector = '';
    searchForViceDirector = '';
    searchForInspectionTeam = '';
    searchForDioikitiko = '';

    ngOnInit() {
        this.resourceFormDefinition = {
            id: [''],
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
        if (!isNullOrUndefined(this.data) && (this.data.length === 3)) {
            Object.keys(this.resourceFormDefinition).forEach(
                key => this.resourceForm
                    .patchValue({ [key]: this.data[0][key] })
            );
            this.delegates = this.data[1];
            this.pois = this.data[2];
            if (!isNullOrUndefined(this.data[0].poy)) {
                this.poyFormData = [this.data[0].poy, this.delegates];
            }
            if (!isNullOrUndefined(this.data[0].director)) {
                this.directorFormData = [this.data[0].director, this.delegates];
            }
            if (!isNullOrUndefined(this.data[0].viceDirector)) {
                this.viceDirectorFormData = [this.data[0].viceDirector, this.delegates];
            }
            if (!isNullOrUndefined(this.data[0].inspectionTeam)) {
                this.data[0].inspectionTeam.forEach(
                    insp => this.inspectionTeamFormsData.push([insp, this.delegates])
                );
                this.resourceForm.get('inspectionTeam').setValue(['']);
            }
            if (!isNullOrUndefined(this.data[0].dioikitikoSumvoulio)) {
                this.dioikitikoSumvoulioFormData = [this.data[0].dioikitikoSumvoulio, this.delegates];
            }
        }
    }

    updateSearchTerm(event: any, searchFieldName: string) {
        this[searchFieldName] = event.target.value;
    }

    addPOIToList(poi?: any) {
        this.searchForInspectionTeam = '';
        if (!isNullOrUndefined(poi)) {
            this.inspectionTeamFormsData.push([poi, this.delegates]);
        } else {
            this.inspectionTeamFormsData.push([new PersonOfInterest(), this.delegates]);
        }
    }

    addPOI(searchFieldName: string, viewChildDataName: string, poi?: any) {
        this[searchFieldName] = '';
        if (!isNullOrUndefined(poi)) {
            this[viewChildDataName] = [poi, this.delegates];
        } else {
            this[viewChildDataName] = [new PersonOfInterest(), this.delegates];
        }
    }

    refreshViewChildForm(viewChildName: string) {
        this[viewChildName].data = [new PersonOfInterest(), this.delegates];
        this[viewChildName].parseData();
    }

    exportFormValue() {
        this.resourceForm.patchValue({poy: this.poyForm.exportFormValue()});
        this.resourceForm.patchValue({director: this.directorForm.exportFormValue()});
        this.resourceForm.patchValue({viceDirector: this.viceDirectorForm.exportFormValue()});
        const inspectionTeamFormArrayValue = [];
        for (const del of this.inspectionTeamForms.toArray()) {
            inspectionTeamFormArrayValue.push(del.exportFormValue());
        }
        this.resourceForm.patchValue({inspectionTeam: inspectionTeamFormArrayValue});
        this.resourceForm.patchValue({dioikitikoSumvoulio: this.dioikitikoSumvoulioForm.exportFormValue()});
        if (this.resourceForm.valid) {
            if (this.checkIfFormIsEmpty()) {
                return '';
            } else {
                return this.resourceForm.value;
            }
        }
    }

}

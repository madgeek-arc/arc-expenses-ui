import { Component, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { EditResourcesComponent } from './edit-resources.component';
import { Validators } from '@angular/forms';
import { Delegate, Executive, PersonOfInterest } from '../../domain/operation';
import { EditDelegateComponent } from './edit-delegate.component';

@Component({
    selector: 'app-edit-poi',
    templateUrl: './edit-poi.component.html',
    styleUrls: ['./edit-resources.component.scss']
})
export class EditPoiComponent extends EditResourcesComponent implements OnInit, OnChanges {
    showForm: boolean;
    newPOIMode: boolean;
    executives: Executive[] = [];
    delegateFormsData: any[] = [];
    @ViewChildren('delegateForms') delegateForms: QueryList<EditDelegateComponent>;

    searchTerm = '';

    ngOnInit() {
        this.resourceFormDefinition = {
            email: ['', Validators.required],
            firstname: [''],
            lastname: [''],
            delegates: ['']
        };
        super.ngOnInit();
        this.resourceForm.get('firstname').disable();
        this.resourceForm.get('lastname').disable();
        this.parseData();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes && changes['data'] && changes['data'].currentValue) {
            if (this.resourceForm && (changes[ 'data' ].currentValue !== changes[ 'data' ].previousValue)) {
                this.parseData();
            }
        }
    }

    /*  expects to receive a list of Executives
        and maybe one PersonOfInterest (in edit mode) from the input data */
    parseData() {
        // this.showForm = false;
        // this.resourceForm.reset();
        if (this.data && (this.data.length >= 1)) {
            this.executives = this.data[0];

            if (this.data[1]) {
                Object.keys(this.resourceFormDefinition).forEach(
                    key => this.resourceForm.patchValue({ [key]: this.data[1][key] })
                );
                if (this.data[1].delegates) {
                    this.data[1].delegates.forEach(
                        del => this.delegateFormsData.push([this.executives, del])
                    );
                    this.resourceForm.get('delegates').setValue(['']);
                }
                // this.showForm = true;
                this.resourceForm.updateValueAndValidity();
            } else {
                this.addDelegate();
            }
        }
    }

    updateSearchTerm() {
        if (!this.newPOIMode) {
            this.searchTerm = this.resourceForm.get('email').value;
        }
    }

    addDelegate(delegate?: any) {
        this.searchTerm = '';
        if ( (delegate !== undefined) && (delegate !== null) ) {
            this.delegateFormsData.push([this.executives, delegate]);
        } else {
            this.delegateFormsData.push([this.executives]);
        }
    }

    addPOI(poi?: any) {
        this.searchTerm = '';
        // this.resourceForm.reset();
        if (poi) {
            Object.keys(this.resourceFormDefinition).forEach(
                key => this.resourceForm.patchValue({ [key]: poi[key] })
            );
        } else {
            this.resourceForm.get('firstname').enable();
            this.resourceForm.get('lastname').enable();
        }
        this.resourceForm.updateValueAndValidity();
        // this.showForm = true;
    }

    inNewPOIMode(newPOIMode: boolean) {
        this.newPOIMode = newPOIMode;
        if (this.newPOIMode) {
            this.addPOI();
        } else {
            this.resourceForm.get('firstname').disable();
            this.resourceForm.get('lastname').disable();
        }
    }

    exportFormValue() {
        const delegateFormArrayValue = [];
        for (const del of this.delegateForms.toArray()) {
            if (del.exportFormValue() !== '') {
                delegateFormArrayValue.push(del.exportFormValue());
            }
        }
        this.resourceForm.patchValue({delegates: delegateFormArrayValue});
        if (this.resourceForm.valid) {
            return this.resourceForm.value;
        } else {
            return '';
        }
    }

}

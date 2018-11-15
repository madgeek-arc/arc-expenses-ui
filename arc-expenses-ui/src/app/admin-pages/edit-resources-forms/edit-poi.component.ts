import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { EditResourcesComponent } from './edit-resources.components';
import { Validators } from '@angular/forms';
import { Delegate, PersonOfInterest } from '../../domain/operation';
import { EditDelegateComponent } from './edit-delegate.component';
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'app-edit-poi',
    templateUrl: './edit-poi.component.html'
})
export class EditPoiComponent extends EditResourcesComponent implements OnInit {
    delegates: Delegate[] = [];
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
        this.parseData();
    }

    /* expects to receive one Person Of Interest and a list of delegates from the input data */
    parseData() {
        if (!isNullOrUndefined(this.data) && (this.data.length === 2)) {
            this.resourceForm.setValue(this.data[0]);
            this.delegates = this.data[1];
            if (!isNullOrUndefined(this.data[0].delegates)) {
                this.delegateFormsData = this.data[0].delegates;
            }
        }
    }

    updateSearchTerm(event: any) {
        this.searchTerm = event.target.value;
    }

    addDelegate(delegate?: any) {
        this.searchTerm = '';
        if (!isNullOrUndefined(delegate)) {
            this.delegateFormsData.push(delegate);
        } else {
            this.delegateFormsData.push(new Delegate());
        }

    }


    exportFormValue() {
        const delegateFormArrayValue = [];
        for (const del of this.delegateForms.toArray()) {
            delegateFormArrayValue.push(del.exportFormValue());
        }
        this.resourceForm.patchValue({delegates: delegateFormArrayValue});
        if (this.resourceForm.valid) {
            if (this.checkIfFormIsEmpty()) {
                return '';
            } else {
                return this.resourceForm.value;
            }
        }
    }

}

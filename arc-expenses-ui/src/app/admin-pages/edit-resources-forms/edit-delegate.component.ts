import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EditResourcesComponent } from './edit-resources.components';
import { Validators } from '@angular/forms';
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'app-edit-delegate',
    templateUrl: './edit-delegate.component.html'
})
export class EditDelegateComponent extends EditResourcesComponent implements OnInit, OnChanges {

    ngOnInit() {
        this.resourceFormDefinition = {
            email: ['', Validators.required],
            firstname:  [''],
            lastname:  [''],
            hidden:  ['']
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

    /* expects to receive one delegate from the input data */
    parseData() {
        if (!isNullOrUndefined(this.data)) {
            Object.keys(this.resourceFormDefinition).forEach(
                key => this.resourceForm
                    .patchValue({ [key]: this.data[key] })
            );
        }
    }

    clearForm() {
        this.createForm();
    }

    exportFormValue() {
        if (this.resourceForm.valid) {
            if (this.checkIfFormIsEmpty()) {
                return '';
            } else {
                return this.resourceForm.value;
            }
        }
    }
}

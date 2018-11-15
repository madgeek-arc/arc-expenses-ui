import { Component, OnInit } from '@angular/core';
import { EditResourcesComponent } from './edit-resources.components';
import { Validators } from '@angular/forms';
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'app-edit-delegate',
    templateUrl: './edit-delegate.component.html'
})
export class EditDelegateComponent extends EditResourcesComponent implements OnInit {

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

    /* expects to receive one delegate from the input data */
    parseData() {
        if (!isNullOrUndefined(this.data) && (this.data.length > 0)) {
            this.resourceForm.setValue(this.data[0]);
        }
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

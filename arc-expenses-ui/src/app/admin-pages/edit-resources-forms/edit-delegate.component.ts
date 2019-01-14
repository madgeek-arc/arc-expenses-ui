import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EditResourcesComponent } from './edit-resources.component';
import { Validators } from '@angular/forms';
import { Executive } from '../../domain/operation';

@Component({
    selector: 'app-edit-delegate',
    templateUrl: './edit-delegate.component.html',
    styleUrls: ['./edit-resources.component.scss']
})
export class EditDelegateComponent extends EditResourcesComponent implements OnInit, OnChanges {
    showForm: boolean;
    newDelegateMode: boolean;
    searchTerm: string;

    executives: Executive[] = [];

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
        if (changes && changes['data'] && changes['data'].currentValue) {
            if (this.resourceForm && (changes[ 'data' ].currentValue !== changes[ 'data' ].previousValue)) {
                this.parseData();
            }
        }
    }

    /*  expects to receive a list of Executives
        and maybe one Delegate (in edit mode) from the input data */
    parseData() {
        if (this.data && (this.data.length >= 1)) {
            this.executives = this.data[0];

            if (this.data[1]) {
                Object.keys(this.resourceFormDefinition).forEach(
                    key => {
                        if (this.data[1][key]) {
                            this.resourceForm.patchValue({[ key ]: this.data[ 1 ][ key ]});
                        }
                    }
                );
                // this.showForm = true;
                this.resourceForm.updateValueAndValidity();
            }
        }
        // TODO:: RESTORE DISABLED FIELDS
        // this.resourceForm.get('firstname').disable();
        // this.resourceForm.get('lastname').disable();
    }

    updateSearchTerm() {
        if (!this.newDelegateMode) {
            this.searchTerm = this.resourceForm.get('email').value;
        }
    }

    addDelegate(delegate?: any) {
        this.searchTerm = '';
        this.resourceForm.get('firstname').enable();
        this.resourceForm.get('lastname').enable();
        if (delegate) {
            Object.keys(this.resourceFormDefinition).forEach(
                key => {
                    if (delegate[key]) {
                        this.resourceForm.patchValue({[ key ]: delegate[ key ]});
                    }
                }
            );
            // TODO:: RESTORE DISABLED FIELDS
            // this.resourceForm.get('firstname').disable();
            // this.resourceForm.get('lastname').disable();
        }
        // this.resourceForm.updateValueAndValidity();
    }

    inNewDelegateMode(newDelegateMode: boolean) {
        this.newDelegateMode = newDelegateMode;
        if (this.newDelegateMode) {
            this.addDelegate();
        } else {
            // TODO:: RESTORE DISABLED FIELDS
            // this.resourceForm.get('firstname').disable();
            // this.resourceForm.get('lastname').disable();
        }
    }

    exportFormValue() {
        if (this.resourceForm.valid) {
            return this.resourceForm.getRawValue();
        } else {
            return '';
        }
    }
}

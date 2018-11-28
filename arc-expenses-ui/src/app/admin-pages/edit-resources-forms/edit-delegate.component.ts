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
        // super.ngOnInit();
        this.parseData();
    }

    ngOnChanges(changes: SimpleChanges) {
        if ((changes !== undefined) && (changes !== null) &&
            (changes['data'] !== undefined) && (changes['data'] !== null) &&
            (changes['data'].currentValue !== undefined) && (changes['data'].currentValue !== null) ) {

            if (this.resourceForm && (changes[ 'data' ].currentValue !== changes[ 'data' ].previousValue)) {

                this.parseData();
            }
        }
    }

    /*  expects to receive a list of Executives
        and maybe one Delegate (in edit mode) from the input data */
    parseData() {
        // this.resourceForm.reset();
        this.showForm = false;
        if (this.data && (this.data.length >= 1)) {
            this.executives = this.data[0];

            if (this.data[1]) {
                this.createForm();
                Object.keys(this.resourceFormDefinition).forEach(
                    key => this.resourceForm.patchValue({ [key]: this.data[1][key] })
                );
                this.showForm = true;
                this.resourceForm.updateValueAndValidity();
            }
        }
    }

    updateSearchTerm(event: any) {
        this.searchTerm = event.target.value;
    }

    addDelegate(delegate?: any) {
        this.searchTerm = '';
        this.createForm();
        if (delegate) {
            Object.keys(this.resourceFormDefinition).forEach(
                key => this.resourceForm.patchValue({ [key]: delegate[key] })
            );
        }
        this.showForm = true;
        this.resourceForm.updateValueAndValidity();
    }

    inNewDelegateMode(newDelegateMode: boolean) {
        this.newDelegateMode = newDelegateMode;
        if (this.newDelegateMode) {
            this.addDelegate();
        }
    }

    exportFormValue() {
        if (this.resourceForm.valid) {
            return this.resourceForm.value;
        } else {
            return '';
        }
    }
}

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-edit-resources',
    template: ``
})
export class EditResourcesComponent implements OnInit {
    errorMessage: string;
    successMessage: string;
    showSpinner: boolean;

    @Input() id: string;

    /* data Input must be strictly of the form:
        [{an element of the class corresponding to the resourceForm}, {extra data if needed}]
        in particular data should be as follows:
        editDelegateComponent -> [Executive[], Delegate?]
        editPoiComponent -> [Executive[], PersonOfInterest?]
        editOrganizationComponent -> [Executive[], Organization?]
        editInstituteComponent -> [Executive[], Organization[], Institute?]
        editProjectComponent -> [Executive[], Institute[], Project?]
    */
    @Input() data: any[] = [];
    title: string;

    resourceForm: FormGroup;
    resourceFormDefinition = null;

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        this.createForm();
    }

    createForm() {
        if ( this.resourceFormDefinition ) {
            this.resourceForm = this.fb.group(this.resourceFormDefinition);
        }
    }

    /* returns true if none of the form controls has value */
    checkIfFormIsEmpty() {
        return !Object.keys(this.resourceFormDefinition).some(
            key => ((this.resourceForm.get(key).value !== '') &&
                             (this.resourceForm.get(key).value !== [])));
    }

    removeForm(i: number, dataArrayName: string) {
        const tempArray = this[dataArrayName];
        this[dataArrayName] = [];
        tempArray.splice(i, 1);
        this[dataArrayName] = tempArray;
        /*this[dataArrayName].splice(i, 1);*/
        console.log(JSON.stringify(this[dataArrayName]));
    }

}

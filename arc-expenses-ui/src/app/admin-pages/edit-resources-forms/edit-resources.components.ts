import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {isNullOrUndefined} from 'util';
import {ManageProjectService} from '../../services/manage-project.service';
import {ManageResourcesService} from '../../services/manage-resources.service';
import { Delegate, Institute, Organization, PersonOfInterest, Project, Vocabulary } from '../../domain/operation';

@Component({
    selector: 'app-edit-resources',
    template: ``
})
export class EditResourcesComponent implements OnInit {
    errorMessage: string;

    @Input() id: string;

    /* data Input must be strictly of the form:
        [{an element of the class corresponding to the resourceForm}, {extra data if needed}]
        in particular data should be as follows:
        editDelegateComponent -> [Delegate]
        editPoiComponent -> [PersonOfInterest, Delegate[]]
        editOrganizationComponent -> [Organization, Delegate[], PersonOfInterest[]]
        editInstituteComponent -> [Institute, Delegate[], PersonOfInterest[], Organization[]]
        editProjectComponent -> [Project, Delegate[], PersonOfInterest[], Organization[], Institute[]]
    */
    @Input() data: any[] = [];
    title: string;

    resourceForm: FormGroup;
    resourceFormDefinition = null;

    constructor(public fb: FormBuilder) {}

    ngOnInit() {
        this.createForm();
    }

    createForm() {
        if ( !isNullOrUndefined(this.resourceFormDefinition) ) {
            this.resourceForm = this.fb.group(this.resourceFormDefinition);
        }
    }

    /* returns true if none of the form controls has value */
    checkIfFormIsEmpty() {
        return !Object.keys(this.resourceFormDefinition).some(
            key => ((this.resourceForm.get(key).value !== '') &&
                             (this.resourceForm.get(key).value !== [])));
    }

    /* this function is overloaded by the class descendants */
    /*exportFormValue() {
        if (this.resourceForm.valid) {
            if (this.checkIfFormIsEmpty()) {
                return '';
            } else {
                return this.resourceForm.value;
            }
        }
    }*/

}

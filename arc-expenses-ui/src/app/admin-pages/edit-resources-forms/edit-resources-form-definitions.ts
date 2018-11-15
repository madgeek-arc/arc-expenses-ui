import { Validators } from '@angular/forms';

export const delegateFormDefinition = {
    email: ['', Validators.required],
    firstname:  [''],
    lastname:  [''],
    hidden:  ['']
};

export const poiFormDefinition = {
    email: ['', Validators.required],
    firstname: [''],
    lastname: [''],
    delegates: ['']
};

export const organizationFormDefinition = {
    id: ['', Validators.required],
    name: ['', Validators.required],
    poy: ['', Validators.required],
    director: ['', Validators.required],
    viceDirector: ['', Validators.required],
    inspectionTeam: ['', Validators.required],
    dioikitikoSumvoulio: ['', Validators.required]
};

export const instituteFormDefinition = {
    id: ['', Validators.required],
    name: ['', Validators.required],
    organization: ['', Validators.required],
    director: ['', Validators.required],
    accountingRegistration: ['', Validators.required],
    accountingPayment: ['', Validators.required],
    accountingDirector: ['', Validators.required],
    diaugeia: ['', Validators.required],
    suppliesOffice: ['', Validators.required],
    travelManager: ['', Validators.required],
    diataktis: ['', Validators.required]
};

export const projectFormDefinition = {
    id: ['', Validators.required],
    name: ['', Validators.required],
    acronym: ['', Validators.required],
    institute: ['', Validators.required],
    parentProject: [''],
    scientificCoordinator: ['', Validators.required],
    operator: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    totalCost: ['']
};

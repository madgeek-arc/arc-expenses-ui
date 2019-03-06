import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Attachment, Request, Stage5b } from '../../domain/operation';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { supplierSelectionMethodsMap } from '../../domain/stageDescriptions';

@Component({
    selector: 'stage1-form',
    templateUrl: './stage1-form.component.html'
})
export class Stage1FormComponent implements OnInit {
    errorMessage: string;

    @Input() currentRequest: Request;

    /* output variable that sends the new Stage back to the parent component
     * in order to call the api and update the request */
    @Output() emitRequest: EventEmitter<FormData> = new EventEmitter<FormData>();


    updateStage1Form: FormGroup;
    stage1AttachmentNames: string[] = [];
    uploadedFiles: File[];
    requestedAmount: string;
    readonly amountLimit = 20000;
    readonly lowAmountLimit = 2500;
    showWarning: boolean;

    selMethods = supplierSelectionMethodsMap;
    isSupplierRequired: boolean;

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        this.createForm();
    }

    createForm() {
        this.updateStage1Form = this.fb.group({
            requestText: [''],
            supplier: [''],
            supplierSelectionMethod: [''],
            amount: ['', [Validators.min(1), Validators.pattern('^\\d+(\\.\\d{1,2})?$')] ]
        });
        this.updateStage1Form.get('requestText').setValue(this.currentRequest.stage1.subject);
        this.updateStage1Form.get('requestText').updateValueAndValidity();
        if ( this.currentRequest.stage1.supplier ) {
            this.updateStage1Form.get('supplier').setValue(this.currentRequest.stage1.supplier);
            this.updateStage1Form.get('supplier').updateValueAndValidity();
        }
        if ( this.currentRequest.stage1.supplierSelectionMethod ) {
            this.updateStage1Form.get('supplierSelectionMethod').setValue(this.currentRequest.stage1.supplierSelectionMethod);
            this.updateStage1Form.get('supplierSelectionMethod').updateValueAndValidity();
        }
        if ( this.currentRequest.stage1.amountInEuros ) {
            this.updateStage1Form.get('amount').setValue( (this.currentRequest.stage1.amountInEuros).toString() );
            this.updateStage1Form.get('amount').updateValueAndValidity();
            this.updateStage1Form.get('amount').markAsTouched();
        }

        if (this.currentRequest.stage1.attachments) {
            for (const f of this.currentRequest.stage1.attachments) {
                this.stage1AttachmentNames.push(f.filename);
            }
        }
        this.isSupplierRequired = (this.currentRequest.type !== 'TRIP');
    }


    getUploadedFiles(files: File[]) {
        this.uploadedFiles = files;
    }

    removeUploadedFile(filename: string) {
        const z = this.stage1AttachmentNames.indexOf(filename);
        this.stage1AttachmentNames.splice(z, 1);
        if (this.uploadedFiles && this.uploadedFiles.some(x => x.name === filename)) {
            const i = this.uploadedFiles.findIndex(x => x.name === filename);
            this.uploadedFiles.splice(i, 1);
        }
        if (this.currentRequest.stage1.attachments &&
            this.currentRequest.stage1.attachments.some(x => x.filename === filename)) {

            const i = this.currentRequest.stage1.attachments.findIndex(x => x.filename === filename);
            this.currentRequest.stage1.attachments.splice(i, 1);
        }
    }

    updateStage1() {
        console.log(this.updateStage1Form);
        this.errorMessage = '';
        if (this.updateStage1Form.valid ) {
            if ( (+this.updateStage1Form.get('amount').value > this.lowAmountLimit) &&
                (+this.updateStage1Form.get('amount').value <= this.amountLimit) &&
                ( this.updateStage1Form.get('supplierSelectionMethod').value === 'DIRECT' ) ) {

                this.errorMessage = 'Για αιτήματα άνω των 2.500 € η επιλογή προμηθευτή γίνεται μέσω διαγωνισμού ή έρευνας αγοράς.';

            } else if ( (+this.updateStage1Form.get('amount').value > this.amountLimit) &&
                        ( ((this.currentRequest.type !== 'TRIP') &&
                            (this.currentRequest.type !== 'CONTRACT') ) &&
                            (this.updateStage1Form.get('supplierSelectionMethod').value !== 'AWARD_PROCEDURE') ) ) {

                this.errorMessage = 'Για ποσά άνω των 20.000 € οι αναθέσεις πρέπει να γίνονται μέσω διαγωνισμού.';
            } else if ( (this.currentRequest.type !== 'TRIP') && (this.currentRequest.type !== 'CONTRACT') &&
                        ( this.updateStage1Form.get('supplierSelectionMethod').value !== 'AWARD_PROCEDURE' ) &&
                        !this.updateStage1Form.get('supplier').value ) {

                this.errorMessage = 'Είναι υποχρεωτικό να προσθέσετε πληροφορίες για τον προμηθευτή.';
            } else if ( (( this.updateStage1Form.get('supplierSelectionMethod').value !== 'DIRECT' ) &&
                         ((this.currentRequest.type !== 'TRIP') &&
                          (this.currentRequest.type !== 'CONTRACT') )) &&
                        ((!this.uploadedFiles) && (!this.currentRequest.stage1.attachments) )) {

                this.errorMessage = 'Για αναθέσεις μέσω διαγωνισμού ή έρευνας αγοράς η επισύναψη εγγράφων είναι υποχρεωτική.';
            } else if ( (this.currentRequest.type !== 'SERVICES_CONTRACT') &&
                        (+this.updateStage1Form.get('amount').value > this.lowAmountLimit) &&
                        (!this.currentRequest.stage1.attachments) &&
                        !this.uploadedFiles ) {

                this.errorMessage = 'Για αιτήματα άνω των 2.500 € η επισύναψη εγγράφων είναι υποχρεωτική.';
            } else {
                const updatedRequest = new FormData();
                updatedRequest.append('subject', this.updateStage1Form.get('requestText').value);
                updatedRequest.append('amount', this.updateStage1Form.get('amount').value);
                if ((this.currentRequest.type !== 'CONTRACT') && (this.currentRequest.type !== 'TRIP')) {
                    updatedRequest.append('supplier', this.updateStage1Form.get('supplier').value);
                    updatedRequest.append('supplier_selection_method', this.updateStage1Form.get('supplierSelectionMethod').value);
                }
                if ( this.uploadedFiles ) {
                    for (const file of this.uploadedFiles) {
                        updatedRequest.append('attachments', file, file.name);
                    }
                }

                this.emitRequest.emit(updatedRequest);

            }

        } else {
            this.errorMessage = 'Τα πεδία που σημειώνονται με (*) είναι υποχρεωτικά';
        }
    }

    setIsSupplierReq(val: boolean) {
        this.isSupplierRequired = val;
    }

    checkIfSupplierIsRequired() {
        if (this.updateStage1Form.get('supplierSelectionMethod').value) {
            this.setIsSupplierReq( (this.updateStage1Form.get('supplierSelectionMethod').value !== 'AWARD_PROCEDURE' ) );
        }
    }

    showAmount() {

        if ( this.updateStage1Form.get('amount').value ) {
             if (this.updateStage1Form.get('amount').value.trim().includes(',')) {

                 const temp = this.updateStage1Form.get('amount').value.replace(',', '.');
                 this.updateStage1Form.get('amount').setValue(temp);
             }
        }

        this.updateStage1Form.get('amount').updateValueAndValidity();
        if ( !isNaN(this.updateStage1Form.get('amount').value.trim()) ) {
            this.requestedAmount = this.updateStage1Form.get('amount').value.trim();
        }

        if ( (this.updateStage1Form.get('amount').value !== '') &&
            (+this.updateStage1Form.get('amount').value > this.lowAmountLimit) &&
            (+this.updateStage1Form.get('amount').value <= this.amountLimit) &&
            (this.currentRequest.type === 'REGULAR') ) {

            this.showWarning = true;
        } else {
            this.showWarning = false;
        }
    }

}

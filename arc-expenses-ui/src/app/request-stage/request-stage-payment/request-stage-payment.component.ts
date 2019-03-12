import { Component, OnInit } from '@angular/core';
import { BaseInfo, Request, RequestPayment, RequestSummary } from '../../domain/operation';
import { paymentStages, requesterPositions, requestTypes, supplierSelectionMethodsMap } from '../../domain/stageDescriptions';
import { RequestInfo } from '../../domain/requestInfoClasses';
import { AnchorItem } from '../../shared/dynamic-loader-anchor-components/anchor-item';
import { ActivatedRoute, Router } from '@angular/router';
import { ManageRequestsService } from '../../services/manage-requests.service';
import { AuthenticationService } from '../../services/authentication.service';
import { mergeMap, tap } from 'rxjs/operators';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { printRequestPage } from '../print-request-function';

@Component({
    selector: 'app-request-stage-payment',
    templateUrl: './request-stage-payment.component.html'
})
export class RequestStagePaymentComponent implements OnInit {
    errorMessage: string;
    notFoundMessage: string;
    successMessage: string;
    showSpinner: boolean;

    isSimpleUser: boolean;
    requestId: string;
    currentRequest: Request;
    currentRequestPayment: RequestPayment;
    canEdit: boolean;
    stages: string[];
    reqPositions = requesterPositions;
    selMethods = supplierSelectionMethodsMap;
    stateNames = {
        PENDING: 'βρίσκεται σε εξέλιξη',
        UNDER_REVIEW: 'βρίσκεται σε εξέλιξη',
        REJECTED: 'έχει απορριφθεί',
        ACCEPTED: 'έχει ολοκληρωθεί',
        CANCELLED: 'έχει ακυρωθεί'
    };
    reqTypes = requestTypes;

    currentRequestInfo: RequestInfo;

    stageLoaderItemList: AnchorItem[];

    constructor(private route: ActivatedRoute,
                private router: Router,
                private requestService: ManageRequestsService,
                private authService: AuthenticationService) {
    }

    ngOnInit() {
        this.isSimpleUser = (this.authService.getUserRole().some(x => x.authority === 'ROLE_USER') &&
                             (this.authService.getUserRole().length === 1));
        console.log(`current user role is: ${JSON.stringify(this.authService.getUserRole())}`);
        this.getCurrentRequest();
    }

    getCurrentRequest() {
        this.showSpinner = true;
        this.requestId = this.route.snapshot.paramMap.get('id');
        this.errorMessage = '';
        this.notFoundMessage = '';

        /*call api to get request info or throw errorMessage*/
        const result = this.requestService.getRequestPaymentById(this.requestId).pipe(
            tap(res => this.currentRequestPayment = res),
            mergeMap( res =>
                this.requestService.getRequestById(res.requestId, this.authService.getUserProp('email'))
            ));
        result.subscribe(
            req => {
                this.currentRequest = req;
                console.log(`The archiveid of the currentRequest is ${req.archiveId}`);
            },
            error => {
                console.log(error);
                this.showSpinner = false;
                console.log('error status is', error.status);
                if (error instanceof HttpErrorResponse) {
                    if (error.status === 404) {
                        this.notFoundMessage = 'Το αίτημα που ζητήσατε δεν βρέθηκε.';
                    } else {
                        this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την ανάκτηση του αιτήματος.';
                    }
                }
            },
            () => {
                this.stages = paymentStages;
                this.currentRequestInfo = new RequestInfo(this.currentRequestPayment.id, this.currentRequest.id);
                this.checkIfStageIs7();
                this.showSpinner = false;
                // TODO:: REMOVE THE LINE BELOW WHEN THE BACK SENDS THIS INFO
                this.canEdit = true;
                this.updateShowStageFields();
            }
        );
    }

    checkIfStageIs7() {
        if ( (this.currentRequestPayment.stage === '7') &&
             ((this.currentRequest.type === 'REGULAR') || (this.currentRequest.type === 'TRIP')) ) {

            this.currentRequestInfo.finalAmount = '';
            if ( this.currentRequest.stage1.finalAmount ) {
                this.currentRequestInfo.finalAmount = (this.currentRequest.stage1.finalAmount).toString();
            }
        }
    }

    getSubmittedStage(submittedData: any[]) {
        console.log(`got ${JSON.stringify(submittedData, null, 1)}`);
        this.updateRequest(submittedData[0], submittedData[1]);
    }

    getFinalAmount(newVals: string[]) {
        if (newVals && newVals.length === 1) {
            this.currentRequest.stage1.finalAmount = +newVals[0];
        }
    }

    updateRequest(mode: string, submitted: FormData) {
        window.scrollTo(0, 0);
        this.showSpinner = true;
        this.errorMessage = '';
        this.successMessage = '';
        if (this.currentRequestPayment.stage === '7') {
            submitted.append('finalAmount', this.currentRequest.stage1.finalAmount.toString());
        }
        this.requestService.submitUpdate<any>('payment', mode, this.currentRequest.id, submitted).subscribe(
            event => {
                if (event.type === HttpEventType.UploadProgress) {
                    console.log('uploadAttachment responded: ', event.loaded);
                } else if ( event instanceof HttpResponse) {
                    console.log('final event:', event.body);
                }
            },
            error => {
                console.log(error);
                this.showSpinner = false;
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                this.getCurrentRequest();
            },
            () => {
                this.successMessage = 'Οι αλλαγές αποθηκεύτηκαν.';
                this.getCurrentRequest();
            }
        );
    }


    updateShowStageFields() {
        for ( let i = 0; i < this.stages.length; i++ ) {
            this.currentRequestInfo[this.stages[i]].showStage = this.willShowStage(this.stages[i]);
        }
    }

    willShowStage(stage: string) {
        const stageField = 'stage' + stage;
        if ( (stage === this.currentRequestPayment.stage) &&
            (this.currentRequestPayment.status !== 'REJECTED') &&
            (this.currentRequestPayment.status !== 'ACCEPTED') &&
            (this.currentRequestPayment.status !== 'CANCELLED') &&
            ( (this.authService.getUserRole().some(x => x.authority === 'ROLE_ADMIN')) || (this.canEdit === true) ) ) {

            this.stageLoaderItemList = [
                new AnchorItem(
                    this.currentRequestInfo[stage]['stageComponent'],
                    {
                        currentStage: this.currentRequestPayment['stage' + stage],
                        currentRequestInfo: this.currentRequestInfo
                    }
                ),
            ];

            return 1;

        } else {
            if (stage === '1') {
                return 2;
            }
            if ( (this.currentRequestPayment[stageField]) && (this.currentRequestPayment[stageField].date) ) {

                if ( !this.isSimpleUser || (stage === '7') ) {

                    if ( this.stages.indexOf(this.currentRequestPayment.stage) < this.stages.indexOf(stage)) {
                        return 4;
                    }

                    if ( (stage === this.currentRequestPayment.stage) && (this.stages.indexOf(stage) > 0) ) {

                        const prevStageField = 'stage' + this.stages[this.stages.indexOf(stage) - 1];
                        if ( (this.currentRequestPayment[prevStageField]) &&
                             (this.currentRequestPayment[prevStageField].date) &&
                             (this.currentRequestPayment[prevStageField].date > this.currentRequestPayment[stageField].date) ) {

                            return 4;
                        }
                    }

                    if ( ((this.currentRequestPayment[stageField]['approved']) &&
                          this.currentRequestPayment[stageField]['approved'] === true ) ||
                          (stage === '11') ) {

                        return 2;

                    } else {
                        return 3;
                    }
                }
            }
        }

        return 0;
    }

    linkToFile(fileIndex: number) {
        if (this.currentRequest.stage1.attachments &&
            this.currentRequest.stage1.attachments[fileIndex]) {

            let url = `${window.location.origin}/arc-expenses-service/request/store/download?`;
            url = `${url}id=${this.currentRequest.id}&stage=1&mode=request`;
            url = `${url}&filename=${this.currentRequest.stage1.attachments[fileIndex].filename}`;

            window.open(url, '_blank', 'enabledstatus=0,toolbar=0,menubar=0,location=0');
        }
    }

    printRequest(): void {
        printRequestPage(this.currentRequest.id, this.reqTypes[this.currentRequest.type]);
    }

    userIsAdmin() {
        return (this.authService.getUserRole().some(x => x.authority === 'ROLE_ADMIN'));
    }

}

import { Component, OnInit } from '@angular/core';
import { BaseInfo, Request, RequestApproval, RequestPayment, RequestSummary,
         Stage10, Stage11, Stage12, Stage13, Stage7, Stage8, Stage9 } from '../domain/operation';
import { ActivatedRoute, Router } from '@angular/router';
import { ManageRequestsService } from '../services/manage-requests.service';
import { AuthenticationService } from '../services/authentication.service';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { approvalStages, requesterPositions, requestTypes, stageTitles, supplierSelectionMethodsMap } from '../domain/stageDescriptions';
import { printRequestPage } from './print-request-function';
import { AnchorItem } from '../shared/dynamic-loader-anchor-components/anchor-item';
import { RequestInfo } from '../domain/requestInfoClasses';
import { mergeMap, tap } from 'rxjs/operators';

declare var UIkit: any;

@Component({
    selector: 'app-request-stage',
    templateUrl: './request-stage.component.html',
    styleUrls: ['./request-stage.component.scss']
})
export class RequestStageComponent implements OnInit {
    errorMessage: string;
    notFoundMessage: string;
    successMessage: string;
    showSpinner: boolean;

    isSimpleUser: boolean;
    requestId: string;
    currentRequest: Request;
    currentRequestApproval: RequestApproval;
    currentRequestPayments: RequestPayment[] = [];
    canEdit: boolean;
    stages: string[];
    stagesMap = stageTitles;
    reqPositions = requesterPositions;
    selMethods = supplierSelectionMethodsMap;
    stateNames = {
        PENDING: 'βρίσκεται σε εξέλιξη', UNDER_REVIEW: 'βρίσκεται σε εξέλιξη',
        REJECTED: 'έχει απορριφθεί', ACCEPTED: 'έχει ολοκληρωθεί', CANCELLED: 'έχει ακυρωθεί'
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
        this.getCurrentRequest();
        this.isSimpleUser = (this.authService.getUserRole().some(x => x.authority === 'ROLE_USER') &&
                             (this.authService.getUserRole().length === 1));
        console.log(`current user role is: ${JSON.stringify(this.authService.getUserRole())}`);
    }

    getCurrentRequest() {
        this.showSpinner = true;
        this.requestId = this.route.snapshot.paramMap.get('id');
        this.errorMessage = '';
        this.notFoundMessage = '';

        /*call api to get request info or throw errorMessage*/
        const result = this.requestService.getRequestApprovalById(this.requestId).pipe(
                            tap(res => this.currentRequestApproval = res),
                            mergeMap( res =>
                                this.requestService.getRequestById(res.requestId, this.authService.getUserProp('email'))
                            ));
        result.subscribe (
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
                this.showSpinner = false;
                this.stages = approvalStages;
                this.currentRequestInfo = new RequestInfo(this.currentRequestApproval.id, this.currentRequest.id);
                this.checkIfStageIs5b();
                // TODO:: REMOVE THE LINE BELOW WHEN THE BACK SENDS THIS INFO
                this.canEdit = true;
                // this.getIfUserCanEditRequest();
                if ((this.currentRequest.type !== 'CONTRACT') &&
                    (this.currentRequestApproval.status === 'ACCEPTED')) {
                    this.getRequestPayments();
                }

            }
        );
    }

    checkIfStageIs5b() {
        if ( (this.currentRequestApproval.stage === '5b') &&
             (this.currentRequest.stage1.supplierSelectionMethod === 'AWARD_PROCEDURE') ) {

            this.currentRequestInfo.supplier = '';
            this.currentRequestInfo.requestedAmount = '';
            if ( this.currentRequest.stage1.supplier ) {
                this.currentRequestInfo.supplier = this.currentRequest.stage1.supplier;
            }
            if ( this.currentRequest.stage1.amountInEuros ) {
                this.currentRequestInfo.requestedAmount = (this.currentRequest.stage1.amountInEuros).toString();
            }
        }
    }

    getRequestPayments() {
        this.errorMessage = '';
        this.requestService.getPaymentsOfRequest(this.currentRequest.id).subscribe(
            res => this.currentRequestPayments = res.results,
            error => {
                console.log(error);
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την ανάκτηση του αιτήματος.';
                this.showSpinner = false;
            },
            () => this.showSpinner = false
        );
    }

    getSubmittedStage(submittedData: any[]) {
        console.log(`got ${JSON.stringify(submittedData, null, 1)}`);
        this.updateRequest(submittedData[0], submittedData[1]);
    }

    getUpdatedRequest(updatedRequest: FormData) {
        this.updateRequest('approve', updatedRequest);
    }

    getNewSupplierAndAmount(newVals: string[]) {
        if (newVals && newVals.length === 2) {
            this.currentRequest.stage1.supplier = newVals[0];
            this.currentRequest.stage1.amountInEuros = +newVals[1];
            this.currentRequest.stage1.finalAmount = +newVals[1];
        }
    }

    updateRequest(mode: string, submitted: FormData) {
        window.scrollTo(0, 0);
        this.showSpinner = true;
        this.errorMessage = '';
        this.successMessage = '';
        if (this.currentRequestApproval.stage === '5b') {
            submitted.append('supplier', this.currentRequest.stage1.supplier);
            submitted.append('amount', this.currentRequest.stage1.amountInEuros.toString());
        }
        this.requestService.submitUpdate<any>(mode, this.currentRequest.id, submitted).subscribe(
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
        for ( let i = 1; i < this.stages.length; i++ ) {
            this.currentRequestInfo[this.stages[i]].showStage = this.willShowStage(this.stages[i]);
        }
    }

    willShowStage(stage: string) {
        const stageField = 'stage' + stage;
        if ((stage === this.currentRequestApproval.stage) &&
            (this.currentRequestApproval.status !== 'REJECTED') &&
            (this.currentRequestApproval.status !== 'ACCEPTED') &&
            (this.currentRequestApproval.status !== 'CANCELLED') &&
            ( (this.authService.getUserRole().some(x => x.authority === 'ROLE_ADMIN')) || (this.canEdit === true) ) ) {

            if (this.currentRequestApproval.stage !== '1') {
                this.stageLoaderItemList = [
                    new AnchorItem(
                        this.currentRequestInfo[stage]['stageComponent'],
                        {
                            currentStage: this.currentRequestApproval['stage' + stage],
                            currentRequestInfo: this.currentRequestInfo
                        }
                    ),
                ];
            }

            return 1;

        } else {
            if (stage === '1') {
                return 2;
            }
            if ( (this.currentRequestApproval[stageField]) && (this.currentRequestApproval[stageField].date)) {

                if (!this.isSimpleUser || (stage === '2') ) {

                    if ( this.stages.indexOf(this.currentRequestApproval.stage) < this.stages.indexOf(stage)) {
                        return 4;
                    }

                    if ( (stage === this.currentRequestApproval.stage) && (this.stages.indexOf(stage) > 0)) {

                        const prevStageField = 'stage' + this.stages[this.stages.indexOf(stage) - 1];
                        if ((this.currentRequestApproval[prevStageField]) &&
                            (this.currentRequestApproval[prevStageField].date) &&
                            (this.currentRequestApproval[prevStageField].date > this.currentRequestApproval[stageField].date) ) {

                            return 4;
                        }
                    }

                if ( (this.currentRequestApproval[stageField]['approved'] &&
                      this.currentRequestApproval[stageField]['approved'] === true ) ||
                      (stage === '6') ) {

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
        if (this.currentRequest.stage1.attachments && this.currentRequest.stage1.attachments[fileIndex].url) {
            let url = `${window.location.origin}/arc-expenses-service/request/store/download?`;
            url = `${url}requestId=${this.currentRequest.id}&stage=1&mode=request`;
            console.log(url);
            window.open(url, '_blank', 'enabledstatus=0,toolbar=0,menubar=0,location=0');
        }
    }

    printRequest() {
        printRequestPage(this.currentRequest.id, this.reqTypes[this.currentRequest.type]);
    }

    createRequestPayment() {
        const newRequestPayment = new RequestPayment();
        newRequestPayment.id = '';
        newRequestPayment.requestId = this.currentRequest.id;
        newRequestPayment.creationDate = Date.now().toString();
        newRequestPayment.stage = '7';
        newRequestPayment.status = 'PENDING';
        newRequestPayment.stage7 = new Stage7();
        newRequestPayment.stage8 = new Stage8();
        newRequestPayment.stage9 = new Stage9();
        newRequestPayment.stage10 = new Stage10();
        newRequestPayment.stage11 = new Stage11();
        newRequestPayment.stage12 = new Stage12();
        newRequestPayment.stage13 = new Stage13();

        this.requestService.addRequestPayment(newRequestPayment).subscribe(
            res => {
                    console.log(JSON.stringify(res));
                    this.router.navigate(['/requests/request-stage-payment', res.id]);
                },
            error => {
                console.log(error);
                this.showSpinner = false;
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                this.getCurrentRequest();
            },
            () => {
                this.successMessage = 'Οι αλλαγές αποθηκεύτηκαν.';
                // TODO:: REMOVE THE LINE BELOW WHEN THE BACK SENDS THIS INFO
                this.canEdit = true;
                this.updateShowStageFields();
                // this.getIfUserCanEditRequest();
            }
        );
    }

    getStatusAsString( status: string ) {
        if ( (status === 'PENDING') || (status === 'UNDER_REVIEW') ) {
            return 'σε εξέλιξη';
        } else if (status === 'ACCEPTED') {
            return 'ολοκληρωθηκε';
        } else {
            return 'απορρίφθηκε';
        }
    }

    userIsAdmin() {
        return (this.authService.getUserRole().some(x => x.authority === 'ROLE_ADMIN'));
    }

    userIsRequester() {
        return (this.authService.getUserProp('email') === this.currentRequest.user.email);
    }

    confirmedCancel() {
        this.requestService.submitUpdate<any>('cancel', this.currentRequest.id).subscribe(
            event => {
                if (event.type === HttpEventType.UploadProgress) {
                    console.log('cancel request responded: ', event.loaded);
                } else if ( event instanceof HttpResponse) {
                    console.log('final event:', event.body);
                }
            },
            error => {
                console.log(error);
                this.showSpinner = false;
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                this.getCurrentRequest();
                UIkit.modal('#cancellationModal').hide();
            },
            () => {
                this.successMessage = 'Το αίτημα ακυρώθηκε.';
                this.showSpinner = false;
                this.getCurrentRequest();
                UIkit.modal('#cancellationModal').hide();
            }
        );
    }

}

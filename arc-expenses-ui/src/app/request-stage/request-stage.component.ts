import { Component, OnInit } from '@angular/core';
import { RequestPayment, RequestResponse } from '../domain/operation';
import { ActivatedRoute, Router } from '@angular/router';
import { ManageRequestsService } from '../services/manage-requests.service';
import { AuthenticationService } from '../services/authentication.service';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { approvalStages, requesterPositions, requestTypes, stageTitles, supplierSelectionMethodsMap } from '../domain/stageDescriptions';
import { printRequestPage } from './print-request-function';
import { AnchorItem } from '../shared/dynamic-loader-anchor-components/anchor-item';
import { RequestInfo } from '../domain/requestInfoClasses';

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
    currentRequestApproval: RequestResponse;
    currentRequestPayments: RequestPayment[] = [];
    stages: string[] = approvalStages;
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
        console.log(`isSimpleUser is: ${this.isSimpleUser}`);
    }

    getCurrentRequest() {
        this.showSpinner = true;
        this.requestId = this.route.snapshot.paramMap.get('id');
        this.errorMessage = '';
        this.notFoundMessage = '';

        /*call api to get request info or throw errorMessage*/
        this.requestService.getRequestApprovalById(this.requestId).subscribe(
            res => this.currentRequestApproval = res,
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
                this.currentRequestInfo = new RequestInfo(this.currentRequestApproval.baseInfo.id,
                                                          this.currentRequestApproval.baseInfo.requestId);
                this.checkIfStageIs5b();
                if ((this.currentRequestApproval.type !== 'CONTRACT') &&
                    (this.currentRequestApproval.baseInfo.status === 'ACCEPTED')) {
                    this.getRequestPayments();
                } else {
                    this.updateShowStageFields();
                }

            }
        );
    }

    checkIfStageIs5b() {
        if ( (this.currentRequestApproval.baseInfo.stage === '5b') &&
             (this.currentRequestApproval.stages['1']['supplierSelectionMethod'] === 'AWARD_PROCEDURE') ) {

            this.currentRequestInfo.supplier = '';
            this.currentRequestInfo.requestedAmount = '';
            if ( this.currentRequestApproval.stages['1']['supplier'] ) {
                this.currentRequestInfo.supplier = this.currentRequestApproval.stages['1']['supplier'];
            }
            if ( this.currentRequestApproval.stages['1']['amountInEuros'] ) {
                this.currentRequestInfo.requestedAmount = (this.currentRequestApproval.stages['1']['amountInEuros']).toString();
            }
        }
    }

    getRequestPayments() {
        this.errorMessage = '';
        this.requestService.getPaymentsOfRequest(this.currentRequestApproval.baseInfo.requestId).subscribe(
            res => this.currentRequestPayments = res.results,
            error => {
                console.log(error);
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την ανάκτηση του αιτήματος.';
                this.showSpinner = false;
            },
            () => {
                this.showSpinner = false;
                this.updateShowStageFields();
            }
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
            this.currentRequestApproval.stages['1']['supplier'] = newVals[0];
            this.currentRequestApproval.stages['1']['amountInEuros'] = +newVals[1];
            this.currentRequestApproval.stages['1']['finalAmount'] = +newVals[1];
        }
    }

    updateRequest(mode: string, submitted: FormData) {
        window.scrollTo(0, 0);
        this.showSpinner = true;
        this.errorMessage = '';
        this.successMessage = '';
        if (this.currentRequestApproval.baseInfo.stage === '5b') {
            submitted.append('supplier', this.currentRequestApproval.stages['1']['supplier']);
            submitted.append('amount', this.currentRequestApproval.stages['1']['amountInEuros'].toString());
        }
        this.requestService.submitUpdate<any>('request', mode, this.currentRequestApproval.baseInfo.requestId, submitted)
            .subscribe(
                event => {
                    if (event.type === HttpEventType.UploadProgress) {
                        console.log('update progress says:', event.loaded);
                    } else if ( event instanceof HttpResponse) {
                        console.log('final event:', event.body);
                    }
                },
                error => {
                    console.log(error);
                    this.showSpinner = false;
                    this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                    // this.getCurrentRequest();
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
            // console.log(`${this.stages[i]} is ${this.currentRequestInfo[this.stages[i]].showStage}`);
        }
    }

    willShowStage(stage: string) {
        if ((stage === this.currentRequestApproval.baseInfo.stage) &&
            (this.currentRequestApproval.baseInfo.status !== 'REJECTED') &&
            (this.currentRequestApproval.baseInfo.status !== 'ACCEPTED') &&
            (this.currentRequestApproval.baseInfo.status !== 'CANCELLED') &&
            ( (this.authService.getUserRole().some(x => x.authority === 'ROLE_ADMIN')) ||
              (this.currentRequestApproval.canEdit === true) ) ) {

            if (this.currentRequestApproval.baseInfo.stage !== '1') {
                if (this.currentRequestApproval.stages[stage] == null) {
                    this.currentRequestApproval.stages[stage] = this.currentRequestInfo.createNewStageObject(stage);
                }
                this.stageLoaderItemList = [
                    new AnchorItem(
                        this.currentRequestInfo[stage]['stageComponent'],
                        {
                            currentStage: this.currentRequestApproval.stages[stage],
                            currentRequestInfo: this.currentRequestInfo
                        }
                    )
                ];
            }

            return 1;

        } else {
            if (stage === '1') {
                return 2;
            }
            if ( (this.currentRequestApproval.stages[stage]) && (this.currentRequestApproval.stages[stage].date)) {
                if (!this.isSimpleUser || (stage === '2') ) {
                    if ( this.stages.indexOf(this.currentRequestApproval.baseInfo.stage) < this.stages.indexOf(stage)) {
                        return 4;
                    }

                    if ( stage === this.currentRequestApproval.baseInfo.stage ) {

                        const prevStage = this.stages[this.stages.indexOf(stage) - 1];
                        if ((this.currentRequestApproval.stages[prevStage]) &&
                            (this.currentRequestApproval.stages[prevStage].date) &&
                            (this.currentRequestApproval.stages[prevStage].date > this.currentRequestApproval.stages[stage].date) ) {

                            return 4;
                        }
                    }

                    if ( ((this.currentRequestApproval.stages[stage]['approved'] != null) &&
                          this.currentRequestApproval.stages[stage]['approved'] === true ) ||
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
        if (this.currentRequestApproval.stages['1'].attachments &&
            this.currentRequestApproval.stages['1'].attachments[fileIndex] &&
            this.currentRequestApproval.stages['1'].attachments[fileIndex].url) {

            let url = `${window.location.origin}/arc-expenses-service/request/store/download?`;
            url = `${url}archiveId=${this.currentRequestApproval.stages['1'].attachments[fileIndex].url}`;
            url = `${url}&filename=${this.currentRequestApproval.stages['1'].attachments[fileIndex].filename}`;

            window.open(url, '_blank', 'enabledstatus=0,toolbar=0,menubar=0,location=0');
        }
    }

    printRequest() {
        printRequestPage(this.currentRequestApproval.baseInfo.requestId, this.reqTypes[this.currentRequestApproval.type]);
    }

    createRequestPayment() {

        this.requestService.addRequestPayment(this.currentRequestApproval.baseInfo.requestId).subscribe(
            res => {
                    console.log(JSON.stringify(res));
                    this.router.navigate(['/requests/request-stage-payment', res.id]);
                },
            error => {
                console.log(error);
                this.showSpinner = false;
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                // this.getCurrentRequest();
            },
            () => {
                this.successMessage = 'Οι αλλαγές αποθηκεύτηκαν.';
                this.showSpinner = false;
                this.getCurrentRequest();
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
        return ((this.authService.getUserProp('firstname') + ' ' + this.authService.getUserProp('lastname')) ===
                this.currentRequestApproval.requesterFullName);
    }

    confirmedCancel() {
        this.requestService.submitUpdate<any>('request', 'cancel',
                                               this.currentRequestApproval.baseInfo.requestId).subscribe(
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

    confirmedFinalize() {
        UIkit.modal('#finalizingModal').hide();
    }

}

import { Component, OnInit } from '@angular/core';
import { RequestResponse } from '../../domain/operation';
import { paymentStages, requesterPositions, requestTypes,
         statusNamesMap, supplierSelectionMethodsMap } from '../../domain/stageDescriptions';
import { RequestInfo } from '../../domain/requestInfoClasses';
import { AnchorItem } from '../../shared/dynamic-loader-anchor-components/anchor-item';
import { ActivatedRoute, Router } from '@angular/router';
import { ManageRequestsService } from '../../services/manage-requests.service';
import { AuthenticationService } from '../../services/authentication.service';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { printRequestPage } from '../print-request-function';
import { mergeMap, tap } from 'rxjs/operators';

declare var UIkit: any;

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
    currentRequestPayment: RequestResponse;
    totalPaymentsOfRequest: number;
    stages: string[] = paymentStages;
    reqPositions = requesterPositions;
    selMethods = supplierSelectionMethodsMap;
    stateNames = statusNamesMap;
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

        const result = this.requestService.getRequestPaymentById(this.requestId).pipe(
            tap(res => this.currentRequestPayment = res),
            mergeMap( res =>
                this.requestService.getPaymentsOfRequest(res.baseInfo.requestId)
            ));

        /* get request info */
        result.subscribe(
            req => {
                this.totalPaymentsOfRequest = req.total;
                console.log(`total payments are: ${this.totalPaymentsOfRequest}`);
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
                this.currentRequestInfo = new RequestInfo(this.currentRequestPayment.baseInfo.id,
                                                          this.currentRequestPayment.baseInfo.requestId);
                console.log(this.authService.getUserProp('email'));
                console.log(JSON.stringify(this.currentRequestPayment.baseInfo));
                this.checkIfStageIs7();
                this.showSpinner = false;
                this.updateShowStageFields();
            }
        );
    }

    checkIfStageIs7() {
        if ( (this.currentRequestPayment.baseInfo.stage === '7') &&
             ((this.currentRequestPayment.type === 'REGULAR') || (this.currentRequestPayment.type === 'TRIP')) ) {

            this.currentRequestInfo.finalAmount = '';
            if ( this.currentRequestPayment.stages['1']['finalAmount'] ) {
                this.currentRequestInfo.finalAmount = (this.currentRequestPayment.stages['1']['finalAmount']).toString();
            }
        }
    }

    getSubmittedStage(submittedData: any[]) {
        this.updateRequest(submittedData[0], submittedData[1]);
    }

    getFinalAmount(newVals: string[]) {
        if (newVals && newVals.length === 1) {
            this.currentRequestPayment.stages['1']['finalAmount'] = +newVals[0];
        }
    }

    updateRequest(mode: string, submitted: FormData) {
        window.scrollTo(0, 0);
        this.showSpinner = true;
        this.errorMessage = '';
        this.successMessage = '';
        if (this.currentRequestPayment.baseInfo.stage === '7') {
            submitted.append('finalAmount', this.currentRequestPayment.stages['1']['finalAmount'].toString());
        }
        this.requestService.submitUpdate<any>('payment', mode, this.currentRequestPayment.baseInfo.id, submitted).subscribe(
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
        for ( let i = 0; i < this.stages.length; i++ ) {
            this.currentRequestInfo[this.stages[i]].showStage = this.willShowStage(this.stages[i]);
        }
    }

    willShowStage(stage: string) {
        if ( (stage === this.currentRequestPayment.baseInfo.stage) &&
            (this.currentRequestPayment.baseInfo.status !== 'REJECTED') &&
            (this.currentRequestPayment.baseInfo.status !== 'ACCEPTED') &&
            (this.currentRequestPayment.baseInfo.status !== 'CANCELLED') &&
            ( this.userIsAdmin() || (this.currentRequestPayment.canEdit === true) ) ) {

            if (this.currentRequestPayment.stages[stage] == null) {
                this.currentRequestPayment.stages[stage] = this.currentRequestInfo.createNewStageObject(stage);
            }
            this.stageLoaderItemList = [
                new AnchorItem(
                    this.currentRequestInfo[stage]['stageComponent'],
                    {
                        currentStage: this.currentRequestPayment.stages[stage],
                        currentRequestInfo: this.currentRequestInfo
                    }
                )
            ];

            return 1;

        } else {
            if (stage === '1') {
                return 2;
            }
            if ( (this.currentRequestPayment.stages[stage]) && (this.currentRequestPayment.stages[stage].date) ) {
                if ( !this.isSimpleUser || (stage === '7') ) {
                    if ( this.stages.indexOf(this.currentRequestPayment.baseInfo.stage) < this.stages.indexOf(stage)) {
                        return 4;
                    }

                    if ( (stage === this.currentRequestPayment.baseInfo.stage) && (this.stages.indexOf(stage) > 0) ) {

                        const prevStage = this.stages[this.stages.indexOf(stage) - 1];
                        if ( (this.currentRequestPayment.stages[prevStage]) &&
                             (this.currentRequestPayment.stages[prevStage].date) &&
                             (this.currentRequestPayment.stages[prevStage].date > this.currentRequestPayment.stages[stage].date) ) {

                            return 4;
                        }
                    }

                    if ( ((this.currentRequestPayment.stages[stage]['approved']) &&
                          this.currentRequestPayment.stages[stage]['approved'] === true ) ||
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

    canBeCancelled() {
        if (this.userIsAdmin() || this.userIsRequester() || this.userIsOnBehalfUser()) {
            return ((this.currentRequestPayment.baseInfo.status === 'PENDING') ||
                    (this.currentRequestPayment.baseInfo.status === 'UNDER_REVIEW'));
        }
        return false;
    }

    userIsAdmin() {
        return (this.authService.getUserRole().some(x => x.authority === 'ROLE_ADMIN'));
    }

    userIsRequester() {
        return (this.authService.getUserProp('email') === this.currentRequestPayment.requesterEmail);
    }

    userIsOnBehalfUser() {
        return (this.authService.getUserProp('email') === this.currentRequestPayment.onBehalfEmail);
    }

    confirmedCancel(cancelWholeRequest: boolean) {
        /* TODO:: !!!!!!!!!!!!!!! on payment AND request cancel, also cancel the approval */
        window.scrollTo(0, 0);
        this.showSpinner = true;
        this.errorMessage = '';
        this.successMessage = '';
        this.requestService.cancelRequestPayment(this.currentRequestPayment.baseInfo.id, cancelWholeRequest).subscribe(
            res => console.log('cancel payment responded: ', JSON.stringify(res)),
            error => {
                console.log(error);
                this.showSpinner = false;
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                this.getCurrentRequest();
                UIkit.modal('#cancellationModal').hide();
            },
            () => {
                this.errorMessage = '';
                this.showSpinner = false;
                UIkit.modal('#cancellationModal').hide();
                if (cancelWholeRequest) {
                    this.router.navigate(['/requests']);
                } else if (this.totalPaymentsOfRequest > 1) {
                    this.router.navigate(['/requests/request-stage', this.currentRequestPayment.baseInfo.requestId + '-a1']);
                } else {
                    this.getCurrentRequest();
                }
            }
        );
    }


    linkToFile(fileIndex: number) {
        if (this.currentRequestPayment.stages['1'].attachments &&
            this.currentRequestPayment.stages['1'].attachments[fileIndex] &&
            this.currentRequestPayment.stages['1'].attachments[fileIndex].url) {

            let url = `${window.location.origin}/arc-expenses-service/request/store/download?`;
            url = `${url}archiveId=${encodeURIComponent(this.currentRequestPayment.stages['1'].attachments[fileIndex].url)}`;
            url = `${url}&id=${this.currentRequestPayment.baseInfo.requestId}-a1`;
            url = `${url}&mode=approval`;
            url = `${url}&filename=${encodeURIComponent(this.currentRequestPayment.stages['1'].attachments[fileIndex].filename)}`;

            window.open(url, '_blank');
        }
    }

    printRequest(): void {
        printRequestPage(this.currentRequestPayment.baseInfo.id);
    }

}

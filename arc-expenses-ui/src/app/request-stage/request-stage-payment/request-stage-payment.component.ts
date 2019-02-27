import { Component, OnInit } from '@angular/core';
import { BaseInfo, Request, RequestPayment, RequestSummary } from '../../domain/operation';
import { paymentStages, requestTypes } from '../../domain/stageDescriptions';
import { RequestInfo } from '../../domain/requestInfoClasses';
import { AnchorItem } from '../../shared/dynamic-loader-anchor-components/anchor-item';
import { ActivatedRoute, Router } from '@angular/router';
import { ManageRequestsService } from '../../services/manage-requests.service';
import { AuthenticationService } from '../../services/authentication.service';
import { concatMap, mergeMap, tap } from 'rxjs/operators';
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

    readonly amountLimit = 20000;
    readonly lowAmountLimit = 2500;

    uploadedFiles: File[] = [];
    uploadedFilesURLs: string[] = [];

    updatedFinalAmount: number;

    isSimpleUser: boolean;
    requestId: string;
    currentRequest: Request;
    currentRequestPayment: RequestPayment;
    currentStageName: string;
    canEdit: boolean;
    wentBackOneStage: boolean;
    requestNeedsUpdate: boolean;
    stages: string[];
    stateNames = {
        pending: 'βρίσκεται σε εξέλιξη',
        under_review: 'βρίσκεται σε εξέλιξη',
        rejected: 'έχει απορριφθεί',
        accepted: 'έχει ολοκληρωθεί',
        cancelled: 'έχει ακυρωθεί'
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
                if (this.currentRequest.type === 'trip') {
                    this.currentRequestInfo = new RequestInfo(this.currentRequestPayment.id,
                                                              this.currentRequest.id,
                                                              this.currentRequest.user,
                                                              this.currentRequest.project,
                                                              this.currentRequest.scientificCoordinatorAsDiataktis,
                                                              this.currentRequest.trip.email);
                } else {
                    this.currentRequestInfo = new RequestInfo(this.currentRequestPayment.id,
                                                              this.currentRequest.id,
                                                              this.currentRequest.user,
                                                              this.currentRequest.project,
                                                              this.currentRequest.scientificCoordinatorAsDiataktis);
                }
                // console.log('diataktis is', this.currentRequestInfo['5a'].stagePOIs);
                this.checkIfStageIs7();
                this.getIfUserCanEditRequest();
            }
        );
    }

    checkIfStageIs7() {
        if ( (this.currentRequestPayment.stage === '7') &&
             ((this.currentRequest.type === 'regular') || (this.currentRequest.type === 'trip')) ) {

            this.currentRequestInfo.finalAmount = '';
            if ( (this.currentRequest.stage1.finalAmount !== undefined) &&
                 (this.currentRequest.stage1.finalAmount !== null) ) {
                this.currentRequestInfo.finalAmount = (this.currentRequest.stage1.finalAmount).toString();
            }
        }
    }

    getIfUserCanEditRequest() {
        this.errorMessage = '';
        this.canEdit = null;
        const newBasicInfo = new BaseInfo();
        newBasicInfo.creationDate = this.currentRequestPayment.creationDate;
        newBasicInfo.requestId = this.currentRequestPayment.requestId;
        newBasicInfo.id = this.currentRequestPayment.id;
        newBasicInfo.stage = this.currentRequestPayment.stage;
        newBasicInfo.status = this.currentRequestPayment.status;
        const newSummary = new RequestSummary();
        newSummary.request = this.currentRequest;
        newSummary.baseInfo = newBasicInfo;
        this.requestService.isEditable(newSummary, this.authService.getUserProp('email')).subscribe(
            res => this.canEdit = res,
            error => {
                console.log(error);
                this.canEdit = false;
                this.showSpinner = false;
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την ανάκτηση του αιτήματος.';
            },
            () => {
                this.showSpinner = false;
                console.log('this.canEdit is ', this.canEdit);
                this.successMessage = '';
                this.updateShowStageFields();
            }
        );
    }

    getRequestToGoBack(event: any) {
        this.wentBackOneStage = true;
    }

    getNextStage(stage: string) {
        if ((this.currentRequestPayment['stage' + stage]['approved'] === undefined) ||
            (this.currentRequestPayment['stage' + stage]['approved'] === true)) {
            for (const nextStage of this.currentRequestInfo[stage]['next']) {
                if (this.currentRequestPayment['stage' + nextStage] !== undefined) {
                    return nextStage;
                }
            }
        }
        return this.currentRequestPayment.stage;
    }

    getPreviousStage(stage: string) {
        for (const prevStage of this.currentRequestInfo[stage]['prev']) {
            if (this.currentRequestPayment['stage' + prevStage] !== undefined) {
                return prevStage;
            }
        }
        return this.currentRequestPayment.stage;
    }

    getFinalAmount(newVals: string[]) {
        if (newVals && newVals.length === 1) {
            this.updatedFinalAmount = +newVals[0];
            // this.currentRequest.stage1.finalAmount = +newVals[0];
            this.requestNeedsUpdate = true;
        }
    }

    getSubmittedStage(newStage: any) {
        console.log(`got ${JSON.stringify(newStage, null, 1)}`);
        this.currentStageName = 'stage' + this.currentRequestPayment.stage;
        console.log(`submitting as ${this.currentStageName}`);
        this.currentRequestPayment[this.currentStageName] = newStage;

        const submittedStage = this.currentRequestPayment.stage;
        if (this.wentBackOneStage === true) {
            this.currentRequestPayment.stage = this.getPreviousStage(this.currentRequestPayment.stage);
        } else {
            this.currentRequestPayment.stage = this.getNextStage(this.currentRequestPayment.stage);
        }

        // if the pending stage has not changed, the request has been finalized
        if (this.currentRequestPayment.stage === submittedStage) {
            if ( (this.stages.indexOf(this.currentRequestPayment.stage) === (this.stages.length - 1)) &&
                 (newStage['approved'] === true) ) {

                this.currentRequestPayment.status = 'accepted';
                if (this.currentRequest.type !== 'services_contract') {
                    this.currentRequest.requestStatus = 'accepted';
                    this.requestNeedsUpdate = true;
                }
            } else {

                this.currentRequestPayment.status = 'rejected';
                if (this.currentRequest.type !== 'services_contract') {
                    this.currentRequest.requestStatus = 'rejected';
                    this.requestNeedsUpdate = true;
                }
            }
        } else {
            if ( this.wentBackOneStage === true ) {
                this.currentRequestPayment.status = 'under_review';
            } else {
                this.currentRequestPayment.status = 'pending';
            }
        }

        this.checkIfStageIs7();
        this.wentBackOneStage = false;
        console.log('submitted status:', this.currentRequestPayment.status);

        if ( this.uploadedFiles && (this.uploadedFiles.length > 0) ) {
            this.uploadFiles();
        } else {
            if (this.requestNeedsUpdate) {
                this.requestNeedsUpdate = false;
                this.submitRequestAndPayment();
            } else {
                this.submitRequestPayment();
            }
        }
    }

    submitRequestPayment() {
        window.scrollTo(0, 0);
        this.showSpinner = true;
        this.errorMessage = '';
        this.successMessage = '';

        if ( this.uploadedFiles ) {
            const z = this.currentRequestPayment[this.currentStageName].attachments.findIndex(x => x.url === '');
            console.log(`z is ${z}`);
            console.log(`attachments are ${this.currentRequestPayment[this.currentStageName].attachments}`);
            if (z > -1) {
                for (let i = 0; i < this.uploadedFilesURLs.length; i++) {
                    this.currentRequestPayment[ this.currentStageName ][ 'attachments' ][ i + z ][ 'url' ] = this.uploadedFilesURLs[ i ];
                }
            }
            this.uploadedFilesURLs = [];
            this.uploadedFiles = [];
        }
        console.log(`sending ${JSON.stringify(this.currentRequestPayment[this.currentStageName], null, 1)} to updateRequestPayment`);
        /*update this.currentRequest*/
        this.requestService.updateRequestPayment(this.currentRequestPayment).subscribe (
            res => console.log(`update RequestPayment responded: ${res.id}, status=${res.status}, stage=${res.stage}`),
            error => {
                console.log(error);
                this.showSpinner = false;
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
            },
            () => {
                this.successMessage = 'Οι αλλαγές αποθηκεύτηκαν.';
                this.showSpinner = false;
                this.getIfUserCanEditRequest();
            }
        );
    }

    uploadFiles() {
        this.showSpinner = true;
        this.errorMessage = '';
        const submittedStageNumber = this.currentStageName.split('stage')[1];
        this.requestService.uploadAttachments<string[]>(this.currentRequest.archiveId,
                                                        this.currentRequestPayment.id,
                                                        submittedStageNumber,
                                                        this.uploadedFiles,
                                                        'payment')
            .subscribe (
                event => {
                    // console.log('uploadAttachment responded: ', JSON.stringify(event));
                    if (event.type === HttpEventType.UploadProgress) {
                        console.log('uploadAttachments responded: ', event);
                    } else if ( event instanceof HttpResponse) {
                        console.log('final event:', event.body);
                        this.uploadedFilesURLs = event.body;
                    }
                },
                error => {
                    console.log(error);
                    this.uploadedFiles = [];
                    this.uploadedFilesURLs = [];
                    this.showSpinner = false;
                    this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                },
                () => {
                    console.log('ready to update RequestPayment');
                    if (this.requestNeedsUpdate) {
                        this.requestNeedsUpdate = false;
                        this.submitRequestAndPayment();
                    } else {
                        this.submitRequestPayment();
                    }
                }
            );
    }

    submitRequestAndPayment() {
        if ( this.uploadedFiles ) {
            const z = this.currentRequestPayment[this.currentStageName].attachments.findIndex(x => x.url === '');
            console.log(`z is ${z}`);
            console.log(`attachments are ${this.currentRequestPayment[this.currentStageName].attachments}`);
            if (z > -1) {
                for (let i = 0; i < this.uploadedFilesURLs.length; i++) {
                    this.currentRequestPayment[ this.currentStageName ][ 'attachments' ][ i + z ][ 'url' ] = this.uploadedFilesURLs[ i ];
                }
            }
            this.uploadedFilesURLs = [];
            this.uploadedFiles = [];
        }

        if ( (this.updatedFinalAmount !== undefined) && (this.updatedFinalAmount !== null) ) {
            this.currentRequest.stage1.finalAmount = this.updatedFinalAmount;
            this.updatedFinalAmount = null;
        }

        this.requestService.updateRequest(this.currentRequest, this.authService.getUserProp('email')).pipe(
            tap(res => this.currentRequest = res),
            concatMap(res => this.requestService.updateRequestPayment(this.currentRequestPayment))
        ).subscribe(
            res => this.currentRequestPayment = res,
            error => {
                console.log(error);
                this.showSpinner = false;
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
            },
            () => {
                this.successMessage = 'Οι αλλαγές αποθηκεύτηκαν.';
                this.showSpinner = false;
                this.getIfUserCanEditRequest();
            }
        );
    }



    willShowStage(stage: string) {
        const stageField = 'stage' + stage;
        if ( (stage === this.currentRequestPayment.stage) &&
            (this.currentRequestPayment.status !== 'rejected') &&
            (this.currentRequestPayment.status !== 'accepted') &&
            (this.currentRequestPayment.status !== 'cancelled') &&
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
            if ( ((this.currentRequestPayment[stageField] !== undefined) && (this.currentRequestPayment[stageField] !== null)) &&
                 ((this.currentRequestPayment[stageField].date !== undefined) && (this.currentRequestPayment[stageField].date !== null)) ) {

                if ( !this.isSimpleUser || (stage === '7') ) {

                    if ( this.stages.indexOf(this.currentRequestPayment.stage) < this.stages.indexOf(stage)) {
                        return 4;
                    }

                    if ( (stage === this.currentRequestPayment.stage) && (this.stages.indexOf(stage) > 0) ) {

                        const prevStageField = 'stage' + this.stages[this.stages.indexOf(stage) - 1];
                        if ( ((this.currentRequestPayment[prevStageField] !== undefined) &&
                              (this.currentRequestPayment[prevStageField] !== null)) &&
                             ((this.currentRequestPayment[prevStageField].date !== undefined) &&
                              (this.currentRequestPayment[prevStageField].date !== null)) &&
                             (this.currentRequestPayment[prevStageField].date > this.currentRequestPayment[stageField].date) ) {

                            return 4;
                        }
                    }

                    if ( ((this.currentRequestPayment[stageField]['approved'] !== undefined) &&
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

    updateShowStageFields() {
        for ( let i = 0; i < this.stages.length; i++ ) {
            this.currentRequestInfo[this.stages[i]].showStage = this.willShowStage(this.stages[i]);
        }
    }

    linkToFile(i: number) {
        if (this.currentRequest.stage1.attachments && this.currentRequest.stage1.attachments[i] &&
            this.currentRequest.stage1.attachments[i].url) {
            /*window.open(this.currentRequest.stage1.attachment.url , '_blank', 'enabledstatus=0,toolbar=0,menubar=0,location=0');*/
            let url = `${window.location.origin}/arc-expenses-service/request/store/download?`;
            url = `${url}id=${this.currentRequest.id}&stage=1&mode=request`;
            url = `${url}&filename=${this.currentRequest.stage1.attachments[i].filename}`;
            console.log(url);
            window.open(url, '_blank', 'enabledstatus=0,toolbar=0,menubar=0,location=0');
        }
    }

    getUploadedFiles(files: File[]) {
        this.uploadedFiles = files;
    }

    printRequest(): void {
        printRequestPage(this.currentRequest.id, this.reqTypes[this.currentRequest.type]);
    }

    userIsAdmin() {
        return (this.authService.getUserRole().some(x => x.authority === 'ROLE_ADMIN'));
    }

}

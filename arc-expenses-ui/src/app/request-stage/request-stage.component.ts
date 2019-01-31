import { Component, OnInit } from '@angular/core';
import { BaseInfo, Request, RequestApproval, RequestPayment, RequestSummary,
    Stage10, Stage11, Stage12, Stage13, Stage5b, Stage7, Stage8, Stage9
} from '../domain/operation';
import { ActivatedRoute, Router } from '@angular/router';
import { ManageRequestsService } from '../services/manage-requests.service';
import { AuthenticationService } from '../services/authentication.service';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { approvalStages, requestTypes, stageTitles } from '../domain/stageDescriptions';
import { printRequestPage } from './print-request-function';
import { AnchorItem } from '../shared/dynamic-loader-anchor-components/anchor-item';
import { RequestInfo } from '../domain/requestInfoClasses';
import { concatMap, mergeMap, tap } from 'rxjs/operators';

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

    readonly amountLimit = 20000;
    readonly lowAmountLimit = 2500;

    uploadedFile: File;
    uploadedFileURL: string;
    uploadMode: string;

    isSimpleUser: boolean;
    requestId: string;
    currentRequest: Request;
    currentRequestApproval: RequestApproval;
    currentRequestPayments: RequestPayment[] = [];
    currentStageName: string;
    canEdit: boolean;
    wentBackOneStage: boolean;
    requestNeedsUpdate: boolean;
    stages: string[];
    stagesMap = stageTitles;
    stateNames = {
        pending: 'βρίσκεται σε εξέλιξη', under_review: 'βρίσκεται σε εξέλιξη',
        rejected: 'έχει απορριφθεί', accepted: 'έχει ολοκληρωθεί', cancelled: 'έχει ακυρωθεί'
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
        console.log(`current user role is: ${this.authService.getUserRole()}`);
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
                this.stages = approvalStages;
                if (this.currentRequest.type === 'trip') {
                    this.currentRequestInfo = new RequestInfo(this.currentRequestApproval.id,
                                                              this.currentRequest.id,
                                                              this.currentRequest.user,
                                                              this.currentRequest.project,
                                                              this.currentRequest.trip.email);
                } else {
                    this.currentRequestInfo = new RequestInfo(this.currentRequestApproval.id,
                                                              this.currentRequest.id,
                                                              this.currentRequest.user,
                                                              this.currentRequest.project);
                }
                // console.log('diataktis is', this.currentRequestInfo['5a'].stagePOIs);
                this.checkIfStageIs5b();
                this.getIfUserCanEditRequest();
                if ((this.currentRequest.type !== 'contract') &&
                    (this.currentRequestApproval.status === 'accepted')) {
                    this.getRequestPayments();
                }

            }
        );
    }

    checkIfStageIs5b() {
        if ( (this.currentRequestApproval.stage === '5b') &&
             (this.currentRequest.stage1.supplierSelectionMethod === 'Διαγωνισμός') ) {

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

    getIfUserCanEditRequest() {
        this.errorMessage = '';
        this.canEdit = null;
        const newBasicInfo = new BaseInfo();
        newBasicInfo.creationDate = this.currentRequestApproval.creationDate;
        newBasicInfo.requestId = this.currentRequestApproval.requestId;
        newBasicInfo.id = this.currentRequestApproval.id;
        newBasicInfo.stage = this.currentRequestApproval.stage;
        newBasicInfo.status = this.currentRequestApproval.status;
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

    getRequestToGoBack(event: any) {
        console.log('will go back');
        this.wentBackOneStage = true;
    }

    getNextStage(stage: string) {
        if ((this.currentRequestApproval['stage' + stage]['approved'] === undefined) ||
            (this.currentRequestApproval['stage' + stage]['approved'] === true)) {
            for (const nextStage of this.currentRequestInfo[ stage ][ 'next' ]) {
                if (this.currentRequestApproval[ 'stage' + nextStage ]) {
                    return nextStage;
                }
            }
        }

        return this.currentRequestApproval.stage;
    }

    getPreviousStage(stage: string) {
        for (const prevStage of this.currentRequestInfo[stage]['prev']) {
            if (this.currentRequestApproval['stage' + prevStage]) {
                return prevStage;
            }
        }

        return this.currentRequestApproval.stage;
    }

    getSubmittedStage(newStage: any) {
        console.log(`got ${JSON.stringify(newStage, null, 1)}`);
        this.currentStageName = 'stage' + this.currentRequestApproval.stage;
        console.log(`submitting as ${this.currentStageName}`);
        this.currentRequestApproval[this.currentStageName] = newStage;

        const submittedStage = this.currentRequestApproval.stage;
        if (this.wentBackOneStage) {
            if (submittedStage === '2') {
                this.currentRequestApproval.stage = '1';
            } else {
                this.currentRequestApproval.stage = this.getPreviousStage(this.currentRequestApproval.stage);
            }
        } else {
            this.currentRequestApproval.stage = this.getNextStage(this.currentRequestApproval.stage);
        }

        // if the pending stage has not changed, the requestApproval has been finalized
        if (this.currentRequestApproval.stage === submittedStage) {
            if (this.stages.indexOf(this.currentRequestApproval.stage) === (this.stages.length - 1)) {
                this.currentRequestApproval.status = 'accepted';
                if (this.currentRequest.type === 'contract') {
                    this.currentRequest.requestStatus = 'accepted';
                    this.requestNeedsUpdate = true;
                }
            } else {
                // console.log('will reject request');
                this.currentRequestApproval.status = 'rejected';
                this.currentRequest.requestStatus = 'rejected';
                this.requestNeedsUpdate = true;
            }
        } else {
            if ( this.wentBackOneStage === true ) {
                this.currentRequestApproval.status = 'under_review';
            } else {
                this.currentRequestApproval.status = 'pending';
            }
        }

        this.checkIfStageIs5b();
        this.wentBackOneStage = false;
        console.log('submitted status:', this.currentRequestApproval.status);
        console.log('next stage:', this.currentRequestApproval.stage);

        if ( this.uploadedFile ) {
            this.uploadMode = 'approval';
            this.uploadFile();
        } else {
            if (this.requestNeedsUpdate) {
                this.requestNeedsUpdate = false;
                this.updateRequestAndApproval();
            } else {
                this.submitRequestApproval();
            }
        }
    }

    getUpdatedRequest(updatedRequest: Request) {
        this.currentRequest = updatedRequest;
        this.currentRequestApproval.stage = '2';
        this.currentRequestApproval.status = 'pending';
        this.currentStageName = 'stage1';

        if ( (this.currentRequest.stage1.amountInEuros > this.amountLimit) &&
             (!this.currentRequestApproval.stage5b) ) {
            this.currentRequestApproval.stage5b = new Stage5b();
        }
        if ( this.uploadedFile ) {
            this.uploadMode = 'request';
            this.uploadFile();
        } else {
            this.submitRequest();
        }
    }

    submitRequest() {
        window.scrollTo(0, 0);
        this.showSpinner = true;
        this.errorMessage = '';
        this.successMessage = '';

        if ( this.uploadedFile ) {

            this.currentRequest.stage1.attachment.url = this.uploadedFileURL;
            this.uploadedFileURL = '';
            this.uploadedFile = null;
        }
        console.log(`sending ${JSON.stringify(this.currentRequest.stage1, null, 1)} to updateRequest`);
        this.updateRequestAndApproval();
    }

    submitRequestApproval() {
        console.log('updating approval');
        window.scrollTo(0, 0);
        this.showSpinner = true;
        this.errorMessage = '';
        this.successMessage = '';

        if ( this.uploadedFile ) {

            this.currentRequestApproval[this.currentStageName]['attachment']['url'] = this.uploadedFileURL;
            this.uploadedFileURL = '';
            this.uploadedFile = null;
        }
        console.log(`sending ${JSON.stringify(this.currentRequestApproval[this.currentStageName], null, 1)} to updateRequestApproval`);

        /*update this.currentRequestApproval*/
        this.requestService.updateRequestApproval(this.currentRequestApproval).subscribe (
            res => console.log(`update RequestApproval responded: ${res.id}, status=${res.status}, stage=${res.stage}`),
            error => {
                console.log(error);
                this.showSpinner = false;
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                this.getCurrentRequest();
            },
            () => {
                if ((this.currentRequestApproval.status === 'accepted') && (this.currentRequest.type !== 'contract')) {
                    this.createRequestPayment();
                } else {
                    this.successMessage = 'Οι αλλαγές αποθηκεύτηκαν.';
                    // this.showSpinner = false;
                    this.getIfUserCanEditRequest();
                }
            }
        );
    }

    updateRequestAndApproval() {
        console.log('updating request and approval');
        if ( (this.uploadedFile) && (this.currentStageName !== 'stage1') ) {

            this.currentRequestApproval[this.currentStageName]['attachment']['url'] = this.uploadedFileURL;
            this.uploadedFileURL = '';
            this.uploadedFile = null;
        }

        this.requestService.updateRequest(this.currentRequest, this.authService.getUserProp('email')).pipe(
            tap(res => this.currentRequest = res),
            concatMap( res =>
                this.requestService.updateRequestApproval(this.currentRequestApproval)
            )).subscribe(
            res => {
                this.currentRequestApproval = res;
            },
            error => {
                console.log(error);
                this.showSpinner = false;
                this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                this.getCurrentRequest();
            },
            () => {
                if ((this.currentRequestApproval.status === 'accepted') && (this.currentRequest.type !== 'contract')) {
                    this.createRequestPayment();
                } else {
                    this.successMessage = 'Οι αλλαγές αποθηκεύτηκαν.';
                    // this.showSpinner = false;
                    this.getIfUserCanEditRequest();
                }
            }
        );
    }

    uploadFile() {
        console.log('uploading file');
        this.showSpinner = true;
        this.errorMessage = '';
        this.requestService.uploadAttachment<string>(this.currentRequest.archiveId,
                                                     this.currentStageName,
                                                     this.uploadedFile,
                                                     this.uploadMode)
            .subscribe(
                event => {
                    // console.log('uploadAttachment responded: ', JSON.stringify(event));
                    if (event.type === HttpEventType.UploadProgress) {
                        console.log('uploadAttachment responded: ', event);
                    } else if ( event instanceof HttpResponse) {
                        console.log('final event:', event.body);
                        this.uploadedFileURL = event.body;
                    }
                },
                error => {
                    console.log(error);
                    this.uploadedFile = null;
                    this.uploadMode = null;
                    this.showSpinner = false;
                    this.errorMessage = 'Παρουσιάστηκε πρόβλημα κατά την αποθήκευση των αλλαγών.';
                },
                () => {
                    if (this.currentStageName === 'stage1') {
                        this.submitRequest();
                    } else if (this.requestNeedsUpdate) {
                        this.requestNeedsUpdate = false;
                        this.updateRequestAndApproval();
                    } else {
                        this.submitRequestApproval();
                    }
                }
            );
    }


    willShowStage(stage: string) {
        const stageField = 'stage' + stage;
        if ((stage === this.currentRequestApproval.stage) &&
            (this.currentRequestApproval.status !== 'rejected') &&
            (this.currentRequestApproval.status !== 'accepted') &&
            (this.currentRequestApproval.status !== 'cancelled') &&
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
            if ( (this.currentRequestApproval[stageField]) &&
                 (this.currentRequestApproval[stageField].date)) {

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

    updateShowStageFields() {
        for ( let i = 1; i < this.stages.length; i++ ) {
            this.currentRequestInfo[this.stages[i]].showStage = this.willShowStage(this.stages[i]);
        }
    }

    linkToFile() {
        if (this.currentRequest.stage1.attachment && this.currentRequest.stage1.attachment.url) {
            /*window.open(this.currentRequest.stage1.attachment.url , '_blank', 'enabledstatus=0,toolbar=0,menubar=0,location=0');*/
            let url = `${window.location.origin}/arc-expenses-service/request/store/download?`;
            url = `${url}requestId=${this.currentRequest.id}&stage=1&mode=request`;
            console.log(url);
            window.open(url, '_blank', 'enabledstatus=0,toolbar=0,menubar=0,location=0');
        }
    }

    getNewSupplierAndAmount(newVals: string[]) {
        if (newVals && newVals.length === 2) {
            this.currentRequest.stage1.supplier = newVals[0];
            this.currentRequest.stage1.amountInEuros = +newVals[1];
            this.currentRequest.stage1.finalAmount = +newVals[1];
            this.requestNeedsUpdate = true;
        }
    }

    getUploadedFile(file: File) {
        console.log('I got the file!');
        this.uploadedFile = file;
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
        newRequestPayment.status = 'pending';
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
                this.showSpinner = false;
                this.getIfUserCanEditRequest();
            }
        );
    }

    getStatusAsString( status: string ) {
        if ( (status === 'pending') || (status === 'under_review') ) {
            return 'σε εξέλιξη';
        } else if (status === 'accepted') {
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

    cancelRequest() {
        // UIkit.modal('#cancellationModal').show();
    }

    confirmedCancel() {
        this.currentRequestApproval.status = 'cancelled';
        this.currentRequest.requestStatus = 'cancelled';
        this.requestService.updateRequest(this.currentRequest, this.authService.getUserProp('email')).pipe(
            tap(res => this.currentRequest = res),
            concatMap( res =>
                this.requestService.updateRequestApproval(this.currentRequestApproval)
            )).subscribe(
                res => {
                        this.currentRequestApproval = res;
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
                    this.getIfUserCanEditRequest();
                    UIkit.modal('#cancellationModal').hide();
                }
            );
    }

}

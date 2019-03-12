import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FieldDescription } from '../../domain/stageDescriptions';
import * as uikit from 'uikit';

@Component({
  selector: 'app-form-field',
  template: `
<div class="uk-grid uk-margin-small-top">
    <label class="uk-width-1-3" *ngIf="description.label!=null">
        {{description.label}}
    </label>
    <div class="uk-width-expand" [ngClass]="{'uk-text-danger': !valid}">
        <ng-content></ng-content>
    </div>
</div>

`
})
export class FormFieldComponent implements OnChanges {

  constructor() { }

  @Input() public description: FieldDescription = null;

  @Input() public valid = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.valid) {
        this.valid = <boolean>changes.valid.currentValue;
    }
  }

}

@Component({
    selector: 'app-form-upload-file',
    template: `
<div data-tooltip title="Επιλέξτε αρχείο" (drop)="getDroppedFile($event)" (dragover)="allowDrop($event)">
    <div class="uk-link uk-placeholder uk-text-center uk-margin-top uk-width-1-1" uk-form-custom>
        <i class="uk-icon-cloud-upload uk-icon-medium uk-text-muted uk-margin-small-right"></i>
        <input type="file" name="selectedFile" (change)="getInput($event)">
        <span class="uk-link">Επισυνάψτε το αρχείο σας ρίχνοντάς το εδώ ή πατώντας εδώ</span>
        <div><span class="uk-text-bold">Επιλεγμένο αρχείο: </span>
            {{uploadedFilename}}
        </div>
    </div>
</div>
`
})
export class FormUploadFileComponent implements OnInit {

  uploadedFile: File;

  @Input() uploadedFilename = '';

  @Output() emitFile: EventEmitter<File> = new EventEmitter<File>();

  constructor() {}

  ngOnInit() {
    if ((!this.uploadedFilename) || this.uploadedFilename.length === 0) {
      this.uploadedFilename = 'επιλέξτε αρχείο';
    }
  }

  getDroppedFile(event: any) {
    event.preventDefault();
    console.log(event.dataTransfer.files[0]);
    /*script to upload file*/
    this.uploadedFile = <File>event.dataTransfer.files[0];
    this.uploadedFilename = this.uploadedFile.name;
    console.log('this.droppedFile is : ', this.uploadedFile);
    this.emitFile.emit(this.uploadedFile);
  }

  getInput(event: any) {
    this.uploadedFile = event.target.files[0];
    this.uploadedFilename = this.uploadedFile.name;
    console.log('this.uploadedFile is : ', this.uploadedFile);
    this.emitFile.emit(this.uploadedFile);
  }

  allowDrop(event: any) {
    event.preventDefault();
  }

}

@Component({
    selector: 'app-form-upload-files',
    template: `
<div class="uk-margin-bottom uk-margin-small-top">
    <div class="uk-placeholder">
        <div data-tooltip title="Επιλέξτε αρχεία" (drop)="getDroppedFile($event)" (dragover)="allowDrop($event)">
            <div class="uk-link uk-text-center uk-margin-top uk-width-1-1" uk-form-custom>
                <i class="uk-icon-cloud-upload uk-icon-medium uk-text-muted uk-margin-small-right"></i>
                <input type="file" name="selectedFile" multiple (change)="getInput($event)">
                <span class="uk-link">Επισυνάψτε τα αρχεία σας ρίχνοντάς τα εδώ ή πατώντας εδώ</span>
                <div *ngIf="uploadedFilenames.length === 0" class="uk-text-bold">Επιλέξτε αρχεία</div>
                <div *ngIf="uploadedFilenames.length > 0" class="uk-text-bold">Επιλεγμένα αρχεία:</div>
            </div>
        </div>
        <div class="uk-flex-center">
            <div *ngFor="let f of uploadedFilenames; let i = index"
                 class="uk-text-bold uk-padding-small uk-display-inline-block uk-margin-small-right">
                <span class="uk-margin-small-right">{{ f }}</span>
                <span>
                    <a class="uk-link uk-position-z-index" uk-icon="icon: close" (click)="deleteItem(i)"></a>
                </span>
            </div>
        </div>
    </div>
    <button *ngIf="uploadedFilenames.length > 0"
            class="uk-button uk-button-link"
            (click)="clearList()">Απόρριψη όλων των αρχείων</button>
</div>
`
})
export class FormUploadFilesComponent implements OnInit {

    badFilename: string;

    /* the file list is updated and emitted to the parent component after every user action
       (drop - open from explorer - delete one - delete all) */
    uploadedFiles: File[] = [];

    @Input() uploadedFilenames: string[] = [];

    @Output() emitFiles: EventEmitter<File[]> = new EventEmitter<File[]>();
    @Output() emitDelete: EventEmitter<string> = new EventEmitter<string>();

    constructor() {}

    ngOnInit() { }

    getDroppedFile(event: any) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        this.loadFilesToUploadedList(files);
        console.log('droppedFiles are:', JSON.stringify(this.uploadedFilenames));
        this.emitFiles.emit(this.uploadedFiles);
    }

    getInput(event: any) {
        const files = event.target.files;
        this.loadFilesToUploadedList(files);
        console.log('inputFiles are: ', JSON.stringify(this.uploadedFilenames));
        this.emitFiles.emit(this.uploadedFiles);
    }

    loadFilesToUploadedList(files: File[]) {
        for (const f of files) {
            // check for illegal filename characters
            if ( f.name.match(/[!@#$%^&*()=,?"':;{}|< >\[\]\(\)+`~\/\\]/g) ||
                 (f.name.indexOf('.') !== f.name.lastIndexOf('.'))) {
                this.badFilename = f.name;
                this.badFilename.replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/"/g, '&quot;')
                                .replace(/'/g, '&#039;');
                uikit.modal.alert(`<h6 class="uk-modal-title">Μη αποδεκτό όνομα αρχείου<br>(${this.badFilename})</h6>
                                   <div class="uk-modal-body">
                                        <div>Τα ονόματα των αρχείων δεν πρέπει να περιέχουν σύμβολα ή κενά.</div>
                                        <div>Αποδεκτά σύμβολα είναι μόνο τα: \'-\' και \'_\'.</div>
                                   </div>`);
            } else {
                this.uploadedFilenames.push(f.name);
                this.uploadedFiles.push(f);
            }
        }
    }

    allowDrop(event: any) {
        event.preventDefault();
    }


    deleteItem(i: number) {
        console.log(`deleting ${this.uploadedFilenames[i]}`);
        if (this.uploadedFiles && this.uploadedFiles.some(x => x.name === this.uploadedFilenames[i])) {
            const z = this.uploadedFiles.findIndex(x => x.name === this.uploadedFilenames[i]);
            this.uploadedFiles.splice(z, 1);
            console.log(`number of uploaded files is ${this.uploadedFiles.length}`);
            this.emitFiles.emit(this.uploadedFiles);
        }
        this.emitDelete.emit(this.uploadedFilenames[i]);
        console.log(`uploaded filenames are ${this.uploadedFilenames}`);
    }

    clearList() {
        this.uploadedFiles = [];
        this.uploadedFilenames = [];
        this.emitFiles.emit(this.uploadedFiles);
    }


}

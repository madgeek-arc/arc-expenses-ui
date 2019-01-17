import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FieldDescription } from '../../domain/stageDescriptions';

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
<div data-tooltip title="Επιλέξτε αρχεία" (drop)="getDroppedFile($event)" (dragover)="allowDrop($event)">
    <div class="uk-link uk-placeholder uk-text-center uk-margin-top uk-width-1-1" uk-form-custom>
        <i class="uk-icon-cloud-upload uk-icon-medium uk-text-muted uk-margin-small-right"></i>
        <input type="file" name="selectedFile" multiple (change)="getInput($event)">
        <span class="uk-link">Επισυνάψτε τα αρχεία σας ρίχνοντάς τα εδώ ή πατώντας εδώ</span>
        <div *ngIf="uploadedFilenames.length === 0">επιλέξτε αρχείο</div>
        <div *ngFor="let f of uploadedFilenames; let i = index"
             class="uk-text-bold uk-grid uk-child-width-1-4@l uk-child-width-1-2@s uk-flex-center">
            <div>{{ f }}</div>
            <div>
                <a class="uk-link uk-margin-small-left" uk-icon="icon: close"
                       (click)="deleteItem(i)"></a>
            </div>
        </div>
    </div>
</div>
<button class="uk-button uk-button-link" (click)="clearList()">Διαγραφή όλων των αρχείων</button>
`
})
export class FormUploadFilesComponent implements OnInit {

    uploadedFiles: File[] = [];

    @Input() uploadedFilenames: string[] = [];

    @Output() emitFile: EventEmitter<File[]> = new EventEmitter<File[]>();

    constructor() {}

    ngOnInit() { }

    getDroppedFile(event: any) {
        event.preventDefault();
        const files = event.dataTransfer.files;

        for (let i = 0; i < files.length; i++) {
            this.uploadedFilenames.push(files[i].name);
            this.uploadedFiles.push(files[i]);
        }
        console.log('droppedFiles are:', JSON.stringify(this.uploadedFilenames));
        this.emitFile.emit(this.uploadedFiles);
    }

    getInput(event: any) {
        const files = event.target.files;
        for (let i = 0; i < files; i++) {
            this.uploadedFilenames.push(files[i].name);
            this.uploadedFiles.push(files[i]);
        }
        console.log('inputFiles are: ', JSON.stringify(this.uploadedFilenames));
        this.emitFile.emit(this.uploadedFiles);
    }

    allowDrop(event: any) {
        event.preventDefault();
    }


    deleteItem(i: number) {
        this.uploadedFilenames.splice(i, 1);
        this.uploadedFiles.splice(i, 1);
        console.log(this.uploadedFiles);
        this.emitFile.emit(this.uploadedFiles);
    }

    clearList() {
        this.uploadedFiles = [];
        this.uploadedFilenames = [];
        this.emitFile.emit(this.uploadedFiles);
    }


}

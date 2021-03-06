import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FileUploadComponent } from './file-upload.component';
import { alphanumericValidator } from '../validators/alphanumeric-validation';
import { ApplicationFieldsService } from '../_services/application-fields.service';
import { FileItem, FileUploaderOptions, FileLikeObject, FileUploadModule } from 'ng2-file-upload';
import * as sinon from 'sinon';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [FileUploadModule],
        declarations: [FileUploadComponent],
        providers: [FormBuilder, { provide: ApplicationFieldsService, useClass: ApplicationFieldsService }],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.debugElement.componentInstance;
    component.field = new FormControl();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should remove a file when upload is complete', () => {
    component.fieldsService.numberOfFiles = 2;
    component.onCompleteItem(null, null, null, null);
    expect(component.fieldsService.numberOfFiles).toEqual(1);
  });

  it('should update field after file is added', () => {
    component.fieldsService.numberOfFiles = 0;
    let uploader = { queue: [] };
    component.onAfterAddingFile(uploader);
    expect(component.fieldsService.numberOfFiles).toEqual(0);

    uploader = { queue: [{ file: { name: 'test' } }] };
    component.onAfterAddingFile(uploader);
    expect(component.errorMessage).toEqual('');
    expect(component.fieldsService.numberOfFiles).toEqual(1);
    expect(component.field.value).toEqual('test');
  });

  it('should give an error when file fails to add to queue', () => {
    const some = File;
    let filter = { name: 'fileSize' };
    const uploader = { queue: [] };
    const file = new FileLikeObject(some);
    file.size = 2000;
    component.onWhenAddingFileFailed(file, filter, null);
    expect(component.errorMessage).toEqual(`Maximum upload size exceeded (2000 of 26214400 allowed)`);
    filter = { name: 'mimeType' };
    component.onWhenAddingFileFailed(file, filter, null);
    expect(component.errorMessage).toEqual(
      `The file type you selected is not allowed. The allowed file types are .pdf, .doc, .docx, or .rtf`
    );
    component.allowXls = true;
    component.onWhenAddingFileFailed(file, filter, null);
    expect(component.errorMessage).toEqual(
      `The file type you selected is not allowed. The allowed file types are .pdf, .doc, .docx, .xls, .xlsx, or .rtf`
    );

    filter = { name: 'test filter' };
    component.onWhenAddingFileFailed(file, filter, null);
    expect(component.errorMessage).toEqual(`Unknown error (filter is test filter)`);

    component.ngOnInit();
    expect(component.allowedMimeType.indexOf('application/vnd.ms-excel')).toBeTruthy();
    expect(
      component.allowedMimeType.indexOf('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    ).toBeTruthy();
  });
});

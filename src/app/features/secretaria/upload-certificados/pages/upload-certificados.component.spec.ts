import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { UploadCertificadosComponent } from './upload-certificados.component';
import { UploadService } from '@services/upload.service';
import { MatDialog } from '@angular/material/dialog';

class UploadServiceStub {
  enviarArquivo = jasmine
    .createSpy('enviarArquivo')
    .and.returnValue(
      of({
        message: 'ok',
        data: { quantidade_enviada: 1 },
      } as any)
    );
}

class MatDialogStub {
  open() {
    return {
      afterClosed: () => of(true),
    } as any;
  }
}

describe('UploadCertificadosComponent', () => {
  let component: UploadCertificadosComponent;
  let fixture: ComponentFixture<UploadCertificadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadCertificadosComponent],
      providers: [
        { provide: UploadService, useClass: UploadServiceStub },
        { provide: MatDialog, useClass: MatDialogStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadCertificadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

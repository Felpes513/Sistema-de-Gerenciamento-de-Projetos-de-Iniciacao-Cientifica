import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { UploadCertificadosComponent } from './upload-certificados.component';
import { UploadService } from '@services/upload.service';
import { MatDialog } from '@angular/material/dialog';
import { RelatorioService } from '@services/relatorio.service';

class UploadServiceStub {
  enviarArquivo = jasmine.createSpy('enviarArquivo').and.returnValue(
    of({
      message: 'ok',
      data: { quantidade_enviada: 1 },
    } as any)
  );
}

class RelatorioServiceStub {
  baixarModeloExcelImportacaoAlunos = jasmine
    .createSpy('baixarModeloExcelImportacaoAlunos')
    .and.returnValue(of({} as any));
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
        { provide: RelatorioService, useClass: RelatorioServiceStub },
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

  it('should capture selected file and expose the file name', () => {
    const file = new File(['conteudo'], 'certificados.xlsx');
    const input = { files: [file] } as any;

    component.onFileSelected({ target: input } as any);

    expect(component.file).toBe(file);
    expect(component.fileName).toBe('certificados.xlsx');
  });

  it('should remove the selected file', () => {
    component.file = new File(['conteudo'], 'certificados.xlsx');

    component.removeFile();

    expect(component.file).toBeNull();
    expect(component.fileName).toBeNull();
  });
});

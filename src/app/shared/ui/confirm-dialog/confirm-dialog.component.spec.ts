import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { titulo: 'Aviso', mensagem: 'Confirma?', modo: 'confirm' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the provided title and message', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Aviso');
    expect(element.textContent).toContain('Confirma?');
  });

  it('should close with true when confirming', () => {
    component.onConfirm();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should close with false when dismissing', () => {
    component.onClose();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
  });

  it('should expose the injected dialog data', () => {
    expect(component.data.modo).toBe('confirm');
    expect(component.data.titulo).toBe('Aviso');
  });
});

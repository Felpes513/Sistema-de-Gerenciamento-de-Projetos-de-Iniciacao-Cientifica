import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadCertificadosComponent } from './upload-certificados.component';

describe('UploadCertificadosComponent', () => {
  let component: UploadCertificadosComponent;
  let fixture: ComponentFixture<UploadCertificadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadCertificadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadCertificadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { EnvioDeEmailComponent } from './envio-de-email.component';
import { environment } from '@environments/environment';

describe('EnvioDeEmailComponent', () => {
  let component: EnvioDeEmailComponent;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, EnvioDeEmailComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(EnvioDeEmailComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    component.ngOnInit();
  });

  afterEach(() => http.verify());

  it('should load projects on init', () => {
    const req = http.expectOne(`${environment.emailApiBaseUrl}/projetos`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, nome_projeto: 'Projeto', orientador_nome: 'Prof' }]);
    expect(component.projetos.length).toBe(1);
  });

  it('should post certificates after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.enviarCertificados(1, 'Projeto');

    const req = http.expectOne(`${environment.emailApiBaseUrl}/enviar-certificado`);
    expect(req.request.method).toBe('POST');
    req.flush({ mensagem: 'ok' });
  });

  it('should cancel sending certificates when user declines', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.enviarCertificados(2, 'Outro');
    http.expectNone(`${environment.emailApiBaseUrl}/enviar-certificado`);
  });
});

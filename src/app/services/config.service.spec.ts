import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let http: HttpTestingController;
  let base: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(ConfigService);
    http = TestBed.inject(HttpTestingController);
    base = (service as any).apiUrl as string;
  });

  afterEach(() => http.verify());

  // ===== CAMPUS =====
  it('should list campus', () => {
    service.listarCampus().subscribe((res) => {
      expect(res.campus.length).toBe(1);
    });

    const req = http.expectOne(`${base}/campus`);
    expect(req.request.method).toBe('GET');
    req.flush({ campus: [{}] });
  });

  it('should create campus', () => {
    const body = { campus: 'Novo Campus' };
    service.criarCampus(body).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = http.expectOne(`${base}/campus/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id_campus: 1, campus: 'Novo Campus' });
  });

  it('should delete campus', () => {
    service.excluirCampus(123).subscribe();
    const req = http.expectOne(`${base}/campus/123`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ ok: true });
  });

  // ===== CURSOS =====
  it('should list cursos', () => {
    service.listarCursos().subscribe((res) => {
      expect(res.cursos.length).toBe(1);
    });

    const req = http.expectOne(`${base}/cursos`);
    expect(req.request.method).toBe('GET');
    req.flush({ cursos: [{}] });
  });

  it('should create curso', () => {
    const body = { nome: 'Novo Curso' };
    service.criarCurso(body).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = http.expectOne(`${base}/cursos/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id_curso: 1, nome: 'Novo Curso' });
  });

  it('should delete curso', () => {
    service.excluirCurso(123).subscribe();
    const req = http.expectOne(`${base}/cursos/123`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ ok: true });
  });

  // ===== TIPOS DE BOLSA =====
  it('should list tipos de bolsa', () => {
    service.listarTiposBolsa().subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = http.expectOne(`${base}/bolsas/tipos`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id_bolsa: 1, nome: 'Tipo 1' }]);
  });

  it('should create tipo de bolsa', () => {
    const body = 'Novo Tipo';
    service.criarTipoBolsa(body).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = http.expectOne(`${base}/tipos-bolsa/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ tipo_bolsa: body });
    req.flush({ id_bolsa: 1, nome: 'Novo Tipo' });
  });

  it('should delete tipo de bolsa', () => {
    service.excluirTipoBolsa(123).subscribe();
    const req = http.expectOne(`${base}/bolsas/tipos/123`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ ok: true });
  });
});

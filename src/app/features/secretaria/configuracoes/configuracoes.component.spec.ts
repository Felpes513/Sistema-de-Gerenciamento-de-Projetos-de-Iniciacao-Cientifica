import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ConfiguracoesComponent } from './configuracoes.component';
import { ConfigService } from '@services/config.service';
import { BolsaService } from '@services/bolsa.service';

class ConfigServiceStub {
  listarCampus = jasmine
    .createSpy('listarCampus')
    .and.returnValue(of({ campus: [{ id_campus: 1, campus: 'Campus Test' }] }));
  listarCursos = jasmine
    .createSpy('listarCursos')
    .and.returnValue(of({ cursos: [{ id_curso: 1, nome: 'Curso Test' }] }));
  criarCurso = jasmine.createSpy('criarCurso').and.returnValue(of({}));
  criarCampus = jasmine.createSpy('criarCampus').and.returnValue(of({}));
  excluirCurso = jasmine.createSpy('excluirCurso').and.returnValue(of({}));
  excluirCampus = jasmine.createSpy('excluirCampus').and.returnValue(of({}));
}

class BolsaServiceStub {
  listar = jasmine
    .createSpy('listar')
    .and.returnValue(
      of([
        {
          id_aluno: 1,
          nome_completo: 'Aluno Test',
          email: 'aluno@test.com',
          possui_bolsa: true,
        },
      ])
    );
  create = jasmine.createSpy('create').and.returnValue(of({}));
  setStatus = jasmine.createSpy('setStatus').and.returnValue(of({}));
}

describe('ConfiguracoesComponent', () => {
  let component: ConfiguracoesComponent;
  let configService: ConfigServiceStub;
  let bolsaService: BolsaServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracoesComponent],
      providers: [
        { provide: ConfigService, useClass: ConfigServiceStub },
        { provide: BolsaService, useClass: BolsaServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ConfiguracoesComponent);
    component = fixture.componentInstance;
    configService = TestBed.inject(
      ConfigService
    ) as unknown as ConfigServiceStub;
    bolsaService = TestBed.inject(
      BolsaService
    ) as unknown as BolsaServiceStub;
    fixture.detectChanges(); // ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial lists on init', () => {
    expect(configService.listarCampus).toHaveBeenCalled();
    expect(configService.listarCursos).toHaveBeenCalled();
    expect(bolsaService.listar).toHaveBeenCalled();
  });

  // ===== CAMPUS =====
  it('should create a new campus', () => {
    component.novoCampus = 'Novo Campus';
    component.cadastrarCampus();
    expect(configService.criarCampus).toHaveBeenCalledWith({
      campus: 'Novo Campus',
    });
    expect(component.novoCampus).toBe('');
  });

  it('should delete campus', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.excluirCampus(1);
    expect(configService.excluirCampus).toHaveBeenCalledWith(1);
  });

  // ===== CURSOS =====
  it('should create a new course', () => {
    component.novoCurso = 'Novo Curso';
    component.cadastrarCurso();
    expect(configService.criarCurso).toHaveBeenCalledWith({
      nome: 'Novo Curso',
    });
    expect(component.novoCurso).toBe('');
  });

  it('should delete curso', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.excluirCurso(2);
    expect(configService.excluirCurso).toHaveBeenCalledWith(2);
  });

  // ===== BOLSAS =====
  it('should create bolsa for aluno', () => {
    component.formBolsa = { id_aluno: 1, possui_bolsa: true };
    component.cadastrarBolsaAluno();
    expect(bolsaService.create).toHaveBeenCalledWith(1, true);
  });

  it('should not create bolsa if id_aluno is invalid', () => {
    component.formBolsa = { id_aluno: null, possui_bolsa: true };
    spyOn(window, 'alert');
    component.cadastrarBolsaAluno();
    expect(bolsaService.create).not.toHaveBeenCalled();
  });

  it('should toggle bolsa status', () => {
    const row = {
      id_aluno: 1,
      nome_completo: 'Aluno Test',
      email: 'test@test.com',
      possui_bolsa: false,
    };
    component.toggleBolsa(row);
    expect(row.possui_bolsa).toBe(true);
    expect(bolsaService.setStatus).toHaveBeenCalledWith(1, true);
  });

  it('should rollback bolsa status on error', () => {
    const row = {
      id_aluno: 1,
      nome_completo: 'Aluno Test',
      email: 'test@test.com',
      possui_bolsa: false,
    };
    bolsaService.setStatus.and.returnValue(throwError(() => new Error('Error')));
    spyOn(window, 'alert');
    component.toggleBolsa(row);
    expect(row.possui_bolsa).toBe(false); // rollback
  });

  it('should filter bolsas by term', () => {
    component.bolsas = [
      {
        id_aluno: 1,
        nome_completo: 'João Silva',
        email: 'joao@test.com',
        possui_bolsa: true,
      },
      {
        id_aluno: 2,
        nome_completo: 'Maria Santos',
        email: 'maria@test.com',
        possui_bolsa: false,
      },
    ];
    expect(component.matchBolsa('joão', 'João Silva', 'joao@test.com')).toBe(
      true
    );
    expect(component.matchBolsa('maria', 'Maria Santos', 'maria@test.com')).toBe(
      true
    );
    expect(component.matchBolsa('pedro', 'João Silva', 'joao@test.com')).toBe(
      false
    );
    expect(component.matchBolsa('', 'qualquer')).toBe(true);
  });
});

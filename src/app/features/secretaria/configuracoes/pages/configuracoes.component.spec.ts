import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ConfiguracoesComponent } from './configuracoes.component';
import { ConfigService } from '@services/config.service';
import { DialogService } from '@services/dialog.service';
import { RegisterService } from '@services/cadastro.service';

class ConfigServiceStub {
  // CAMPUS
  listarCampus = jasmine
    .createSpy('listarCampus')
    .and.returnValue(of({ campus: [{ id_campus: 1, campus: 'Campus Test' }] }));

  criarCampus = jasmine.createSpy('criarCampus').and.returnValue(of({}));

  excluirCampus = jasmine.createSpy('excluirCampus').and.returnValue(of({}));

  // CURSOS
  listarCursos = jasmine
    .createSpy('listarCursos')
    .and.returnValue(of({ cursos: [{ id_curso: 1, nome: 'Curso Test' }] }));

  criarCurso = jasmine.createSpy('criarCurso').and.returnValue(of({}));

  excluirCurso = jasmine.createSpy('excluirCurso').and.returnValue(of({}));

  // TIPOS DE BOLSA
  listarTiposBolsa = jasmine
    .createSpy('listarTiposBolsa')
    .and.returnValue(of([{ id_tipo_bolsa: 1, tipo_bolsa: 'IC' }]));

  criarTipoBolsa = jasmine.createSpy('criarTipoBolsa').and.returnValue(of({}));

  excluirTipoBolsa = jasmine
    .createSpy('excluirTipoBolsa')
    .and.returnValue(of({}));

  // ALUNOS COM BOLSA
  listarBolsas = jasmine.createSpy('listarBolsas').and.returnValue(
    of({
      bolsas: [
        {
          id_bolsa: 1,
          id_aluno: 10,
          aluno_nome: 'Aluno Teste',
          aluno_email: 'aluno@test.com',
          id_tipo_bolsa: 1,
          tipo_bolsa: 'IC',
          created_at: '2025-01-01T00:00:00Z',
        },
      ],
      limit: 10,
      offset: 0,
      count: 1,
    })
  );

  criarBolsa = jasmine.createSpy('criarBolsa').and.returnValue(of({}));

  excluirBolsa = jasmine.createSpy('excluirBolsa').and.returnValue(of({}));
}

class DialogServiceStub {
  confirm = jasmine.createSpy('confirm').and.returnValue(Promise.resolve(true));
  alert = jasmine.createSpy('alert');
}

class RegisterServiceStub {
  listarAlunos = jasmine
    .createSpy('listarAlunos')
    .and.returnValue(
      of([
        {
          id_aluno: 1,
          nome_completo: 'Aluno Teste',
          email: 'aluno@teste.com',
          status: 'APROVADO',
        },
      ])
    );
}

describe('ConfiguracoesComponent', () => {
  let component: ConfiguracoesComponent;
  let configService: ConfigServiceStub;
  let dialogService: DialogServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracoesComponent, HttpClientTestingModule],
      providers: [
        { provide: ConfigService, useClass: ConfigServiceStub },
        { provide: DialogService, useClass: DialogServiceStub },
        { provide: RegisterService, useClass: RegisterServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ConfiguracoesComponent);
    component = fixture.componentInstance;
    configService = TestBed.inject(
      ConfigService
    ) as unknown as ConfigServiceStub;
    dialogService = TestBed.inject(
      DialogService
    ) as unknown as DialogServiceStub;

    fixture.detectChanges(); // dispara ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial lists on init', () => {
    expect(configService.listarCampus).toHaveBeenCalled();
    expect(configService.listarCursos).toHaveBeenCalled();
    expect(configService.listarTiposBolsa).toHaveBeenCalled();
    expect(configService.listarBolsas).toHaveBeenCalled();
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

  it('should not create campus when name is empty', () => {
    component.novoCampus = '   ';
    component.cadastrarCampus();
    expect(configService.criarCampus).not.toHaveBeenCalled();
  });

  it('should delete campus when confirmed', async () => {
    dialogService.confirm.and.returnValue(Promise.resolve(true));
    await component.excluirCampus(1);
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

  it('should not create course when name is empty', () => {
    component.novoCurso = '  ';
    component.cadastrarCurso();
    expect(configService.criarCurso).not.toHaveBeenCalled();
  });

  it('should delete course when confirmed', async () => {
    dialogService.confirm.and.returnValue(Promise.resolve(true));
    await component.excluirCurso(2);
    expect(configService.excluirCurso).toHaveBeenCalledWith(2);
  });

  // ===== TIPOS DE BOLSA =====
  it('should create a new tipo de bolsa', () => {
    component.novoTipoBolsa = 'Nova Bolsa';
    component.criarTipoBolsa();
    expect(configService.criarTipoBolsa).toHaveBeenCalledWith('Nova Bolsa');
    expect(component.novoTipoBolsa).toBe('');
  });

  it('should not create tipo de bolsa when empty', () => {
    component.novoTipoBolsa = '   ';
    component.criarTipoBolsa();
    expect(configService.criarTipoBolsa).not.toHaveBeenCalled();
  });

  it('should delete tipo de bolsa when confirmed', async () => {
    dialogService.confirm.and.returnValue(Promise.resolve(true));
    await component.excluirTipoBolsa(1);
    expect(configService.excluirTipoBolsa).toHaveBeenCalledWith(1);
  });

  // ===== ALUNOS COM BOLSA =====
  it('should open selection modal for aluno', () => {
    const aluno = {
      id_aluno: 10,
      nome_completo: 'Aluno Teste',
      email: 'aluno@teste.com',
      bolsas: []
    };
    component.abrirSelecaoBolsa(aluno);
    expect(component.alunoSelecionado).toBe(aluno);
    expect(component.modalBolsaAberto).toBeTrue();
  });

  it('should close modal and reset selection', () => {
    component.modalBolsaAberto = true;
    component.alunoSelecionado = {
      id_aluno: 10,
      nome_completo: 'Aluno Teste',
      email: 'aluno@teste.com',
      bolsas: []
    };
    component.bolsaSelecionada = 1;

    component.fecharModal();

    expect(component.modalBolsaAberto).toBeFalse();
    expect(component.alunoSelecionado).toBeNull();
    expect(component.bolsaSelecionada).toBeNull();
  });

  it('should create vinculo de bolsa when aluno and bolsa selected', () => {
    component.alunoSelecionado = {
      id_aluno: 10,
      nome_completo: 'Aluno Teste',
      email: 'aluno@teste.com',
      bolsas: []
    };
    component.bolsaSelecionada = 3;

    component.confirmarVinculo();

    expect(configService.criarBolsa).toHaveBeenCalledWith({
      id_aluno: 10,
      id_tipo_bolsa: 3,
    });
  });

  it('should not create vinculo when data is incomplete', () => {
    component.alunoSelecionado = null;
    component.bolsaSelecionada = 3;
    component.confirmarVinculo();
    expect(configService.criarBolsa).not.toHaveBeenCalled();

    component.alunoSelecionado = {
      id_aluno: 10,
      nome_completo: 'Aluno Teste',
      email: 'aluno@teste.com',
      bolsas: []
    };
    component.bolsaSelecionada = null;
    component.confirmarVinculo();
    expect(configService.criarBolsa).not.toHaveBeenCalled();
  });

  it('should remove bolsa by id_bolsa when confirmed', async () => {
    dialogService.confirm.and.returnValue(Promise.resolve(true));
    await component.removerBolsa(5);
    expect(configService.excluirBolsa).toHaveBeenCalledWith(5);
  });

  // ===== MATCHBOLSA (filtro) =====
  it('should match bolsa by term (case and accent insensitive)', () => {
    expect(
      component.matchBolsa('joao', 'João da Silva', 'joao@teste.com')
    ).toBeTrue();

    expect(
      component.matchBolsa('teste', 'Outra Pessoa', 'teste@dominio.com')
    ).toBeTrue();

    expect(
      component.matchBolsa('inexistente', 'João', 'joao@teste.com')
    ).toBeFalse();

    // termo vazio => sempre true
    expect(component.matchBolsa('', 'qualquer coisa')).toBeTrue();
  });
});

import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ListagemProjetosComponent } from './listagem-projetos.component';
import { ProjetoService } from '@services/projeto.service';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InscricoesService } from '@services/inscricoes.service';

class ProjetoServiceStub {
  listarProjetos = jasmine.createSpy().and.returnValue(
    of([
      {
        id: 1,
        nomeProjeto: 'Projeto Teste',
        nomeOrientador: 'joao da silva',
        campus: 'Campus',
        quantidadeMaximaAlunos: 0,
        nomesAlunos: [],
      },
    ])
  );

  listarProjetosDoOrientador = jasmine.createSpy().and.returnValue(of([]));
}

class AuthServiceStub {
  hasRole = jasmine
    .createSpy()
    .and.callFake((role: string) => role === 'SECRETARIA');
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

class SnackBarStub {
  open = jasmine.createSpy('open');
}

class InscricoesServiceStub {
  listarAprovadosDoProjeto = jasmine
    .createSpy()
    .and.returnValue(of([{ id_aluno: 1, nome: 'Aluno' }]));
}

describe('ListagemProjetosComponent', () => {
  let component: ListagemProjetosComponent;
  let projetoService: ProjetoServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemProjetosComponent],
      providers: [
        { provide: ProjetoService, useClass: ProjetoServiceStub },
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: Router, useClass: RouterStub },
        { provide: MatSnackBar, useClass: SnackBarStub },
        { provide: InscricoesService, useClass: InscricoesServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ListagemProjetosComponent);
    component = fixture.componentInstance;
    projetoService = TestBed.inject(
      ProjetoService
    ) as unknown as ProjetoServiceStub;
    component.ngOnInit();
  });

  it('should load and normalise project data', () => {
    expect(component.projetos.length).toBe(1);
    expect(component.getOrientadorNome(component.projetos[0] as any)).toBe(
      'Joao da Silva'
    );
  });

  it('should filter by status', () => {
    component.filtroStatus = '';
    component.atualizarProjetosFiltrados();
    component.setFiltroStatus('EM_EXECUCAO');
    expect(component.filtroStatus).toBe('EM_EXECUCAO');
  });

  it('should toggle contextual menu', () => {
    component.toggleMenu(1);
    expect(component.menuAberto).toBe(1);
    component.toggleMenu(1);
    expect(component.menuAberto).toBeNull();
  });

  it('should paginate to 8 items per page', () => {
    component.pageSize = 8;
    component.currentPage = 1;
    (component as any).projetos = Array.from({ length: 10 }).map((_, i) => ({
      id: i + 1,
      nomeProjeto: `P${i + 1}`,
      campus: '',
      quantidadeMaximaAlunos: 0,
      nomeOrientador: '',
      nomesAlunos: [],
    }));
    component.atualizarProjetosFiltrados();
    expect(component.paginatedList.length).toBe(8);
    component.nextPage();
    expect(component.paginatedList.length).toBe(2);
  });

  it('should expose readonly mode when user lacks orientador role', () => {
    expect(component.readonlyMode).toBeTrue();
  });
});

import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ListagemAlunosComponent } from './listagem-alunos.component';
import { ProjetoService } from '@services/projeto.service';
import { InscricoesService } from '@services/inscricoes.service';

class ProjetoServiceStub {
  listarAlunosDoProjeto = jasmine
    .createSpy('listarAlunosDoProjeto')
    .and.returnValue(of([]));

  listarInscricoesPorProjeto = jasmine
    .createSpy('listarInscricoesPorProjeto')
    .and.returnValue(
      of([
        {
          id_inscricao: 1,
          id_aluno: 1,
          aluno: { nome: 'Aluno Um', email: 'a@a', matricula: '1' },
          status: 'APROVADO',
        },
      ])
    );

  updateAlunosProjeto = jasmine
    .createSpy('updateAlunosProjeto')
    .and.returnValue(of({ mensagem: 'ok' }));

  atualizarAprovadosEExcluirRejeitados = jasmine
    .createSpy('atualizarAprovadosEExcluirRejeitados')
    .and.returnValue(of({ mensagem: 'ok', excluidos: [] }));
}

class InscricoesServiceStub {
  listarPorProjeto = jasmine
    .createSpy('listarPorProjeto')
    .and.returnValue(
      of([
        {
          id_inscricao: 1,
          id_aluno: 1,
          aluno: { nome: 'Aluno Um', email: 'a@a', matricula: '1' },
          status: 'APROVADO',
        },
      ])
    );
}

describe('ListagemAlunosComponent', () => {
  let component: ListagemAlunosComponent;
  let projetoService: ProjetoServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemAlunosComponent],
      providers: [
        { provide: ProjetoService, useClass: ProjetoServiceStub },
        { provide: InscricoesService, useClass: InscricoesServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ListagemAlunosComponent);
    component = fixture.componentInstance;
    projetoService = TestBed.inject(ProjetoService) as any;
    component.projetoId = 1;
  });

  it('should map students for secretaria view', () => {
    component.modo = 'SECRETARIA';
    component.ngOnInit();

    const lista = component.lista();
    expect(lista.length).toBe(1);
    expect(lista[0].nome).toBe('Aluno Um');
    expect(lista[0].matricula).toBe('1');
    expect(lista[0].email).toBe('a@a');
  });

  it('should toggle selection respecting the limit', () => {
    component.modo = 'ORIENTADOR';
    component.ngOnInit();
    const outra: any = { id_aluno: 2, aluno: { nome: 'Aluno 2' } };
    component.limite = 1;
    component.toggleSelecionado(component.aprovadas[0] as any, true);
    component.toggleSelecionado(outra, true);

    expect(component.selecionados.size).toBe(1);
  });

  it('should persist the selected students in ORIENTADOR mode', () => {
    component.modo = 'ORIENTADOR';
    component.selecionados = new Set([1]);

    component.salvarSelecao();

    expect(
      projetoService.atualizarAprovadosEExcluirRejeitados
    ).toHaveBeenCalled();
  });

  it('should remove a student from selection when toggled off', () => {
    component.modo = 'ORIENTADOR';
    component.selecionados = new Set([1]);
    const inscricao: any = { id_aluno: 1, aluno: { nome: 'Aluno' } };

    component.toggleSelecionado(inscricao, false);

    expect(component.selecionados.has(1)).toBeFalse();
  });

  it('should disable checkbox when the selection limit is reached', () => {
    component.modo = 'ORIENTADOR';
    component.selecionados = new Set([1]);
    component.limite = 1;
    const inscricao: any = { id_aluno: 2, aluno: { nome: 'Aluno 2' } };

    expect(component.disabledCheckbox(inscricao)).toBeTrue();
  });
});

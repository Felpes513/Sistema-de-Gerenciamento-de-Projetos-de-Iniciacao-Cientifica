import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { EnviarAvaliacoesModalComponent } from './enviar-avaliacoes.modal';
import { ProjetoService } from '@services/projeto.service';

class ProjetoServiceStub {
  listarProjetosComPdf = jasmine
    .createSpy()
    .and.returnValue(of([{ id: 1, titulo: 'Projeto', has_pdf: true }]));
  enviarProjetoParaAvaliadores = jasmine
    .createSpy()
    .and.returnValue(of({ mensagem: 'ok' }));
}

describe('EnviarAvaliacoesModalComponent', () => {
  let component: EnviarAvaliacoesModalComponent;
  let service: ProjetoServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnviarAvaliacoesModalComponent],
      providers: [{ provide: ProjetoService, useClass: ProjetoServiceStub }],
    }).compileComponents();

    const fixture = TestBed.createComponent(EnviarAvaliacoesModalComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ProjetoService) as unknown as ProjetoServiceStub;
    component.ngOnInit();
  });

  it('should load only projects that already have PDF', () => {
    expect(component.projetos.length).toBe(1);
  });

  it('should manage the email selection set', () => {
    component.toggleEmail('a@mail.com', true);
    expect(component.emailsSelecionados.has('a@mail.com')).toBeTrue();
    component.toggleEmail('a@mail.com', false);
    expect(component.emailsSelecionados.size).toBe(0);
  });

  it('should validate sending constraints', () => {
    component.projetoSelecionadoId = 1;
    component.emailsSelecionados = new Set(['a@mail.com']);
    component.enviar();
    expect(service.enviarProjetoParaAvaliadores).toHaveBeenCalled();
  });

  it('should handle API errors gracefully', () => {
    service.enviarProjetoParaAvaliadores.and.returnValue(
      throwError(() => ({ error: { detail: 'erro' } }))
    );
    component.projetoSelecionadoId = 1;
    component.emailsSelecionados = new Set(['a@mail.com']);
    component.enviar();
    expect(component.erro).toBe('erro');
  });

  it('should block sending when no project is chosen', () => {
    component.emailsSelecionados = new Set(['a@mail.com']);
    component.projetoSelecionadoId = null;
    component.enviar();
    expect(component.erro).toContain('Selecione um projeto');
  });
});

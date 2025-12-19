import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { EnviarAvaliacoesModalComponent } from './enviar-avaliacoes.modal';
import { ProjetoService } from '@services/projeto.service';
import { AvaliadoresExternosService } from '@services/avaliadores_externos.service';

class ProjetoServiceStub {
  listarProjetosComPdf = jasmine
    .createSpy('listarProjetosComPdf')
    .and.returnValue(of([{ id: 1, titulo: 'Projeto', has_pdf: true }]));
}

class AvaliadoresExternosServiceStub {
  enviarProjetoParaAvaliadores = jasmine
    .createSpy('enviarProjetoParaAvaliadores')
    .and.returnValue(of({ mensagem: 'ok' }));
}

describe('EnviarAvaliacoesModalComponent', () => {
  let component: EnviarAvaliacoesModalComponent;
  let projService: ProjetoServiceStub;
  let avaliadoresService: AvaliadoresExternosServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnviarAvaliacoesModalComponent],
      providers: [
        { provide: ProjetoService, useClass: ProjetoServiceStub },
        { provide: AvaliadoresExternosService, useClass: AvaliadoresExternosServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EnviarAvaliacoesModalComponent);
    component = fixture.componentInstance;

    projService = TestBed.inject(ProjetoService) as any;
    avaliadoresService = TestBed.inject(
      AvaliadoresExternosService
    ) as any;

    component.ngOnInit();
  });

  it('should load only projects that already have PDF', () => {
    expect(projService.listarProjetosComPdf).toHaveBeenCalled();
    expect(component.projetos.length).toBe(1);
    expect(component.projetos[0].has_pdf).toBeTrue();
  });

  it('should manage the email selection set', () => {
    component.toggleEmail('a@mail.com', true);
    expect(component.emailsSelecionados.has('a@mail.com')).toBeTrue();

    component.toggleEmail('a@mail.com', false);
    expect(component.emailsSelecionados.size).toBe(0);
  });

  it('should validate sending constraints and call API', () => {
    component.projetoSelecionadoId = 1;
    component.emailsSelecionados = new Set(['a@mail.com']);

    component.enviar();

    expect(
      avaliadoresService.enviarProjetoParaAvaliadores
    ).toHaveBeenCalledWith(
      1,
      ['a@mail.com'],
      undefined,
      undefined
    );
  });

  it('should handle API errors gracefully', () => {
    avaliadoresService.enviarProjetoParaAvaliadores.and.returnValue(
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

    expect(component.erro).toContain('Selecione um projeto com PDF');
  });

  it('should enable sending when there is a project and at least one email', () => {
    component.projetoSelecionadoId = 1;
    component.emailsSelecionados = new Set(['a@mail.com']);
    component.carregando = false;

    expect(component.podeEnviar).toBeTrue();
  });
});

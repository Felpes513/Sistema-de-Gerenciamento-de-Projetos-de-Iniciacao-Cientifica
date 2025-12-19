import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { FormularioProjetoComponent } from './formulario-projeto.component';
import { ProjetoService } from '@services/projeto.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from '@services/dialog.service';

class ProjetoServiceStub {
  listarOrientadoresAprovados = jasmine
    .createSpy('listarOrientadoresAprovados')
    .and.returnValue(
      of([{ id: 1, nome_completo: 'Maria Souza', email: 'maria@mail.com' }])
    );

  listarCampus = jasmine
    .createSpy('listarCampus')
    .and.returnValue(of([{ id_campus: 1, campus: 'Campus Central' }]));

  listarProjetosRaw = jasmine
    .createSpy('listarProjetosRaw')
    .and.returnValue(of([]));

  listarOrientadores = jasmine
    .createSpy('listarOrientadores')
    .and.returnValue(of([]));

  cadastrarProjetoCompleto = jasmine
    .createSpy('cadastrarProjetoCompleto')
    .and.returnValue(of({ id_projeto: 1 }));

  uploadDocumentosMonografia = jasmine
    .createSpy('uploadDocumentosMonografia')
    .and.returnValue(of([{ tipo: 'pdf', ok: true }]));

  uploadMonografiaParcialDocx = jasmine
    .createSpy('uploadMonografiaParcialDocx')
    .and.returnValue(of({}));

  uploadMonografiaParcialPdf = jasmine
    .createSpy('uploadMonografiaParcialPdf')
    .and.returnValue(of({}));

  uploadMonografiaFinalDocx = jasmine
    .createSpy('uploadMonografiaFinalDocx')
    .and.returnValue(of({}));

  uploadMonografiaFinalPdf = jasmine
    .createSpy('uploadMonografiaFinalPdf')
    .and.returnValue(of({}));

  // Downloads (não usados nos testes, mas stubados por segurança)
  downloadDocx = jasmine
    .createSpy('downloadDocx')
    .and.returnValue(of(new Blob()));
  downloadPdf = jasmine
    .createSpy('downloadPdf')
    .and.returnValue(of(new Blob()));
  downloadMonografiaParcialDocx = jasmine
    .createSpy('downloadMonografiaParcialDocx')
    .and.returnValue(of(new Blob()));
  downloadMonografiaParcialPdf = jasmine
    .createSpy('downloadMonografiaParcialPdf')
    .and.returnValue(of(new Blob()));
  downloadMonografiaFinalDocx = jasmine
    .createSpy('downloadMonografiaFinalDocx')
    .and.returnValue(of(new Blob()));
  downloadMonografiaFinalPdf = jasmine
    .createSpy('downloadMonografiaFinalPdf')
    .and.returnValue(of(new Blob()));
}

class DialogServiceStub {
  confirm = jasmine.createSpy('confirm').and.returnValue(Promise.resolve(true));
  alert = jasmine.createSpy('alert');
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

describe('FormularioProjetoComponent', () => {
  let component: FormularioProjetoComponent;
  let service: ProjetoServiceStub;
  let dialogService: DialogServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioProjetoComponent, HttpClientTestingModule],
      providers: [
        { provide: ProjetoService, useClass: ProjetoServiceStub },
        { provide: Router, useClass: RouterStub },
        { provide: DialogService, useClass: DialogServiceStub },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {}, // sem id => modo cadastro
              data: { modo: 'SECRETARIA' },
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(FormularioProjetoComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ProjetoService) as unknown as ProjetoServiceStub;
    dialogService = TestBed.inject(
      DialogService
    ) as unknown as DialogServiceStub;
    fixture.detectChanges(); // dispara ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orientadores and allow filtering', () => {
    expect(service.listarOrientadoresAprovados).toHaveBeenCalled();
    component.buscaOrientador = 'maria';
    component.filtrarOrientadores();
    expect(component.orientadoresFiltrados.length).toBe(1);
    expect(component.orientadoresFiltrados[0].nome_completo).toBe(
      'Maria Souza'
    );
  });

  it('should load campus list on init', () => {
    expect(service.listarCampus).toHaveBeenCalled();
    expect(component.campusList.length).toBeGreaterThan(0);
  });

  it('should compute titles for etapas correctly', () => {
    expect(component.tituloEtapa('IDEIA')).toContain('Submissão do Projeto');
    expect(component.subtituloEtapa('FINAL')).toContain('Envio final');
  });

  it('should start upload flow on PARCIAL etapa for new project', () => {
    // novo cadastro => sem id na rota => currentEtapaUpload deve ser PARCIAL
    expect(component['currentEtapaUpload']).toBe('PARCIAL');
  });

  it('should send PARCIAL PDF using uploadDocumentosMonografia when editing', async () => {
    // garantir que passa na validação do formulário
    component.projeto.titulo_projeto = 'Titulo';
    component.projeto.resumo = 'Resumo';
    component.projeto.orientador_nome = 'Maria Souza';
    component.orientadorSelecionadoId = 1;
    component.projeto.id_campus = 1;

    // modo edição + id do projeto (upload só roda no modo edição)
    component.modoEdicao = true;
    component.projetoId = 123;
    component.currentEtapaUpload = 'PARCIAL';

    const fakePdf = new File(['pdf'], 'monografia_parcial.pdf', {
      type: 'application/pdf',
    });
    component.arquivoPdf = fakePdf;

    await component.salvarProjeto();

    expect(service.uploadDocumentosMonografia).toHaveBeenCalledWith(
      123,
      'PARCIAL',
      { docx: undefined, pdf: fakePdf }
    );
  });

  it('should advance etapa from PARCIAL to FINAL when requirements are met', async () => {
    dialogService.confirm.and.returnValue(Promise.resolve(true));

    component.projetoId = 1;
    component.currentEtapaUpload = 'PARCIAL';

    component['historico'] = [
      { etapa: 'IDEIA', status: 'NAO_ENVIADO' },
      {
        etapa: 'PARCIAL',
        status: 'ENVIADO',
        arquivos: { pdf: { nome: 'monografia_parcial.pdf' } },
      },
      { etapa: 'FINAL', status: 'NAO_ENVIADO' },
    ];

    await component.avancarEtapa();

    expect(component.currentEtapaUpload).toBe('FINAL');
    expect(component.podeAvancar).toBeFalse();
  });

  it('should format orientador names using title case and roman numerals', () => {
    const formatted = component.formatarNomeCompleto('joao da silva ii');
    expect(formatted).toBe('Joao da Silva II');
  });
});

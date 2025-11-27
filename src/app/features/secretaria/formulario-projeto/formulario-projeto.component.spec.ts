import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FormularioProjetoComponent } from './formulario-projeto.component';
import { ProjetoService } from '@services/projeto.service';
import { Router, ActivatedRoute } from '@angular/router';

class ProjetoServiceStub {
  listarOrientadoresAprovados = jasmine
    .createSpy()
    .and.returnValue(of([{ id: 1, nome_completo: 'Maria Souza', email: 'maria@mail.com' }]));
  listarCampus = jasmine
    .createSpy()
    .and.returnValue(of([{ id_campus: 1, campus: 'Campus Central' }]));
  listarProjetosRaw = jasmine.createSpy().and.returnValue(of([]));
  listarOrientadores = jasmine.createSpy().and.returnValue(of([]));
  cadastrarProjetoCompleto = jasmine.createSpy().and.returnValue(of({ id_projeto: 1 }));
  atualizarProjeto = jasmine.createSpy().and.returnValue(of({}));
  uploadDocx = jasmine.createSpy().and.returnValue(of({}));
  uploadPdf = jasmine.createSpy().and.returnValue(of({}));
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

describe('FormularioProjetoComponent', () => {
  let component: FormularioProjetoComponent;
  let service: ProjetoServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioProjetoComponent],
      providers: [
        { provide: ProjetoService, useClass: ProjetoServiceStub },
        { provide: Router, useClass: RouterStub },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {}, data: {}, queryParamMap: new Map() },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(FormularioProjetoComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ProjetoService) as unknown as ProjetoServiceStub;
    component.ngOnInit();
  });

  it('should load orientadores and filter them', () => {
    expect(service.listarOrientadoresAprovados).toHaveBeenCalled();
    component.buscaOrientador = 'maria';
    component.filtrarOrientadores();
    expect(component.orientadoresFiltrados.length).toBe(1);
  });

  it('should compute titles for etapas', () => {
    expect(component.tituloEtapa('IDEIA')).toContain('Ideia');
    expect(component.subtituloEtapa('FINAL')).toContain('Final');
  });

  it('should advance etapa when requirements are met', () => {
    spyOn(window, 'alert');
    spyOn(window, 'confirm').and.returnValue(true);
    component.projetoId = 1;
    component.arquivoPdf = new File(['pdf'], 'arquivo.pdf');
    component.arquivoDocx = new File(['docx'], 'arquivo.docx');
    component.podeAvancar = true;
    component.avancarEtapa();
    expect(component.historico[0].status).toBe('ENVIADO');
  });

  it('should start on the first etapa', () => {
    expect(component.etapaAtual).toBe('IDEIA');
  });
});

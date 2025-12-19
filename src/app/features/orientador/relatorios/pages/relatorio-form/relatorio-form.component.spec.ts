import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { RelatorioFormComponent } from './relatorio-form.component';
import { RelatorioService } from '@services/relatorio.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '@services/dialog.service';

class RelatorioServiceStub {
  listarDoMes = jasmine.createSpy().and.returnValue(of([]));
  listarRecebidosSecretaria = jasmine.createSpy().and.returnValue(of([]));
  confirmar = jasmine.createSpy().and.returnValue(of({ mensagem: 'ok' }));
}

class DialogServiceStub {
  confirm = jasmine.createSpy('confirm').and.returnValue(Promise.resolve(true));
  alert = jasmine.createSpy('alert');
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

function createParamMap(map: Record<string, string>) {
  return {
    get: (key: string) => map[key] ?? null,
    has: (key: string) => map[key] != null,
  } as any;
}

describe('RelatorioFormComponent', () => {
  let component: RelatorioFormComponent;
  let service: RelatorioServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatorioFormComponent, HttpClientTestingModule],
      providers: [
        { provide: RelatorioService, useClass: RelatorioServiceStub },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: createParamMap({ projetoId: '1' }),
              queryParamMap: createParamMap({}),
            },
          },
        },
        { provide: Router, useClass: RouterStub },
        { provide: DialogService, useClass: DialogServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RelatorioFormComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(RelatorioService) as unknown as RelatorioServiceStub;
    component.ngOnInit();
  });

  it('should normalise parsed observations', () => {
    const parsed = (component as any).parseObservacao(
      'Resumo: teste\nAtividades: estudar\nHoras no mês: 12'
    );
    expect(parsed.resumo).toBe('teste');
    expect(parsed.horas).toBe(12);
  });

  it('should assemble the observation payload', () => {
    component.form.patchValue({
      referenciaMes: '2024-01',
      resumo: 'Resumo',
      atividades: 'Atividades',
      proximosPassos: 'Próximos',
      horas: 10,
    });

    const texto = (component as any).montarObservacao();
    expect(texto).toContain('Resumo: Resumo');
    expect(texto).toContain('Horas no mês: 10');
  });

  it('should format ISO strings using the helper', () => {
    const formatted = component.dataBr('2024-02-05T12:30:00Z');
    expect(formatted).toContain('/');
    expect(formatted).toContain(':');
  });

  it('should call confirmar when saving a valid form', () => {
    component.form.patchValue({
      referenciaMes: '2024-01',
      resumo: 'Resumo válido',
      ok: true,
    });
    component.salvar();
    expect(service.confirmar).toHaveBeenCalled();
  });

  it('should avoid saving when the form is read-only', () => {
    component.readOnly = true;
    component.form.patchValue({
      referenciaMes: '2024-01',
      resumo: 'Resumo válido',
      ok: true,
    });

    component.salvar();

    expect(service.confirmar).not.toHaveBeenCalled();
  });
});

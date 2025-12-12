import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { RelatoriosComponent } from './relatorios.component';
import { RelatorioService } from '@services/relatorio.service';
import { Router } from '@angular/router';
import { DialogService } from '@services/dialog.service';

class RelatorioServiceStub {
  listarRecebidosSecretaria = jasmine
    .createSpy()
    .and.returnValue(of([{ projetoId: 1, orientadorNome: 'joao da silva', referenciaMes: '2024-01' }]));
  listarPendentesSecretaria = jasmine
    .createSpy()
    .and.returnValue(of([{ projetoId: 2, orientadorNome: 'maria de souza', mes: '2024-01' }]));
  baixarRelatorioAlunos = jasmine
    .createSpy()
    .and.returnValue(of({ body: new Blob(), headers: new Map([['Content-Disposition', 'filename="relatorio.xlsx"']]) } as any));
}

class DialogServiceStub {
  confirm = jasmine.createSpy('confirm').and.returnValue(Promise.resolve(true));
  alert = jasmine.createSpy('alert');
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

describe('RelatoriosComponent', () => {
  let component: RelatoriosComponent;
  let service: RelatorioServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatoriosComponent, HttpClientTestingModule],
      providers: [
        { provide: RelatorioService, useClass: RelatorioServiceStub },
        { provide: Router, useClass: RouterStub },
        { provide: DialogService, useClass: DialogServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RelatoriosComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(RelatorioService) as unknown as RelatorioServiceStub;
    component.ngOnInit();
  });

  it('should load monthly reports and proper case orientador names', () => {
    expect(service.listarRecebidosSecretaria).toHaveBeenCalled();
    expect(component.recebidos[0].orientadorNome).toBe('Joao da Silva');
    expect(component.pendentes[0].orientadorNome).toBe('Maria de Souza');
  });

  it('should format ISO dates', () => {
    const result = component.dataBr('2024-01-01T12:00:00Z');
    expect(result).toContain('/');
  });

  it('should navigate to detail when opening a report', () => {
    const router = TestBed.inject(Router) as unknown as RouterStub;
    component.abrirDetalhe({ projetoId: 1, referenciaMes: '2024-01' } as any);
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should download the XLSX and reset loading flag', () => {
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:fake');
    spyOn(window.URL, 'revokeObjectURL');
    component.baixarAlunosXlsx();
    expect(service.baixarRelatorioAlunos).toHaveBeenCalled();
    expect(component.baixando).toBeFalse();
  });
});

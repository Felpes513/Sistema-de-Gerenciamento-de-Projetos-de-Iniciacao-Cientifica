// D:\Projetos\Vs code\Sistema-de-Gerenciamento-de-Projetos-de-Iniciacao-Cientifica\src\app\features\secretaria\relatorios\pages\relatorios.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { RelatoriosComponent } from './relatorios.component';
import { RelatorioService } from '@services/relatorio.service';
import { Router } from '@angular/router';

class RelatorioServiceStub {
  listarRecebidosSecretaria = jasmine
    .createSpy('listarRecebidosSecretaria')
    .and.returnValue(
      of([
        {
          projetoId: 1,
          orientadorNome: 'joao da silva',
          referenciaMes: '2024-01',
          confirmadoEm: '2024-01-01T12:00:00Z',
        } as any,
      ])
    );

  listarPendentesSecretaria = jasmine
    .createSpy('listarPendentesSecretaria')
    .and.returnValue(
      of([
        {
          projetoId: 2,
          orientadorNome: 'maria de souza',
          mes: '2024-01',
        } as any,
      ])
    );
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

describe('RelatoriosComponent', () => {
  let fixture: ComponentFixture<RelatoriosComponent>;
  let component: RelatoriosComponent;
  let service: RelatorioServiceStub;
  let router: RouterStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatoriosComponent],
      providers: [
        { provide: RelatorioService, useClass: RelatorioServiceStub },
        { provide: Router, useClass: RouterStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RelatoriosComponent);
    component = fixture.componentInstance;

    service = TestBed.inject(RelatorioService) as unknown as RelatorioServiceStub;
    router = TestBed.inject(Router) as unknown as RouterStub;

    fixture.detectChanges(); // ngOnInit -> carregarMensal()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load monthly reports and proper case orientador names', () => {
    expect(service.listarRecebidosSecretaria).toHaveBeenCalledWith(component.mes);
    expect(service.listarPendentesSecretaria).toHaveBeenCalledWith(component.mes);

    expect(component.recebidos.length).toBe(1);
    expect(component.pendentes.length).toBe(1);

    expect(component.recebidos[0].orientadorNome).toBe('Joao da Silva');
    expect(component.pendentes[0].orientadorNome).toBe('Maria de Souza');
  });

  it('should format ISO dates', () => {
    const result = component.dataBr('2024-01-01T12:00:00Z');
    expect(result).not.toBe('—');
    expect(result).toContain('/');
  });

  it('should return placeholder when date is invalid', () => {
    expect(component.dataBr('invalid-date')).toBe('—');
    expect(component.dataBr()).toBe('—');
  });

  it('should navigate to detail when opening a report', () => {
    component.abrirDetalhe({ projetoId: 1, referenciaMes: '2024-01' } as any);

    expect(router.navigate).toHaveBeenCalledWith(['/orientador/relatorios', 1], {
      queryParams: { mes: '2024-01', readonly: 1 },
    });
  });

  it('should not navigate when report has no id', () => {
    component.abrirDetalhe({ referenciaMes: '2024-01' } as any);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should carregarMensal set erroMensal when both lists are empty', () => {
    service.listarRecebidosSecretaria.and.returnValue(of([] as any));
    service.listarPendentesSecretaria.and.returnValue(of([] as any));

    component.carregarMensal();

    expect(component.erroMensal).toBe('Nenhum dado retornado.');
    expect(component.carregandoMensal).toBeFalse();
  });

  it('should keep working when one request fails (catchError -> [])', () => {
    // reset calls do load inicial do beforeEach
    service.listarRecebidosSecretaria.calls.reset();
    service.listarPendentesSecretaria.calls.reset();

    service.listarRecebidosSecretaria.and.returnValue(
      throwError(() => new Error('boom'))
    );
    // pendentes continua OK
    service.listarPendentesSecretaria.and.returnValue(
      of([
        { projetoId: 2, orientadorNome: 'maria de souza', mes: '2024-01' } as any,
      ])
    );

    component.carregarMensal();

    expect(service.listarRecebidosSecretaria).toHaveBeenCalledWith(component.mes);
    expect(service.listarPendentesSecretaria).toHaveBeenCalledWith(component.mes);

    // como o erro foi "engolido" pelo catchError, não entra no subscribe.error
    expect(component.carregandoMensal).toBeFalse();
    expect(component.erroMensal).toBeNull();

    expect(component.recebidos.length).toBe(0); // virou []
    expect(component.pendentes.length).toBe(1);
    expect(component.pendentes[0].orientadorNome).toBe('Maria de Souza');
  });

  it('should mudarMes update mes and call carregarMensal', () => {
    const spy = spyOn(component, 'carregarMensal').and.callThrough();

    component.mes = '2024-01';
    component.mudarMes(1);

    expect(component.mes).toBe('2024-02');
    expect(spy).toHaveBeenCalled();
  });

  it('should atualizarMes call carregarMensal', () => {
    const spy = spyOn(component, 'carregarMensal').and.callThrough();

    component.atualizarMes();

    expect(spy).toHaveBeenCalled();
  });
});

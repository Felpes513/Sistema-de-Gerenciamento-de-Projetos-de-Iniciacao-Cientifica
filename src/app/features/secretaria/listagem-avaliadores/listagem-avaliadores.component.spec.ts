import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ListagemAvaliadoresComponent } from './listagem-avaliadores.component';
import { ProjetoService } from '@services/projeto.service';
import { RouterTestingModule } from '@angular/router/testing';

class ProjetoServiceStub {
  listarAvaliadoresExternos = jasmine
    .createSpy()
    .and.returnValue(of([{ id: 1, nome: 'Avaliador', link_lattes: null }]));
  deleteAvaliador = jasmine.createSpy().and.returnValue(of({}));
}

describe('ListagemAvaliadoresComponent', () => {
  let component: any;
  let service: ProjetoServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ListagemAvaliadoresComponent],
      providers: [{ provide: ProjetoService, useClass: ProjetoServiceStub }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ListagemAvaliadoresComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ProjetoService) as any;
    fixture.detectChanges(); // ngOnInit
  });

  it('should load and normalise evaluators', () => {
    expect(component.avaliadores[0].link_lattes).toBe('');
  });

  it('should delete an evaluator after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.excluir(1);
    expect(service.deleteAvaliador).toHaveBeenCalledWith(1);
  });

  it('should open the modal flag', () => {
    component.abrirModal();
    expect(component.showModal).toBeTrue();
  });

  it('should reload the list after closing the modal with reload flag', () => {
    expect(service.listarAvaliadoresExternos).toHaveBeenCalledTimes(1);
    component.onModalClosed(true);
    expect(service.listarAvaliadoresExternos).toHaveBeenCalledTimes(2);
  });
});

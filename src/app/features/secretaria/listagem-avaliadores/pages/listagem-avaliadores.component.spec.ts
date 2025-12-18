import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ListagemAvaliadoresComponent } from './listagem-avaliadores.component';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogService } from '@services/dialog.service';
import { AvaliadoresExternosService } from '@services/avaliadores_externos.service';

class AvaliadoresExternosServiceStub {
  listarAvaliadoresExternos = jasmine
    .createSpy('listarAvaliadoresExternos')
    .and.returnValue(
      of([
        {
          id: 1,
          nome: 'Avaliador',
          link_lattes: null,
        },
      ])
    );

  deleteAvaliador = jasmine
    .createSpy('deleteAvaliador')
    .and.returnValue(of({}));
}

class DialogServiceStub {
  confirm = jasmine.createSpy('confirm').and.returnValue(Promise.resolve(true));
  alert = jasmine.createSpy('alert');
}

describe('ListagemAvaliadoresComponent', () => {
  let component: ListagemAvaliadoresComponent;
  let service: AvaliadoresExternosServiceStub;
  let dialogService: DialogServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ListagemAvaliadoresComponent],
      providers: [
        {
          provide: AvaliadoresExternosService,
          useClass: AvaliadoresExternosServiceStub,
        },
        { provide: DialogService, useClass: DialogServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ListagemAvaliadoresComponent);
    component = fixture.componentInstance;

    service = TestBed.inject(
      AvaliadoresExternosService
    ) as unknown as AvaliadoresExternosServiceStub;

    dialogService = TestBed.inject(
      DialogService
    ) as unknown as DialogServiceStub;

    fixture.detectChanges();
  });

  it('should load and normalise evaluators', () => {
    expect(component.avaliadores.length).toBe(1);
    expect(component.avaliadores[0].nome).toBe('Avaliador');
    expect(component.avaliadores[0].link_lattes).toBe('');
  });

  it('should delete an evaluator after confirmation', async () => {
    dialogService.confirm.and.returnValue(Promise.resolve(true));

    await component.excluir(1);

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

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { NotificacoesComponent } from './notificacoes.component';
import { NotificacaoService } from '@services/notificacao.service';
import { Renderer2 } from '@angular/core';
import { DialogService } from '@services/dialog.service';

class NotificacaoServiceStub {
  getNotificacoesPaginado = jasmine.createSpy().and.returnValue(
    of({ items: [{ id: 1, mensagem: 'Oi', data_criacao: new Date() }], page: 1, size: 10, total: 1 })
  );
  marcarTodasComoLidas = jasmine.createSpy().and.returnValue(of({}));
}

class DialogServiceStub {
  confirm = jasmine.createSpy('confirm').and.returnValue(Promise.resolve(true));
  alert = jasmine.createSpy('alert');
}

class RendererStub {
  addClass = jasmine.createSpy('addClass');
  removeClass = jasmine.createSpy('removeClass');
}

describe('NotificacoesComponent', () => {
  let component: NotificacoesComponent;
  let service: NotificacaoServiceStub;
  let dialogService: DialogServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificacoesComponent, HttpClientTestingModule],
      providers: [
        { provide: NotificacaoService, useClass: NotificacaoServiceStub },
        { provide: Renderer2, useClass: RendererStub },
        { provide: DialogService, useClass: DialogServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(NotificacoesComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(NotificacaoService) as unknown as NotificacaoServiceStub;
    dialogService = TestBed.inject(DialogService) as unknown as DialogServiceStub;
    component.ngOnInit();
  });

  it('should map and display notifications', () => {
    expect(component.notificacoes.length).toBe(1);
    expect(component.totalPages).toBe(1);
  });

  it('should mark all notifications as read', async () => {
    dialogService.confirm.and.returnValue(Promise.resolve(true));
    await component.marcarTodasComoLidas();
    expect(service.marcarTodasComoLidas).toHaveBeenCalled();
  });

  it('should open and close the modal', () => {
    const notif = component.notificacoes[0];
    component.abrirNotificacao(notif);
    expect(component.notificacaoAberta).toBe(notif);
    component.fecharModal();
    expect(component.notificacaoAberta).toBeNull();
  });

  it('should keep pagination bounds when already at the last page', () => {
    expect(service.getNotificacoesPaginado).toHaveBeenCalledTimes(1);
    component.totalPages = 1;
    component.proxima();
    expect(service.getNotificacoesPaginado).toHaveBeenCalledTimes(1);
  });
});

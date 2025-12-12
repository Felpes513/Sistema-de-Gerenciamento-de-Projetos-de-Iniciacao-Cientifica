import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SidenavSecretariaComponent } from './sidenav-secretaria.component';
import { AuthService, Role } from '@services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificacaoService } from '@services/notificacao.service';
import { DialogService } from '@services/dialog.service';

class AuthServiceStub {
  role: Role | null = 'SECRETARIA';

  getRole = jasmine.createSpy('getRole').and.callFake(() => this.role);
  hasRole = jasmine
    .createSpy('hasRole')
    .and.callFake((r: Role) => this.role === r);
  hasAnyRole = jasmine.createSpy('hasAnyRole').and.returnValue(true);
  clearSession = jasmine.createSpy('clearSession');
}

class NotificacaoServiceStub {
  getNotificacoesPaginado = jasmine
    .createSpy('getNotificacoesPaginado')
    .and.returnValue(
      of({
        items: [],
        page: 1,
        size: 10,
        total: 0,
      })
    );

  getNotificacoes = jasmine
    .createSpy('getNotificacoes')
    .and.returnValue(of([]));

  marcarTodasComoLidas = jasmine
    .createSpy('marcarTodasComoLidas')
    .and.returnValue(of({}));
}

class DialogServiceStub {
  confirm = jasmine
    .createSpy('confirm')
    .and.returnValue(Promise.resolve(true));
  alert = jasmine.createSpy('alert').and.returnValue(Promise.resolve());
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({
      matches: false,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
      media: '',
      onchange: null,
    }),
  });
});

/* ---------- TESTES ---------- */

describe('SidenavSecretariaComponent', () => {
  let component: SidenavSecretariaComponent;
  let auth: AuthServiceStub;
  let notifService: NotificacaoServiceStub;
  let dialog: DialogServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, SidenavSecretariaComponent],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: NotificacaoService, useClass: NotificacaoServiceStub },
        { provide: DialogService, useClass: DialogServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SidenavSecretariaComponent);
    component = fixture.componentInstance;

    auth = TestBed.inject(AuthService) as any;
    notifService = TestBed.inject(NotificacaoService) as any;
    dialog = TestBed.inject(DialogService) as any;

    fixture.detectChanges();
  });

  it('should expose the readable role name', () => {
    expect(component.papelLegivel()).toBe('Secretaria');
  });

  it('should toggle the mobile menu only when on mobile', () => {
    component.isMobile = false;
    component.isMenuOpen = true;

    component.toggleMenu();
    expect(component.isMenuOpen).toBeTrue();

    component.isMobile = true;
    component.toggleMenu();
    expect(component.isMenuOpen).toBeFalse();
  });

  it('should clear the session when the user confirms logout', async () => {
    dialog.confirm.and.returnValue(Promise.resolve(true));

    await component.confirmarSaida(new Event('click'));

    expect(auth.clearSession).toHaveBeenCalled();
  });

  it('should mark notifications as read for the secretaria', () => {
    component.isSecretaria = true;

    component.marcarNotificacoesComoLidas();

    expect(notifService.marcarTodasComoLidas).toHaveBeenCalledWith(
      'secretaria'
    );
  });

  it('should adapt layout when the viewport switches to mobile', () => {
    spyOn(window, 'matchMedia').and.returnValue({
      matches: true,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
      media: '',
      onchange: null,
    } as any);

    (component as any).updateLayout();

    expect(component.isMobile).toBeTrue();
    expect(component.isMenuOpen).toBeFalse();
  });
});

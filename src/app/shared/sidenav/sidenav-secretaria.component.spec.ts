import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SidenavSecretariaComponent } from './sidenav-secretaria.component';
import { AuthService, Role } from '@services/auth.service';
import { ProjetoService } from '@services/projeto.service';
import { RouterTestingModule } from '@angular/router/testing';

class AuthServiceStub {
  role: Role | null = 'SECRETARIA';
  getRole = jasmine.createSpy().and.callFake(() => this.role);
  hasRole = jasmine.createSpy().and.callFake((r: Role) => this.role === r);
  hasAnyRole = jasmine.createSpy().and.returnValue(true);
  clearSession = jasmine.createSpy('clearSession');
}
class ProjetoServiceStub {
  getNotificacoesPaginado = jasmine
    .createSpy()
    .and.returnValue(of({ items: [] }));
  getNotificacoes = jasmine.createSpy().and.returnValue(of([]));
  marcarTodasComoLidas = jasmine.createSpy().and.returnValue(of({}));
}

// polyfill matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({
      matches: false,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    }),
  });
});

describe('SidenavSecretariaComponent', () => {
  let component: SidenavSecretariaComponent;
  let projetoService: ProjetoServiceStub;
  let auth: AuthServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, SidenavSecretariaComponent],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: ProjetoService, useClass: ProjetoServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SidenavSecretariaComponent);
    component = fixture.componentInstance;
    projetoService = TestBed.inject(ProjetoService) as any;
    auth = TestBed.inject(AuthService) as any;
  });

  it('should expose the readable role name', () => {
    // valor inicial
    expect(component.papelLegivel()).toBe('Secretaria');

    // muda o stub E o snapshot do componente
    auth.role = 'ORIENTADOR';
    (component as any).role = 'ORIENTADOR';

    expect(component.papelLegivel()).toBe('Orientador');
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

  it('should clear the session when the user confirms logout', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.confirmarSaida(new Event('click'));
    expect(auth.clearSession).toHaveBeenCalled();
  });

  it('should mark notifications as read for the secretaria', () => {
    component.isSecretaria = true;
    component.marcarNotificacoesComoLidas();
    expect(projetoService.marcarTodasComoLidas).toHaveBeenCalledWith(
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

    component['updateLayout' as any]();
    expect(component.isMobile).toBeTrue();
    expect(component.isMenuOpen).toBeFalse();
  });
});

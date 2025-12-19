import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { LoginService } from '@services/login.service';
import { ActivatedRoute, Router } from '@angular/router';

class LoginServiceStub {
  loginAluno = jasmine.createSpy().and.returnValue(of({ access_token: 'jwt', refresh_token: 'ref' }));
  loginOrientador = jasmine
    .createSpy()
    .and.returnValue(of({ access_token: 'jwt', refresh_token: 'ref' }));
  loginSecretaria = jasmine
    .createSpy()
    .and.returnValue(of({ access_token: 'jwt', refresh_token: 'ref' }));
  setTokens = jasmine.createSpy();
  getRole = jasmine.createSpy().and.returnValue('ALUNO');
}

class RouterStub {
  navigateByUrl = jasmine.createSpy('navigateByUrl');
  navigate = jasmine.createSpy('navigate');
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let loginService: LoginServiceStub;
  let routeParams$: Subject<any>;

  beforeEach(async () => {
    routeParams$ = new Subject();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: LoginService, useClass: LoginServiceStub },
        { provide: Router, useClass: RouterStub },
        { provide: ActivatedRoute, useValue: { queryParams: routeParams$.asObservable() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    loginService = TestBed.inject(LoginService) as unknown as LoginServiceStub;
  });

  afterEach(() => localStorage.clear());

  it('should switch login strategy based on perfil', () => {
    routeParams$.next({ perfil: 'orientador' });
    component.email = 'orientador@mail.com';
    component.senha = '123456';
    component.login();

    expect(loginService.loginOrientador).toHaveBeenCalledWith(
      'orientador@mail.com',
      '123456'
    );
  });

  it('should persist the remembered email', () => {
    component.perfil = 'aluno';
    component.email = 'foo@bar.com';
    component.senha = '123456';
    component.rememberMe = true;
    component.login();

    expect(localStorage.getItem('rememberedEmail_aluno')).toBe('foo@bar.com');
  });

  it('should surface backend errors', () => {
    loginService.loginSecretaria.and.returnValue(
      throwError(() => ({ status: 501, error: { detail: 'SSO' } }))
    );
    component.perfil = 'secretaria';
    component.email = 'sec@uscs';
    component.senha = 'senha';
    component.login();

    expect(component.erro).toContain('SSO');
  });

  it('should open support contact', () => {
    component.perfil = 'aluno';
    const spy = spyOn(window, 'open');
    component.contactSupport(new Event('click'));
    expect(spy).toHaveBeenCalled();
  });

  it('should default to the aluno profile', () => {
    expect(component.perfil).toBe('aluno');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ResetPasswordComponent } from './reset-password.component';
import { PasswordService } from '@services/password.service';
import { ActivatedRoute, Router } from '@angular/router';

/* ---------- STUBS ---------- */

class PasswordServiceStub {
  forgotPassword = jasmine
    .createSpy('forgotPassword')
    .and.returnValue(of({ message: 'OK' }));

  resetPassword = jasmine
    .createSpy('resetPassword')
    .and.returnValue(of({ message: 'Senha redefinida' }));
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

const activatedRouteStub: Partial<ActivatedRoute> = {
  snapshot: {
    data: { perfil: 'aluno' },
    queryParamMap: {
      get: (key: string) => {
        // para esses testes não precisamos do token; pode ser null
        if (key === 'token') return null;
        if (key === 'perfil') return 'aluno';
        return null;
      },
    } as any,
  } as any,
};

/* ---------- TESTES ---------- */

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let passwordService: PasswordServiceStub;
  let router: RouterStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        { provide: PasswordService, useClass: PasswordServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useClass: RouterStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;

    passwordService = TestBed.inject(
      PasswordService
    ) as unknown as PasswordServiceStub;

    router = TestBed.inject(Router) as unknown as RouterStub;
  });

  it('should call the API and display success message', () => {
    component.email = 'user@email.com';

    component.enviar();

    expect(passwordService.forgotPassword).toHaveBeenCalledWith(
      'user@email.com'
    );
    expect(component.okMsg).toBe('OK');
    expect(component.loading).toBeFalse();
    expect(component.erro).toBe('');
  });

  it('should avoid calling API when email is empty', () => {
    component.email = '   '; // vazio com espaços

    component.enviar();

    expect(passwordService.forgotPassword).not.toHaveBeenCalled();
    expect(component.erro).toBe('Informe um e-mail.');
  });

  it('should handle API errors gracefully', () => {
    const errorResponse = { error: { detail: 'Erro na API' } };

    (passwordService.forgotPassword as jasmine.Spy).and.returnValue(
      throwError(() => errorResponse)
    );

    component.email = 'user@email.com';

    component.enviar();

    expect(passwordService.forgotPassword).toHaveBeenCalled();
    expect(component.erro).toBe('Erro na API');
    expect(component.loading).toBeFalse();
    expect(component.okMsg).toBe('');
  });

  it('should redirect back to login', () => {
    component.perfil = 'secretaria';

    component.voltarLogin();

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { perfil: 'secretaria' },
    });
  });

  it('should go to login without perfil when irParaLogin is called', () => {
    component.irParaLogin();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});

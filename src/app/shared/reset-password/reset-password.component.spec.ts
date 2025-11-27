import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ResetPasswordComponent } from './reset-password.component';
import { ConfigService } from '@services/config.service';
import { ActivatedRoute, Router } from '@angular/router';

class ConfigServiceStub {
  forgotPassword = jasmine.createSpy().and.returnValue(of({ message: 'ok' }));
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let config: ConfigServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        { provide: ConfigService, useClass: ConfigServiceStub },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { perfil: 'aluno' }, queryParamMap: new Map() } },
        },
        { provide: Router, useClass: RouterStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    config = TestBed.inject(ConfigService) as unknown as ConfigServiceStub;
  });

  it('should call the API and display success message', () => {
    component.email = 'user@mail.com';
    component.enviar();
    expect(config.forgotPassword).toHaveBeenCalledWith('user@mail.com');
    expect(component.okMsg).toBe('ok');
  });

  it('should handle API errors gracefully', () => {
    config.forgotPassword.and.returnValue(
      throwError(() => ({ error: { detail: 'Falha' } }))
    );
    component.email = 'user@mail.com';
    component.enviar();
    expect(component.erro).toBe('Falha');
  });

  it('should redirect back to login', () => {
    const router = TestBed.inject(Router) as unknown as RouterStub;
    component.voltarLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { perfil: component.perfil },
    });
  });

  it('should avoid calling API when email is empty', () => {
    component.email = '';
    component.enviar();
    expect(config.forgotPassword).not.toHaveBeenCalled();
  });
});

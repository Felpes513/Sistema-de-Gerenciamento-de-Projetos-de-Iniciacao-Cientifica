import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RegisterComponent } from './cadastro.component';
import { RegisterService } from '@services/cadastro.service';
import { ConfigService } from '@services/config.service';
import { Router } from '@angular/router';

class RegisterServiceStub {
  registerOrientador = jasmine.createSpy('registerOrientador').and.returnValue(of({}));
  registerAluno = jasmine.createSpy('registerAluno').and.returnValue(of({}));
}

class ConfigServiceStub {
  listarCursos = jasmine.createSpy('listarCursos').and.returnValue(of({ cursos: [] }));
  listarCampus = jasmine.createSpy('listarCampus').and.returnValue(of({ campus: [] }));
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let registerService: RegisterServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: RegisterService, useClass: RegisterServiceStub },
        { provide: ConfigService, useClass: ConfigServiceStub },
        { provide: Router, useClass: RouterStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    registerService = TestBed.inject(RegisterService) as unknown as RegisterServiceStub;

    fixture.detectChanges();
  });

  it('should mask CPF correctly', () => {
    component.ori.cpf = '12345678901';
    component.applyCpfMask('ori');
    expect(component.ori.cpf).toBe('123.456.789-01');
  });

  it('should validate the first step for students', () => {
    component.alu = {
      nomeCompleto: 'Aluno Teste',
      cpf: '529.982.247-25',
      email: 'aluno@mail.com',
      senha: '123456',
      confirmar: '123456',
      idCurso: 1,
      idCampus: 1,
      possuiTrabalhoRemunerado: false,
    } as any;

    expect(component.validStep1()).toBeTrue();
  });

  it('should capture PDF selection', () => {
    const file = new File(['conteudo'], 'arquivo.pdf', { type: 'application/pdf' });
    const input = { files: [file], value: '' };

    component.onPdfChange({ target: input } as any);

    expect(component.pdfFile).toBe(file);
    expect(component.pdfName).toBe('arquivo.pdf');
  });

  it('should stop orientador submission when validation fails', () => {
    component.onSubmitOrientador();

    expect(component.erro).toContain('Preencha o nome completo.');
    expect(registerService.registerOrientador).not.toHaveBeenCalled();
  });

  it('should submit orientador registration when data is valid', () => {
    spyOn(window as any, 'setTimeout').and.callFake((fn: any) => {
      fn();
      return 0;
    });

    component.ori = {
      nomeCompleto: 'Orientador',
      cpf: '529.982.247-25',
      email: 'o@mail.com',
      senha: '123456',
      confirmar: '123456',
    };

    component.acceptTermsOri = true;

    component.onSubmitOrientador();

    expect(registerService.registerOrientador).toHaveBeenCalled();
  });

  it('should require PDF for student submission', () => {
    component.step = 3;
    component.acceptTermsAlu = true;
    component.alu = {
      nomeCompleto: 'Aluno',
      cpf: '529.982.247-25',
      email: 'a@mail.com',
      senha: '123456',
      confirmar: '123456',
      idCurso: 1,
      idCampus: 1,
      possuiTrabalhoRemunerado: false,
    } as any;

    component.pdfFile = null;

    component.onSubmitAluno();

    expect(component.erro).toBe('Envie o PDF de notas.');
    expect(registerService.registerAluno).not.toHaveBeenCalled();
  });

  it('should send student registration when everything is provided', () => {
    spyOn(window as any, 'setTimeout').and.callFake((fn: any) => {
      fn();
      return 0;
    });

    component.step = 3;
    component.acceptTermsAlu = true;

    component.pdfFile = new File(['x'], 'arquivo.pdf', { type: 'application/pdf' });

    component.alu = {
      nomeCompleto: 'Aluno',
      cpf: '529.982.247-25',
      email: 'a@mail.com',
      senha: '123456',
      confirmar: '123456',
      idCurso: 1,
      idCampus: 1,
      possuiTrabalhoRemunerado: false,
    } as any;

    component.onSubmitAluno();

    expect(registerService.registerAluno).toHaveBeenCalled();
  });

  it('should start the wizard on the first step', () => {
    expect(component.step).toBe(1);
  });

  it('should reset state when selecting a profile', () => {
    component.step = 3;
    component.pdfName = 'arquivo.pdf';
    component.erro = 'Erro';
    component.sucesso = 'Ok';

    component.selecionarPerfil('orientador');

    expect(component.step).toBe(1);
    expect(component.pdfName).toBe('');
    expect(component.erro).toBeNull();
    expect(component.sucesso).toBeNull();
    expect(component.pdfFile).toBeNull();
  });
});

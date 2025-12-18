import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RegisterComponent } from './cadastro.component';
import { RegisterService } from '@services/cadastro.service';
import { ProjetoService } from '@services/projeto.service';
import { ConfigService } from '@services/config.service';
import { Router } from '@angular/router';

class RegisterServiceStub {
  registerOrientador = jasmine.createSpy().and.returnValue(of({}));
  registerAluno = jasmine.createSpy().and.returnValue(of({}));
}

class ProjetoServiceStub {
  listarCampus = jasmine.createSpy().and.returnValue(of([{ id_campus: 1, campus: 'Campus' }]));
}

class ConfigServiceStub {
  listarCursos = jasmine.createSpy().and.returnValue(of({ cursos: [] }));
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
        { provide: ProjetoService, useClass: ProjetoServiceStub },
        { provide: ConfigService, useClass: ConfigServiceStub },
        { provide: Router, useClass: RouterStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    registerService = TestBed.inject(RegisterService) as unknown as RegisterServiceStub;
  });

  it('should mask CPF correctly', () => {
    component.ori.cpf = '12345678901';
    component.applyCpfMask('ori');
    expect(component.ori.cpf).toBe('123.456.789-01');
  });

  it('should validate the first step for students', () => {
    component.alu = {
      nomeCompleto: 'Aluno Teste',
      cpf: '123.456.789-01',
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
  });

  it('should stop orientador submission when validation fails', () => {
    component.onSubmitOrientador();
    expect(component.erro).toContain('Preencha os campos');
  });

  it('should submit orientador registration when data is valid', () => {
    component.ori = {
      nomeCompleto: 'Orientador',
      cpf: '123.456.789-01',
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
    component.onSubmitAluno();
    expect(component.erro).toBe('Envie o PDF de notas.');
  });

  it('should send student registration when everything is provided', () => {
    component.step = 3;
    component.acceptTermsAlu = true;
    component.pdfFile = new File(['x'], 'arquivo.pdf');
    component.alu = {
      nomeCompleto: 'Aluno',
      cpf: '123.456.789-01',
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
});

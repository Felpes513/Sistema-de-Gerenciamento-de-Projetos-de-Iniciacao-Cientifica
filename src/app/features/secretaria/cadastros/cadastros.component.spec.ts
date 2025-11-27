import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CadastrosComponent } from './cadastros.component';
import { RegisterService } from '@services/cadastro.service';

class RegisterServiceStub {
  listarAlunos = jasmine
    .createSpy()
    .and.returnValue(of([{ nome: 'JOSE', cpf: '12345678901' }]));
  listarOrientadores = jasmine
    .createSpy()
    .and.returnValue(of([{ nome: 'MARIA', cpf: '98765432100' }]));
  listarAlunosInadimplentes = jasmine.createSpy().and.returnValue(of([]));
  listarOrientadoresInadimplentes = jasmine.createSpy().and.returnValue(of([]));
  aprovarAluno = jasmine.createSpy().and.returnValue(of({}));
  aprovarOrientador = jasmine.createSpy().and.returnValue(of({}));
  reprovarAluno = jasmine.createSpy().and.returnValue(of({}));
  reprovarOrientador = jasmine.createSpy().and.returnValue(of({}));
}

describe('CadastrosComponent', () => {
  let component: CadastrosComponent;
  let service: RegisterServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrosComponent],
      providers: [{ provide: RegisterService, useClass: RegisterServiceStub }],
    }).compileComponents();

    const fixture = TestBed.createComponent(CadastrosComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(RegisterService) as unknown as RegisterServiceStub;
    fixture.detectChanges(); // ngOnInit -> load()
  });

  it('should load students by default', () => {
    expect(service.listarAlunos).toHaveBeenCalled();
    expect(component.alunos[0].nomeFmt).toBe('Jose');
  });

  it('should switch tabs and reload data', () => {
    component.setTipo('ORIENTADORES');
    expect(service.listarOrientadores).toHaveBeenCalled();
  });

  it('should match search terms ignoring accents', () => {
    expect(component.match('jose', 'José da Silva')).toBeTrue();
  });

  it('should approve using the correct endpoint', () => {
    component.aprovar(1);
    expect(service.aprovarAluno).toHaveBeenCalledWith(1);
    component.setTipo('ORIENTADORES');
    component.aprovar(2);
    expect(service.aprovarOrientador).toHaveBeenCalledWith(2);
  });

  it('should reject using the correct endpoint', () => {
    component.reprovar(3);
    expect(service.reprovarAluno).toHaveBeenCalledWith(3);
    component.setTipo('ORIENTADORES');
    component.reprovar(4);
    expect(service.reprovarOrientador).toHaveBeenCalledWith(4);
  });
});

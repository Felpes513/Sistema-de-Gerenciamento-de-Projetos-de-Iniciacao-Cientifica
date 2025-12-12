import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CadastrosComponent } from './cadastros.component';
import { RegisterService } from '@services/cadastro.service';
import { DialogService } from '@services/dialog.service';

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

class DialogServiceStub {
  confirm = jasmine.createSpy('confirm').and.returnValue(Promise.resolve(true));
  alert = jasmine.createSpy('alert');
}

describe('CadastrosComponent', () => {
  let component: CadastrosComponent;
  let service: RegisterServiceStub;
  let dialogService: DialogServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrosComponent, HttpClientTestingModule],
      providers: [
        { provide: RegisterService, useClass: RegisterServiceStub },
        { provide: DialogService, useClass: DialogServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CadastrosComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(RegisterService) as unknown as RegisterServiceStub;
    dialogService = TestBed.inject(DialogService) as unknown as DialogServiceStub;
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

  it('should reject using the correct endpoint', async () => {
    dialogService.confirm.and.returnValue(Promise.resolve(true));
    await component.reprovar(3);
    expect(service.reprovarAluno).toHaveBeenCalledWith(3);
    component.setTipo('ORIENTADORES');
    await component.reprovar(4);
    expect(service.reprovarOrientador).toHaveBeenCalledWith(4);
  });
});

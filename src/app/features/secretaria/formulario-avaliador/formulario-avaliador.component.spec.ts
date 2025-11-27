import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FormularioAvaliadorComponent } from './formulario-avaliador.component';
import { Router } from '@angular/router';
import { ProjetoService } from '@services/projeto.service';

class ProjetoServiceStub {
  criarAvaliador = jasmine.createSpy().and.returnValue(of({}));
  atualizarAvaliador = jasmine.createSpy().and.returnValue(of({}));
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

describe('FormularioAvaliadorComponent', () => {
  let component: FormularioAvaliadorComponent;
  let service: ProjetoServiceStub;
  let router: RouterStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioAvaliadorComponent],
      providers: [
        { provide: Router, useClass: RouterStub },
        { provide: ProjetoService, useClass: ProjetoServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(FormularioAvaliadorComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ProjetoService) as unknown as ProjetoServiceStub;
    router = TestBed.inject(Router) as unknown as RouterStub;
  });

  it('should validate mandatory fields', () => {
    spyOn(window, 'alert');
    component.salvarAvaliador();
    expect(window.alert).toHaveBeenCalled();
  });

  it('should create a new evaluator', () => {
    spyOn(window, 'alert');
    component.avaliador.nome = ' Nome ';
    component.avaliador.email = 'mail@mail.com ';
    component.salvarAvaliador();
    expect(service.criarAvaliador).toHaveBeenCalledWith({
      nome: 'Nome',
      email: 'mail@mail.com',
      especialidade: '',
      subespecialidade: '',
      link_lattes: '',
    });
  });

  it('should update an existing evaluator', () => {
    spyOn(window, 'alert');
    component.edicao = true;
    component.avaliador = {
      id: 1,
      nome: 'Nome',
      email: 'mail@mail.com',
      especialidade: '',
      subespecialidade: '',
      link_lattes: '',
    };
    component.salvarAvaliador();
    expect(service.atualizarAvaliador).toHaveBeenCalledWith(1, jasmine.any(Object));
  });
});

// D:\Projetos\Vs code\Sistema-de-Gerenciamento-de-Projetos-de-Iniciacao-Cientifica\src\app\features\secretaria\formulario-avaliador\formulario-avaliador.component.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { FormularioAvaliadorComponent } from './formulario-avaliador.component';
import { Router } from '@angular/router';
import { AvaliadoresExternosService } from '@services/avaliadores_externos.service';
import { DialogService } from '@services/dialog.service';
import { AvaliadorExterno } from '@shared/models/avaliador_externo';

class AvaliadoresExternosServiceStub {
  criarAvaliador = jasmine
    .createSpy('criarAvaliador')
    .and.returnValue(of({ id_avaliador: 1 }));

  atualizarAvaliador = jasmine
    .createSpy('atualizarAvaliador')
    .and.returnValue(of(void 0));
}

class DialogServiceStub {
  // o componente faz `await this.dialog.alert(...)`, então devolvemos uma Promise resolvida
  alert = jasmine.createSpy('alert').and.returnValue(Promise.resolve());
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

describe('FormularioAvaliadorComponent', () => {
  let component: FormularioAvaliadorComponent;
  let service: AvaliadoresExternosServiceStub;
  let router: RouterStub;
  let dialog: DialogServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioAvaliadorComponent, HttpClientTestingModule],
      providers: [
        { provide: Router, useClass: RouterStub },
        { provide: AvaliadoresExternosService, useClass: AvaliadoresExternosServiceStub },
        { provide: DialogService, useClass: DialogServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(FormularioAvaliadorComponent);
    component = fixture.componentInstance;

    service = TestBed.inject(
      AvaliadoresExternosService
    ) as unknown as AvaliadoresExternosServiceStub;

    router = TestBed.inject(Router) as unknown as RouterStub;

    dialog = TestBed.inject(DialogService) as unknown as DialogServiceStub;
  });

  it('should validate mandatory fields', async () => {
    // nome e email vazios
    component.avaliador.nome = '';
    component.avaliador.email = '';

    await component.salvarAvaliador();

    expect(dialog.alert).toHaveBeenCalled();
    expect(dialog.alert).toHaveBeenCalledWith(
      'Preencha pelo menos Nome e E-mail.',
      'Campos obrigatórios'
    );
  });

  it('should create a new evaluator', async () => {
    component.avaliador.nome = ' Nome ';
    component.avaliador.email = 'mail@mail.com ';
    component.avaliador.especialidade = '';
    component.avaliador.subespecialidade = '';
    component.avaliador.link_lattes = '';

    await component.salvarAvaliador();

    const expectedPayload: AvaliadorExterno = {
      nome: 'Nome',
      email: 'mail@mail.com',
      especialidade: '',
      subespecialidade: '',
      link_lattes: '',
    };

    expect(service.criarAvaliador).toHaveBeenCalledWith(expectedPayload);
  });

  it('should update an existing evaluator', async () => {
    component.edicao = true;
    component.avaliador = {
      id: 1,
      nome: 'Nome',
      email: 'mail@mail.com',
      especialidade: '',
      subespecialidade: '',
      link_lattes: '',
    };

    await component.salvarAvaliador();

    expect(service.atualizarAvaliador).toHaveBeenCalledWith(
      1,
      jasmine.objectContaining({
        nome: 'Nome',
        email: 'mail@mail.com',
        especialidade: '',
        subespecialidade: '',
        link_lattes: '',
      })
    );
  });
});

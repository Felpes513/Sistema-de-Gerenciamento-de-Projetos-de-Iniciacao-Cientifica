import { Routes } from '@angular/router';
import { orientadorGuard } from '@core/guards/orientador.guard';
import { alunoGuard } from '@core/guards/aluno.guard';
import { secretariaGuard } from '@core/guards/secretaria.guard';
import { LandingRedirectGuard } from '@core/guards/landing-redirect.guard';
import { projetoExistsGuard } from '@core/guards/exist-screen.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [LandingRedirectGuard],
    loadComponent: () =>
      import('@shared/ui/home/home.component').then((m) => m.HomeComponent),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('@shared/ui/login/login.component').then((m) => m.LoginComponent),
  },

  {
    path: 'cadastro',
    loadComponent: () =>
      import('@shared/ui/cadastro/cadastro.component').then(
        (m) => m.RegisterComponent
      ),
  },

  {
    path: 'secretaria',
    canActivate: [secretariaGuard],
    loadComponent: () =>
      import('@shared/ui/sidenav/sidenav.component').then(
        (m) => m.SidenavComponent
      ),
    children: [
      { path: '', redirectTo: 'projetos', pathMatch: 'full' },

      {
        path: 'configuracoes',
        loadComponent: () =>
          import('@sec/configuracoes/pages/configuracoes.component').then(
            (m) => m.ConfiguracoesComponent
          ),
      },

      {
        path: 'avaliadores',
        loadComponent: () =>
          import(
            '@sec/listagem-avaliadores/pages/listagem-avaliadores.component'
          ).then((m) => m.ListagemAvaliadoresComponent),
      },

      {
        path: 'avaliadores/novo',
        loadComponent: () =>
          import(
            '@sec/formulario-avaliador/pages/formulario-avaliador.component'
          ).then((m) => m.FormularioAvaliadorComponent),
      },

      {
        path: 'notificacoes',
        loadComponent: () =>
          import('@sec/notificacoes/pages/notificacoes.component').then(
            (m) => m.NotificacoesComponent
          ),
      },

      {
        path: 'projetos',
        loadComponent: () =>
          import(
            '@features/projetos/pages/listagem-projetos/listagem-projetos.component'
          ).then((m) => m.ListagemProjetosComponent),
        data: { modo: 'SECRETARIA' },
      },

      {
        path: 'projetos/novo',
        loadComponent: () =>
          import(
            '@features/projetos/pages/formulario-projeto/formulario-projeto.component'
          ).then((m) => m.FormularioProjetoComponent),
        data: { modo: 'SECRETARIA' },
      },

      {
        path: 'projetos/editar/:id',
        canActivate: [projetoExistsGuard],
        loadComponent: () =>
          import(
            '@features/projetos/pages/formulario-projeto/formulario-projeto.component'
          ).then((m) => m.FormularioProjetoComponent),
        data: { modo: 'SECRETARIA' },
      },

      {
        path: 'email',
        loadComponent: () =>
          import(
            '@sec/upload-certificados/pages/upload-certificados.component'
          ).then((m) => m.UploadCertificadosComponent),
      },

      {
        path: 'relatorios',
        loadComponent: () =>
          import('@sec/relatorios/pages/relatorios.component').then(
            (m) => m.RelatoriosComponent
          ),
      },

      {
        path: 'cadastros',
        loadComponent: () =>
          import('@sec/cadastros/pages/cadastros.component').then(
            (m) => m.CadastrosComponent
          ),
      },
      
    ],
  },

  {
    path: 'orientador',
    canActivate: [orientadorGuard],
    loadComponent: () =>
      import('@shared/ui/sidenav/sidenav.component').then(
        (m) => m.SidenavComponent
      ),
    children: [
      { path: '', redirectTo: 'projetos', pathMatch: 'full' },

      {
        path: 'projetos',
        loadComponent: () =>
          import(
            '@features/projetos/pages/listagem-projetos/listagem-projetos.component'
          ).then((m) => m.ListagemProjetosComponent),
        data: { modo: 'ORIENTADOR' },
      },
      {
        path: 'projetos/:id',
        canActivate: [projetoExistsGuard],
        loadComponent: () =>
          import(
            '@features/projetos/pages/formulario-projeto/formulario-projeto.component'
          ).then((m) => m.FormularioProjetoComponent),
        data: { modo: 'ORIENTADOR' },
      },

      { path: 'relatorios', redirectTo: 'projetos', pathMatch: 'full' },
      {
        path: 'relatorios/:projetoId',
        canActivate: [projetoExistsGuard],
        loadComponent: () =>
          import(
            '@ori/relatorios/pages/relatorio-form/relatorio-form.component'
          ).then((m) => m.RelatorioFormComponent),
      },
    ],
  },

  {
    path: 'aluno',
    canActivate: [alunoGuard],
    loadComponent: () =>
      import('@shared/ui/sidenav/sidenav.component').then(
        (m) => m.SidenavComponent
      ),
    children: [
      { path: '', redirectTo: 'projetos', pathMatch: 'full' },

      {
        path: 'projetos',
        loadComponent: () =>
          import(
            '@features/projetos/pages/listagem-projetos/listagem-projetos.component'
          ).then((m) => m.ListagemProjetosComponent),
        data: { modo: 'ALUNO' },
      },
      {
        path: 'projetos/:id',
        canActivate: [projetoExistsGuard],
        loadComponent: () =>
          import(
            '@features/projetos/pages/formulario-projeto/formulario-projeto.component'
          ).then((m) => m.FormularioProjetoComponent),
        data: { modo: 'ALUNO' },
      },
    ],
  },

  {
    path: 'aluno/reset-password',
    loadComponent: () =>
      import('@shared/ui/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
    data: { perfil: 'aluno' },
  },
  {
    path: 'orientador/reset-password',
    loadComponent: () =>
      import('@shared/ui/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
    data: { perfil: 'orientador' },
  },
  {
    path: 'secretaria/reset-password',
    loadComponent: () =>
      import('@shared/ui/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
    data: { perfil: 'secretaria' },
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('@shared/ui/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },

  { path: '**', redirectTo: '' },
];

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
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('@shared/login/login.component').then((m) => m.LoginComponent),
  },

  {
    path: 'cadastro',
    loadComponent: () =>
      import('@shared/cadastro/cadastro.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'secretaria',
    canActivate: [secretariaGuard],
    loadComponent: () =>
      import('@shared/sidenav/sidenav.component').then(
        (m) => m.SidenavComponent
      ),
    children: [
      { path: '', redirectTo: 'projetos', pathMatch: 'full' },

      {
        path: 'configuracoes',
        loadComponent: () =>
          import(
            './features/secretaria/configuracoes/configuracoes.component'
            ).then((m) => m.ConfiguracoesComponent),
      },
      {
        path: 'avaliadores',
        loadComponent: () =>
          import(
            './features/secretaria/listagem-avaliadores/listagem-avaliadores.component'
            ).then((m) => m.ListagemAvaliadoresComponent),
      },
      {
        path: 'avaliadores/novo',
        loadComponent: () =>
          import(
            './features/secretaria/formulario-avaliador/formulario-avaliador.component'
            ).then((m) => m.FormularioAvaliadorComponent),
      },
      {
        path: 'notificacoes',
        loadComponent: () =>
          import(
            './features/secretaria/notificacoes/notificacoes.component'
            ).then((m) => m.NotificacoesComponent),
      },
      {
        path: 'projetos',
        loadComponent: () =>
          import(
            './features/secretaria/listagem-projetos/listagem-projetos.component'
            ).then((m) => m.ListagemProjetosComponent),
      },
      {
        path: 'projetos/novo',
        loadComponent: () =>
          import(
            './features/secretaria/formulario-projeto/formulario-projeto.component'
            ).then((m) => m.FormularioProjetoComponent),
      },
      {
        path: 'projetos/editar/:id',
        canActivate: [projetoExistsGuard],
        loadComponent: () =>
          import(
            './features/secretaria/formulario-projeto/formulario-projeto.component'
            ).then((m) => m.FormularioProjetoComponent),
      },
      {
        path: 'email',
        loadComponent: () =>
          import(
            './features/secretaria/upload-certificados/upload-certificados.component'
            ).then((m) => m.UploadCertificadosComponent),
      },
      {
        path: 'relatorios',
        loadComponent: () =>
          import('./features/secretaria/relatorios/relatorios.component').then(
            (m) => m.RelatoriosComponent
          ),
      },
      {
        path: 'cadastros',
        loadComponent: () =>
          import('./features/secretaria/cadastros/cadastros.component').then(
            (m) => m.CadastrosComponent
          ),
      },
    ],
  },
  {
    path: 'orientador',
    canActivate: [orientadorGuard],
    loadComponent: () =>
      import('@shared/sidenav/sidenav.component').then(
        (m) => m.SidenavComponent
      ),
    children: [
      { path: '', redirectTo: 'projetos', pathMatch: 'full' },

      {
        path: 'projetos',
        loadComponent: () =>
          import(
            './features/secretaria/listagem-projetos/listagem-projetos.component'
            ).then((m) => m.ListagemProjetosComponent),
        data: { modo: 'ORIENTADOR' },
      },
      {
        path: 'projetos/:id',
        canActivate: [projetoExistsGuard],
        loadComponent: () =>
          import(
            './features/secretaria/formulario-projeto/formulario-projeto.component'
            ).then((m) => m.FormularioProjetoComponent),
        data: { modo: 'ORIENTADOR' },
      },

      { path: 'relatorios', redirectTo: 'projetos', pathMatch: 'full' },
      {
        path: 'relatorios/:projetoId',
        canActivate: [projetoExistsGuard],
        loadComponent: () =>
          import(
            './features/orientador/relatorio-form/relatorio-form.component'
            ).then((m) => m.RelatorioFormComponent),
      },
    ],
  },
  {
    path: 'aluno',
    canActivate: [alunoGuard],
    loadComponent: () =>
      import('@shared/sidenav/sidenav.component').then(
        (m) => m.SidenavComponent
      ),
    children: [
      { path: '', redirectTo: 'projetos', pathMatch: 'full' },

      {
        path: 'projetos',
        loadComponent: () =>
          import(
            './features/secretaria/listagem-projetos/listagem-projetos.component'
            ).then((m) => m.ListagemProjetosComponent),
        data: { modo: 'ALUNO' },
      },
      {
        path: 'projetos/:id',
        canActivate: [projetoExistsGuard],
        loadComponent: () =>
          import(
            './features/secretaria/formulario-projeto/formulario-projeto.component'
            ).then((m) => m.FormularioProjetoComponent),
        data: { modo: 'ALUNO' },
      },
    ],
  },
  {
    path: 'aluno/reset-password',
    loadComponent: () =>
      import('./shared/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
    data: { perfil: 'aluno' },
  },
  {
    path: 'orientador/reset-password',
    loadComponent: () =>
      import('./shared/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
    data: { perfil: 'orientador' },
  },
  {
    path: 'secretaria/reset-password',
    loadComponent: () =>
      import('./shared/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
    data: { perfil: 'secretaria' },
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./shared/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },

  { path: '**', redirectTo: '' },
];

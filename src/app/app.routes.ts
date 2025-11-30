import { ProjetoCadastro } from './shared/interfaces/projeto';
import { Routes } from '@angular/router';
import { orientadorGuard } from '@core/guards/orientador.guard';
import { alunoGuard } from '@core/guards/aluno.guard';
import { LandingRedirectGuard } from '@core/guards/landing-redirect.guard';

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

  // SECRETARIA
  {
    path: 'secretaria',
    loadComponent: () =>
      import('./shared/sidenav/sidenav-secretaria.component').then(
        (m) => m.SidenavSecretariaComponent
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/secretaria/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
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
            (m) => m.CadastrosComponent // <- certo
          ),
      },
    ],
  },

  // ORIENTADOR
  {
    path: 'orientador',
    canActivate: [orientadorGuard],
    loadComponent: () =>
      import('./shared/sidenav/sidenav-secretaria.component').then(
        (m) => m.SidenavSecretariaComponent
      ),
    children: [
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
        loadComponent: () =>
          import(
            './features/secretaria/formulario-projeto/formulario-projeto.component'
          ).then((m) => m.FormularioProjetoComponent),
        data: { modo: 'ORIENTADOR' },
      },
      { path: 'relatorios', redirectTo: 'projetos', pathMatch: 'full' },
      {
        path: 'relatorios/:projetoId',
        loadComponent: () =>
          import(
            './features/orientador/relatorio-form/relatorio-form.component'
          ).then((m) => m.RelatorioFormComponent),
      },
      { path: '', redirectTo: 'projetos', pathMatch: 'full' },
    ],
  },

  {
    path: 'aluno',
    canActivate: [alunoGuard],
    loadComponent: () =>
      import('./shared/sidenav/sidenav-secretaria.component').then(
        (m) => m.SidenavSecretariaComponent
      ),
    children: [
      { path: '', redirectTo: 'projetos', pathMatch: 'full' },
      {
        path: 'projetos',
        loadComponent: () =>
          import(
            './features/secretaria/listagem-projetos/listagem-projetos.component'
          ).then((m) => m.ListagemProjetosComponent),
      },
      {
        path: 'projetos/:id',
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

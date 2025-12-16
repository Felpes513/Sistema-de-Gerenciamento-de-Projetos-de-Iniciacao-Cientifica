import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LoginService } from '@services/login.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  senha = '';
  erro: string | null = null;
  perfil: 'aluno' | 'orientador' | 'secretaria' = 'aluno';
  showPassword = false;
  rememberMe = false;
  isLoading = false;

  constructor(
    private loginService: LoginService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParams.subscribe((params) => {
      this.perfil = (params['perfil'] as any) || 'aluno';
      this.loadRememberedEmail();
    });
  }

  login() {
    if (this.isLoading) return;
    this.erro = null;
    this.isLoading = true;

    const email = this.email.trim();
    const senha = this.senha;

    let observable;
    if (this.perfil === 'aluno') {
      observable = this.loginService.loginAluno(email, senha);
    } else if (this.perfil === 'orientador') {
      observable = this.loginService.loginOrientador(email, senha);
    } else {
      observable = this.loginService.loginSecretaria(email, senha);
    }

    observable.subscribe({
      next: (res) => {
        this.loginService.setTokens(res.access_token, res.refresh_token);
        this.handleRememberMe();

        const role = this.loginService.getRole();

        // ✅ Dashboard removido: Secretaria vai para "projetos"
        const redirects: Record<string, string> = {
          ALUNO: '/aluno/projetos',
          ORIENTADOR: '/orientador/projetos',
          SECRETARIA: '/secretaria/projetos',
        };

        const destino = (role && redirects[role]) || '/';
        this.isLoading = false;
        this.router.navigateByUrl(destino);
      },
      error: (e) => {
        const status = e?.status;

        if (status === 501 && this.perfil === 'secretaria') {
          this.erro =
            "Login da Secretaria usa SSO. Clique em 'Entrar com SSO'.";
        } else {
          this.erro =
            e?.error?.detail ||
            e?.error?.message ||
            'E-mail ou senha inválidos.';
        }

        this.isLoading = false;
      },
    });
  }

  entrarComSSO() {
    window.location.href = environment.ssoRedirectUrl;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  forgotPassword(event: Event) {
    event.preventDefault();
    this.router.navigate(['/reset-password'], {
      queryParams: { perfil: this.perfil },
    });
  }

  goToRegister() {
    if (this.perfil === 'aluno') {
      this.router.navigate(['/register/aluno']);
    } else if (this.perfil === 'orientador') {
      this.router.navigate(['/cadastro'], {
        queryParams: { perfil: 'orientador' },
      });
    }
  }

  contactSupport(event: Event) {
    event.preventDefault();
    const supportEmails = {
      aluno: 'suporte.aluno@uscs.edu.br',
      orientador: 'suporte.orientador@uscs.edu.br',
      secretaria: 'suporte.secretaria@uscs.edu.br',
    } as const;

    const email = supportEmails[this.perfil];
    const subject = `Suporte - Login ${
      this.perfil.charAt(0).toUpperCase() + this.perfil.slice(1)
    }`;
    const body = `Olá, preciso de ajuda com o login como ${this.perfil}.`;

    window.open(
      `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
    );
  }

  private handleRememberMe() {
    const storageKey = `rememberedEmail_${this.perfil}`;
    if (this.rememberMe) localStorage.setItem(storageKey, this.email);
    else localStorage.removeItem(storageKey);
  }

  private loadRememberedEmail() {
    const storageKey = `rememberedEmail_${this.perfil}`;
    const savedEmail = localStorage.getItem(storageKey);
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }
}

import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription, interval, of } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, Role } from '@services/auth.service';
import { NotificacaoService } from '@services/notificacao.service';
import { DialogService } from '@services/dialog.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private auth = inject(AuthService);
  private notificacaoService = inject(NotificacaoService);
  private dialog = inject(DialogService);

  exibirBadgeNotificacao = false;
  private notifSub?: Subscription;

  role = this.auth.getRole();
  isSecretaria = this.auth.hasRole('SECRETARIA');
  isOrientador = this.auth.hasRole('ORIENTADOR');
  isAluno = this.auth.hasRole('ALUNO');

  isMobile = false;
  isMenuOpen = true;

  papelLegivel = computed(() => {
    const map: Record<Role, string> = {
      SECRETARIA: 'Secretaria',
      ORIENTADOR: 'Orientador',
      ALUNO: 'Aluno',
    };
    return this.role ? map[this.role] : 'Usuário';
  });

  private readonly helpUrls = {
    secretaria:
      'https://www.notion.so/Bem-vindo-ao-SGPIC-Secretaria-2ca0bb39d1c9807fb34fc03c6658a6b9',
    orientador:
      'https://www.notion.so/Bem-vindo-ao-SGPIC-Orientador-2ca0bb39d1c9803183a9cb6bf33bc378',
    aluno:
      'https://www.notion.so/Bem-vindo-ao-SGPIC-Aluno-2ca0bb39d1c9803baddcd78495552fa0',
  } as const;

  get ajudaUrl(): string {
    if (this.isSecretaria) return this.helpUrls.secretaria;
    if (this.isOrientador) return this.helpUrls.orientador;
    if (this.isAluno) return this.helpUrls.aluno;
    return this.helpUrls.aluno; // fallback seguro
  }


  ngOnInit(): void {
    this.updateLayout();

    if (this.isSecretaria) {
      this.notifSub = interval(30000)
        .pipe(
          startWith(0),
          switchMap(() =>
            this.notificacaoService
              .getNotificacoesPaginado('secretaria', 1, 10)
              .pipe(
                catchError(() =>
                  this.notificacaoService.getNotificacoes('secretaria')
                ),
                catchError(() => of([]))
              )
          )
        )
        .subscribe((res: any) => {
          const items = Array.isArray(res) ? res : res?.items ?? [];
          this.exibirBadgeNotificacao = items.some(
            (n: any) => n?.lida === false
          );
        });
    }
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateLayout();
  }

  private updateLayout(): void {
    this.isMobile = window.matchMedia('(max-width: 768px)').matches;
    this.isMenuOpen = this.isMobile ? false : true;
  }

  toggleMenu(): void {
    if (this.isMobile) this.isMenuOpen = !this.isMenuOpen;
  }

  onNavClick(): void {
    if (this.isMobile) this.isMenuOpen = false;
  }

  async confirmarSaida(e: Event) {
    e.preventDefault();

    const confirmou = await this.dialog.confirm(
      'Tem certeza que deseja sair do sistema?',
      'Sair do sistema'
    );

    if (!confirmou) {
      return;
    }

    this.auth.clearSession();
    this.router.navigate(['/'], { replaceUrl: true });
  }

  marcarNotificacoesComoLidas() {
    this.exibirBadgeNotificacao = false;
    if (this.isSecretaria) {
      this.notificacaoService.marcarTodasComoLidas('secretaria').subscribe({
        error: () => {},
      });
    }
  }
}

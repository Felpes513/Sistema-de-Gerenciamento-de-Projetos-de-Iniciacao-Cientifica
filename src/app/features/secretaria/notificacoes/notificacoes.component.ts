import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Notificacao } from '@interfaces/notificacao';
import { NotificacaoService } from '@services/notificacao.service';
import { DialogService } from '@services/dialog.service';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './notificacoes.component.html',
  styleUrls: ['./notificacoes.component.css'],
})
export class NotificacoesComponent implements OnInit, OnDestroy {
  private readonly destinatario = 'secretaria';

  notificacoes: Notificacao[] = [];
  page = 1;
  size = 10;
  total = 0;
  totalPages = 1;
  carregando = false;
  erro: string | null = null;
  notificacaoAberta: Notificacao | null = null;

  constructor(
    private notifService: NotificacaoService,
    private renderer: Renderer2,
    private dialog: DialogService
  ) {}

  ngOnInit(): void {
    this.carregar(1);
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'modal-open');
  }

  private mapItem(n: any): Notificacao {
    const rawDate = n.data_criacao || n.created_at || n.data || n.timestamp;
    const d = rawDate ? new Date(rawDate) : new Date();
    return {
      tipo: n.titulo || n.tipo || 'Notificação',
      mensagem: n.mensagem || n.message || '',
      data: d.toLocaleDateString(),
      hora: d.toLocaleTimeString(),
      lida: !!n.lida,
      id: n.id,
    };
  }

  carregar(p = 1): void {
    this.carregando = true;
    this.erro = null;

    this.notifService
      .getNotificacoesPaginado(this.destinatario, p, this.size)
      .subscribe({
        next: (res) => {
          const items = res?.items ?? [];
          this.notificacoes = items.map((x: any) => this.mapItem(x));
          this.page = res?.page ?? p;
          this.size = res?.size ?? this.size;
          this.total = res?.total ?? items.length;
          this.totalPages = Math.max(1, Math.ceil(this.total / this.size));
          this.carregando = false;
        },
        error: () => {
          this.erro = 'Falha ao carregar notificações';
          this.carregando = false;
        },
      });
  }

  anterior(): void {
    if (this.page > 1) this.carregar(this.page - 1);
  }

  proxima(): void {
    if (this.page < this.totalPages) this.carregar(this.page + 1);
  }

  async marcarTodasComoLidas(): Promise<void> {
    const ok = await this.dialog.confirm(
      'Marcar todas as notificações como lidas?',
      'Confirmação'
    );
    if (!ok) return;

    this.notifService.marcarTodasComoLidas(this.destinatario).subscribe({
      next: () => this.carregar(this.page),
      error: () => {
      },
    });
  }

  abrirNotificacao(notificacao: Notificacao): void {
    this.notificacaoAberta = notificacao;
    notificacao.lida = true;
    this.renderer.addClass(document.body, 'modal-open');
  }

  fecharModal(): void {
    this.notificacaoAberta = null;
    this.renderer.removeClass(document.body, 'modal-open');
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.notificacaoAberta) this.fecharModal();
  }

  get novasNotificacoes(): boolean {
    return this.notificacoes.some((n) => !n.lida);
  }
}

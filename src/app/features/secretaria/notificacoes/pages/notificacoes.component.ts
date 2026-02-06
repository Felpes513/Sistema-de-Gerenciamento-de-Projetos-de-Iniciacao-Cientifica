import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Notificacao } from '@shared/models/notificacao';
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
  /** Limite fixo de 5 notificações por página */
  size = 5;
  total = 0;
  totalPages = 1;
  carregando = false;
  erro: string | null = null;
  notificacaoAberta: Notificacao | null = null;

  constructor(
    private notifService: NotificacaoService,
    private renderer: Renderer2,
    private dialog: DialogService,
  ) {}

  ngOnInit(): void {
    this.carregar(1);
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'modal-open');
  }

  /**
   * Monta mensagem amigável para relatório mensal quando o back
   * passar a enviar nome do projeto/orientador. Enquanto isso,
   * mantém a mensagem original.
   */
  private formatMensagem(n: any): string {
    const base = n.mensagem || n.message || '';

    const tipo = (n.tipo || n.titulo || '').toString().toLowerCase();

    const nomeProjeto =
      n.projeto_nome ||
      n.nome_projeto ||
      n.titulo_projeto ||
      n.projeto?.nome ||
      n.projeto?.titulo;

    const nomeOrientador =
      n.orientador_nome || n.nome_orientador || n.orientador?.nome;

    // Só mexe na mensagem de relatório mensal
    if (tipo.includes('relatorio mensal') && (nomeProjeto || nomeOrientador)) {
      const mes =
        n.mes || n.mes_referencia || n.mes_ref || this.extrairMesDoTexto(base);

      if (nomeProjeto && nomeOrientador) {
        if (mes) {
          return `O orientador ${nomeOrientador} enviou o relatório mensal do projeto "${nomeProjeto}" (mês ${mes}).`;
        }
        return `O orientador ${nomeOrientador} enviou o relatório mensal do projeto "${nomeProjeto}".`;
      }

      if (nomeProjeto && mes) {
        return `Relatório mensal do projeto "${nomeProjeto}" enviado (mês ${mes}).`;
      }

      if (nomeProjeto) {
        return `Relatório mensal do projeto "${nomeProjeto}" enviado.`;
      }
    }

    // Qualquer outra notificação fica exatamente como veio do back
    return base;
  }

  private extrairMesDoTexto(texto: string | undefined): string | null {
    if (!texto) return null;
    const match = texto.match(/\d{4}-(0[1-9]|1[0-2])/);
    return match ? match[0] : null;
  }

  private mapItem(n: any): Notificacao {
    const rawDate = n.data_criacao || n.created_at || n.data || n.timestamp;

    let d: Date;
    if (rawDate) {
      const dateStr = String(rawDate);
      const match = dateStr.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,
      );

      if (match) {
        const [, year, month, day, hour, minute, second] = match;

        // Cria a data assumindo que veio em UTC e converte para local
        d = new Date(
          Date.UTC(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second),
          ),
        );
      } else {
        d = new Date(rawDate);
      }
    } else {
      d = new Date();
    }

    const rawLida = n.lida;
    const lida = rawLida === true || rawLida === 1 || rawLida === '1';

    return {
      tipo: n.titulo || n.tipo || 'Notificação',
      mensagem: this.formatMensagem(n),
      data: d.toLocaleDateString('pt-BR'),
      hora: d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      lida,
      id: n.id,
    };
  }

  carregar(p = 1): void {
    this.carregando = true;
    this.erro = null;

    this.notifService
      .getNotificacoesPaginado(this.destinatario, p, this.size)
      .subscribe({
        next: (res: any) => {
          const itemsRaw = Array.isArray(res?.items)
            ? res.items
            : Array.isArray(res)
              ? res
              : [];

          this.notificacoes = itemsRaw.map((x: any) => {
            return this.mapItem(x);
          });

          this.page = res?.page ?? p;
          this.total = res?.total ?? itemsRaw.length;
          this.totalPages = Math.max(1, Math.ceil(this.total / this.size));
          this.carregando = false;
        },
        error: (e) => {
          console.error('[NOTIF] erro ao carregar notificações', e);
          this.erro = 'Falha ao carregar notificações';
          this.carregando = false;
        },
      });
  }

  anterior(): void {
    if (this.page > 1) {
      this.carregar(this.page - 1);
    }
  }

  proxima(): void {
    if (this.page < this.totalPages) {
      this.carregar(this.page + 1);
    }
  }

  async marcarTodasComoLidas(): Promise<void> {
    const ok = await this.dialog.confirm(
      'Marcar todas as notificações como lidas?',
      'Confirmação',
    );
    if (!ok) return;

    this.notifService.marcarTodasComoLidas(this.destinatario).subscribe({
      next: () => this.carregar(this.page),
      error: () => {
        // opcional: tratar erro
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
    if (this.notificacaoAberta) {
      this.fecharModal();
    }
  }

  get novasNotificacoes(): boolean {
    return this.notificacoes.some((n) => !n.lida);
  }
}

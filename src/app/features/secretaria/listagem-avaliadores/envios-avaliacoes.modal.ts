import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvaliadoresExternosService } from '@services/avaliadores_externos.service';
import { EnvioProjeto } from '@interfaces/avaliador_externo';

type EnvioView = {
  id: number;
  titulo: string;
  assunto: string;
  enviadoEm: string;
  destinatarios: string[];
  raw: EnvioProjeto;
};

@Component({
  selector: 'app-envios-avaliacoes-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './envios-avaliacoes.modal.html',
  styleUrls: ['./envios-avaliacoes.modal.css'],
})
export class EnviosAvaliacoesModalComponent implements OnInit {
  @Output() closed = new EventEmitter<boolean>();

  carregando = false;
  erro = '';
  envios: EnvioView[] = [];

  selecionadoId: number | null = null;
  detalhe: EnvioProjeto | null = null;
  carregandoDetalhe = false;

  constructor(private service: AvaliadoresExternosService) {}

  ngOnInit(): void {
    this.carregar();
  }

  fechar(reload = false): void {
    this.closed.emit(reload);
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';
    this.envios = [];
    this.selecionadoId = null;
    this.detalhe = null;

    this.service.listarEnvios().subscribe({
      next: (rows) => {
        const lista = Array.isArray(rows) ? rows : [];
        this.envios = lista
          .map((r) => this.normalizeEnvio(r))
          .filter((x) => x.id > 0);
        this.carregando = false;
      },
      error: (err: any) => {
        this.erro =
          err?.error?.detail || err?.message || 'Falha ao listar envios';
        this.carregando = false;
      },
    });
  }

  async abrirDetalhe(item: EnvioView): Promise<void> {
    this.selecionadoId = item.id;
    this.detalhe = null;
    this.carregandoDetalhe = true;

    this.service.obterEnvioPorId(item.id).subscribe({
      next: (envio) => {
        this.detalhe = envio || item.raw;
        this.carregandoDetalhe = false;
      },
      error: () => {
        this.detalhe = item.raw;
        this.carregandoDetalhe = false;
      },
    });
  }

  private normalizeEnvio(r: EnvioProjeto): EnvioView {
    const id = Number((r as any).id_envio ?? (r as any).id ?? 0);

    const titulo =
      (r as any).titulo_projeto ||
      (r as any).projeto_titulo ||
      (r as any).titulo ||
      '—';

    const assunto = ((r as any).assunto ?? '')?.toString().trim() || '—';

    const enviadoEm =
      (r as any).enviado_em ||
      (r as any).data_envio ||
      (r as any).created_at ||
      '';

    const destinatarios = this.normalizeDestinatarios((r as any).destinatarios);

    return {
      id,
      titulo,
      assunto,
      enviadoEm,
      destinatarios,
      raw: r,
    };
  }

  private normalizeDestinatarios(v: any): string[] {
    if (!v) return [];

    if (Array.isArray(v)) {
      return v.map((x) => String(x).trim()).filter(Boolean);
    }

    if (typeof v === 'string') {
      const s = v.trim();
      if (
        (s.startsWith('[') && s.endsWith(']')) ||
        (s.startsWith('{') && s.endsWith('}'))
      ) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed))
            return parsed.map((x) => String(x).trim()).filter(Boolean);
        } catch {}
      }
      return s
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
    }

    return [];
  }

  dataBr(iso?: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString('pt-BR');
  }
}

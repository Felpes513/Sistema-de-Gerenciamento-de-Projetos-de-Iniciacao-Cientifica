import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RelatorioService } from '@services/relatorio.service';
import { RelatorioMensal, PendenciaMensal } from '@shared/models/relatorio';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DialogService } from '@services/dialog.service';

@Component({
  standalone: true,
  selector: 'app-relatorios',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.css'],
})
export class RelatoriosComponent implements OnInit {
  private relatorioService = inject(RelatorioService);
  private router = inject(Router);
  private dialog = inject(DialogService);

  baixando = false;
  mes = this.toYYYYMM(new Date());
  recebidos: RelatorioMensal[] = [];
  pendentes: PendenciaMensal[] = [];
  carregandoMensal = false;
  erroMensal: string | null = null;

  private readonly TZ = 'America/Sao_Paulo';

  private readonly lowerWords = new Set([
    'de',
    'da',
    'do',
    'das',
    'dos',
    'e',
    'di',
  ]);

  private properCase(v: string): string {
    if (!v) return '';
    return v
      .toLowerCase()
      .split(/\s+/)
      .map((w, i) =>
        i > 0 && this.lowerWords.has(w)
          ? w
          : w.charAt(0).toUpperCase() + w.slice(1)
      )
      .join(' ');
  }

  ngOnInit(): void {
    this.carregarMensal();
  }

  toYYYYMM(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  atualizarMes(): void {
    this.carregarMensal();
  }

  carregarMensal(): void {
    this.carregandoMensal = true;
    this.erroMensal = null;

    forkJoin({
      recebidos: this.relatorioService
        .listarRecebidosSecretaria(this.mes)
        .pipe(catchError(() => of<RelatorioMensal[]>([]))),
      pendentes: this.relatorioService
        .listarPendentesSecretaria(this.mes)
        .pipe(catchError(() => of<PendenciaMensal[]>([]))),
    }).subscribe({
      next: ({ recebidos, pendentes }) => {
        this.recebidos = (recebidos ?? []).map((r) => ({
          ...r,
          orientadorNome: r?.orientadorNome
            ? this.properCase(r.orientadorNome)
            : r?.orientadorNome,
        }));

        this.pendentes = (pendentes ?? []).map((p) => ({
          ...p,
          orientadorNome: (p as any)?.orientadorNome
            ? this.properCase((p as any).orientadorNome)
            : (p as any)?.orientadorNome,
        }));

        this.carregandoMensal = false;
        if (!this.recebidos.length && !this.pendentes.length) {
          this.erroMensal = 'Nenhum dado retornado.';
        }
      },
      error: () => {
        this.erroMensal = 'Falha ao carregar relatórios do mês.';
        this.carregandoMensal = false;
      },
    });
  }

  mudarMes(delta: number): void {
    if (!this.mes) {
      this.mes = this.toYYYYMM(new Date());
    }

    const [yStr, mStr] = this.mes.split('-');
    const year = Number(yStr);
    const monthIndex = Number(mStr) - 1;

    if (Number.isNaN(year) || Number.isNaN(monthIndex)) {
      this.mes = this.toYYYYMM(new Date());
    } else {
      const novaData = new Date(year, monthIndex + delta, 1);
      this.mes = this.toYYYYMM(novaData);
    }

    this.carregarMensal();
  }

  private extrairFilename(
    contentDisposition: string,
    fallback: string
  ): string {
    const cd = contentDisposition || '';
    const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
    const raw = m?.[1] || m?.[2];

    if (!raw) return fallback;

    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  private isXlsxZip(buffer: ArrayBuffer): boolean {
    // XLSX é ZIP: começa com "PK" (0x50 0x4B)
    const bytes = new Uint8Array(buffer);
    return bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b;
  }

  async baixarAlunosXlsx() {
    this.baixando = true;

    this.relatorioService.baixarModeloExcelImportacaoAlunos().subscribe({
      next: async (res) => {
        const buf = res.body;

        if (!buf || buf.byteLength === 0) {
          this.baixando = false;
          await this.dialog.alert('O arquivo retornou vazio.', 'Erro');
          return;
        }

        const contentType = res.headers.get('Content-Type') || '';
        const cd = res.headers.get('Content-Disposition') || '';

        // ✅ validação REAL do XLSX (ZIP)
        const okZip = this.isXlsxZip(buf);

        if (!okZip) {
          // provavelmente HTML/JSON (rota errada, auth, etc.)
          const preview = new TextDecoder('utf-8').decode(
            new Uint8Array(buf).slice(0, 350)
          );

          console.error('Download NÃO é XLSX.');
          console.error('Content-Type:', contentType);
          console.error('Content-Disposition:', cd);
          console.error('Preview (início):', preview);

          this.baixando = false;
          await this.dialog.alert(
            'O servidor não retornou um arquivo Excel válido. Verifique a rota/baseUrl ou autenticação.',
            'Erro'
          );
          return;
        }

        const filename = this.extrairFilename(cd, 'exemplo_importacao.xlsx');

        const blob = new Blob([buf], {
          type:
            contentType ||
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        setTimeout(() => window.URL.revokeObjectURL(url), 250);
        this.baixando = false;
      },
      error: async () => {
        this.baixando = false;
        await this.dialog.alert(
          'Não foi possível baixar o modelo de importação.',
          'Erro'
        );
      },
    });
  }

  abrirDetalhe(r: RelatorioMensal) {
    const id = r?.projetoId ?? (r as any)?.id_projeto;
    if (!id) return;

    this.router.navigate(['/orientador/relatorios', id], {
      queryParams: { mes: r.referenciaMes, readonly: 1 },
    });
  }

  dataBr(iso?: string): string {
    if (!iso) return '—';

    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';

    const s = new Intl.DateTimeFormat('pt-BR', {
      timeZone: this.TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d);

    return s.replace(',', '');
  }
}

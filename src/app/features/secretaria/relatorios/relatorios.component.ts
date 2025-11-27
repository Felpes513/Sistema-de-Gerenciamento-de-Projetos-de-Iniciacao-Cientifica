import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RelatorioService } from '@services/relatorio.service';
import { RelatorioMensal, PendenciaMensal } from '@interfaces/relatorio';
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

  async baixarAlunosXlsx() {
    this.baixando = true;
    this.relatorioService.baixarRelatorioAlunos().subscribe({
      next: (res) => {
        const blob = res.body as Blob;
        const cd = res.headers.get('Content-Disposition') || '';
        const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
        const filename = decodeURIComponent(
          m?.[1] || m?.[2] || 'relatorio_alunos.xlsx'
        );
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        this.baixando = false;
      },
      error: async () => {
        this.baixando = false;
        await this.dialog.alert(
          'Não foi possível gerar o relatório de alunos.',
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
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }
}

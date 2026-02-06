import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AvaliadorExterno } from '@shared/models/avaliador_externo';
import { AvaliadoresExternosService } from '@services/avaliadores_externos.service';
import { ProjetoService } from '@services/projeto.service';

type EnvioView = {
  id: number;
  titulo: string;
  avaliadorNome: string;
  enviadoEm?: string;
  raw?: any;
};

@Component({
  selector: 'app-envios-avaliacoes-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews-sended.component.html',
  styleUrls: ['./reviews-sended.component.css'],
})
export class ReviewsSendedComponent implements OnInit {
  @Input() avaliador?: AvaliadorExterno;
  @Output() closed = new EventEmitter<void>();

  private enviosService = inject(AvaliadoresExternosService);
  private projetoService = inject(ProjetoService);
  private router = inject(Router);

  carregando = false;
  erro = '';

  envios: EnvioView[] = [];
  selecionadoId: number | null = null;

  carregandoDetalhe = false;
  detalhe: any = null;

  projetoIdSelecionado: number | null = null;

  private byCod = new Map<string, number>();
  private byTitleUnique = new Map<string, number>();

  ngOnInit(): void {
    this.carregar();
  }

  fechar(): void {
    this.closed.emit();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';
    this.envios = [];
    this.selecionadoId = null;
    this.detalhe = null;
    this.projetoIdSelecionado = null;

    forkJoin({
      envios: this.enviosService
        .listarEnvios()
        .pipe(catchError(() => of([] as any[]))),
      projetos: this.projetoService
        .listarProjetosRaw()
        .pipe(catchError(() => of([] as any[]))),
    })
      .pipe(
        map(({ envios, projetos }) => {
          this.indexarProjetos(projetos || []);

          const nomeAvaliador = this.norm(this.avaliador?.nome || '');

          const lista = (envios || [])
            .map((e: any) => {
              const idEnvio = Number(e?.id_envio ?? e?.id ?? 0);
              if (!idEnvio) return null;

              const avaliadorNome = String(e?.avaliador_nome ?? '');
              const titulo = String(e?.titulo_projeto ?? '—');
              const enviadoEm = String(e?.data_envio ?? '');

              if (nomeAvaliador && this.norm(avaliadorNome) !== nomeAvaliador)
                return null;

              const view: EnvioView = {
                id: idEnvio,
                titulo,
                avaliadorNome,
                enviadoEm,
                raw: e,
              };

              return view;
            })
            .filter(Boolean) as EnvioView[];

          lista.sort((a, b) =>
            this.norm(String(b.enviadoEm || '')).localeCompare(
              this.norm(String(a.enviadoEm || ''))
            )
          );

          return lista;
        })
      )
      .subscribe({
        next: (rows) => {
          this.envios = rows;
          this.carregando = false;
        },
        error: (err: any) => {
          this.erro = err?.message || 'Falha ao carregar envios';
          this.carregando = false;
        },
      });
  }

  abrirDetalhe(e: EnvioView): void {
    this.selecionadoId = e.id;
    this.carregandoDetalhe = true;
    this.detalhe = null;
    this.projetoIdSelecionado = null;

    // como a API atual já traz tudo em /envios, usamos o raw
    const det = e.raw || e;
    this.detalhe = det;

    this.projetoIdSelecionado = this.resolverProjetoId(det);
    this.carregandoDetalhe = false;
  }

  abrirProjeto(): void {
    if (!this.projetoIdSelecionado) return;

    this.router.navigate([
      '/secretaria/projetos/editar',
      this.projetoIdSelecionado,
    ]);
  }

  dataBr(v?: string): string {
    if (!v) return '—';
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  }

  private norm(s: any): string {
    return String(s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private indexarProjetos(projetos: any[]): void {
    this.byCod.clear();
    this.byTitleUnique.clear();

    const titleCount = new Map<string, { id: number; count: number }>();

    for (const p of projetos || []) {
      const id = Number(p?.id_projeto ?? p?.id);
      if (!id) continue;

      const cod = this.norm(p?.cod_projeto);
      const titulo = this.norm(p?.titulo_projeto || p?.nomeProjeto || p?.nome);

      if (cod) this.byCod.set(cod, id);

      if (titulo) {
        const cur = titleCount.get(titulo);
        if (!cur) titleCount.set(titulo, { id, count: 1 });
        else titleCount.set(titulo, { id: cur.id, count: cur.count + 1 });
      }
    }

    for (const [titulo, info] of titleCount.entries()) {
      if (info.count === 1) this.byTitleUnique.set(titulo, info.id);
    }
  }

  private resolverProjetoId(det: any): number | null {
    const direct = Number(det?.id_projeto ?? det?.projeto_id ?? 0);
    if (direct) return direct;

    const cod = this.norm(det?.cod_projeto ?? det?.codigo_projeto ?? '');
    if (cod && this.byCod.has(cod)) return this.byCod.get(cod)!;

    const titulo = this.norm(det?.titulo_projeto ?? det?.titulo ?? '');
    if (titulo && this.byTitleUnique.has(titulo))
      return this.byTitleUnique.get(titulo)!;

    return null;
  }
}

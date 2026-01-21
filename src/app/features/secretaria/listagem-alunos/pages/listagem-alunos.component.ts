import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, switchMap, map, Subject, takeUntil } from 'rxjs';
import { ProjetoService } from '@services/projeto.service';
import { InscricoesService } from '@services/inscricoes.service';
import { ProjetoInscricaoApi } from '@shared/models/projeto';
import { Inscricao } from '@shared/models/inscricao';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { DialogService } from '@core/data-access/dialog.service';

type Modo = 'SECRETARIA' | 'ORIENTADOR';
type InscricaoLike = ProjetoInscricaoApi | Inscricao;

function toTitleCase(s: string = ''): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ')
    .trim();
}

type InscricaoVM = {
  inscricaoId: number;
  alunoId: number;
  nome: string;
  matricula: string;
  email: string;
  status: string;
  possuiTrabalhoRemunerado: boolean;
  documentoNotasUrl?: string | null;
  raw: InscricaoLike;
};

@Component({
  selector: 'app-listagem-alunos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatDividerModule],
  templateUrl: './listagem-alunos.component.html',
  styleUrls: ['./listagem-alunos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListagemAlunosComponent implements OnInit, OnDestroy {
  @Input({ required: true }) projetoId!: number;
  @Input() modo: Modo = 'SECRETARIA';

  readonly skeletonRows = [1, 2, 3, 4];

  private destroy$ = new Subject<void>();

  private _inscricoes: InscricaoLike[] = [];

  secretariaSelecionados: InscricaoVM[] = [];
  secretariaDisponiveis: InscricaoVM[] = [];
  secretariaListaNormal: InscricaoVM[] = [];

  aprovadasVm: InscricaoVM[] = [];
  pendentesOuReprovadasVm: InscricaoVM[] = [];
  orientadorSelecionados: InscricaoVM[] = [];
  orientadorDisponiveis: InscricaoVM[] = [];

  selecionados = new Set<number>();
  limite = 4;

  bloqueado = false;
  loadingFlag = false;
  salvandoSelecao = false;
  sucessoSelecao = '';
  erroSalvarSelecao = '';

  temSelecaoFinal = false;

  bolsaMarcada = new Set<number>();

  constructor(
    private projetoService: ProjetoService,
    private inscricoesService: InscricoesService,
    private cdr: ChangeDetectorRef,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    if (!this.projetoId) return;
    this.carregar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get loading(): boolean {
    return this.loadingFlag;
  }

  get total(): number {
    if (this.modo === 'SECRETARIA') {
      return this.temSelecaoFinal
        ? this.secretariaSelecionados.length + this.secretariaDisponiveis.length
        : this.secretariaListaNormal.length;
    }

    return this.aprovadasVm.length + this.pendentesOuReprovadasVm.length;
  }

  private alunoId(i: InscricaoLike): number {
    const anyI = i as any;
    return (
      anyI?.id_aluno ??
      anyI?.aluno_id ??
      anyI?.idAluno ??
      anyI?.aluno?.id ??
      anyI?.alunoId ??
      anyI?.id ??
      0
    );
  }

  private inscricaoId(i: InscricaoLike): number {
    const anyI = i as any;
    return anyI?.id_inscricao ?? anyI?.id ?? 0;
  }

  private alunoNome(i: InscricaoLike): string {
    const anyI = i as any;
    const raw =
      anyI?.aluno?.nome ||
      anyI?.nome_completo ||
      anyI?.nome_aluno ||
      anyI?.nome ||
      `Aluno #${this.alunoId(i)}`;
    return toTitleCase(raw);
  }

  private alunoRa(i: InscricaoLike): string {
    const anyI = i as any;
    return anyI?.aluno?.matricula || anyI?.matricula || '—';
  }

  private alunoEmail(i: InscricaoLike): string {
    const anyI = i as any;
    return (anyI?.aluno?.email || anyI?.email || '—').trim();
  }

  private alunoStatus(i: InscricaoLike): string {
    const anyI = i as any;
    const st = (anyI?.status || anyI?.situacao || 'PENDENTE')
      .toString()
      .toUpperCase()
      .trim();
    return st || 'PENDENTE';
  }

  private possuiRemunerado(i: InscricaoLike): boolean {
    const anyI = i as any;
    return anyI?.possuiTrabalhoRemunerado ?? !!anyI?.possui_trabalho_remunerado;
  }

  private notasUrl(i: InscricaoLike): string | null {
    const anyI = i as any;
    return anyI?.documentoNotasUrl ?? anyI?.documento_notas_url ?? null;
  }

  private toVM(i: InscricaoLike, overrideStatus?: string): InscricaoVM {
    const st = (overrideStatus || this.alunoStatus(i)).toUpperCase().trim();
    return {
      inscricaoId: this.inscricaoId(i),
      alunoId: this.alunoId(i),
      nome: this.alunoNome(i),
      matricula: this.alunoRa(i),
      email: this.alunoEmail(i),
      status: st,
      possuiTrabalhoRemunerado: this.possuiRemunerado(i),
      documentoNotasUrl: this.notasUrl(i),
      raw: i,
    };
  }

  private filtrarCadFinalForaDoProjeto(
    lista: InscricaoLike[],
    allowedFinalIds: Set<number> | null,
  ): InscricaoLike[] {
    const allowed = allowedFinalIds ?? new Set<number>();

    return (lista || []).filter((i) => {
      const st = this.alunoStatus(i);
      if (st !== 'CADASTRADO_FINAL') return true;

      const id = this.alunoId(i);
      return allowed.has(id);
    });
  }

  private uniqByAlunoId(list: InscricaoLike[]): InscricaoLike[] {
    const seen = new Set<number>();
    const out: InscricaoLike[] = [];
    for (const item of list || []) {
      const id = this.alunoId(item);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(item);
    }
    return out;
  }

  private carregar() {
    this.loadingFlag = true;

    if (this.modo === 'ORIENTADOR') {
      this.carregarOrientador();
      return;
    }

    this.carregarSecretaria();
  }

  private carregarSecretaria() {
    this.temSelecaoFinal = false;
    this.secretariaSelecionados = [];
    this.secretariaDisponiveis = [];
    this.secretariaListaNormal = [];

    this.projetoService
      .listarAlunosDoProjeto(this.projetoId)
      .pipe(
        switchMap((alunosVinculados) => {
          const temVinculados = !!(alunosVinculados && alunosVinculados.length);

          if (temVinculados) {
            this.bloqueado = true;
            this.temSelecaoFinal = true;

            const vinculadosAsLike: InscricaoLike[] = (
              alunosVinculados || []
            ).map(
              (a: any) =>
                ({
                  id_aluno: a.id_aluno,
                  nome_completo: a.nome_completo,
                  email: a.email,
                  possuiTrabalhoRemunerado: a.possuiTrabalhoRemunerado,
                  status: 'CADASTRADO_FINAL',
                }) as any,
            );

            const vinculadosUniq = this.uniqByAlunoId(vinculadosAsLike);
            this.secretariaSelecionados = vinculadosUniq.map((i) =>
              this.toVM(i, 'CADASTRADO_FINAL'),
            );

            return this.inscricoesService.listarPorProjeto(this.projetoId).pipe(
              map((inscricoes) => {
                const lista = Array.isArray(inscricoes) ? inscricoes : [];
                const selectedIds = new Set<number>(
                  vinculadosUniq.map((i) => this.alunoId(i)),
                );
                return { inscricoes: lista, selectedIds };
              }),
            );
          }

          this.bloqueado = false;

          return this.inscricoesService.listarPorProjeto(this.projetoId).pipe(
            map((inscricoes) => ({
              inscricoes: Array.isArray(inscricoes) ? inscricoes : [],
              selectedIds: null as Set<number> | null,
            })),
          );
        }),
        finalize(() => {
          this.loadingFlag = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: ({ inscricoes, selectedIds }) => {
          const baseUniq = this.uniqByAlunoId(inscricoes ?? []);
          const allowedFinalIds = selectedIds ?? new Set<number>();

          // >>> FILTRO: remove CADASTRADO_FINAL que NÃO está vinculado ao projeto
          const listaUi = this.filtrarCadFinalForaDoProjeto(
            baseUniq,
            allowedFinalIds,
          );

          if (!this.temSelecaoFinal) {
            this._inscricoes = listaUi; // ok aqui, secretaria não usa _inscricoes pra deletar
            this.secretariaListaNormal = listaUi.map((i) => this.toVM(i));
            return;
          }

          const idsSel = allowedFinalIds;
          const disponiveis = listaUi.filter(
            (i) => !idsSel.has(this.alunoId(i)),
          );

          this.secretariaDisponiveis = disponiveis.map((i) => this.toVM(i));
          this.secretariaListaNormal = [];
        },

        error: () => {
          this._inscricoes = [];
          this.secretariaSelecionados = [];
          this.secretariaDisponiveis = [];
          this.secretariaListaNormal = [];
        },
      });
  }

  private carregarOrientador() {
    this.loadingFlag = true;

    this.projetoService
      .listarAlunosDoProjeto(this.projetoId)
      .pipe(
        switchMap((alunosVinculados) => {
          const finalizados = (alunosVinculados || []).map((a: any) => ({
            id_aluno: a.id_aluno,
            nome_completo: a.nome_completo,
            email: a.email,
            possuiTrabalhoRemunerado: a.possuiTrabalhoRemunerado,
            status: 'CADASTRADO_FINAL',
          })) as any[];

          this.bloqueado = finalizados.length > 0;
          this.selecionados = new Set<number>(
            finalizados.map((i: any) => this.alunoId(i)),
          );

          return this.projetoService
            .listarInscricoesPorProjeto(this.projetoId)
            .pipe(
              map((inscricoes) => ({
                inscricoes: (inscricoes ?? []) as InscricaoLike[],
                finalizados,
              })),
            );
        }),
        finalize(() => {
          this.loadingFlag = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: ({ inscricoes, finalizados }) => {
          this._inscricoes = this.uniqByAlunoId(inscricoes ?? []); // mantém para exclusão batch

          const finalIds = new Set<number>(
            (finalizados ?? []).map((i: any) => this.alunoId(i)),
          );

          // >>> FILTRO PARA UI
          const inscricoesUi = this.filtrarCadFinalForaDoProjeto(
            this._inscricoes,
            finalIds,
          );

          const aprovadasApi = inscricoesUi.filter((i) => {
            const st = this.alunoStatus(i);
            return st === 'VALIDADO' || st === 'APROVADO';
          });

          const finalizadosApi = inscricoesUi.filter(
            (i) => this.alunoStatus(i) === 'CADASTRADO_FINAL',
          );

          const finalMerge = this.uniqByAlunoId([
            ...(finalizados as any[]),
            ...(finalizadosApi as any[]),
          ]);

          for (const i of finalMerge) {
            const id = this.alunoId(i);
            if (id) this.selecionados.add(id);
          }
          if (finalMerge.length) this.bloqueado = true;

          const aprovadasLike = this.uniqByAlunoId([
            ...(finalMerge as any[]),
            ...(aprovadasApi as any[]),
          ]);

          this.aprovadasVm = aprovadasLike.map((i) => this.toVM(i));

          const pendentes = inscricoesUi.filter((i) => {
            const st = this.alunoStatus(i);
            return (
              st !== 'VALIDADO' &&
              st !== 'APROVADO' &&
              st !== 'CADASTRADO_FINAL'
            );
          });

          this.pendentesOuReprovadasVm = pendentes.map((i) => this.toVM(i));

          this.recomputeOrientadorLists();
        },
        error: () => {
          this._inscricoes = [];
          this.aprovadasVm = [];
          this.pendentesOuReprovadasVm = [];
          this.orientadorSelecionados = [];
          this.orientadorDisponiveis = [];
        },
      });
  }

  private recomputeOrientadorLists() {
    this.orientadorSelecionados = (this.aprovadasVm || []).filter((v) =>
      this.selecionados.has(v.alunoId),
    );
    this.orientadorDisponiveis = (this.aprovadasVm || []).filter(
      (v) => !this.selecionados.has(v.alunoId),
    );
  }

  disabledCheckboxByAlunoId(alunoId: number): boolean {
    if (this.selecionados.has(alunoId)) return false;
    return this.selecionados.size >= this.limite;
  }

  onSelecionadoChange(event: Event, alunoId: number) {
    const target = event.target as HTMLInputElement | null;
    const checked = !!target?.checked;

    if (!alunoId) return;

    if (checked) {
      if (this.selecionados.size >= this.limite) return;
      this.selecionados.add(alunoId);
    } else {
      this.selecionados.delete(alunoId);
    }

    this.recomputeOrientadorLists();
    this.cdr.markForCheck();
  }

  async salvarSelecao() {
    this.sucessoSelecao = '';
    this.erroSalvarSelecao = '';

    const ids = Array.from(this.selecionados);

    if (this.modo === 'ORIENTADOR') {
      if (ids.length === 0) {
        await this.dialogService.alert(
          'Selecione pelo menos 1 aluno antes de salvar.',
          'Atenção',
        );
        return;
      }

      const selecionadosTexto = this.orientadorSelecionados
        .map((v) => `• ${v.nome} (RA: ${v.matricula})`)
        .join('\n');

      const msg =
        `Você selecionou ${ids.length}${
          this.limite ? ` de ${this.limite}` : ''
        } aluno(s).\n\n` +
        `${selecionadosTexto || '—'}\n\n` +
        `Ao confirmar, sua seleção será registrada.\n\n` +
        `Deseja confirmar?`;

      const confirmou = await this.dialogService.confirm(
        msg,
        'Confirmar seleção',
      );
      if (!confirmou) return;
    }

    this.salvandoSelecao = true;

    if (this.modo === 'ORIENTADOR') {
      this.projetoService
        .atualizarAprovadosEExcluirRejeitados(
          {
            id_projeto: this.projetoId,
            ids_alunos_aprovados: ids,
          },
          this._inscricoes.map((i) => ({
            id_inscricao: (i as any).id_inscricao ?? (i as any).id ?? 0,
            id_aluno: this.alunoId(i),
          })),
        )
        .subscribe({
          next: (res) => {
            this.salvandoSelecao = false;
            this.sucessoSelecao =
              (res as any)?.mensagem || 'Seleção salva com sucesso.';
            this.selecionados = new Set<number>(ids);
            this.carregar();
          },
          error: (e: unknown) => {
            this.salvandoSelecao = false;
            const message =
              typeof e === 'object' && e && 'message' in e
                ? String((e as { message: unknown }).message)
                : null;
            this.erroSalvarSelecao = message || 'Falha ao salvar seleção.';
          },
        });

      return;
    }

    this.projetoService
      .updateAlunosProjeto({
        id_projeto: this.projetoId,
        ids_alunos_aprovados: ids,
      })
      .subscribe({
        next: () => {
          this.salvandoSelecao = false;
          this.sucessoSelecao = 'Alunos atualizados com sucesso!';
          this.selecionados = new Set<number>(ids);
          this.carregar();
        },
        error: (e: unknown) => {
          this.salvandoSelecao = false;
          const message =
            typeof e === 'object' && e && 'message' in e
              ? String((e as { message: unknown }).message)
              : null;
          this.erroSalvarSelecao = message || 'Falha ao salvar seleção.';
        },
      });
  }

  trackByVM = (_: number, v: InscricaoVM) => v.alunoId || v.inscricaoId;
  trackByIndex = (index: number) => index;
}

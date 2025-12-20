import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, of, switchMap, map } from 'rxjs';
import { ProjetoService } from '@services/projeto.service';
import { InscricoesService } from '@services/inscricoes.service';
import { ProjetoInscricaoApi } from '@shared/models/projeto';
import { AlunoSecretariaView } from '@shared/models/listagem-alunos';
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

@Component({
  selector: 'app-listagem-alunos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatDividerModule],
  templateUrl: './listagem-alunos.component.html',
  styleUrls: ['./listagem-alunos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListagemAlunosComponent implements OnInit {
  @Input({ required: true }) projetoId!: number;
  @Input() modo: Modo = 'SECRETARIA';

  readonly skeletonRows = [1, 2, 3, 4];

  private _inscricoes: InscricaoLike[] = [];

  alunosSecretaria: AlunoSecretariaView[] = [];

  // ORIENTADOR: lista "base" (aprovados/validados + finalizados)
  aprovadas: InscricaoLike[] = [];
  pendentesOuReprovadas: InscricaoLike[] = [];

  // Seleção
  selecionados = new Set<number>();
  limite = 4;

  // Flags
  bloqueado = false; // agora indica "já existe seleção registrada", mas não bloqueia interação
  loadingFlag = false;
  salvandoSelecao = false;
  sucessoSelecao = '';
  erroSalvarSelecao = '';

  // SECRETARIA: split quando já existe seleção final
  temSelecaoFinal = false;
  secretariaSelecionados: AlunoSecretariaView[] = [];
  secretariaDisponiveis: AlunoSecretariaView[] = [];

  // Mantido (caso use depois)
  bolsaMarcada = new Set<number>();

  constructor(
    private projetoService: ProjetoService,
    private inscricoesService: InscricoesService,
    private cdr: ChangeDetectorRef,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    if (!this.projetoId) return;
    this.carregar();
  }

  private carregar() {
    this.loadingFlag = true;

    if (this.modo === 'ORIENTADOR') {
      this.carregarOrientador();
      return;
    }

    // SECRETARIA
    this.temSelecaoFinal = false;
    this.secretariaSelecionados = [];
    this.secretariaDisponiveis = [];

    this.projetoService
      .listarAlunosDoProjeto(this.projetoId)
      .pipe(
        switchMap((alunosVinculados) => {
          const temVinculados = !!(alunosVinculados && alunosVinculados.length);

          if (temVinculados) {
            this.bloqueado = true;
            this.temSelecaoFinal = true;

            // "Selecionados" (vinculados)
            this._inscricoes = (alunosVinculados || []).map((a: any) => ({
              id_aluno: a.id_aluno,
              nome_completo: a.nome_completo,
              email: a.email,
              possuiTrabalhoRemunerado: a.possuiTrabalhoRemunerado,
              status: 'CADASTRADO_FINAL',
            })) as any[];

            this.debugDuplicatas('SECRETARIA-LOCK', this._inscricoes);

            this.secretariaSelecionados = this._inscricoes.map((i) =>
              this.mapAlunoSecretaria(i)
            );

            // Mantém "lista()" com algo (pra não cair no vazio)
            this.alunosSecretaria = [...this.secretariaSelecionados];

            // Busca inscrições para montar "Disponíveis"
            return this.inscricoesService.listarPorProjeto(this.projetoId).pipe(
              map((inscricoes) => ({
                inscricoes: Array.isArray(inscricoes) ? inscricoes : [],
                selectedIds: new Set<number>(
                  this._inscricoes.map((i) => this.alunoId(i))
                ),
              }))
            );
          }

          // Sem seleção final: lista normal de inscritos
          this.bloqueado = false;
          return this.inscricoesService.listarPorProjeto(this.projetoId).pipe(
            map((inscricoes) => ({
              inscricoes: Array.isArray(inscricoes) ? inscricoes : [],
              selectedIds: null as Set<number> | null,
            }))
          );
        }),
        finalize(() => {
          this.loadingFlag = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: ({ inscricoes, selectedIds }) => {
          // Se NÃO tem seleção final, apenas lista normal
          if (!this.temSelecaoFinal) {
            this._inscricoes = inscricoes ?? [];
            this.debugDuplicatas('SECRETARIA', this._inscricoes);

            this.alunosSecretaria = this._inscricoes.map((i) =>
              this.mapAlunoSecretaria(i)
            );
            return;
          }

          // Se TEM seleção final, calcula "Disponíveis" (inscrições que não estão selecionadas)
          const idsSel = selectedIds ?? new Set<number>();

          const disponiveis = (inscricoes ?? []).filter(
            (i) => !idsSel.has(this.alunoId(i))
          );

          this.secretariaDisponiveis = disponiveis.map((i) =>
            this.mapAlunoSecretaria(i)
          );

          // Mantém lista() como união (não quebra nada existente)
          this.alunosSecretaria = [
            ...this.secretariaSelecionados,
            ...this.secretariaDisponiveis,
          ];
        },
        error: () => {
          if (!this.temSelecaoFinal) {
            this.alunosSecretaria = [];
          }
          this.secretariaDisponiveis = [];
        },
      });
  }

  private carregarOrientador() {
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

          // Se tiver finalizados, marca como "já existe seleção"
          this.bloqueado = finalizados.length > 0;

          // Selecionados iniciais = finalizados (se existirem)
          this.selecionados = new Set<number>(
            finalizados.map((i: any) => this.alunoId(i))
          );

          // Sempre busca as inscrições também (pra montar "Disponíveis")
          return this.projetoService
            .listarInscricoesPorProjeto(this.projetoId)
            .pipe(
              map((inscricoes) => ({
                inscricoes: (inscricoes ?? []) as InscricaoLike[],
                finalizados,
              }))
            );
        }),
        finalize(() => {
          this.loadingFlag = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: ({ inscricoes, finalizados }) => {
          this._inscricoes = inscricoes ?? [];

          this.debugDuplicatas('ORIENTADOR', this._inscricoes);

          // Aprovadas/Validado vindo das inscrições
          const aprovadasApi = this._inscricoes.filter((i) => {
            const st = this.alunoStatus(i);
            return st === 'VALIDADO' || st === 'APROVADO';
          });

          // Se a API também retornar CADASTRADO_FINAL em inscrições
          const finalizadosApi = this._inscricoes.filter(
            (i) => this.alunoStatus(i) === 'CADASTRADO_FINAL'
          );

          const finalMerge = this.uniqByAlunoId([
            ...(finalizados as any[]),
            ...(finalizadosApi as any[]),
          ]);

          // garante que todos os finalizados estejam selecionados
          for (const i of finalMerge) {
            const id = this.alunoId(i);
            if (id) this.selecionados.add(id);
          }
          if (finalMerge.length) this.bloqueado = true;

          // "aprovadas" agora contém: finalizados + aprovadasApi (sem duplicar por aluno)
          this.aprovadas = this.uniqByAlunoId([
            ...(finalMerge as any[]),
            ...(aprovadasApi as any[]),
          ]);

          // resto (não aparece no template hoje, mas mantemos)
          this.pendentesOuReprovadas = this._inscricoes.filter((i) => {
            const st = this.alunoStatus(i);
            return (
              st !== 'VALIDADO' &&
              st !== 'APROVADO' &&
              st !== 'CADASTRADO_FINAL'
            );
          });
        },
        error: () => {
          this._inscricoes = [];
          this.aprovadas = [];
          this.pendentesOuReprovadas = [];
        },
      });
  }

  // ---------- helpers do template ----------
  loading() {
    return this.loadingFlag;
  }

  lista(): AlunoSecretariaView[] {
    return this.alunosSecretaria;
  }

  total() {
    if (this.modo === 'SECRETARIA') {
      return this.temSelecaoFinal
        ? this.secretariaSelecionados.length + this.secretariaDisponiveis.length
        : this.alunosSecretaria.length;
    }

    return this.aprovadas.length + this.pendentesOuReprovadas.length;
  }

  aprovadasSelecionadas(): InscricaoLike[] {
    return (this.aprovadas || []).filter((i) =>
      this.selecionados.has(this.alunoId(i))
    );
  }

  aprovadasDisponiveis(): InscricaoLike[] {
    return (this.aprovadas || []).filter(
      (i) => !this.selecionados.has(this.alunoId(i))
    );
  }

  alunoId(i: InscricaoLike): number {
    const anyI = i as any;
    return (
      anyI?.id_aluno ??
      anyI?.aluno_id ??
      anyI?.idAluno ??
      anyI?.aluno?.id ??
      anyI?.alunoId ??
      anyI?.aluno_id ??
      anyI?.id ??
      0
    );
  }

  alunoNome(i: InscricaoLike): string {
    const anyI = i as any;
    const raw =
      anyI?.aluno?.nome ||
      anyI?.nome_completo ||
      anyI?.nome_aluno ||
      anyI?.nome ||
      `Aluno #${this.alunoId(i)}`;
    return toTitleCase(raw);
  }

  alunoRa(i: InscricaoLike): string {
    const anyI = i as any;
    return anyI?.aluno?.matricula || anyI?.matricula || '—';
  }

  alunoEmail(i: InscricaoLike): string {
    const anyI = i as any;
    return (anyI?.aluno?.email || anyI?.email || '—').trim();
  }

  alunoStatus(i: InscricaoLike): string {
    const anyI = i as any;
    const st = (anyI?.status || anyI?.situacao || 'PENDENTE')
      .toString()
      .toUpperCase();
    return st || 'PENDENTE';
  }

  disabledCheckbox(i: InscricaoLike): boolean {
    const id = this.alunoId(i);
    if (this.selecionados.has(id)) return false;
    return this.selecionados.size >= this.limite;
  }

  toggleSelecionado(i: InscricaoLike, checked: boolean) {
    const id = this.alunoId(i);
    if (!id) return;

    if (checked) {
      if (this.selecionados.size >= this.limite) return;
      this.selecionados.add(id);
    } else {
      this.selecionados.delete(id);
    }
  }

  onSelecionadoChange(event: Event, inscricao: InscricaoLike) {
    const target = event.target as HTMLInputElement | null;
    this.toggleSelecionado(inscricao, !!target?.checked);
  }

  async salvarSelecao() {
    this.sucessoSelecao = '';
    this.erroSalvarSelecao = '';

    const ids = Array.from(this.selecionados);

    if (this.modo === 'ORIENTADOR') {
      if (ids.length === 0) {
        await this.dialogService.alert(
          'Selecione pelo menos 1 aluno antes de salvar.',
          'Atenção'
        );
        return;
      }

      const selecionadosTexto = this.aprovadas
        .filter((i) => this.selecionados.has(this.alunoId(i)))
        .map((i) => `• ${this.alunoNome(i)} (RA: ${this.alunoRa(i)})`)
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
        'Confirmar seleção'
      );
      if (!confirmou) return;
    }

    this.salvandoSelecao = true;

    // ORIENTADOR usa a rota que você já tinha
    if (this.modo === 'ORIENTADOR') {
      this.projetoService
        .atualizarAprovadosEExcluirRejeitados(
          {
            id_projeto: this.projetoId,
            ids_alunos_aprovados: ids,
          },
          this._inscricoes.map((i) => ({
            id_inscricao: (i as any).id_inscricao ?? 0,
            id_aluno: this.alunoId(i),
          }))
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

    // SECRETARIA (mantido como estava)
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

  toggleBolsa(i: InscricaoLike, checked: boolean) {
    const id = this.alunoId(i);
    if (!id) return;

    if (checked) this.bolsaMarcada.add(id);
    else this.bolsaMarcada.delete(id);
  }

  temBolsa(i: InscricaoLike) {
    const id = this.alunoId(i);
    return this.bolsaMarcada.has(id);
  }

  // trackBys
  trackByAlunoSecretaria = (_: number, aluno: AlunoSecretariaView) =>
    aluno.idAluno || aluno.idInscricao;

  trackByInscricao = (_: number, inscricao: InscricaoLike) =>
    this.alunoId(inscricao);

  trackByIndex = (index: number) => index;

  private mapAlunoSecretaria(inscricao: InscricaoLike): AlunoSecretariaView {
    const anyI = inscricao as any;
    const idAluno = this.alunoId(inscricao);
    const idInscricao = anyI?.id_inscricao ?? anyI?.id ?? 0;

    const nomeRaw =
      anyI?.aluno?.nome ||
      anyI?.nome_completo ||
      anyI?.nome_aluno ||
      anyI?.nome ||
      `Aluno #${idAluno || idInscricao}`;

    return {
      idInscricao,
      idAluno,
      nome: toTitleCase(nomeRaw),
      matricula: anyI?.aluno?.matricula || anyI?.matricula || '—',
      email: (anyI?.aluno?.email || anyI?.email || '—').trim(),
      status: anyI?.status || anyI?.situacao || 'PENDENTE',
      possuiTrabalhoRemunerado:
        anyI?.possuiTrabalhoRemunerado ?? !!anyI?.possui_trabalho_remunerado,
      documentoNotasUrl: anyI?.documentoNotasUrl ?? undefined,
    };
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

  private debugDuplicatas(contexto: string, lista: InscricaoLike[]) {
    const seen = new Set<string>();
    const dups: { key: string; idInscricao: number; idAluno: number }[] = [];

    for (const i of lista || []) {
      const anyI = i as any;
      const idInscricao = anyI.id_inscricao ?? anyI.id ?? 0;
      const idAluno = this.alunoId(i);
      const key = `${idInscricao}|${idAluno}`;

      if (seen.has(key)) {
        dups.push({ key, idInscricao, idAluno });
      } else {
        seen.add(key);
      }
    }

    console.log(
      `%c[DEBUG][${contexto}] inscricoes`,
      'color:#8e24aa;font-weight:bold',
      {
        total: lista?.length || 0,
        duplicadas: dups.length,
        detalhes: dups,
      }
    );
  }
}

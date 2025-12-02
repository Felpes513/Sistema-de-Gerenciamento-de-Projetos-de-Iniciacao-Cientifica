import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ProjetoService } from '@services/projeto.service';
import { InscricoesService } from '@services/inscricoes.service';
import { ProjetoInscricaoApi } from '@interfaces/projeto';
import { AlunoSecretariaView } from '@interfaces/listagem-alunos';
import { Inscricao } from '@interfaces/inscricao';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

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
  aprovadas: InscricaoLike[] = [];
  pendentesOuReprovadas: InscricaoLike[] = [];
  selecionados = new Set<number>();
  limite = 4;
  bloqueado = false;
  bloqueadoEm?: string;
  loadingFlag = false;
  salvandoSelecao = false;
  sucessoSelecao = '';
  erroSalvarSelecao = '';
  bolsaMarcada = new Set<number>();

  constructor(
    private projetoService: ProjetoService,
    private inscricoesService: InscricoesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.projetoId) return;

    // Se for orientador, verifica se já existe lock salvo
    if (this.modo === 'ORIENTADOR') {
      this.carregarLock();
    }

    this.carregar();
  }

  private lockKey() {
    return `proj-lock:${this.projetoId}`;
  }

  private carregarLock() {
    try {
      const raw = localStorage.getItem(this.lockKey());
      if (!raw) return;
      const v = JSON.parse(raw);
      this.bloqueado = !!v?.lock;
      this.bloqueadoEm = v?.ts || undefined;
    } catch {
      this.bloqueado = localStorage.getItem(this.lockKey()) === '1';
    }
  }

  private salvarLock() {
    const payload = { lock: true, ts: new Date().toISOString() };
    localStorage.setItem(this.lockKey(), JSON.stringify(payload));
    this.bloqueado = true;
    this.bloqueadoEm = payload.ts;
  }

  private carregar() {
    this.loadingFlag = true;

    // ===== ORIENTADOR =====
    if (this.modo === 'ORIENTADOR') {
      // Depois que o orientador já salvou a seleção (lock),
      // passamos a usar a rota /projetos/{id}/alunos
      if (this.bloqueado) {
        this.projetoService
          .listarAlunosDoProjeto(this.projetoId)
          .pipe(
            finalize(() => {
              this.loadingFlag = false;
              this.cdr.markForCheck();
            })
          )
          .subscribe({
            next: (alunos) => {
              // alunos: [{ id_aluno, nome_completo, email, possuiTrabalhoRemunerado }]
              this._inscricoes = (alunos || []).map((a: any) => ({
                id_aluno: a.id_aluno,
                nome_completo: a.nome_completo,
                email: a.email,
                possuiTrabalhoRemunerado: a.possuiTrabalhoRemunerado,
                status: 'CADASTRADO_FINAL',
              })) as any[];

              this.debugDuplicatas('ORIENTADOR-LOCK', this._inscricoes);

              this.aprovadas = [...this._inscricoes];
              this.pendentesOuReprovadas = [];

              // todos os alunos retornados são os vinculados
              this.selecionados = new Set<number>(
                this._inscricoes.map((i) => this.alunoId(i))
              );
            },
            error: () => {
              this._inscricoes = [];
              this.aprovadas = [];
              this.pendentesOuReprovadas = [];
            },
          });

        return;
      }

      // Antes do lock: usa rota /projetos/{id}/inscricoes (inscrições por projeto)
      this.projetoService
        .listarInscricoesPorProjeto(this.projetoId)
        .pipe(
          finalize(() => {
            this.loadingFlag = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (inscricoes) => {
            this._inscricoes = inscricoes ?? [];

            this.debugDuplicatas('ORIENTADOR', this._inscricoes);

            this.aprovadas = this._inscricoes.filter((i) => {
              const st = ((i as any).status || '').toUpperCase();
              return st === 'VALIDADO' || st === 'APROVADO';
            });

            this.pendentesOuReprovadas = this._inscricoes.filter((i) => {
              const st = ((i as any).status || '').toUpperCase();
              return !this.aprovadas.includes(i) && st !== 'CADASTRADO_FINAL';
            });

            const jaVinculados = this._inscricoes
              .filter(
                (i) =>
                  (((i as any).status || '') as string).toUpperCase() ===
                  'CADASTRADO_FINAL'
              )
              .map((i) => this.alunoId(i));

            this.selecionados = new Set<number>(jaVinculados);
          },
          error: () => {
            this._inscricoes = [];
            this.aprovadas = [];
            this.pendentesOuReprovadas = [];
          },
        });

      return;
    }

    // ===== SECRETARIA: usa rota /inscricao (listagem geral de inscrições) =====
    this.inscricoesService
      .listarPorProjeto(this.projetoId)
      .pipe(
        finalize(() => {
          this.loadingFlag = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (inscricoes) => {
          this._inscricoes = Array.isArray(inscricoes) ? inscricoes : [];

          this.debugDuplicatas('SECRETARIA', this._inscricoes);

          this.alunosSecretaria = this._inscricoes.map((i) =>
            this.mapAlunoSecretaria(i)
          );
        },
        error: () => {
          this.alunosSecretaria = [];
        },
      });
  }

  loading() {
    return this.loadingFlag;
  }

  lista(): AlunoSecretariaView[] {
    return this.alunosSecretaria;
  }

  total() {
    return this.modo === 'SECRETARIA'
      ? this.alunosSecretaria.length
      : this.aprovadas.length + this.pendentesOuReprovadas.length;
  }

  alunoId(i: InscricaoLike): number {
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

  disabledCheckbox(i: InscricaoLike): boolean {
    // Se o projeto já foi bloqueado, não permite alterar nada
    if (this.modo === 'ORIENTADOR' && this.bloqueado) {
      return true;
    }

    const id = this.alunoId(i);
    if (this.selecionados.has(id)) return false;
    return this.selecionados.size >= this.limite;
  }

  toggleSelecionado(i: InscricaoLike, checked: boolean) {
    if (this.modo === 'ORIENTADOR' && this.bloqueado) return;

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
    if (this.modo === 'ORIENTADOR' && this.bloqueado) {
      // Garante que o checkbox volte ao estado original caso alguém clique
      const target = event.target as HTMLInputElement | null;
      if (target) {
        target.checked = this.selecionados.has(this.alunoId(inscricao));
      }
      return;
    }

    const target = event.target as HTMLInputElement | null;
    this.toggleSelecionado(inscricao, !!target?.checked);
  }

  salvarSelecao() {
    this.sucessoSelecao = '';
    this.erroSalvarSelecao = '';
    this.salvandoSelecao = true;

    const ids = Array.from(this.selecionados);

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
              (res as any)?.mensagem ||
              'Seleção salva e inscrições restantes excluídas.';
            this.selecionados = new Set<number>(ids);

            // Bloqueia alterações futuras
            this.salvarLock();

            // Recarrega já usando a rota /projetos/{id}/alunos
            this.carregar();
          },
          error: (e: unknown) => {
            this.salvandoSelecao = false;
            const message =
              typeof e === 'object' && e && 'message' in e
                ? String((e as { message: unknown }).message)
                : null;
            this.erroSalvarSelecao =
              message || 'Falha ao salvar seleção/apagar inscrições.';
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

  toggleBolsa(i: InscricaoLike, checked: boolean) {
    if (!this.bloqueado) return;
    const id = this.alunoId(i);
    if (!id) return;

    if (checked) this.bolsaMarcada.add(id);
    else this.bolsaMarcada.delete(id);
  }

  temBolsa(i: InscricaoLike) {
    const id = this.alunoId(i);
    return this.bolsaMarcada.has(id);
  }

  trackByAlunoSecretaria = (_: number, aluno: AlunoSecretariaView) =>
    aluno.idInscricao;
  trackByInscricao = (_: number, inscricao: InscricaoLike) =>
    this.alunoId(inscricao);
  trackByIndex = (index: number) => index;

  private mapAlunoSecretaria(inscricao: InscricaoLike): AlunoSecretariaView {
    const anyI = inscricao as any;
    const idAluno = this.alunoId(inscricao);
    const idInscricao = anyI?.id_inscricao ?? anyI?.id ?? 0;

    const nomeRaw =
      anyI?.aluno?.nome ||
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

  // 🔍 Helper para detectar duplicatas no front
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

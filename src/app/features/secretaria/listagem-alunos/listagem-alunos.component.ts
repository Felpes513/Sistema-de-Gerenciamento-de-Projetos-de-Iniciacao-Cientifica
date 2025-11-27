// D:\Projetos\Vs code\Sistema-de-Gerenciamento-de-Projetos-de-Iniciacao-Cientifica\src\app\features\secretaria\listagem-alunos\listagem-alunos.component.ts

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

type Modo = 'SECRETARIA' | 'ORIENTADOR';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './listagem-alunos.component.html',
  styleUrls: ['./listagem-alunos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListagemAlunosComponent implements OnInit {
  @Input({ required: true }) projetoId!: number;
  @Input() modo: Modo = 'SECRETARIA';

  readonly skeletonRows = [1, 2, 3, 4];

  private _inscricoes: ProjetoInscricaoApi[] = [];

  alunosSecretaria: AlunoSecretariaView[] = [];
  aprovadas: ProjetoInscricaoApi[] = [];
  pendentesOuReprovadas: ProjetoInscricaoApi[] = [];
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

    if (this.modo === 'ORIENTADOR') {
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

            this.aprovadas = this._inscricoes.filter(
              (i) =>
                (i.status || '').toUpperCase() === 'VALIDADO' ||
                (i.status || '').toUpperCase() === 'APROVADO'
            );

            this.pendentesOuReprovadas = this._inscricoes.filter(
              (i) =>
                !this.aprovadas.includes(i) &&
                (i.status || '').toUpperCase() !== 'CADASTRADO_FINAL'
            );

            const jaVinculados = this._inscricoes
              .filter(
                (i) => (i.status || '').toUpperCase() === 'CADASTRADO_FINAL'
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
          this._inscricoes = Array.isArray(inscricoes) ? inscricoes : [];
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

  alunoId(i: ProjetoInscricaoApi): number {
    return (
      i?.id_aluno ?? i?.aluno_id ?? i?.idAluno ?? i?.aluno?.id ?? i?.id ?? 0
    );
  }

  alunoNome(i: ProjetoInscricaoApi): string {
    const raw =
      i?.aluno?.nome ||
      i?.nome_completo ||
      i?.nome_aluno ||
      i?.nome ||
      `Aluno #${this.alunoId(i)}`;
    return toTitleCase(raw);
  }

  alunoRa(i: ProjetoInscricaoApi): string {
    return i?.aluno?.matricula || (i as any)?.matricula || '—';
  }

  alunoEmail(i: ProjetoInscricaoApi): string {
    return (i?.aluno?.email || (i as any)?.email || '—').trim();
  }

  disabledCheckbox(i: ProjetoInscricaoApi): boolean {
    const id = this.alunoId(i);
    if (this.selecionados.has(id)) return false;
    return this.selecionados.size >= this.limite;
  }

  toggleSelecionado(i: ProjetoInscricaoApi, checked: boolean) {
    const id = this.alunoId(i);
    if (!id) return;
    if (checked) {
      if (this.selecionados.size >= this.limite) return;
      this.selecionados.add(id);
    } else {
      this.selecionados.delete(id);
    }
  }

  onSelecionadoChange(event: Event, inscricao: ProjetoInscricaoApi) {
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
            id_inscricao: i.id_inscricao ?? 0,
            id_aluno: this.alunoId(i),
          }))
        )
        .subscribe({
          next: (res) => {
            this.salvandoSelecao = false;
            this.sucessoSelecao =
              res?.mensagem ||
              'Seleção salva e inscrições restantes excluídas.';
            this.selecionados = new Set<number>(ids);
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

  toggleBolsa(i: ProjetoInscricaoApi, checked: boolean) {
    if (!this.bloqueado) return;
    const id = this.alunoId(i);
    if (!id) return;

    if (checked) this.bolsaMarcada.add(id);
    else this.bolsaMarcada.delete(id);
  }

  temBolsa(i: ProjetoInscricaoApi) {
    const id = this.alunoId(i);
    return this.bolsaMarcada.has(id);
  }

  trackByAlunoSecretaria = (_: number, aluno: AlunoSecretariaView) =>
    aluno.idInscricao;
  trackByInscricao = (_: number, inscricao: ProjetoInscricaoApi) =>
    this.alunoId(inscricao);
  trackByIndex = (index: number) => index;

  private mapAlunoSecretaria(
    inscricao: ProjetoInscricaoApi
  ): AlunoSecretariaView {
    const idAluno = this.alunoId(inscricao);
    const idInscricao = inscricao?.id_inscricao ?? 0;

    const nomeRaw =
      inscricao?.aluno?.nome ||
      inscricao?.nome_aluno ||
      inscricao?.nome ||
      `Aluno #${idAluno || idInscricao}`;

    return {
      idInscricao,
      idAluno,
      nome: toTitleCase(nomeRaw),
      matricula:
        inscricao?.aluno?.matricula || (inscricao as any)?.matricula || '—',
      email: (
        inscricao?.aluno?.email ||
        (inscricao as any)?.email ||
        '—'
      ).trim(),
      status: inscricao?.status || (inscricao as any)?.situacao || 'PENDENTE',
      possuiTrabalhoRemunerado:
        (inscricao as any)?.possuiTrabalhoRemunerado ??
        !!(inscricao as any)?.possui_trabalho_remunerado,
      documentoNotasUrl: (inscricao as any)?.documentoNotasUrl ?? undefined,
    };
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegisterService } from '@services/cadastro.service';
import { forkJoin } from 'rxjs';
import { DialogService } from '@services/dialog.service';

type Aba = 'APROVACoes' | 'INADIMPLENTES';
type Tipo = 'ALUNOS' | 'ORIENTADORES';
type StatusCadastro = 'PENDENTE' | 'APROVADO' | 'INADIMPLENTE';

@Component({
  standalone: true,
  selector: 'app-cadastros',
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastros.component.html',
  styleUrls: ['./cadastros.component.css'],
})
export class CadastrosComponent implements OnInit {
  aba: Aba = 'APROVACoes';
  tipo: Tipo = 'ALUNOS';

  filtro = '';
  carregando = false;
  erro: string | null = null;

  alunos: any[] = [];
  orientadores: any[] = [];
  alunosInad: any[] = [];
  orientadoresInad: any[] = [];

  private readonly lowerWords = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'di']);

  constructor(private api: RegisterService, private dialog: DialogService) {}

  ngOnInit() {
    this.load();
  }

  setAba(a: Aba) {
    this.aba = a;
    this.load();
  }

  setTipo(t: Tipo) {
    this.tipo = t;
    this.load();
  }

  rowId(row: any): number {
    return Number(row?.id_aluno ?? row?.id_orientador ?? row?.id ?? 0);
  }

  private load() {
    this.carregando = true;
    this.erro = null;

    if (this.aba === 'APROVACoes') {
      if (this.tipo === 'ALUNOS') {
        this.api.listarAlunos().subscribe({
          next: (rows: any[]) => {
            const lista = (rows || []).map((r) => this.transformRow(r));

            this.alunos = lista.filter((r) => !this.isInadimplente(r));

            this.carregando = false;
          },
          error: (e: any) => {
            this.erro = e?.message || 'Falha ao listar alunos';
            this.carregando = false;
          },
        });
      } else {
        this.api.listarOrientadores().subscribe({
          next: (rows: any[]) => {
            const lista = (rows || []).map((r) => this.transformRow(r));

            this.orientadores = lista.filter((r) => !this.isInadimplente(r));

            this.carregando = false;
          },
          error: (e: any) => {
            this.erro = e?.message || 'Falha ao listar orientadores';
            this.carregando = false;
          },
        });
      }
      return;
    }

    forkJoin({
      alunos: this.api.listarAlunosInadimplentes(),
      orientadores: this.api.listarOrientadoresInadimplentes(),
    }).subscribe({
      next: ({ alunos, orientadores }) => {
        this.alunosInad = (alunos || []).map((r: any) => this.transformRow(r));
        this.orientadoresInad = (orientadores || []).map((r: any) =>
          this.transformRow(r)
        );
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Falha ao listar inadimplentes';
        this.carregando = false;
      },
    });
  }

  match(term: string, ...vals: (string | number | undefined | null)[]) {
    const norm = (s: any) =>
      (s ?? '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    const f = norm(term);
    return vals.some((v) => norm(v).includes(f));
  }

  private statusOf(row: any): StatusCadastro {
    const st = String(row?.status ?? '')
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (st === 'REPROVADO') return 'INADIMPLENTE';

    if (st === 'APROVADO' || st === 'INADIMPLENTE' || st === 'PENDENTE')
      return st as StatusCadastro;

    return 'PENDENTE';
  }

  isPendente(row: any): boolean {
    return this.statusOf(row) === 'PENDENTE';
  }

  isAprovado(row: any): boolean {
    return this.statusOf(row) === 'APROVADO';
  }

  isInadimplente(row: any): boolean {
    return this.statusOf(row) === 'INADIMPLENTE';
  }

  statusLabel(row: any): string {
    return this.statusOf(row);
  }

  aprovar(id: number) {
    const call =
      this.tipo === 'ALUNOS'
        ? this.api.aprovarAluno(id)
        : this.api.aprovarOrientador(id);

    call.subscribe({
      next: () => this.load(),
      error: () => this.dialog.alert('Erro ao aprovar', 'Erro'),
    });
  }

  async reprovar(id: number) {
    const confirmado = await this.dialog.confirm(
      'Confirmar reprovação? O usuário ficará inadimplente por 2 anos.',
      'Confirmação'
    );
    if (!confirmado) return;

    const call =
      this.tipo === 'ALUNOS'
        ? this.api.atualizarStatusAluno(id, 'INADIMPLENTE')
        : this.api.atualizarStatusOrientador(id, 'INADIMPLENTE');

    call.subscribe({
      next: () => this.load(),
      error: () => this.dialog.alert('Erro ao reprovar', 'Erro'),
    });
  }

  async inadimplentar(id: number) {
    const confirmado = await this.dialog.confirm(
      'Confirmar inadimplência? O usuário ficará inadimplente por 2 anos.',
      'Confirmação'
    );
    if (!confirmado) return;

    const call =
      this.tipo === 'ALUNOS'
        ? this.api.atualizarStatusAluno(id, 'INADIMPLENTE')
        : this.api.atualizarStatusOrientador(id, 'INADIMPLENTE');

    call.subscribe({
      next: () => this.load(),
      error: () => this.dialog.alert('Erro ao inadimplentar', 'Erro'),
    });
  }

  async adimplentar(id: number) {
    const confirmado = await this.dialog.confirm(
      'Confirmar adimplência? O usuário voltará a ficar adimplente.',
      'Confirmação'
    );
    if (!confirmado) return;

    const call =
      this.tipo === 'ALUNOS'
        ? this.api.aprovarAluno(id)
        : this.api.aprovarOrientador(id);

    call.subscribe({
      next: () => this.load(),
      error: () => this.dialog.alert('Erro ao adimplentar', 'Erro'),
    });
  }

  async adimplentarAluno(id: number) {
    const confirmado = await this.dialog.confirm(
      'Confirmar adimplência? O aluno voltará a ficar adimplente.',
      'Confirmação'
    );
    if (!confirmado) return;

    this.api.aprovarAluno(id).subscribe({
      next: () => this.load(),
      error: () => this.dialog.alert('Erro ao adimplentar', 'Erro'),
    });
  }

  async adimplentarOrientador(id: number) {
    const confirmado = await this.dialog.confirm(
      'Confirmar adimplência? O orientador voltará a ficar adimplente.',
      'Confirmação'
    );
    if (!confirmado) return;

    this.api.aprovarOrientador(id).subscribe({
      next: () => this.load(),
      error: () => this.dialog.alert('Erro ao adimplentar', 'Erro'),
    });
  }

  private transformRow(row: any) {
    const nomeSrc = row?.nome_completo ?? row?.nome ?? row?.name ?? '';
    const cpfSrc = row?.cpf ?? row?.CPF ?? '';
    return {
      ...row,
      nomeFmt: this.properCase(nomeSrc),
      cpfFmt: this.formatCpf(cpfSrc),
    };
  }

  private properCase(value: string): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .split(/\s+/)
      .map((w, i) =>
        i > 0 && this.lowerWords.has(w)
          ? w
          : w.charAt(0).toUpperCase() + w.slice(1)
      )
      .join(' ');
  }

  private formatCpf(value: string | number): string {
    const v = String(value ?? '')
      .replace(/\D/g, '')
      .padStart(11, '0')
      .slice(-11);
    if (v.length !== 11) return '';
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}

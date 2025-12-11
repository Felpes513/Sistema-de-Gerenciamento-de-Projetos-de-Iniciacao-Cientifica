import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfigService } from '@services/config.service';
import { DialogService } from '@services/dialog.service';
import { RegisterService } from '@services/cadastro.service';
import { forkJoin } from 'rxjs';
import { BolsaListItem } from '@interfaces/configuracao';

interface AlunoConfigView {
  id_aluno: number;
  nome_completo: string;
  email: string;
  status?: string;
  bolsas: {
    id_bolsa: number;
    id_tipo_bolsa: number;
    tipo_bolsa: string;
  }[];
}

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule],
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.css'],
})
export class ConfiguracoesComponent implements OnInit {
  campus: any[] = [];
  novoCampus = '';

  cursos: any[] = [];
  novoCurso = '';

  tiposBolsa: any[] = [];
  novoTipoBolsa = '';

  alunos: AlunoConfigView[] = [];
  filtroBolsa = '';

  modalBolsaAberto = false;
  alunoSelecionado: AlunoConfigView | null = null;
  bolsaSelecionada: number | null = null;

  constructor(
    private config: ConfigService,
    private dialog: DialogService,
    private registerService: RegisterService
  ) {}

  ngOnInit(): void {
    this.carregarCampus();
    this.carregarCursos();
    this.carregarTiposBolsa();
    this.carregarAlunosComBolsa();
  }

  // ========= Campus =========

  carregarCampus() {
    this.config.listarCampus().subscribe({
      next: (res: { campus: any[] }) => (this.campus = res.campus),
      error: () => (this.campus = []),
    });
  }

  cadastrarCampus() {
    if (!this.novoCampus.trim()) return;

    this.config.criarCampus({ campus: this.novoCampus }).subscribe(() => {
      this.novoCampus = '';
      this.carregarCampus();
    });
  }

  async excluirCampus(id: number) {
    const confirmado = await this.dialog.confirm(
      'Confirma excluir este campus?',
      'Confirmação'
    );
    if (!confirmado) return;

    this.config.excluirCampus(id).subscribe({
      next: () => this.carregarCampus(),
      error: () => this.dialog.alert('Falha ao excluir campus', 'Erro'),
    });
  }

  // ========= Cursos =========

  carregarCursos() {
    this.config.listarCursos().subscribe((res) => (this.cursos = res.cursos));
  }

  cadastrarCurso() {
    if (!this.novoCurso.trim()) return;

    this.config.criarCurso({ nome: this.novoCurso }).subscribe(() => {
      this.novoCurso = '';
      this.carregarCursos();
    });
  }

  async excluirCurso(id: number) {
    const confirmado = await this.dialog.confirm(
      'Confirma excluir este curso?',
      'Confirmação'
    );
    if (!confirmado) return;

    this.config.excluirCurso(id).subscribe({
      next: () => this.carregarCursos(),
      error: () => this.dialog.alert('Falha ao excluir curso', 'Erro'),
    });
  }

  // ========= Tipos de Bolsa =========

  carregarTiposBolsa() {
    this.config.listarTiposBolsa().subscribe((res) => {
      this.tiposBolsa = res;
    });
  }

  criarTipoBolsa() {
    if (!this.novoTipoBolsa.trim()) return;

    this.config.criarTipoBolsa(this.novoTipoBolsa).subscribe(() => {
      this.novoTipoBolsa = '';
      this.carregarTiposBolsa();
    });
  }

  async excluirTipoBolsa(id: number) {
    const confirmado = await this.dialog.confirm(
      'Remover este tipo de bolsa?',
      'Confirmação'
    );
    if (!confirmado) return;

    this.config.excluirTipoBolsa(id).subscribe(() => {
      this.carregarTiposBolsa();
    });
  }

  // ========= Alunos + Bolsas =========

  carregarAlunosComBolsa() {
    forkJoin({
      alunos: this.registerService.listarAlunos(),   // GET /alunos/
      bolsasResp: this.config.listarBolsas(),        // GET /bolsas/
    }).subscribe({
      next: ({ alunos, bolsasResp }) => {
        const bolsas: BolsaListItem[] = bolsasResp?.bolsas || [];

        // agrupa bolsas por id_aluno
        const bolsasPorAluno: Record<number, AlunoConfigView['bolsas']> = {};
        for (const b of bolsas) {
          const idAluno = b.id_aluno;
          if (!bolsasPorAluno[idAluno]) {
            bolsasPorAluno[idAluno] = [];
          }
          bolsasPorAluno[idAluno].push({
            id_bolsa: b.id_bolsa,
            id_tipo_bolsa: b.id_tipo_bolsa,
            tipo_bolsa: b.tipo_bolsa,
          });
        }

        // filtra só alunos aprovados pela secretaria
        const aprovados = (alunos || []).filter(
          (a: any) => a.status === 'APROVADO'
        );

        // monta a estrutura consumida pelo HTML
        this.alunos = aprovados.map((a: any) => {
          const alunoId = Number(a.id_aluno ?? a.id);
          return {
            id_aluno: alunoId,
            nome_completo: a.nome_completo,
            email: a.email,
            status: a.status,
            bolsas: bolsasPorAluno[alunoId] || [],
          };
        });
      },
      error: () => {
        this.alunos = [];
      },
    });
  }

  abrirSelecaoBolsa(aluno: AlunoConfigView) {
    this.alunoSelecionado = aluno;
    this.modalBolsaAberto = true;
  }

  fecharModal() {
    this.modalBolsaAberto = false;
    this.alunoSelecionado = null;
    this.bolsaSelecionada = null;
  }

  confirmarVinculo() {
    if (!this.bolsaSelecionada || !this.alunoSelecionado) return;

    const payload = {
      id_aluno: this.alunoSelecionado.id_aluno,
      id_tipo_bolsa: this.bolsaSelecionada,
    };

    console.log('Payload criar bolsa:', payload);

    this.config.criarBolsa(payload).subscribe({
      next: () => {
        this.fecharModal();
        this.carregarAlunosComBolsa();
      },
      error: (err) => {
        console.error('Erro ao criar bolsa', err);
        this.dialog.alert(
          'Não foi possível atribuir a bolsa. Verifique se o aluno e o tipo de bolsa são válidos.',
          'Erro ao atribuir bolsa'
        );
      },
    });
  }

  async removerBolsa(id_bolsa: number) {
    const confirmado = await this.dialog.confirm(
      'Remover esta bolsa?',
      'Confirmação'
    );
    if (!confirmado) return;

    this.config.excluirBolsa(id_bolsa).subscribe(() => {
      this.carregarAlunosComBolsa();
    });
  }

  // ========= Helpers =========

  matchBolsa(term: string, ...vals: (string | number | undefined | null)[]) {
    const norm = (s: any) =>
      (s ?? '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    const f = norm(term);
    if (!f) return true;

    return vals.some((v) => norm(v).includes(f));
  }

  /** Exibe nome em Title Case (Felipe Souza Moreira) */
  toTitleCase(value?: string | null): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .split(' ')
      .filter((p) => p)
      .map((p) => p[0].toUpperCase() + p.slice(1))
      .join(' ');
  }
}

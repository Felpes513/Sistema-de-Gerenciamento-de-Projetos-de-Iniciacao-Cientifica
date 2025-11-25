import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfigService } from '@services/config.service';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule],
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.css'],
})
export class ConfiguracoesComponent implements OnInit {
  /* ================================================================
   * CAMPUS
   * ================================================================ */
  campus: any[] = [];
  novoCampus = '';

  /* ================================================================
   * CURSOS
   * ================================================================ */
  cursos: any[] = [];
  novoCurso = '';

  /* ================================================================
   * TIPOS DE BOLSA
   * ================================================================ */
  tiposBolsa: any[] = [];
  novoTipoBolsa = '';

  /* ================================================================
   * ALUNOS EM PROJETOS (APROVADOS)
   * ================================================================ */
  alunos: any[] = [];
  filtroBolsa = '';

  // Modal de bolsas
  modalBolsaAberto = false;
  alunoSelecionado: any = null;
  bolsaSelecionada: number | null = null;

  constructor(private config: ConfigService) {}

  ngOnInit(): void {
    this.carregarCampus();
    this.carregarCursos();
    this.carregarTiposBolsa();

    /** 🔥 AGORA LISTA OS ALUNOS CADASTRADOS EM PROJETOS, NÃO MAIS INSCRIÇÕES */
    this.carregarAlunosEmProjetos();
  }

  /* ================================================================
   * CAMPUS
   * ================================================================ */
  carregarCampus() {
    this.config.listarCampus().subscribe({
      next: (res) => (this.campus = res),
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

  excluirCampus(id: number) {
    if (!confirm('Confirma excluir este campus?')) return;

    this.config.excluirCampus(id).subscribe({
      next: () => this.carregarCampus(),
      error: () => alert('Falha ao excluir campus'),
    });
  }

  /* ================================================================
   * CURSOS
   * ================================================================ */
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

  excluirCurso(id: number) {
    if (!confirm('Confirma excluir este curso?')) return;

    this.config.excluirCurso(id).subscribe({
      next: () => this.carregarCursos(),
      error: () => alert('Falha ao excluir curso'),
    });
  }

  /* ================================================================
   * TIPOS DE BOLSA
   * ================================================================ */
  carregarTiposBolsa() {
    this.config.listarTiposBolsa().subscribe((res) => {
      this.tiposBolsa = res;
    });
  }

  criarTipoBolsa() {
    if (!this.novoTipoBolsa.trim()) return;

    this.config
      .criarTipoBolsa({ tipo_bolsa: this.novoTipoBolsa })
      .subscribe(() => {
        this.novoTipoBolsa = '';
        this.carregarTiposBolsa();
      });
  }

  excluirTipoBolsa(id: number) {
    if (!confirm('Remover este tipo de bolsa?')) return;

    this.config.excluirTipoBolsa(id).subscribe(() => {
      this.carregarTiposBolsa();
    });
  }

  /* ================================================================
   * ALUNOS EM PROJETOS (APROVADOS)
   * ================================================================ */
  carregarAlunosEmProjetos() {
    this.config.listarAlunosEmProjetos().subscribe({
      next: (res) => (this.alunos = res.alunos),
      error: () => (this.alunos = []),
    });
  }

  /* ================================================================
   * BOLSAS
   * ================================================================ */
  abrirSelecaoBolsa(aluno: any) {
    this.alunoSelecionado = aluno;
    this.modalBolsaAberto = true;
  }

  fecharModal() {
    this.modalBolsaAberto = false;
    this.bolsaSelecionada = null;
  }

  confirmarVinculo() {
    if (!this.bolsaSelecionada) return;

    this.config
      .criarBolsaAluno({
        id_aluno: this.alunoSelecionado.id_aluno,
        id_tipo_bolsa: this.bolsaSelecionada,
      })
      .subscribe(() => {
        this.fecharModal();
        this.carregarAlunosEmProjetos();
      });
  }

  removerBolsa(id_bolsa: number) {
    if (!confirm('Remover esta bolsa?')) return;

    this.config.removerBolsa(id_bolsa).subscribe(() => {
      this.carregarAlunosEmProjetos();
    });
  }

  /* ================================================================
   * FILTRO
   * ================================================================ */
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
}

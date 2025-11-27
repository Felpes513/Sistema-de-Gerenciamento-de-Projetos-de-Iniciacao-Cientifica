import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfigService } from '@services/config.service';
import { DialogService } from '@services/dialog.service';

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

  alunos: any[] = [];
  filtroBolsa = '';

  modalBolsaAberto = false;
  alunoSelecionado: any = null;
  bolsaSelecionada: number | null = null;

  constructor(private config: ConfigService, private dialog: DialogService) {}

  ngOnInit(): void {
    this.carregarCampus();
    this.carregarCursos();
    this.carregarTiposBolsa();
    this.carregarAlunosComBolsa();
  }

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

  carregarAlunosComBolsa() {
    this.config.listarBolsas().subscribe({
      next: (res: {
        bolsas: any[];
        limit: number;
        offset: number;
        count: number;
      }) => (this.alunos = res.bolsas),
      error: () => (this.alunos = []),
    });
  }

  abrirSelecaoBolsa(aluno: any) {
    this.alunoSelecionado = aluno;
    this.modalBolsaAberto = true;
  }

  fecharModal() {
    this.modalBolsaAberto = false;
    this.bolsaSelecionada = null;
  }

  confirmarVinculo() {
    if (!this.bolsaSelecionada || !this.alunoSelecionado) return;

    this.config
      .criarBolsa({
        id_aluno: this.alunoSelecionado.id_aluno,
        id_tipo_bolsa: this.bolsaSelecionada,
      })
      .subscribe(() => {
        this.fecharModal();
        this.carregarAlunosComBolsa();
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

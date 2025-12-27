import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfigService } from '@services/config.service';
import { DialogService } from '@services/dialog.service';
import { RegisterService } from '@services/cadastro.service';
import { forkJoin } from 'rxjs';
import { BolsaListItem } from '@shared/models/configuracao';
import { PasswordService } from '@services/password.service';
import { RegisterSecretariaData } from '@shared/models/registros';
import { AlunoConfigView } from '@shared/models/aluno';

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
  secretarias: RegisterSecretariaData[] = [];
  secretariasLoading = false;

  sec = { nomeCompleto: '', cpf: '', email: '', senha: '', confirmar: '' };
  secLoading = false;
  secErro: string | null = null;
  secSucesso: string | null = null;

  secTouched = {
    nome: false,
    email: false,
    cpf: false,
    senha: false,
    confirmar: false,
  };

  resetPwdLoadingId: number | null = null;

  constructor(
    private config: ConfigService,
    private dialog: DialogService,
    private registerService: RegisterService,
    private passwordService: PasswordService
  ) {}

  ngOnInit(): void {
    this.carregarCampus();
    this.carregarCursos();
    this.carregarTiposBolsa();
    this.carregarAlunosComBolsa();
    this.carregarSecretarias();
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
    forkJoin({
      alunos: this.registerService.listarAlunos(),
      bolsasResp: this.config.listarBolsas(),
    }).subscribe({
      next: ({ alunos, bolsasResp }) => {
        const bolsas: BolsaListItem[] = bolsasResp?.bolsas || [];

        const bolsasPorAluno: Record<number, AlunoConfigView['bolsas']> = {};
        for (const b of bolsas) {
          const idAluno = b.id_aluno;
          if (!bolsasPorAluno[idAluno]) bolsasPorAluno[idAluno] = [];
          bolsasPorAluno[idAluno].push({
            id_bolsa: b.id_bolsa,
            id_tipo_bolsa: b.id_tipo_bolsa,
            tipo_bolsa: b.tipo_bolsa,
          });
        }

        const aprovados = (alunos || []).filter(
          (a: any) => a.status === 'APROVADO'
        );

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

    this.config.criarBolsa(payload).subscribe({
      next: () => {
        this.fecharModal();
        this.carregarAlunosComBolsa();
      },
      error: () => {
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

  carregarSecretarias() {
    this.secretariasLoading = true;

    this.registerService.listarSecretarias().subscribe({
      next: (rows: any[]) => {
        this.secretariasLoading = false;
        const lista = Array.isArray(rows) ? rows : [];

        this.secretarias = lista.map((s: any) => ({
          id: Number(s.id ?? s.id_secretaria ?? 0),
          nome_completo: s.nome_completo ?? '',
          email: s.email ?? '',
          cpf: s.cpf ?? '',
        }));
      },
      error: () => {
        this.secretariasLoading = false;
        this.secretarias = [];
      },
    });
  }

  onSecCpfBlur() {
    this.secTouched.cpf = true;
    this.sec.cpf = this.applyCpfMask(this.sec.cpf);
  }

  canSubmitSecretaria(): boolean {
    return (
      this.sec.nomeCompleto.trim().length >= 3 &&
      this.isEmailValid(this.sec.email) &&
      this.isCpfValido(this.sec.cpf) &&
      this.isSenhaValida(this.sec.senha) &&
      this.sec.senha === this.sec.confirmar
    );
  }

  cadastrarSecretaria() {
    this.secErro = null;
    this.secSucesso = null;

    this.secTouched = {
      nome: true,
      email: true,
      cpf: true,
      senha: true,
      confirmar: true,
    };

    if (!this.canSubmitSecretaria()) {
      this.secErro = 'Revise os campos destacados.';
      return;
    }

    this.secLoading = true;

    this.registerService
      .registerSecretaria({
        nomeCompleto: this.sec.nomeCompleto,
        email: this.sec.email,
        cpf: this.sec.cpf,
        senha: this.sec.senha,
      })
      .subscribe({
        next: (res: any) => {
          this.secLoading = false;

          const msg = res?.mensagem || 'Secretaria cadastrada com sucesso.';
          this.secSucesso = msg;

          this.dialog.alert(msg, 'Sucesso');

          this.sec = {
            nomeCompleto: '',
            cpf: '',
            email: '',
            senha: '',
            confirmar: '',
          };
          this.secTouched = {
            nome: false,
            email: false,
            cpf: false,
            senha: false,
            confirmar: false,
          };

          this.carregarSecretarias();
        },
        error: (e) => {
          this.secLoading = false;

          const msg =
            e?.error?.detail ||
            e?.message ||
            'Falha ao cadastrar secretária (verifique permissões e dados).';

          this.secErro = msg;

          this.dialog.alert(msg, 'Erro');
        },
      });
  }

  private applyCpfMask(v: string): string {
    const raw = (v || '').replace(/\D/g, '').slice(0, 11);
    return raw.length === 11
      ? raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      : raw;
  }

  formatCpf(value?: string | null): string {
    const digits = (value ?? '').replace(/\D/g, '');
    if (digits.length !== 11) return value ?? '';
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  isSenhaValida(s: string): boolean {
    return (s || '').length >= 6;
  }

  isEmailValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
  }

  isCpfValido(cpf: string): boolean {
    const digits = (cpf || '').replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1+$/.test(digits)) return false;

    const calc = (base: string) => {
      let sum = 0;
      for (let i = 0; i < base.length; i++) {
        sum += Number(base[i]) * (base.length + 1 - i);
      }
      const r = (sum * 10) % 11;
      return r === 10 ? 0 : r;
    };

    const d1 = calc(digits.slice(0, 9));
    const d2 = calc(digits.slice(0, 10));
    return d1 === Number(digits[9]) && d2 === Number(digits[10]);
  }

  async resetarSenhaSecretaria(sec: RegisterSecretariaData) {
    const email = (sec.email || '').trim();
    if (!email) {
      await this.dialog.alert('E-mail da secretária inválido.', 'Erro');
      return;
    }

    const ok = await this.dialog.confirm(
      `Enviar link de redefinição de senha para:\n${email}?`,
      'Reset de senha'
    );
    if (!ok) return;

    this.resetPwdLoadingId = sec.id;

    this.passwordService.forgotPassword(email, 'secretaria').subscribe({
      next: (r) => {
        this.resetPwdLoadingId = null;
        const msg =
          (r as any)?.message ||
          'Link de redefinição enviado para o e-mail da secretária.';
        this.dialog.alert(msg, 'Sucesso');
      },
      error: (e) => {
        this.resetPwdLoadingId = null;
        const msg =
          e?.error?.message ||
          e?.error?.detail ||
          e?.message ||
          'Falha ao solicitar reset de senha.';
        this.dialog.alert(msg, 'Erro');
      },
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

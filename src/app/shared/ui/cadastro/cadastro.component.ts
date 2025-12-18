import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RegisterService } from '@services/cadastro.service';
import { ConfigService } from '@services/config.service';
import { Campus, Curso } from '@shared/models/configuracao';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css'],
})
export class RegisterComponent implements OnInit {
  perfilSelecionado: 'orientador' | 'aluno' | null = null;
  step = 1;
  isLoading = false;
  erro: string | null = null;
  sucesso: string | null = null;

  cursos: Curso[] = [];
  campus: Campus[] = [];

  ori = { nomeCompleto: '', cpf: '', email: '', senha: '', confirmar: '' };
  showPassOri = false;
  acceptTermsOri = false;

  alu = {
    nomeCompleto: '',
    cpf: '',
    email: '',
    senha: '',
    confirmar: '',
    idCurso: '' as any,
    idCampus: '' as any,
    possuiTrabalhoRemunerado: false,
  };
  showPassAlu = false;
  acceptTermsAlu = false;

  pdfFile: File | null = null;
  pdfName = '';

  // ✅ Flags para só pintar/vermelho após o usuário tocar no campo
  cpfOriTouched = false;
  senhaOriTouched = false;
  confirmarOriTouched = false;

  cpfAluTouched = false;
  senhaAluTouched = false;
  confirmarAluTouched = false;

  pdfTouched = false;

  constructor(
    private registerService: RegisterService,
    private configService: ConfigService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.configService.listarCursos().subscribe({
      next: (res) => (this.cursos = res?.cursos || []),
      error: () => (this.cursos = []),
    });

    this.configService.listarCampus().subscribe({
      next: (res) => (this.campus = res?.campus || []),
      error: () => (this.campus = []),
    });
  }

  selecionarPerfil(p: 'orientador' | 'aluno') {
    this.perfilSelecionado = p;
    this.erro = null;
    this.sucesso = null;
    this.step = 1;

    // reset “touched”
    this.cpfOriTouched = this.senhaOriTouched = this.confirmarOriTouched = false;
    this.cpfAluTouched = this.senhaAluTouched = this.confirmarAluTouched = false;
    this.pdfTouched = false;
    this.pdfFile = null;
    this.pdfName = '';
  }

  goStep(n: number) {
    this.step = n;
    this.erro = null;
    this.sucesso = null;
  }

  touchCpf(kind: 'ori' | 'alu') {
    if (kind === 'ori') this.cpfOriTouched = true;
    else this.cpfAluTouched = true;
  }

  touchSenha(kind: 'ori' | 'alu') {
    if (kind === 'ori') this.senhaOriTouched = true;
    else this.senhaAluTouched = true;
  }

  touchConfirmar(kind: 'ori' | 'alu') {
    if (kind === 'ori') this.confirmarOriTouched = true;
    else this.confirmarAluTouched = true;
  }

  applyCpfMask(kind: 'ori' | 'alu') {
    const raw = (kind === 'ori' ? this.ori.cpf : this.alu.cpf)
      .replace(/\D/g, '')
      .slice(0, 11);

    const masked =
      raw.length === 11
        ? raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        : raw;

    if (kind === 'ori') this.ori.cpf = masked;
    else this.alu.cpf = masked;
  }

  // ✅ CPF válido (dígitos verificadores)
  isCpfValido(cpf: string): boolean {
    const digits = (cpf || '').replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;

    const calc = (baseLen: number, factorStart: number) => {
      let sum = 0;
      for (let i = 0; i < baseLen; i++) {
        sum += Number(digits.charAt(i)) * (factorStart - i);
      }
      const mod = sum % 11;
      return mod < 2 ? 0 : 11 - mod;
    };

    const d1 = calc(9, 10);
    if (d1 !== Number(digits.charAt(9))) return false;

    const d2 = calc(10, 11);
    if (d2 !== Number(digits.charAt(10))) return false;

    return true;
  }

  validStep1(): boolean {
    return (
      this.alu.nomeCompleto.trim().length >= 3 &&
      this.isCpfValido(this.alu.cpf) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.alu.email) &&
      this.alu.senha.length >= 6 &&
      this.alu.senha === this.alu.confirmar
    );
  }

  onPdfChange(ev: Event) {
    this.pdfTouched = true;

    const input = ev.target as HTMLInputElement;
    const f = input.files?.[0] || null;

    if (!f) {
      this.pdfFile = null;
      this.pdfName = '';
      return;
    }

    if (!/\.pdf$/i.test(f.name)) {
      this.erro = 'Envie um arquivo .pdf válido.';
      this.pdfFile = null;
      this.pdfName = '';
      input.value = '';
      return;
    }

    this.erro = null;
    this.pdfFile = f;
    this.pdfName = f.name;
  }

  onSubmitOrientador() {
    this.erro = null;
    this.sucesso = null;

    // marca touched pra pintar quando tentar enviar
    this.cpfOriTouched = true;
    this.senhaOriTouched = true;
    this.confirmarOriTouched = true;

    if (!this.ori.nomeCompleto.trim()) {
      this.erro = 'Preencha o nome completo.';
      return;
    }

    if (!this.isCpfValido(this.ori.cpf)) {
      this.erro = 'CPF inválido.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.ori.email)) {
      this.erro = 'E-mail inválido.';
      return;
    }

    if (this.ori.senha.length < 6) {
      this.erro = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    if (this.ori.senha !== this.ori.confirmar) {
      this.erro = 'Senha diferente da confirmação.';
      return;
    }

    if (!this.acceptTermsOri) {
      this.erro = 'Você deve aceitar os termos.';
      return;
    }

    this.isLoading = true;
    this.registerService
      .registerOrientador({
        nomeCompleto: this.ori.nomeCompleto,
        cpf: this.ori.cpf,
        email: this.ori.email,
        senha: this.ori.senha,
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.sucesso = 'Cadastro realizado com sucesso! Redirecionando...';
          setTimeout(
            () =>
              this.router.navigate(['/'], {
                queryParams: { perfil: 'orientador' },
              }),
            1500
          );
        },
        error: (e) => {
          this.isLoading = false;
          this.erro = e?.error?.detail || 'Falha no cadastro.';
        },
      });
  }

  onSubmitAluno() {
    if (this.step !== 3) return;

    this.erro = null;
    this.sucesso = null;

    // marca touched pra pintar quando tentar enviar
    this.cpfAluTouched = true;
    this.senhaAluTouched = true;
    this.confirmarAluTouched = true;
    this.pdfTouched = true;

    if (!this.validStep1()) {
      this.erro =
        'Verifique os dados: CPF deve ser válido e a senha deve ter no mínimo 6 caracteres.';
      this.goStep(1);
      return;
    }

    if (!this.alu.idCurso) {
      this.erro = 'Selecione um curso.';
      this.goStep(2);
      return;
    }

    if (!this.pdfFile) {
      this.erro = 'Envie o PDF de notas.';
      return;
    }

    if (!this.acceptTermsAlu) {
      this.erro = 'Você deve aceitar os termos.';
      return;
    }

    this.isLoading = true;
    this.registerService
      .registerAluno({
        nomeCompleto: this.alu.nomeCompleto,
        cpf: this.alu.cpf,
        email: this.alu.email,
        senha: this.alu.senha,
        idCurso: Number(this.alu.idCurso),
        pdf: this.pdfFile,
        possuiTrabalhoRemunerado: this.alu.possuiTrabalhoRemunerado,
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.sucesso = 'Cadastro realizado com sucesso! Redirecionando...';
          setTimeout(
            () =>
              this.router.navigate(['/'], {
                queryParams: { perfil: 'aluno' },
              }),
            1500
          );
        },
        error: (e) => {
          this.isLoading = false;
          this.erro = e?.error?.detail || 'Falha no cadastro.';
        },
      });
  }
}

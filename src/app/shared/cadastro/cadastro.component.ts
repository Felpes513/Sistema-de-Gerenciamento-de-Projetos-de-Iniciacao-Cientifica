import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RegisterService } from '@services/cadastro.service';
import { ConfigService } from '@services/config.service';
import { Campus, Curso } from '@interfaces/configuracao';

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

  constructor(
    private registerService: RegisterService,
    private configService: ConfigService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Lista de cursos (GET /cursos/)
    this.configService.listarCursos().subscribe({
      next: (res) => (this.cursos = res?.cursos || []),
      error: () => (this.cursos = []),
    });

    // Lista de campus (GET /campus/)
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
  }

  goStep(n: number) {
    this.step = n;
    this.erro = null;
    this.sucesso = null;
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

  validStep1(): boolean {
    const cpfDigits = this.alu.cpf.replace(/\D/g, '');
    return (
      this.alu.nomeCompleto.trim().length >= 3 &&
      cpfDigits.length === 11 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.alu.email) &&
      this.alu.senha.length >= 6 &&
      this.alu.senha === this.alu.confirmar
    );
  }

  onPdfChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const f = input.files?.[0] || null;
    if (!f) {
      this.pdfFile = null;
      this.pdfName = '';
      return;
    }
    if (!/\.pdf$/i.test(f.name)) {
      this.erro = 'Envie um arquivo .pdf válido.';
      input.value = '';
      return;
    }
    this.pdfFile = f;
    this.pdfName = f.name;
  }

  onSubmitOrientador() {
    this.erro = null;
    this.sucesso = null;
    const cpfDigits = this.ori.cpf.replace(/\D/g, '');
    if (
      !this.ori.nomeCompleto.trim() ||
      cpfDigits.length !== 11 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.ori.email)
    ) {
      this.erro = 'Preencha os campos corretamente.';
      return;
    }
    if (this.ori.senha.length < 6 || this.ori.senha !== this.ori.confirmar) {
      this.erro = 'Senha inválida ou diferente da confirmação.';
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

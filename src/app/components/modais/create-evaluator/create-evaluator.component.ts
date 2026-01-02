import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvaliadorExterno } from '@shared/models/avaliador_externo';
import { AvaliadoresExternosService } from '@services/avaliadores_externos.service';

type TipoAvaliador = 'INTERNO' | 'EXTERNO';

@Component({
  selector: 'app-avaliador-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-evaluator.component.html',
  styleUrls: ['./create-evaluator.component.css'],
})
export class CreateEvaluatorModalComponent implements OnInit {
  @Input() avaliador: AvaliadorExterno | null = null;
  @Output() closed = new EventEmitter<boolean>();

  carregando = false;
  erro = '';

  submitted = false;

  invalid = {
    identificador: false,
    nome: false,
    email: false,
    especialidade: false,
    subespecialidade: false,
    link_lattes: false,
  };

  form = {
    identificador: '' as '' | TipoAvaliador,
    nome: '',
    email: '',
    especialidade: '',
    subespecialidade: '',
    link_lattes: '',
  };

  get isEdicao(): boolean {
    return !!this.avaliador?.id;
  }

  constructor(private service: AvaliadoresExternosService) {}

  ngOnInit(): void {
    if (this.avaliador) {
      // API devolve tipo_avaliador; alguns lugares podem estar usando identificador
      const tipo =
        (this.avaliador as any).tipo_avaliador ??
        (this.avaliador as any).identificador ??
        (this.avaliador as any).codigo ??
        '';

      this.form.identificador = (String(tipo || '').toUpperCase().trim() as any) || '';

      this.form.nome = this.avaliador.nome ?? '';
      this.form.email = this.avaliador.email ?? '';
      this.form.especialidade = this.avaliador.especialidade ?? '';
      this.form.subespecialidade = this.avaliador.subespecialidade ?? '';
      this.form.link_lattes =
        (this.avaliador as any).link_lattes ??
        (this.avaliador as any).lattes_link ??
        '';
    }
  }

  fechar(reload = false) {
    this.closed.emit(reload);
  }

  private resetInvalid() {
    this.invalid = {
      identificador: false,
      nome: false,
      email: false,
      especialidade: false,
      subespecialidade: false,
      link_lattes: false,
    };
  }

  private isEmailValid(v: string): boolean {
    const s = v.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  }

  private isUrlValid(v: string): boolean {
    const s = v.trim();
    if (!s) return false;
    try {
      const u = new URL(s);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private validar(): string | null {
    this.resetInvalid();

    const identificador = String(this.form.identificador || '').trim().toUpperCase();
    const nome = String(this.form.nome || '').trim();
    const email = String(this.form.email || '').trim();
    const especialidade = String(this.form.especialidade || '').trim();
    const subespecialidade = String(this.form.subespecialidade || '').trim();
    const link = String(this.form.link_lattes || '').trim();

    // Obrigatórios (como você pediu)
    if (!identificador) this.invalid.identificador = true;
    if (nome.length < 3) this.invalid.nome = true;
    if (!this.isEmailValid(email)) this.invalid.email = true;
    if (especialidade.length < 3) this.invalid.especialidade = true;

    // Seu backend atual exige subespecialidade e link_lattes (min_length/HttpUrl).
    // Se você quiser manter opcional no front, a API vai barrar. Então validamos aqui:
    if (subespecialidade.length < 3) this.invalid.subespecialidade = true;
    if (!this.isUrlValid(link)) this.invalid.link_lattes = true;

    if (Object.values(this.invalid).some(Boolean)) {
      // Mensagem simples (e campos destacados em vermelho)
      if (this.invalid.link_lattes) {
        return 'Link do Lattes inválido. Use um link completo (https://...).';
      }
      return 'Corrija os campos destacados.';
    }

    // validação do tipo (por segurança)
    if (identificador !== 'INTERNO' && identificador !== 'EXTERNO') {
      this.invalid.identificador = true;
      return 'Tipo de avaliador inválido.';
    }

    return null;
  }

  salvar(): void {
    this.erro = '';
    this.submitted = true;

    const msg = this.validar();
    if (msg) {
      this.erro = msg;
      return;
    }

    this.carregando = true;

    const payload: any = {
      // ✅ nomes exatamente como a API espera
      nome: String(this.form.nome).trim(),
      email: String(this.form.email).trim(),
      especialidade: String(this.form.especialidade).trim(),
      subespecialidade: String(this.form.subespecialidade).trim(),
      link_lattes: String(this.form.link_lattes).trim(),
      tipo_avaliador: String(this.form.identificador).trim().toUpperCase(),
    };

    const svc: any = this.service;

    const fnCreate =
      svc.createAvaliador ?? svc.criarAvaliador ?? svc.postAvaliador;
    const fnUpdate =
      svc.updateAvaliador ?? svc.atualizarAvaliador ?? svc.putAvaliador;

    const req$ = this.isEdicao
      ? (typeof fnUpdate === 'function'
          ? fnUpdate.call(this.service, (this.avaliador as any).id, payload)
          : null)
      : (typeof fnCreate === 'function'
          ? fnCreate.call(this.service, payload)
          : null);

    if (!req$) {
      this.carregando = false;
      this.erro =
        'Não encontrei o método de salvar no AvaliadoresExternosService.';
      return;
    }

    req$.subscribe({
      next: () => {
        this.carregando = false;
        this.fechar(true);
      },
      error: (e: any) => {
        this.carregando = false;
        this.erro =
          e?.error?.detail ||
          e?.message ||
          'Erro ao salvar avaliador. Verifique a API.';
      },
    });
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvaliadorExterno } from '@shared/models/avaliador_externo';
import { AvaliadoresExternosService } from '@services/avaliadores_externos.service';

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

  form = {
    identificador: '',
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
      this.form.identificador =
        (this.avaliador as any).identificador ??
        (this.avaliador as any).codigo ??
        '';
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

  private validar(): string | null {
    if (!String(this.form.identificador).trim()) return 'Informe o identificador.';
    if (!String(this.form.nome).trim()) return 'Informe o nome.';
    if (!String(this.form.email).trim()) return 'Informe o e-mail.';
    if (!String(this.form.email).includes('@')) return 'E-mail inválido.';
    if (!String(this.form.especialidade).trim()) return 'Informe a especialidade.';
    return null;
  }

  salvar(): void {
    this.erro = '';
    const msg = this.validar();
    if (msg) {
      this.erro = msg;
      return;
    }

    this.carregando = true;

    const payload: any = {
      identificador: String(this.form.identificador).trim(),
      nome: String(this.form.nome).trim(),
      email: String(this.form.email).trim(),
      especialidade: String(this.form.especialidade).trim(),
      subespecialidade: String(this.form.subespecialidade).trim(),
      link_lattes: String(this.form.link_lattes || '').trim(),
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
        'Não encontrei o método de salvar no AvaliadoresExternosService. Crie createAvaliador/updateAvaliador (ou ajuste o nome no modal).';
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

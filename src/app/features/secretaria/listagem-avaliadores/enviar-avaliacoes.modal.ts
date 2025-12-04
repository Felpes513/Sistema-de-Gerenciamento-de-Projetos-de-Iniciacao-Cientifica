import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjetoService } from '@services/projeto.service';
import { AvaliadoresExternosService } from '@services/avaliadores_externos.service';
import { AvaliadorExterno } from '@interfaces/avaliador_externo';

type ProjetoMin = { id: number; titulo: string; has_pdf: boolean };

@Component({
  selector: 'app-enviar-avaliacoes-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enviar-avaliacoes.modal.html',
  styleUrls: ['./enviar-avaliacoes.modal.css'],
})
export class EnviarAvaliacoesModalComponent implements OnInit {
  @Input() avaliadores: AvaliadorExterno[] = [];
  @Output() closed = new EventEmitter<boolean>(); // true = recarregar

  carregando = false;
  erro: string | null = null;
  sucesso: string | null = null;

  projetos: ProjetoMin[] = [];
  projetoSelecionadoId: number | null = null;

  // seleção por e-mail (1..5)
  emailsSelecionados = new Set<string>();

  // texto opcional
  assunto = '';
  mensagem = '';

  constructor(
    private projService: ProjetoService,
    private avaliadoresService: AvaliadoresExternosService
  ) {}

  ngOnInit(): void {
    this.carregando = true;
    this.projService.listarProjetosComPdf().subscribe({
      next: (rows: ProjetoMin[]) => {
        // mostra só os que já têm PDF
        this.projetos = (rows || []).filter((p) => p.has_pdf);
        this.carregando = false;
      },
      error: (e: any) => {
        this.erro = e?.message || 'Falha ao carregar projetos';
        this.carregando = false;
      },
    });
  }

  fechar(ok = false) {
    this.closed.emit(ok);
  }

  toggleEmail(email: string, checked: boolean) {
    if (checked) this.emailsSelecionados.add(email);
    else this.emailsSelecionados.delete(email);
  }

  onToggle(ev: Event, email: string) {
    const checked = (ev.target as HTMLInputElement)?.checked ?? false;
    this.toggleEmail(email, checked);
  }

  get podeEnviar(): boolean {
    return (
      !!this.projetoSelecionadoId &&
      this.emailsSelecionados.size >= 1 &&
      this.emailsSelecionados.size <= 5 &&
      !this.carregando
    );
  }

  enviar() {
    this.erro = null;
    this.sucesso = null;

    if (!this.projetoSelecionadoId) {
      this.erro = 'Selecione um projeto com PDF.';
      return;
    }
    const destinatarios = Array.from(this.emailsSelecionados);
    if (destinatarios.length < 1 || destinatarios.length > 5) {
      this.erro = 'Escolha entre 1 e 5 avaliadores.';
      return;
    }

    this.carregando = true;
    this.avaliadoresService
      .enviarProjetoParaAvaliadores(
        this.projetoSelecionadoId,
        destinatarios,
        this.mensagem?.trim() || undefined,
        this.assunto?.trim() || undefined
      )
      .subscribe({
        next: (res: { mensagem: string }) => {
          this.carregando = false;
          this.sucesso = res?.mensagem || 'Projeto enviado aos avaliadores.';
          setTimeout(() => this.fechar(true), 1200);
        },
        error: (e: any) => {
          this.carregando = false;
          this.erro =
            e?.message || e?.error?.detail || 'Falha ao enviar e-mail.';
        },
      });
  }
}

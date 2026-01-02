import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AvaliadorExterno } from '@shared/models/avaliador_externo';
import { AvaliadoresExternosService } from '@services/avaliadores_externos.service';
import { SendReviewsComponent } from '../../../../components/modais/send-reviews/send-reviews.component';
import { DialogService } from '@services/dialog.service';
import { ReviewsSendedComponent } from '../../../../components/modais/reviews-sended/reviews-sended.component';

import { CreateEvaluatorModalComponent } from '../../../../components/modais/create-evaluator/create-evaluator.component';

@Component({
  selector: 'app-listagem-avaliadores',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SendReviewsComponent,
    ReviewsSendedComponent,
    CreateEvaluatorModalComponent,
  ],
  templateUrl: './listagem-avaliadores.component.html',
  styleUrls: ['./listagem-avaliadores.component.css'],
})
export class ListagemAvaliadoresComponent implements OnInit {
  avaliadores: AvaliadorExterno[] = [];
  carregando = false;
  erro = '';

  showModal = false;

  selectedAvaliador: AvaliadorExterno | null = null;
  showEnviosModal = false;

  showAvaliadorModal = false;
  avaliadorModalData: AvaliadorExterno | null = null;

  constructor(
    private service: AvaliadoresExternosService,
    private router: Router,
    private dialog: DialogService
  ) {}

  ngOnInit(): void {
    this.carregar();
    if (history.state?.reload) this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';

    this.service.listarAvaliadoresExternos().subscribe({
      next: (lista: AvaliadorExterno[]) => {
        this.avaliadores = (lista || []).map((raw: any) => {
          const tipo = String(
            raw?.tipo_avaliador ??
              raw?.tipoAvaliador ??
              raw?.identificador ??
              ''
          )
            .toUpperCase()
            .trim();

          return {
            id: raw?.id,
            nome: raw?.nome ?? '',
            email: raw?.email ?? '',
            especialidade: raw?.especialidade ?? '',
            subespecialidade: raw?.subespecialidade ?? '',
            link_lattes: raw?.link_lattes ?? raw?.lattes_link ?? '',
            tipo_avaliador:
              tipo === 'INTERNO' || tipo === 'EXTERNO' ? tipo : undefined,
          } as AvaliadorExterno;
        });

        this.carregando = false;
      },
      error: (err: any) => {
        this.erro = err?.message || 'Falha ao carregar avaliadores';
        this.carregando = false;
      },
    });
  }

  getIdentificador(a: AvaliadorExterno): string {
    const tipo = String((a as any)?.tipo_avaliador ?? '')
      .toUpperCase()
      .trim();
    if (tipo === 'INTERNO' || tipo === 'EXTERNO') return tipo;
    return '—';
  }

  private isIdValido(id: any): id is number {
    return typeof id === 'number' && !isNaN(id) && id > 0;
  }

  abrirModal(): void {
    this.showModal = true;
  }

  onModalClosed(reload: boolean): void {
    this.showModal = false;
    if (reload) this.carregar();
  }

  abrirEnvios(a: AvaliadorExterno): void {
    this.selectedAvaliador = a;
    this.showEnviosModal = true;
  }

  onEnviosModalClosed(): void {
    this.showEnviosModal = false;
    this.selectedAvaliador = null;
  }

  abrirNovoAvaliador(): void {
    this.avaliadorModalData = null;
    this.showAvaliadorModal = true;
  }

  abrirEditarModal(a: AvaliadorExterno): void {
    this.avaliadorModalData = a;
    this.showAvaliadorModal = true;
  }

  onAvaliadorModalClosed(reload: boolean): void {
    this.showAvaliadorModal = false;
    this.avaliadorModalData = null;
    if (reload) this.carregar();
  }

  async excluir(id?: number): Promise<void> {
    if (!id) return;

    const confirmar = await this.dialog.confirm(
      'Deseja excluir este avaliador?',
      'Confirmação'
    );
    if (!confirmar) return;

    this.service.deleteAvaliador(id).subscribe({
      next: async () => {
        this.avaliadores = this.avaliadores.filter((av) => av.id !== id);
        await this.dialog.alert('Avaliador excluído com sucesso!', 'Sucesso');
      },
      error: async (err: any) => {
        await this.dialog.alert(
          err?.message || 'Erro ao excluir avaliador',
          'Erro'
        );
      },
    });
  }
}

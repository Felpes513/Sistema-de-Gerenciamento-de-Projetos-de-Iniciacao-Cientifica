import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  faUsers,
  faPlus,
  faEdit,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { AvaliadorExterno } from '@shared/models/avaliador_externo';
import { AvaliadoresExternosService } from '@services/avaliadores_externos.service';
import { EnviarAvaliacoesModalComponent } from '../../../../components/modais/enviar-avaliacoes/enviar-avaliacoes.modal';
import { DialogService } from '@services/dialog.service';
import { EnviosAvaliacoesModalComponent } from '../../../../components/modais/envios-avaliacoes/envios-avaliacoes.modal';

@Component({
  selector: 'app-listagem-avaliadores',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    EnviarAvaliacoesModalComponent,
    EnviosAvaliacoesModalComponent,
  ],
  templateUrl: './listagem-avaliadores.component.html',
  styleUrls: ['./listagem-avaliadores.component.css'],
})
export class ListagemAvaliadoresComponent implements OnInit {
  avaliadores: AvaliadorExterno[] = [];
  carregando = false;
  erro = '';
  showModal = false;

  icUsers = faUsers;
  icPlus = faPlus;
  icEdit = faEdit;
  icTrash = faTrash;

  selectedAvaliador: AvaliadorExterno | null = null;
  showEnviosModal = false;
  avaliadorSelecionado: AvaliadorExterno | null = null;

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
        this.avaliadores = (lista || []).map((a: AvaliadorExterno) => ({
          ...a,
          link_lattes: (a as any).link_lattes ?? (a as any).lattes_link ?? '',
        }));
        this.carregando = false;
      },
      error: (err: any) => {
        this.erro = err?.message || 'Falha ao carregar avaliadores';
        this.carregando = false;
      },
    });
  }

  abrirModal(): void {
    this.showModal = true;
  }

  onModalClosed(reload: boolean): void {
    this.showModal = false;
    if (reload) this.carregar();
  }

  editar(a: AvaliadorExterno): void {
    this.router.navigate(['/secretaria/avaliadores/novo'], {
      state: { avaliador: a },
    });
  }

  abrirEnvios(a: AvaliadorExterno): void {
    this.selectedAvaliador = a;
    this.showEnviosModal = true;
  }

  onEnviosModalClosed(): void {
    this.showEnviosModal = false;
    this.selectedAvaliador = null;
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

// D:\Projetos\Vs code\Sistema-de-Gerenciamento-de-Projetos-de-Iniciacao-Cientifica\src\app\features\secretaria\listagem-avaliadores\listagem-avaliadores.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  faUsers,
  faPlus,
  faEdit,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { AvaliadorExterno } from '@interfaces/avaliador_externo';
import { AvaliadoresExternosService } from '@services/avaliadores_externos.service';
import { EnviarAvaliacoesModalComponent } from './enviar-avaliacoes.modal';
import { DialogService } from '@services/dialog.service';

@Component({
  selector: 'app-listagem-avaliadores',
  standalone: true,
  imports: [CommonModule, RouterModule, EnviarAvaliacoesModalComponent],
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
          // garante compatibilidade com possíveis campos diferentes do back
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

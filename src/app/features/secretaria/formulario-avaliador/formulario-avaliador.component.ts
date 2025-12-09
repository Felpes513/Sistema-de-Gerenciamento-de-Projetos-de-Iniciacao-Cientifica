import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AvaliadorExterno } from '@interfaces/avaliador_externo';
import { AvaliadoresExternosService } from '@services/avaliadores_externos.service';
import { DialogService } from '@services/dialog.service';

@Component({
  selector: 'app-formulario-avaliador',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './formulario-avaliador.component.html',
  styleUrls: ['./formulario-avaliador.component.css'],
})
export class FormularioAvaliadorComponent implements OnInit {
  avaliador: {
    id: number | null;
    nome: string;
    email: string;
    especialidade: string;
    subespecialidade: string;
    link_lattes: string;
  } = {
    id: null,
    nome: '',
    email: '',
    especialidade: '',
    subespecialidade: '',
    link_lattes: '',
  };

  edicao = false;

  constructor(
    private router: Router,
    private avaliadoresService: AvaliadoresExternosService,
    private dialog: DialogService
  ) {}

  ngOnInit(): void {
    const estado = history.state as { avaliador?: AvaliadorExterno };

    if (estado?.avaliador) {
      const a = estado.avaliador;
      this.avaliador = {
        id: a.id ?? null,
        nome: a.nome ?? '',
        email: a.email ?? '',
        especialidade: a.especialidade ?? '',
        subespecialidade: a.subespecialidade ?? '',
        link_lattes: a.link_lattes ?? (a as any).lattes_link ?? '',
      };
      this.edicao = true;
    }
  }

  private navegarParaLista(): void {
    this.router.navigate(['/secretaria/avaliadores'], {
      replaceUrl: true,
      state: { reload: true },
    });
  }

  async salvarAvaliador(): Promise<void> {
    if (!this.avaliador.nome.trim() || !this.avaliador.email.trim()) {
      await this.dialog.alert(
        'Preencha pelo menos Nome e E-mail.',
        'Campos obrigatórios'
      );
      return;
    }

    const payload: AvaliadorExterno = {
      nome: this.avaliador.nome.trim(),
      email: this.avaliador.email.trim(),
      especialidade: this.avaliador.especialidade.trim(),
      subespecialidade: this.avaliador.subespecialidade.trim(),
      link_lattes: this.avaliador.link_lattes.trim(),
    };

    // EDIÇÃO
    if (this.edicao && this.avaliador.id) {
      this.avaliadoresService
        .atualizarAvaliador(this.avaliador.id, payload)
        .subscribe({
          next: async () => {
            await this.dialog.alert(
              'Avaliador atualizado com sucesso!',
              'Sucesso'
            );
            this.navegarParaLista();
          },
          error: async (err: any) => {
            await this.dialog.alert(
              `Erro: ${err?.error?.detail || err?.message || 'Falha ao atualizar'}`,
              'Erro'
            );
          },
        });
      return;
    }

    // CRIAÇÃO
    this.avaliadoresService.criarAvaliador(payload).subscribe({
      next: async () => {
        await this.dialog.alert(
          'Avaliador cadastrado com sucesso!',
          'Sucesso'
        );
        this.navegarParaLista();
      },
      error: async (err: any) => {
        await this.dialog.alert(
          `Erro: ${err?.error?.detail || err?.message || 'Falha ao cadastrar'}`,
          'Erro'
        );
      },
    });
  }
}

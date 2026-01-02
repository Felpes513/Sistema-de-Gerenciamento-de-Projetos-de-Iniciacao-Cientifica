import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { AuthService, Role } from '@services/auth.service';
import { DialogService } from '@services/dialog.service';

type Curso = { id: number; nome: string };
type ProjetoVinculo = {
  numero: string;
  nome: string;
  papel: 'ALUNO' | 'ORIENTADOR' | 'SECRETARIA';
  status: 'INSCRITO' | 'APROVADO' | 'CADASTRADO_FINAL' | 'EM_ANDAMENTO' | 'CONCLUIDO';
};

type PerfilMock = {
  id: number;
  role: Role;
  nome: string;
  email: string;
  cpf: string;
  campus: string;

  cursos: Curso[];
  projetos: ProjetoVinculo[];

  // infos extras (mock)
  telefone?: string;
  createdAt?: string;
  updatedAt?: string;
};

function cloneDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private dialog = inject(DialogService);

  role: Role = 'ALUNO';

  // dados editáveis (mock)
  perfil!: PerfilMock;
  private original!: PerfilMock;

  carregando = false;

  ngOnInit(): void {
    this.role = (this.auth.getRole() ?? 'ALUNO') as Role;

    // ✅ MOCK (substituir futuramente por GET /me)
    const base: PerfilMock = {
      id: 1,
      role: this.role,
      nome:
        this.role === 'SECRETARIA'
          ? 'Secretaria - Usuário Exemplo'
          : this.role === 'ORIENTADOR'
            ? 'Orientador - Usuário Exemplo'
            : 'Aluno - Usuário Exemplo',
      email:
        this.role === 'SECRETARIA'
          ? 'secretaria@uscs.edu.br'
          : this.role === 'ORIENTADOR'
            ? 'orientador@uscs.edu.br'
            : 'aluno@uscs.edu.br',
      cpf: '000.000.000-00',
      campus: 'São Caetano do Sul',

      cursos:
        this.role === 'ALUNO'
          ? [
              { id: 10, nome: 'Ciência da Computação' },
              { id: 11, nome: 'Engenharia de Software' },
            ]
          : [{ id: 99, nome: '—' }],

      projetos: [
        {
          numero: 'P-001',
          nome: 'SGPIC - Sistema de Gerenciamento de IC',
          papel: this.role,
          status: this.role === 'ALUNO' ? 'CADASTRADO_FINAL' : 'EM_ANDAMENTO',
        },
        {
          numero: 'P-014',
          nome: 'Portal de Certificados',
          papel: this.role,
          status: 'EM_ANDAMENTO',
        },
      ],

      telefone: '(11) 90000-0000',
      createdAt: '2025-01-01',
      updatedAt: '2026-01-02',
    };

    this.perfil = cloneDeep(base);
    this.original = cloneDeep(base);
  }

  get roleLabel(): string {
    if (this.role === 'SECRETARIA') return 'Secretaria';
    if (this.role === 'ORIENTADOR') return 'Orientador';
    if (this.role === 'ALUNO') return 'Aluno';
    return 'Usuário';
  }

  get resetPasswordLink(): string {
    if (this.role === 'SECRETARIA') return '/secretaria/reset-password';
    if (this.role === 'ORIENTADOR') return '/orientador/reset-password';
    return '/aluno/reset-password';
  }

  async cancelar(): Promise<void> {
    const alterou =
      JSON.stringify(this.perfil) !== JSON.stringify(this.original);

    if (alterou) {
      const confirmou = await this.dialog.confirm(
        'Você tem alterações não salvas. Deseja descartar?',
        'Cancelar alterações'
      );
      if (!confirmou) return;
    }

    this.perfil = cloneDeep(this.original);
  }

  async atualizar(): Promise<void> {
    // ✅ MOCK: futuramente vira PUT /me
    // validações básicas
    if (!this.perfil.nome?.trim()) {
      await this.dialog.alert('Nome é obrigatório.', 'Atenção');
      return;
    }
    if (!this.perfil.email?.trim()) {
      await this.dialog.alert('E-mail é obrigatório.', 'Atenção');
      return;
    }

    this.carregando = true;

    // simula persistência
    setTimeout(async () => {
      this.carregando = false;

      this.original = cloneDeep(this.perfil);
      await this.dialog.alert(
        'Dados atualizados com sucesso (mock).',
        'Sucesso'
      );
    }, 350);
  }

  async irParaResetSenha(): Promise<void> {
    // opcional: confirmação antes de navegar
    const confirmou = await this.dialog.confirm(
      'Você será direcionado para a tela de redefinição de senha.',
      'Reset de senha'
    );
    if (!confirmou) return;

    this.router.navigateByUrl(this.resetPasswordLink);
  }
}

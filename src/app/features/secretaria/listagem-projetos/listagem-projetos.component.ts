import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  Renderer2,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { Projeto } from '@interfaces/projeto';
import { ProjetoService } from '@services/projeto.service';
import { AuthService } from '@services/auth.service';
import { InscricoesService } from '@services/inscricoes.service';

import { Subject, forkJoin, of } from 'rxjs';
import {
  catchError,
  tap,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-listagem-projetos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './listagem-projetos.component.html',
  styleUrls: ['./listagem-projetos.component.css'],
})
export class ListagemProjetosComponent implements OnInit {
  @ViewChild('topSentinel') topSentinel?: ElementRef<HTMLSpanElement>;

  readonly MAX_ESCOLHIDOS = 4;

  pageSize = 6;
  currentPage = 1;

  projetos: (Projeto & { alunosIds?: number[] })[] = [];
  projetosFiltradosLista: (Projeto & { alunosIds?: number[] })[] = [];

  filtro = '';
  filtroStatus: '' | 'EM_EXECUCAO' | 'CONCLUIDO' = '';

  carregando = false;
  erro: string | null = null;

  inscrevendoId: number | null = null;
  menuAberto: number | null = null;

  isOrientador = false;
  isSecretaria = false;
  isAluno = false;

  cores = ['#007bff', '#28a745', '#ffc107'] as const;

  private inscricoesDoAluno = new Set<number>();
  private filtro$ = new Subject<string>();
  private projetosSelecionadosDoAluno = new Set<number>();

  constructor(
    private projetoService: ProjetoService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private inscricoesService: InscricoesService,
    private renderer: Renderer2,
    private dialog: MatDialog
  ) {}

  private abrirConfirmacao(titulo: string, mensagem: string) {
    return this.dialog
      .open(ConfirmDialogComponent, {
        data: { titulo, mensagem, modo: 'confirm' },
      })
      .afterClosed(); // Observable<boolean>
  }

  private abrirAlerta(titulo: string, mensagem: string) {
    this.dialog.open(ConfirmDialogComponent, {
      data: { titulo, mensagem, modo: 'alert' },
    });
  }

  @HostListener('document:keydown.escape')
  onEscClose() {
    this.menuAberto = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    const el = ev.target as HTMLElement;
    if (!el.closest('.menu-dropdown') && !el.closest('.menu-trigger')) {
      this.menuAberto = null;
    }
  }

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'hide-scrollbars');
    this.pageSize = this.computePageSize();
    this.isOrientador = this.authService.hasRole('ORIENTADOR');
    this.isSecretaria = this.authService.hasRole('SECRETARIA');
    this.isAluno = this.authService.hasRole('ALUNO');

    this.filtro$
      .pipe(debounceTime(120), distinctUntilChanged())
      .subscribe((v) => {
        this.filtro = v ?? '';
        this.atualizarProjetosFiltrados();
      });

    this.atualizarProjetosFiltrados();
    this.carregarProjetos();
    this.carregarInscricoesAluno();
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'hide-scrollbars');
  }

  private computePageSize(): number {
    if (typeof window === 'undefined') return 6;
    const w = window.innerWidth || 1920;
    return w >= 1025 ? 6 : 3;
  }

  @HostListener('window:resize')
  onResize() {
    const newSize = this.computePageSize();
    if (newSize !== this.pageSize) {
      this.pageSize = newSize;
      this.refreshPages();
    }
  }

  trackByFn(index: number, item: Projeto): any {
    return (item as any)?.id ?? index;
  }

  private readonly lowerWords = new Set([
    'de',
    'da',
    'do',
    'das',
    'dos',
    'e',
    'di',
  ]);

  get readonlyMode(): boolean {
    return !this.authService.hasRole('ORIENTADOR');
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil((this.projetosFiltradosLista?.length || 0) / this.pageSize)
    );
  }

  private firstWords(nome: string, n = 2): string {
    if (!nome) return '';
    const parts = nome.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, n).join(' ');
  }

  getOrientadorNomeCurto(projeto: Projeto): string {
    return this.firstWords(this.getOrientadorNome(projeto), 2);
  }

  getNomesAlunos(projeto: any): string[] {
    const arr = Array.isArray(projeto?.nomesAlunos) ? projeto.nomesAlunos : [];
    return arr.map((n: string) => this.firstWords(this.properCase(n), 2));
  }

  get paginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return (this.projetosFiltradosLista || []).slice(
      start,
      start + this.pageSize
    );
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.scrollToTopOfList();
  }

  nextPage() {
    this.setPage(this.currentPage + 1);
  }

  prevPage() {
    this.setPage(this.currentPage - 1);
  }

  private refreshPages() {
    const pages = this.totalPages;
    if (this.currentPage > pages) this.currentPage = pages;
    if (this.currentPage < 1) this.currentPage = 1;

    this.scrollToTopOfList();
  }

  private scrollToTopOfList(): void {
    if (this.topSentinel?.nativeElement) {
      this.topSentinel.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private properCase(value: string): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .split(/\s+/)
      .map((w, i) =>
        i > 0 && this.lowerWords.has(w)
          ? w
          : w.charAt(0).toUpperCase() + w.slice(1)
      )
      .join(' ');
  }

  carregarProjetos(): void {
    this.carregando = true;
    this.erro = null;

    const sucesso = (projetos: any[]) => {
      this.projetos = (projetos ?? []) as any[];
      this.carregando = false;

      this.atualizarProjetosFiltrados();
      this.hidratarSelecionados();
    };

    if (this.isOrientador) {
      this.projetoService.listarProjetosDoOrientador().subscribe({
        next: sucesso,
        error: (e) => this.handleLoadError(e),
      });
      return;
    }

    if (this.isAluno) {
      this.carregando = true;
      this.erro = null;

      this.projetoService.listarProjetosDoAlunoSelecionado(1, 200).subscribe({
        next: (selecionados) => {
          const idsSelecionados = (selecionados || [])
            .map((p: any) => Number(p?.id))
            .filter((n: number) => !!n);

          this.projetosSelecionadosDoAluno = new Set(idsSelecionados);

          if (idsSelecionados.length) {
            sucesso(selecionados as any[]);
            return;
          }

          this.projetosSelecionadosDoAluno.clear();

          this.projetoService.listarProjetos().subscribe({
            next: (projetos) => sucesso(projetos as any[]),
            error: (e) => this.handleLoadError(e),
          });
        },
        error: (e) => this.handleLoadError(e),
      });

      return;
    }

    this.projetoService.listarProjetos().subscribe({
      next: (projetos) => {
        const invalidos = projetos.filter(
          (p) => !(p as any).id || (p as any).id <= 0
        );
        if (invalidos.length)
          console.warn('⚠️ Projetos com ID inválido:', invalidos);
        sucesso(projetos as any[]);
      },
      error: (e) => this.handleLoadError(e),
    });
  }

  private handleLoadError(error: any) {
    if (error.status === 0)
      this.erro = 'Erro de conexão: verifique se a API FastAPI está rodando.';
    else if (error.status === 404)
      this.erro =
        'Endpoint não encontrado: verifique se a rota /projetos está correta.';
    else if (error.status >= 500)
      this.erro = 'Erro interno do servidor: verifique os logs da API FastAPI.';
    else this.erro = error.message || 'Erro desconhecido ao carregar projetos';

    this.carregando = false;
    this.atualizarProjetosFiltrados();
  }

  private hidratarSelecionados() {
    const calls = this.projetos
      .filter((p) => this.isIdValido((p as any).id))
      .map((p) =>
        this.inscricoesService.listarAprovadosDoProjeto((p as any).id).pipe(
          tap((alunos: any[]) => {
            const nomes = (alunos || []).map(
              (a) =>
                a?.nome_completo ||
                a?.nome ||
                a?.aluno?.nome ||
                `Aluno #${a?.id_aluno || a?.id || ''}`
            );
            const ids = (alunos || [])
              .map((a) => Number(a?.id_aluno ?? a?.id ?? a?.aluno?.id ?? 0))
              .filter((n) => !!n);

            (p as any).nomesAlunos = nomes;
            (p as any).alunosIds = ids;
            (p as any).inscritosTotal = nomes.length;
          }),
          catchError(() => of(null))
        )
      );

    if (calls.length) {
      forkJoin(calls).subscribe(() => this.atualizarProjetosFiltrados());
    }
  }

  onFiltroChange(valor: string) {
    this.filtro$.next(valor ?? '');
    this.currentPage = 1;
    this.resetScrollAndFocus();
  }

  private resetScrollAndFocus() {
    try {
      this.topSentinel?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } catch {}
    setTimeout(() => {
      document
        .querySelector<HTMLElement>('.card-grid [data-projeto-card]')
        ?.focus?.();
    }, 0);
  }

  setFiltroStatus(status: '' | 'EM_EXECUCAO' | 'CONCLUIDO') {
    this.filtroStatus = status;
    this.currentPage = 1;
    this.atualizarProjetosFiltrados();
    this.scrollToTopOfList();
  }

  atualizarProjetosFiltrados() {
    const texto = (this.filtro || '').toLowerCase().trim();

    const passaTexto = (p: any) =>
      !texto ||
      (p?.nomeProjeto || '').toLowerCase().includes(texto) ||
      (p?.nomeOrientador || '').toLowerCase().includes(texto) ||
      (p?.campus || '').toLowerCase().includes(texto);

    const passaStatus = (p: any) => {
      if (!this.filtroStatus) return true;

      const concluido = this.isConcluido(p);

      if (this.filtroStatus === 'CONCLUIDO') return concluido;
      return true;
    };

    this.projetosFiltradosLista = (this.projetos || []).filter(
      (p) => passaTexto(p) && passaStatus(p)
    );

    this.refreshPages();
  }

  getQuantidadeAlunos(p: Projeto & { alunosIds?: number[] }): number {
    return (p as any).inscritosTotal ?? (p as any).nomesAlunos?.length ?? 0;
  }

  temAlunos(projeto: Projeto): boolean {
    return ((projeto as any).nomesAlunos?.length ?? 0) > 0;
  }

  getOrientadorNome(projeto: Projeto): string {
    const nome = ((projeto as any)?.nomeOrientador ?? '').trim();
    return nome ? this.properCase(nome) : 'Orientador não informado';
  }

  temOrientador(projeto: Projeto): boolean {
    return this.getOrientadorNome(projeto) !== 'Orientador não informado';
  }

  isLotado(projeto: Projeto): boolean {
    return (
      (this.getQuantidadeAlunos(projeto as any) ?? 0) >= this.MAX_ESCOLHIDOS
    );
  }

  getStatusProjeto(projeto: Projeto): string {
    if (!this.temIdValido(projeto)) return 'erro';
    const escolhidos = this.getQuantidadeAlunos(projeto as any);
    if (escolhidos >= this.MAX_ESCOLHIDOS) return 'lotado';
    if (escolhidos > 0) return 'em-andamento';
    return 'disponivel';
  }

  // ✅ CORRIGIDO: string + .size
  get tituloLista(): string {
    if (this.isOrientador) return 'Meus Projetos';
    if (this.isAluno && this.projetosSelecionadosDoAluno.size > 0)
      return 'Meus Projetos';
    return 'Projetos';
  }

  foiSelecionado(idProjeto: number): boolean {
    return this.projetosSelecionadosDoAluno.has(Number(idProjeto));
  }

  toggleMenu(id: number | null): void {
    this.menuAberto = this.menuAberto === id ? null : id;
  }

  // ... (daqui pra baixo permanece igual ao seu código)
  // ✅ Mantive todo o resto, sem alterar lógica.

  concluirProjeto(id: number): void {
    console.log('✅ concluirProjeto clicado', id);
    if (!this.isSecretaria) return;
    if (!this.isIdValido(id)) {
      this.snackBar.open('ID inválido.', 'Fechar', { duration: 2500 });
      return;
    }

    this.abrirConfirmacao(
      'Concluir projeto',
      'Deseja marcar este projeto como concluído?'
    ).subscribe((confirmado) => {
      if (!confirmado) return;

      const svc: any = this.projetoService as any;
      if (typeof svc.concluirProjeto !== 'function') {
        this.snackBar.open(
          'Endpoint concluirProjeto não implementado.',
          'Fechar',
          { duration: 3500 }
        );
        return;
      }

      svc.concluirProjeto(id).subscribe({
        next: (res: any) => {
          this.menuAberto = null;
          this.snackBar.open(res?.mensagem || 'Projeto concluído.', 'Fechar', {
            duration: 3000,
          });
          this.carregarProjetos();
        },
        error: (e: any) => {
          this.menuAberto = null;
          console.error('Erro concluirProjeto', e);
          this.snackBar.open(
            e?.error?.detail || 'Erro ao concluir projeto.',
            'Fechar',
            { duration: 4000 }
          );
        },
      });
    });
  }

  cancelarProjeto(id: number): void {
    console.log('✅ cancelarProjeto clicado', id);
    if (!this.isSecretaria) return;
    if (!this.isIdValido(id)) {
      this.snackBar.open('ID inválido.', 'Fechar', { duration: 2500 });
      return;
    }

    this.abrirConfirmacao(
      'Cancelar projeto',
      'Tem certeza que deseja cancelar este projeto?'
    ).subscribe((confirmado) => {
      if (!confirmado) return;

      const svc: any = this.projetoService as any;
      if (typeof svc.cancelarProjeto !== 'function') {
        this.snackBar.open(
          'Endpoint cancelarProjeto não implementado.',
          'Fechar',
          { duration: 3500 }
        );
        return;
      }

      svc.cancelarProjeto(id).subscribe({
        next: (res: any) => {
          this.menuAberto = null;
          this.snackBar.open(res?.mensagem || 'Projeto cancelado.', 'Fechar', {
            duration: 3000,
          });
          this.carregarProjetos();
        },
        error: (e: any) => {
          this.menuAberto = null;
          console.error('Erro cancelarProjeto', e);
          this.snackBar.open(
            e?.error?.detail || 'Erro ao cancelar projeto.',
            'Fechar',
            { duration: 4000 }
          );
        },
      });
    });
  }

  tornarAlunosInadimplentes(id: number): void {
    console.log('✅ tornarAlunosInadimplentes clicado', id);
    if (!this.isSecretaria) return;
    if (!this.isIdValido(id)) {
      this.snackBar.open('ID inválido.', 'Fechar', { duration: 2500 });
      return;
    }

    this.abrirConfirmacao(
      'Inadimplência de alunos',
      'Marcar TODOS os alunos do projeto como inadimplentes por 2 anos?'
    ).subscribe((confirmado) => {
      if (!confirmado) return;

      const fn = (this.projetoService as any).tornarAlunosInadimplentes;
      if (typeof fn !== 'function') {
        this.snackBar.open(
          'Endpoint tornarAlunosInadimplentes não implementado.',
          'Fechar',
          { duration: 3500 }
        );
        return;
      }

      fn.call(this.projetoService, id).subscribe({
        next: (res: any) => {
          this.menuAberto = null;
          this.snackBar.open(
            res?.mensagem || 'Alunos marcados como inadimplentes.',
            'Fechar',
            { duration: 3000 }
          );
          this.carregarProjetos();
        },
        error: (e: any) => {
          this.menuAberto = null;
          console.error('Erro tornarAlunosInadimplentes', e);
          this.snackBar.open(
            e?.error?.detail || 'Erro na operação.',
            'Fechar',
            { duration: 4000 }
          );
        },
      });
    });
  }

  tornarOrientadorInadimplente(id: number): void {
    console.log('✅ tornarOrientadorInadimplente clicado', id);
    if (!this.isSecretaria) return;
    if (!this.isIdValido(id)) {
      this.snackBar.open('ID inválido.', 'Fechar', { duration: 2500 });
      return;
    }

    this.abrirConfirmacao(
      'Inadimplência do orientador',
      'Marcar o ORIENTADOR deste projeto como inadimplente por 2 anos?'
    ).subscribe((confirmado) => {
      if (!confirmado) return;

      const fn = (this.projetoService as any).tornarOrientadorInadimplente;
      if (typeof fn !== 'function') {
        this.snackBar.open(
          'Endpoint tornarOrientadorInadimplente não implementado.',
          'Fechar',
          { duration: 3500 }
        );
        return;
      }

      fn.call(this.projetoService, id).subscribe({
        next: (res: any) => {
          this.menuAberto = null;
          this.snackBar.open(
            res?.mensagem || 'Orientador marcado como inadimplente.',
            'Fechar',
            { duration: 3000 }
          );
          this.carregarProjetos();
        },
        error: (e: any) => {
          this.menuAberto = null;
          console.error('Erro tornarOrientadorInadimplente', e);
          this.snackBar.open(
            e?.error?.detail || 'Erro na operação.',
            'Fechar',
            { duration: 4000 }
          );
        },
      });
    });
  }

  tornarTodosInadimplentes(id: number): void {
    console.log('✅ tornarTodosInadimplentes clicado', id);
    if (!this.isSecretaria) return;
    if (!this.isIdValido(id)) {
      this.snackBar.open('ID inválido.', 'Fechar', { duration: 2500 });
      return;
    }

    this.abrirConfirmacao(
      'Inadimplência geral',
      'Marcar ORIENTADOR e ALUNOS como inadimplentes por 2 anos?'
    ).subscribe((confirmado) => {
      if (!confirmado) return;

      const fn = (this.projetoService as any).tornarTodosInadimplentes;
      if (typeof fn !== 'function') {
        this.snackBar.open(
          'Endpoint tornarTodosInadimplentes não implementado.',
          'Fechar',
          { duration: 3500 }
        );
        return;
      }

      fn.call(this.projetoService, id).subscribe({
        next: (res: any) => {
          this.menuAberto = null;
          this.snackBar.open(
            res?.mensagem || 'Todos marcados como inadimplentes.',
            'Fechar',
            { duration: 3000 }
          );
          this.carregarProjetos();
        },
        error: (e: any) => {
          this.menuAberto = null;
          console.error('Erro tornarTodosInadimplentes', e);
          this.snackBar.open(
            e?.error?.detail || 'Erro na operação.',
            'Fechar',
            { duration: 4000 }
          );
        },
      });
    });
  }

  excluirProjeto(projeto: Projeto | number): void {
    if (!this.isSecretaria) {
      this.snackBar.open('Ação não permitida.', 'Fechar', { duration: 3000 });
      return;
    }

    let id: number;
    let projetoObj: any | null = null;

    if (typeof projeto === 'number') {
      id = projeto;
      projetoObj = this.projetos.find((p: any) => p.id === id) || null;
    } else {
      id = (projeto as any).id;
      projetoObj = projeto as any;
    }

    if (!this.isIdValido(id)) {
      this.snackBar.open('ID inválido.', 'Fechar', { duration: 3000 });
      return;
    }
    if (!projetoObj) {
      this.snackBar.open('Projeto não encontrado.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    const nomeExibicao = projetoObj.nomeProjeto || 'Desconhecido';

    this.abrirConfirmacao(
      'Excluir projeto',
      `Excluir o projeto "${nomeExibicao}"?\n\nID: ${id}`
    ).subscribe((confirmado) => {
      if (!confirmado) return;

      this.projetoService.excluirProjeto(id).subscribe({
        next: (response) => {
          this.menuAberto = null;
          const mensagem =
            (response as any)?.mensagem ||
            (response as any)?.message ||
            `Projeto ${id} deletado com sucesso`;

          this.carregarProjetos();
          this.abrirAlerta('Projeto excluído', mensagem);
        },
        error: (error) => {
          this.menuAberto = null;
          let mensagemErro = '';
          if (error.status === 0) mensagemErro = 'Erro de conexão';
          else if (error.status === 404)
            mensagemErro = 'Projeto não encontrado';
          else if (error.status === 422) mensagemErro = 'ID inválido';
          else if (error.status >= 500) mensagemErro = 'Erro interno';
          else mensagemErro = error.message || `Erro HTTP ${error.status}`;

          this.snackBar.open(`Erro ao excluir: ${mensagemErro}`, 'Fechar', {
            duration: 4000,
            panelClass: ['snackbar-error'],
          });
        },
      });
    });
  }

  editarProjeto(id: number): void {
    if (!this.isSecretaria) {
      this.snackBar.open('Ação não permitida.', 'Fechar', { duration: 3000 });
      return;
    }
    if (!this.isIdValido(id)) {
      this.snackBar.open('ID inválido', 'Fechar', { duration: 3000 });
      return;
    }
    this.router.navigate(['/secretaria/projetos/editar', id]);
  }

  irParaRelatorio(projeto: Projeto): void {
    const id = (projeto as any)?.id;
    if (!this.isIdValido(id)) {
      this.snackBar.open('Projeto sem ID válido.', 'Fechar', {
        duration: 3000,
      });
      return;
    }
    this.router.navigate(['/orientador/relatorios', id]);
  }

  inscrever(projeto: Projeto & { alunosIds?: number[] }) {
    const id = (projeto as any)?.id;

    if (!this.isAluno) {
      this.snackBar.open(
        'Somente alunos podem se inscrever em projetos.',
        'Fechar',
        { duration: 3000 }
      );
      return;
    }

    if (!this.isIdValido(id)) {
      this.snackBar.open('Projeto sem ID válido.', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    if (this.jaInscrito(id)) {
      this.snackBar.open('Você já se inscreveu neste projeto.', 'Fechar', {
        duration: 2500,
      });
      return;
    }

    this.abrirConfirmacao(
      'Inscrição no projeto',
      `Confirmar inscrição no projeto "${(projeto as any).nomeProjeto}"?`
    ).subscribe((confirmado) => {
      if (!confirmado) return;

      this.inscrevendoId = id;
      this.inscricoesService.inscrever(id).subscribe({
        next: (res) => {
          this.inscrevendoId = null;
          this.marcarInscritoLocal(id);
          this.snackBar.open(
            res?.message || 'Inscrição realizada com sucesso!',
            'Fechar',
            { duration: 3000 }
          );
        },
        error: (e) => {
          this.inscrevendoId = null;
          const msg = e?.error?.detail || e?.message || 'Erro ao inscrever.';
          this.snackBar.open(msg, 'Fechar', { duration: 4000 });
        },
      });
    });
  }

  jaInscrito(idProjeto: number): boolean {
    return (
      this.inscricoesDoAluno.has(idProjeto) ||
      this.projetosSelecionadosDoAluno.has(idProjeto)
    );
  }

  private marcarInscritoLocal(idProjeto: number) {
    this.inscricoesDoAluno.add(idProjeto);
  }

  private carregarInscricoesAluno() {
    if (!this.isAluno) return;

    this.inscricoesService
      .listarMinhasInscricoes()
      .pipe(
        catchError((err) => {
          console.error('Erro ao carregar inscrições do aluno:', err);
          return of([]);
        })
      )
      .subscribe((inscricoes: any[]) => {
        this.inscricoesDoAluno.clear();

        (inscricoes || []).forEach((insc) => {
          const idProjeto = Number(
            insc.id_projeto ??
              insc.projeto_id ??
              insc.projeto?.id ??
              insc.idProjeto
          );
          if (this.isIdValido(idProjeto)) {
            this.inscricoesDoAluno.add(idProjeto);
          }
        });
      });
  }

  podeVerRelatorio(projeto: Projeto & { alunosIds?: number[] }): boolean {
    if (!this.isAluno) return false;
    const meuId = this.getMeuId();
    if (!meuId) return false;
    const ids = (projeto as any).alunosIds as number[] | undefined;
    return Array.isArray(ids) && ids.includes(Number(meuId));
  }

  recarregar(): void {
    this.carregarProjetos();
    this.carregarInscricoesAluno();
  }

  temIdValido(projeto: Projeto): boolean {
    return this.isIdValido((projeto as any).id);
  }

  private isIdValido(id: any): id is number {
    return (
      id !== undefined &&
      id !== null &&
      typeof id === 'number' &&
      !isNaN(id) &&
      id > 0
    );
  }

  private isConcluido(p: any): boolean {
    return Boolean(p?.concluido);
  }

  calcularProgresso(projeto: Projeto): number {
    const escolhidos = this.getQuantidadeAlunos(projeto as any);
    const progresso = (escolhidos / this.MAX_ESCOLHIDOS) * 100;
    return Math.max(0, Math.min(progresso, 100));
  }

  private getMeuId(): number | null {
    try {
      if (typeof (this.authService as any).getUserId === 'function')
        return Number((this.authService as any).getUserId());
      if ((this.authService as any).userId != null)
        return Number((this.authService as any).userId);
    } catch {}
    return null;
  }

  debugProjeto(projeto: Projeto): void {
    console.log('🔍 Debug do projeto:', {
      id: (projeto as any).id,
      nome: (projeto as any).nomeProjeto,
      escolhidos: this.getQuantidadeAlunos(projeto as any),
      alunosIds: (projeto as any).alunosIds,
      podeVerRelatorio: this.podeVerRelatorio(projeto as any),
    });
  }

  debugListaProjetos(): void {
    console.log('🔍 Debug da lista completa:', {
      totalProjetos: this.projetos.length,
      projetos: this.projetos.map((p: any) => ({
        id: p.id,
        nome: p.nomeProjeto,
        escolhidos: this.getQuantidadeAlunos(p),
        alunosIds: p.alunosIds,
      })),
    });
  }
}

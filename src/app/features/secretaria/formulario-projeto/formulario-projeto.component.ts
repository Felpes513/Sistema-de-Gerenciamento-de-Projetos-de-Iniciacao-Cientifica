import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ProjetoService } from '@services/projeto.service';
import { DialogService } from '@services/dialog.service';
import type { ProjetoCadastro } from '@interfaces/projeto';
import type { Orientador } from '@interfaces/orientador';
import type { Aluno } from '@interfaces/aluno';
import type { Campus } from '@interfaces/campus';
import { ListagemAlunosComponent } from '../listagem-alunos/listagem-alunos.component';
import {DocumentoHistorico} from '@interfaces/projeto';
import type { EtapaDocumento, StatusEnvio } from '@interfaces/projeto';


type ProjetoCadastroExt = ProjetoCadastro & {
  tipo_bolsa?: string | null;
  cod_projeto?: string;
  ideia_inicial_b64?: string;
  ideia_inicial_pdf_b64?: string;
};

@Component({
  selector: 'app-formulario-projeto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ListagemAlunosComponent],
  templateUrl: './formulario-projeto.component.html',
  styleUrls: ['./formulario-projeto.component.css'],
})
export class FormularioProjetoComponent implements OnInit {
  viewMode: 'SECRETARIA' | 'ORIENTADOR' | 'ALUNO' = 'SECRETARIA';
  get isReadOnly() {
    return this.viewMode !== 'SECRETARIA';
  }
  get isOrientadorMode() {
    return this.viewMode === 'ORIENTADOR';
  }

  projeto: ProjetoCadastroExt = {
    titulo_projeto: '',
    resumo: '',
    orientador_nome: '',
    orientador_email: '',
    quantidadeMaximaAlunos: 0,
    id_campus: 0,
    tipo_bolsa: null,
    cod_projeto: '',
    ideia_inicial_b64: '',
    ideia_inicial_pdf_b64: '',
  };

  orientadores: Orientador[] = [];
  orientadoresFiltrados: Orientador[] = [];
  buscaOrientador = '';
  emailOrientador = '';
  orientadorSelecionadoId = 0;

  alunosInscritos: Aluno[] = [];

  campusList: Campus[] = [];
  campusFiltrados: Campus[] = [];
  campusSelecionadoId = 0;

  carregando = false;
  erro: string | null = null;
  modoEdicao = false;
  projetoId = 0;

  @ViewChild('docxInput') docxInput!: ElementRef<HTMLInputElement>;
  @ViewChild('pdfInput') pdfInput!: ElementRef<HTMLInputElement>;
  arquivoDocx?: File;
  arquivoPdf?: File;

  currentEtapaUpload: EtapaDocumento = 'PARCIAL';

  podeAvancar = false;

  historico: DocumentoHistorico[] = [
    { etapa: 'IDEIA', status: 'NAO_ENVIADO' },
    { etapa: 'PARCIAL', status: 'NAO_ENVIADO' },
    { etapa: 'FINAL', status: 'NAO_ENVIADO' },
  ];
  private etapas: EtapaDocumento[] = ['IDEIA', 'PARCIAL', 'FINAL'];

  constructor(
    private projetoService: ProjetoService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: DialogService
  ) {}

  ngOnInit(): void {
    this.viewMode = (this.route.snapshot.data['modo'] || 'SECRETARIA')
      .toString()
      .toUpperCase() as any;

    this.carregarOrientadores();
    this.verificarModoEdicao();
    this.carregarCampus();
  }

  private verificarModoEdicao(): void {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      const projetoId = Number(idParam);
      if (!isNaN(projetoId) && projetoId > 0) {
        this.projetoId = projetoId;
        this.modoEdicao = true;
        this.carregarProjeto(projetoId);
      } else {
        this.voltar();
      }
    }
  }

  private carregarProjeto(id: number): void {
    this.carregando = true;
    this.erro = null;

    forkJoin({
      projetos: this.projetoService.listarProjetosRaw(),
      orientadores: this.projetoService.listarOrientadores(),
      campus: this.projetoService.listarCampus(),
    }).subscribe({
      next: ({ projetos, orientadores, campus }) => {
        const p = (projetos || []).find(
          (x: any) =>
            Number(x.id_projeto) === Number(id) || Number(x.id) === Number(id)
        );

        if (!p) {
          this.erro = 'Projeto não encontrado';
          this.carregando = false;
          return;
        }

        this.projeto.titulo_projeto = p.titulo_projeto || p.nomeProjeto || '';
        this.projeto.resumo = p.resumo || '';
        this.projeto.cod_projeto = p.cod_projeto || '';

        const o = (orientadores || []).find(
          (x: any) =>
            (x.nome_completo || '').trim().toLowerCase() ===
            (p.orientador || p.nomeOrientador || '').trim().toLowerCase()
        );
        this.orientadorSelecionadoId = o?.id || 0;
        this.projeto.orientador_nome =
          p.orientador || p.nomeOrientador || o?.nome_completo || '';
        this.emailOrientador = o?.email || '';
        this.projeto.orientador_email = this.emailOrientador;

        const c = (campus || []).find(
          (x: any) =>
            (x.campus || '').trim().toLowerCase() ===
            (p.campus || '').trim().toLowerCase()
        );
        this.campusSelecionadoId = c?.id_campus || 0;
        this.projeto.id_campus = this.campusSelecionadoId;

        const hasIdeiaPdf = !!p.has_ideia_inicial_pdf;
        const hasParcialPdf = !!p.has_mon_parcial_pdf;
        const hasFinalPdf = !!p.has_mon_final_pdf;

        this.historico = [
          {
            etapa: 'IDEIA',
            status: hasIdeiaPdf ? 'ENVIADO' : 'NAO_ENVIADO',
            arquivos: hasIdeiaPdf
              ? { pdf: { nome: 'ideia.pdf' }, docx: { nome: 'ideia.docx' } }
              : undefined,
          },
          {
            etapa: 'PARCIAL',
            status: hasParcialPdf ? 'ENVIADO' : 'NAO_ENVIADO',
            arquivos: hasParcialPdf
              ? {
                  pdf: { nome: 'monografia_parcial.pdf' },
                  docx: { nome: 'monografia_parcial.docx' },
                }
              : undefined,
          },
          {
            etapa: 'FINAL',
            status: hasFinalPdf ? 'ENVIADO' : 'NAO_ENVIADO',
            arquivos: hasFinalPdf
              ? {
                  pdf: { nome: 'monografia_final.pdf' },
                  docx: { nome: 'monografia_final.docx' },
                }
              : undefined,
          },
        ];

        if (hasFinalPdf) {
          this.currentEtapaUpload = 'FINAL';
        } else if (hasParcialPdf) {
          this.currentEtapaUpload = 'FINAL';
        } else {
          this.currentEtapaUpload = 'PARCIAL';
        }

        this.podeAvancar = false;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Falha ao carregar dados do projeto';
        this.carregando = false;
      },
    });
  }

  private carregarOrientadores(): void {
    this.projetoService.listarOrientadoresAprovados().subscribe({
      next: (rows) => {
        this.orientadores = rows ?? [];
        this.orientadoresFiltrados = [...this.orientadores];
      },
      error: () => {
        this.orientadores = this.orientadoresFiltrados = [];
      },
    });
  }

  private carregarCampus(): void {
    this.projetoService.listarCampus().subscribe({
      next: (res: Campus[]) => {
        this.campusList = Array.isArray(res) ? res : [];
        this.campusFiltrados = [...this.campusList];
      },
      error: () => {
        this.erro = 'Erro ao carregar lista de campus';
        this.campusList = [];
        this.campusFiltrados = [];
      },
    });
  }

  filtrarOrientadores(): void {
    const filtro = this.buscaOrientador.toLowerCase().trim();
    this.orientadoresFiltrados = this.orientadores.filter((o) =>
      (o.nome_completo || '').toLowerCase().includes(filtro)
    );
  }

  selecionarOrientador(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    if (!id || isNaN(id)) return;

    this.orientadorSelecionadoId = id;
    const orientador = this.orientadores.find((o) => o.id === id);
    if (orientador) {
      this.projeto.orientador_nome = orientador.nome_completo;
      this.projeto.orientador_email = orientador.email || '';
      this.emailOrientador = orientador.email || '';
    }
  }

  selecionarCampus(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    const campus = this.campusList.find((c) => c.id_campus === id);
    if (campus) {
      this.projeto.id_campus = campus.id_campus;
      this.campusSelecionadoId = campus.id_campus;
    }
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  private async validarFormulario(): Promise<boolean> {
    if (!this.projeto.titulo_projeto?.trim()) {
      await this.dialog.alert(
        'Por favor, informe o título do projeto',
        'Campos obrigatórios'
      );
      return false;
    }
    if (!this.projeto.resumo?.trim()) {
      await this.dialog.alert(
        'Por favor, preencha o resumo do projeto',
        'Campos obrigatórios'
      );
      return false;
    }
    if (
      !this.projeto.orientador_nome?.trim() ||
      !this.orientadorSelecionadoId
    ) {
      await this.dialog.alert(
        'Por favor, selecione um orientador',
        'Campos obrigatórios'
      );
      return false;
    }
    if (!this.projeto.id_campus || this.projeto.id_campus <= 0) {
      await this.dialog.alert(
        'Por favor, selecione um campus',
        'Campos obrigatórios'
      );
      return false;
    }
    return true;
  }

  async salvarProjeto(): Promise<void> {
    if (this.isReadOnly) return;
    if (!(await this.validarFormulario())) return;

    this.carregando = true;
    this.erro = null;

    if (!this.modoEdicao) {
      if (!this.arquivoDocx || !this.arquivoPdf) {
        await this.dialog.alert(
          'Selecione o Documento inicial (.docx) e o PDF para cadastrar o projeto.',
          'Arquivos obrigatórios'
        );
        this.carregando = false;
        return;
      }

      try {
        this.projeto.ideia_inicial_b64 = await this.readFileAsBase64(
          this.arquivoDocx
        );
        this.projeto.ideia_inicial_pdf_b64 = await this.readFileAsBase64(
          this.arquivoPdf
        );
      } catch {
        this.projeto.ideia_inicial_b64 = '';
        this.projeto.ideia_inicial_pdf_b64 = '';
        this.carregando = false;
        await this.dialog.alert(
          'Falha ao ler os arquivos iniciais. Tente selecionar os arquivos novamente.',
          'Erro ao ler arquivos'
        );
        return;
      }
    }

    const operacao = this.modoEdicao
      ? this.projetoService.atualizarProjeto(this.projetoId, this.projeto)
      : this.projetoService.cadastrarProjetoCompleto(
          {
            ...this.projeto,
            cod_projeto: (this.projeto.cod_projeto || '').trim(),
            ideia_inicial_b64: this.projeto.ideia_inicial_b64 || '',
            ideia_inicial_pdf_b64: this.projeto.ideia_inicial_pdf_b64 || '',
          },
          this.orientadorSelecionadoId
        );

    operacao.subscribe({
      next: async () => {
        if (!this.modoEdicao) {
          await this.dialog.alert('Projeto cadastrado com sucesso!', 'Sucesso');
          this.carregando = false;
          this.voltar();
          return;
        } else {
          await this.dialog.alert('Projeto atualizado com sucesso!', 'Sucesso');
        }
        this.carregando = false;
      },
      error: async (error) => {
        this.erro = error?.message || 'Erro ao salvar projeto';
        this.carregando = false;
        await this.dialog.alert(this.erro || 'Erro ao salvar projeto', 'Erro ao salvar projeto');
      },
    });
  }

  async onFileSelected(event: Event, tipo: 'docx' | 'pdf'): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (tipo === 'docx' && file.name.toLowerCase().endsWith('.docx')) {
      this.arquivoDocx = file;
    } else if (tipo === 'pdf' && file.name.toLowerCase().endsWith('.pdf')) {
      this.arquivoPdf = file;
    } else {
      await this.dialog.alert(
        `Formato inválido. Envie um arquivo ${tipo.toUpperCase()}.`,
        'Formato inválido'
      );
    }
  }

  get tituloUploadAtual(): string {
    return this.currentEtapaUpload === 'PARCIAL'
      ? 'Monografia Parcial'
      : this.currentEtapaUpload === 'FINAL'
      ? 'Monografia Final'
      : 'Documento do Projeto';
  }

  get labelBotaoAvancar(): string {
    if (this.currentEtapaUpload === 'PARCIAL') {
      return 'Avançar para Monografia Final';
    }
    if (this.currentEtapaUpload === 'FINAL') {
      return 'Todas as etapas concluídas';
    }
    return 'Avançar';
  }

  async enviarArquivo(tipo: 'docx' | 'pdf'): Promise<void> {
    if (this.isReadOnly) return;
    if (!this.projetoId) {
      await this.dialog.alert(
        'Salve o projeto antes de enviar arquivos.',
        'Projeto não salvo'
      );
      return;
    }

    const arquivo = tipo === 'docx' ? this.arquivoDocx : this.arquivoPdf;
    if (!arquivo) {
      await this.dialog.alert(
        `Selecione um arquivo ${tipo.toUpperCase()} primeiro.`,
        'Arquivo obrigatório'
      );
      return;
    }

    let metodo;

    if (this.currentEtapaUpload === 'PARCIAL') {
      metodo =
        tipo === 'docx'
          ? this.projetoService.uploadMonografiaParcialDocx(
              this.projetoId,
              arquivo
            )
          : this.projetoService.uploadMonografiaParcialPdf(
              this.projetoId,
              arquivo
            );
    } else if (this.currentEtapaUpload === 'FINAL') {
      metodo =
        tipo === 'docx'
          ? this.projetoService.uploadMonografiaFinalDocx(
              this.projetoId,
              arquivo
            )
          : this.projetoService.uploadMonografiaFinalPdf(
              this.projetoId,
              arquivo
            );
    } else {
      await this.dialog.alert(
        'O envio da ideia inicial é feito apenas no cadastro do projeto. Use as etapas de Monografia Parcial e Final para novos uploads.',
        'Etapa inválida'
      );
      return;
    }

    metodo.subscribe({
      next: async () => {
        await this.dialog.alert(
          `${tipo.toUpperCase()} enviado com sucesso!`,
          'Upload concluído'
        );

        if (tipo === 'pdf') {
          this.atualizarHistoricoParaEtapa(
            this.currentEtapaUpload,
            this.arquivoDocx,
            this.arquivoPdf
          );
          this.podeAvancar = this.currentEtapaUpload === 'PARCIAL';
        }
      },
      error: async (err: any) => {
        await this.dialog.alert(
          `Erro ao enviar ${tipo.toUpperCase()}: ${err?.message || err}`,
          'Erro no upload'
        );
      },
    });
  }

  async baixarArquivo(
    tipo: 'docx' | 'pdf',
    etapa?: EtapaDocumento
  ): Promise<void> {
    if (!this.projetoId) {
      await this.dialog.alert('Projeto não identificado.', 'Aviso');
      return;
    }

    const etapaAlvo: EtapaDocumento = etapa || this.currentEtapaUpload;
    let metodo;

    if (etapaAlvo === 'IDEIA') {
      metodo =
        tipo === 'docx'
          ? this.projetoService.downloadDocx(this.projetoId)
          : this.projetoService.downloadPdf(this.projetoId);
    } else if (etapaAlvo === 'PARCIAL') {
      metodo =
        tipo === 'docx'
          ? this.projetoService.downloadMonografiaParcialDocx(this.projetoId)
          : this.projetoService.downloadMonografiaParcialPdf(this.projetoId);
    } else {
      metodo =
        tipo === 'docx'
          ? this.projetoService.downloadMonografiaFinalDocx(this.projetoId)
          : this.projetoService.downloadMonografiaFinalPdf(this.projetoId);
    }

    metodo.subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        let nomeBase =
          etapaAlvo === 'PARCIAL'
            ? 'monografia_parcial'
            : etapaAlvo === 'FINAL'
            ? 'monografia_final'
            : 'projeto';

        a.download = `${nomeBase}_${this.projetoId}.${tipo}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: async (err: any) => {
        await this.dialog.alert(
          `Erro ao baixar ${tipo.toUpperCase()}: ${err.message}`,
          'Erro no download'
        );
      },
    });
  }

  get proximaEtapa(): EtapaDocumento | null {
    for (const e of this.etapas) {
      const h = this.historico.find((x) => x.etapa === e);
      if (!h || h.status === 'NAO_ENVIADO') return e;
    }
    return null;
  }

  async avancarEtapa(): Promise<void> {
    if (this.isReadOnly) return;

    if (this.currentEtapaUpload === 'FINAL') {
      await this.dialog.alert(
        'Todas as etapas já foram concluídas.',
        'Etapas concluídas'
      );
      return;
    }

    if (!this.projetoId) {
      await this.dialog.alert(
        'Salve o projeto antes de avançar etapa.',
        'Projeto não salvo'
      );
      return;
    }

    const histAtual = this.historico.find(
      (h) => h.etapa === this.currentEtapaUpload
    );
    if (!histAtual || histAtual.status !== 'ENVIADO') {
      await this.dialog.alert(
        'Envie o PDF desta etapa antes de avançar.',
        'Envio obrigatório'
      );
      return;
    }

    const proxima: EtapaDocumento = 'FINAL';

    const ok = await this.dialog.confirm(
      `Você deseja avançar para "${this.tituloEtapa(proxima)}"?`,
      'Avançar etapa'
    );
    if (!ok) return;

    this.currentEtapaUpload = proxima;
    this.limparInputsUpload();
    this.podeAvancar = false;

    await this.dialog.alert(
      `Avançou para "${this.tituloEtapa(proxima)}".`,
      'Etapa atualizada'
    );
  }

  private atualizarHistoricoParaEtapa(
    etapa: EtapaDocumento,
    docx?: File,
    pdf?: File
  ) {
    const idx = this.historico.findIndex((h) => h.etapa === etapa);
    const novo: DocumentoHistorico =
      idx >= 0 ? { ...this.historico[idx] } : { etapa, status: 'NAO_ENVIADO' };
    novo.arquivos = novo.arquivos || {};
    if (docx) novo.arquivos.docx = { nome: docx.name };
    if (pdf) novo.arquivos.pdf = { nome: pdf.name };
    if (novo.arquivos.docx || novo.arquivos.pdf) {
      novo.status = 'ENVIADO';
      novo.dataEnvio = new Date();
    }
    if (idx >= 0) this.historico[idx] = novo;
    else this.historico.push(novo);
  }

  private limparInputsUpload() {
    if (this.docxInput?.nativeElement) this.docxInput.nativeElement.value = '';
    if (this.pdfInput?.nativeElement) this.pdfInput.nativeElement.value = '';
    this.arquivoDocx = undefined;
    this.arquivoPdf = undefined;
  }

  tituloEtapa(e: EtapaDocumento): string {
    return e === 'IDEIA'
      ? 'Submissão do Projeto (Ideia)'
      : e === 'PARCIAL'
      ? 'Monografia Parcial'
      : 'Monografia Final';
  }
  subtituloEtapa(e: EtapaDocumento): string {
    return e === 'IDEIA'
      ? 'Primeiro envio'
      : e === 'PARCIAL'
      ? 'Segundo envio'
      : 'Envio final';
  }
  iconeEtapa(e: EtapaDocumento): string {
    return e === 'IDEIA'
      ? 'fas fa-lightbulb'
      : e === 'PARCIAL'
      ? 'fas fa-list'
      : 'fas fa-graduation-cap';
  }

  voltar(): void {
    const base =
      this.viewMode === 'ALUNO'
        ? '/aluno/projetos'
        : this.viewMode === 'ORIENTADOR'
        ? '/orientador/projetos'
        : '/secretaria/projetos';
    this.router.navigate([base]);
  }

  limparFormulario(): void {
    if (this.isReadOnly) return;
    this.projeto = {
      titulo_projeto: '',
      resumo: '',
      orientador_nome: '',
      orientador_email: '',
      quantidadeMaximaAlunos: 0,
      id_campus: 0,
      tipo_bolsa: null,
      cod_projeto: '',
      ideia_inicial_b64: '',
      ideia_inicial_pdf_b64: '',
    };
    this.orientadorSelecionadoId = 0;
    this.emailOrientador = '';
    this.buscaOrientador = '';
    this.orientadoresFiltrados = [...this.orientadores];
    this.alunosInscritos = [];
    this.campusSelecionadoId = 0;
    this.erro = null;
    this.arquivoDocx = undefined;
    this.arquivoPdf = undefined;
    this.podeAvancar = false;
    this.currentEtapaUpload = 'PARCIAL';
    this.historico = [
      { etapa: 'IDEIA', status: 'NAO_ENVIADO' },
      { etapa: 'PARCIAL', status: 'NAO_ENVIADO' },
      { etapa: 'FINAL', status: 'NAO_ENVIADO' },
    ];
  }

  get tituloPagina(): string {
    if (this.viewMode === 'ALUNO') return 'Projeto';
    if (this.viewMode === 'ORIENTADOR') return 'Selecionar alunos do projeto';
    return this.modoEdicao ? 'Editar Projeto' : 'Cadastrar Projeto';
  }

  get textoBotao(): string {
    if (this.viewMode !== 'SECRETARIA') return 'Salvar seleção';
    return this.modoEdicao ? 'Atualizar Projeto' : 'Cadastrar Projeto';
  }
}

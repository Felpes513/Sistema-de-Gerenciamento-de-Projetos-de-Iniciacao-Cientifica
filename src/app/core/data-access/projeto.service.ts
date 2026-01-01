import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';

import { Observable, throwError, of, forkJoin, EMPTY } from 'rxjs';
import { switchMap, map, catchError, expand, reduce } from 'rxjs/operators';

import {
  ProjetoRequest,
  Projeto,
  ProjetoDetalhado,
  ProjetoCadastro,
  ProjetoFormulario,
  UpdateProjetoAlunosDTO,
  ProjetoInscricaoApi,
} from '@shared/models/projeto';

import { Orientador } from '@shared/models/orientador';
import { ApiMensagem } from '@shared/models/api';

import {
  AvaliacaoEnvio,
  AvaliacaoLinkInfo,
  AvaliacaoSalvarDTO,
  ConviteAvaliacaoResponse,
  ProjetoBasico,
} from '@shared/models/avaliacao';

import { environment } from '@environments/environment';

type UploadResultado = {
  tipo: 'docx' | 'pdf';
  ok: boolean;
  mensagem?: string;
};

@Injectable({ providedIn: 'root' })
export class ProjetoService {
  private readonly apiUrl = environment.apiBaseUrl;

  private readonly apiUrlProjetos = `${this.apiUrl}/projetos/`;
  private readonly apiUrlOrientadores = `${this.apiUrl}/orientadores`;
  private readonly apiUrlInscricoes = `${this.apiUrl}/inscricoes`;

  constructor(private http: HttpClient) {}

  private gerarCodProjeto(): string {
    const ano = new Date().getFullYear();
    const suf = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `P-${ano}-${suf}`;
  }

  private stripDataUrl(b64: string): string {
    return (b64 || '').replace(/^data:.*;base64,/, '');
  }

  private extractProjetos(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.projetos)) return res.projetos;
    if (Array.isArray(res?.items)) return res.items;
    return [];
  }

  private listarProjetosRawAll(pageSize = 200): Observable<any[]> {
    const getPage = (page: number) => {
      const params = new HttpParams()
        .set('page', String(page))
        .set('page_size', String(pageSize));

      return this.http
        .get<any>(this.apiUrlProjetos, { params })
        .pipe(catchError(this.handleError));
    };

    return getPage(1).pipe(
      expand((res) => (res?.has_next ? getPage((res?.page || 1) + 1) : EMPTY)),
      map((res) => this.extractProjetos(res)),
      reduce((acc, items) => acc.concat(items), [] as any[])
    );
  }

  cadastrarProjetoCompleto(
    projeto: ProjetoCadastro & {
      cod_projeto?: string;
      ideia_inicial_b64?: string;
      ideia_inicial_pdf_b64?: string;
    },
    id_orientador: number
  ): Observable<any> {
    if (projeto.id_campus == null) {
      return throwError(() => ({
        message: 'id_campus é obrigatório para cadastrar o projeto.',
        status: 422,
      }));
    }

    const cod = (projeto.cod_projeto || '').trim() || this.gerarCodProjeto();

    const ideiaDocxCrua = this.stripDataUrl(projeto.ideia_inicial_b64 || '');
    const ideiaPdfCrua = this.stripDataUrl(projeto.ideia_inicial_pdf_b64 || '');

    if (!ideiaDocxCrua || !ideiaPdfCrua) {
      return throwError(() => ({
        message:
          'Envie o documento inicial (.docx) e o PDF em Base64 para cadastrar o projeto.',
        status: 422,
      }));
    }

    const payload: ProjetoRequest = {
      titulo_projeto: projeto.titulo_projeto,
      resumo: (projeto.resumo || '').trim(),
      id_orientador,
      id_campus: projeto.id_campus,
      cod_projeto: cod,
      ideia_inicial_b64: ideiaDocxCrua,
      ideia_inicial_pdf_b64: ideiaPdfCrua,
    };

    return this.http
      .post(this.apiUrlProjetos, payload)
      .pipe(catchError(this.handleError));
  }

  listarProjetos(): Observable<Projeto[]> {
    return this.listarProjetosRaw().pipe(
      map((lista) => lista.map((p) => this.normalizarProjeto(p))),
      catchError(this.handleError)
    );
  }

  listarProjetosRaw(): Observable<any[]> {
    return this.listarProjetosRawAll(200);
  }

  listarProjetosDoOrientador(): Observable<Projeto[]> {
    return this.http.get<any>(`${this.apiUrlProjetos}me`).pipe(
      map((res) =>
        this.extractProjetos(res).map((p) => this.normalizarProjeto(p))
      ),
      catchError(this.handleError)
    );
  }

  listarProjetosDoAlunoSelecionado(
    page: number = 1,
    pageSize: number = 200
  ): Observable<Projeto[]> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('page_size', String(pageSize));

    return this.http
      .get<any>(`${this.apiUrlProjetos}aluno/me`, { params })
      .pipe(
        map((res) =>
          this.extractProjetos(res).map((p) => this.normalizarProjeto(p))
        ),
        catchError(this.handleError)
      );
  }

  listarProjetosCancelados(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrlProjetos}cancelados`)
      .pipe(catchError(this.handleError));
  }

  getProjetoPorId(id: number) {
    return this.listarProjetosRaw().pipe(
      map((lista) => {
        const raw = (lista || []).find(
          (p: any) => Number(p.id_projeto ?? p.id) === Number(id)
        );

        if (!raw) throw { status: 404, message: 'Projeto não encontrado' };

        return this.normalizarProjetoDetalhado(raw);
      }),
      catchError(this.handleError)
    );
  }

  getProjetoDetalhado(id: number) {
    return this.http.get<any>(`${this.apiUrlProjetos}${id}/detalhado`).pipe(
      map((p) => this.normalizarProjetoDetalhado(p)),
      catchError(() =>
        this.getProjetoPorId(id).pipe(
          map((p) => this.normalizarProjetoDetalhado(p))
        )
      )
    );
  }

  atualizarProjeto(id: number, formulario: ProjetoFormulario) {
    return this.buscarOrientadorPorNome(formulario.orientador_nome).pipe(
      switchMap((orientador: Orientador) => {
        const fd = new FormData();

        fd.append(
          'titulo_projeto',
          String(formulario.titulo_projeto || '').trim()
        );
        fd.append('resumo', String(formulario.resumo || '').trim());
        fd.append('id_orientador', String(orientador.id));
        fd.append('id_campus', String(formulario.id_campus));

        const cod = (formulario as any).cod_projeto;
        if (cod != null) fd.append('cod_projeto', String(cod));

        const concluido = (formulario as any).concluido;
        if (concluido !== undefined && concluido !== null) {
          fd.append('concluido', String(!!concluido));
        }

        return this.http
          .put(`${this.apiUrlProjetos}${id}`, fd)
          .pipe(catchError(this.handleError));
      })
    );
  }

  concluirProjeto(id: number): Observable<{ mensagem: string }> {
    return this.http
      .put<{ success?: boolean; message?: string }>(
        `${this.apiUrlProjetos}${id}/concluir`,
        {}
      )
      .pipe(
        map((res) => ({
          mensagem: res?.message || 'Projeto concluído com sucesso.',
        })),
        catchError(this.handleError)
      );
  }

  ativarProjeto(idProjeto: number) {
    return this.http
      .put<{ mensagem: string }>(
        `${this.apiUrlProjetos}${idProjeto}/ativar`,
        {}
      )
      .pipe(catchError(this.handleError));
  }

  cancelarProjeto(idProjeto: number) {
    return this.http
      .put<{ mensagem: string }>(
        `${this.apiUrlProjetos}${idProjeto}/cancelar`,
        {}
      )
      .pipe(catchError(this.handleError));
  }

  excluirProjeto(id: number): Observable<ApiMensagem> {
    return this.http
      .delete<ApiMensagem>(`${this.apiUrlProjetos}${id}`)
      .pipe(catchError(this.handleError));
  }

  listarOrientadores(): Observable<Orientador[]> {
    return this.http
      .get<Orientador[]>(`${this.apiUrlOrientadores}/`)
      .pipe(catchError(this.handleError));
  }

  buscarOrientadorPorNome(nome: string): Observable<Orientador> {
    return this.http
      .get<Orientador>(
        `${this.apiUrlOrientadores}/buscar?nome=${encodeURIComponent(nome)}`
      )
      .pipe(catchError(this.handleError));
  }

  listarOrientadoresAprovados(): Observable<Orientador[]> {
    return this.http
      .get<Orientador[]>(`${this.apiUrl}/orientadores/aprovados`)
      .pipe(catchError(this.handleError));
  }

  listarInscricoesPorProjeto(
    idProjeto: number
  ): Observable<ProjetoInscricaoApi[]> {
    return this.http
      .get<any[]>(`${this.apiUrlProjetos}${idProjeto}/inscricoes`)
      .pipe(
        map((items: any[]) => {
          const lista = items || [];

          const seen = new Set<string>();
          const duplicadas: any[] = [];

          for (const i of lista) {
            const idInscricao = i.id_inscricao ?? i.id ?? 0;
            const idAluno = i.aluno?.id ?? i.id_aluno ?? 0;
            const key = `${idInscricao}|${idAluno}`;

            if (seen.has(key))
              duplicadas.push({ idInscricao, idAluno, raw: i });
            else seen.add(key);
          }

          console.log(
            '%c[DEBUG] /projetos/%o/inscricoes',
            'color: #1976d2; font-weight: bold',
            idProjeto,
            {
              totalRecebido: lista.length,
              duplicadas: duplicadas.length,
              detalhesDuplicadas: duplicadas,
            }
          );

          return lista.map(
            (i) =>
              ({
                id_inscricao: i.id_inscricao ?? 0,
                id_aluno: i.aluno?.id ?? i.id_aluno ?? 0,
                aluno: {
                  id: i.aluno?.id ?? i.id_aluno ?? 0,
                  nome: i.aluno?.nome ?? i.nome_aluno ?? '—',
                  email: i.aluno?.email ?? i.email ?? '—',
                  matricula: i.aluno?.matricula ?? i.matricula ?? undefined,
                },
                nome_aluno: i.nome_aluno ?? i.aluno?.nome ?? '—',
                email: i.email ?? i.aluno?.email ?? '—',
                matricula: i.matricula ?? i.cpf ?? '—',
                status: i.status ?? i.status_aluno ?? 'PENDENTE',
                possuiTrabalhoRemunerado: !!(
                  i.possuiTrabalhoRemunerado ?? i.possui_trabalho_remunerado
                ),
                created_at: i.created_at ?? null,
              } as ProjetoInscricaoApi)
          );
        }),
        catchError(this.handleError)
      );
  }

  updateAlunosProjeto(
    dto: UpdateProjetoAlunosDTO
  ): Observable<{ mensagem: string }> {
    const payload = { id_alunos: dto.ids_alunos_aprovados };

    return this.http
      .post<any>(
        `${this.apiUrlProjetos}${dto.id_projeto}/selecionados`,
        payload
      )
      .pipe(
        map((res) => ({
          mensagem:
            res?.mensagem || 'Alunos selecionados atualizados com sucesso',
        })),
        catchError(this.handleError)
      );
  }

  atualizarAprovadosEExcluirRejeitados(
    dto: UpdateProjetoAlunosDTO,
    inscricoesDoProjeto: Array<{ id_inscricao: number; id_aluno: number }>
  ): Observable<{ mensagem: string; excluidos: number[] }> {
    const idsEscolhidos = new Set(dto.ids_alunos_aprovados);
    const rejeitadas = (inscricoesDoProjeto || [])
      .filter((i) => !idsEscolhidos.has(i.id_aluno))
      .map((i) => i.id_inscricao);

    return this.updateAlunosProjeto(dto).pipe(
      switchMap((res) => {
        if (!rejeitadas.length)
          return of({ mensagem: res.mensagem, excluidos: [] });

        return this.http
          .request('DELETE', `${this.apiUrlInscricoes}/_batch`, {
            body: { ids: rejeitadas },
          })
          .pipe(
            map(() => ({ mensagem: res.mensagem, excluidos: rejeitadas })),
            catchError(() =>
              of({ mensagem: res.mensagem, excluidos: rejeitadas })
            )
          );
      })
    );
  }

  aprovarAluno(id: number): Observable<any> {
    return this.http
      .post(`${this.apiUrlInscricoes}/${id}/aprovar`, {})
      .pipe(catchError(this.handleError));
  }

  excluirAluno(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrlInscricoes}/${id}`)
      .pipe(catchError(this.handleError));
  }

  listarAlunosDoProjeto(idProjeto: number): Observable<any[]> {
    return this.http
      .get<{ id_projeto: number; alunos: any[] }>(
        `${this.apiUrlProjetos}${idProjeto}/alunos`
      )
      .pipe(
        map((res) => res.alunos ?? []),
        catchError(this.handleError)
      );
  }

  downloadDocx(idProjeto: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrlProjetos}${idProjeto}/ideia-inicial.docx`,
      {
        responseType: 'blob',
      }
    );
  }

  downloadPdf(idProjeto: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrlProjetos}${idProjeto}/ideia-inicial.pdf`,
      {
        responseType: 'blob',
      }
    );
  }

  private extrairMsgErro(err: any): string {
    return (
      err?.error?.detail ||
      err?.error?.message ||
      err?.message ||
      'Erro no upload'
    );
  }

  uploadDocumentosMonografia(
    idProjeto: number,
    etapa: 'PARCIAL' | 'FINAL',
    arquivos: { docx?: File; pdf?: File }
  ): Observable<UploadResultado[]> {
    const tasks: Observable<UploadResultado>[] = [];

    const base =
      etapa === 'PARCIAL'
        ? `${this.apiUrlProjetos}${idProjeto}/monografia-parcial/`
        : `${this.apiUrlProjetos}${idProjeto}/monografia-final/`;

    const putArquivo = (tipo: 'docx' | 'pdf', file: File) => {
      const formData = new FormData();
      formData.append('arquivo', file);

      return this.http.put(`${base}${tipo}`, formData).pipe(
        map(() => ({ tipo, ok: true } as UploadResultado)),
        catchError((err) =>
          of({ tipo, ok: false, mensagem: this.extrairMsgErro(err) })
        )
      );
    };

    if (arquivos?.docx) tasks.push(putArquivo('docx', arquivos.docx));
    if (arquivos?.pdf) tasks.push(putArquivo('pdf', arquivos.pdf));

    return tasks.length ? forkJoin(tasks) : of([]);
  }

  downloadMonografiaParcialDocx(idProjeto: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrlProjetos}${idProjeto}/monografia-parcial.docx`,
      {
        responseType: 'blob',
      }
    );
  }

  downloadMonografiaParcialPdf(idProjeto: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrlProjetos}${idProjeto}/monografia-parcial.pdf`,
      {
        responseType: 'blob',
      }
    );
  }

  downloadMonografiaFinalDocx(idProjeto: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrlProjetos}${idProjeto}/monografia-final.docx`,
      {
        responseType: 'blob',
      }
    );
  }

  downloadMonografiaFinalPdf(idProjeto: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrlProjetos}${idProjeto}/monografia-final.pdf`,
      {
        responseType: 'blob',
      }
    );
  }

  listarProjetosParaAvaliacao(): Observable<ProjetoBasico[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/avaliacoes/projetos-para-avaliacao`)
      .pipe(
        map((rows: any[]) =>
          (rows || []).map((r) => ({
            id: r.id_projeto,
            titulo: r.titulo || r.nome || 'Projeto',
            pdfUrl: r.pdf_url || r.documento_url || '#',
          }))
        ),
        catchError(this.handleError)
      );
  }

  enviarConvitesDeAvaliacao(payload: {
    envios: AvaliacaoEnvio[];
  }): Observable<ConviteAvaliacaoResponse> {
    return this.http
      .post<ConviteAvaliacaoResponse>(
        `${this.apiUrl}/avaliacoes/convites`,
        payload
      )
      .pipe(catchError(this.handleError));
  }

  obterInfoPorToken(token: string): Observable<AvaliacaoLinkInfo> {
    return this.http
      .get<AvaliacaoLinkInfo>(`${this.apiUrl}/avaliacoes/form/${token}`)
      .pipe(catchError(this.handleError));
  }

  salvarAvaliacaoPorToken(
    token: string,
    dto: AvaliacaoSalvarDTO
  ): Observable<{ mensagem: string }> {
    return this.http
      .post<{ mensagem: string }>(
        `${this.apiUrl}/avaliacoes/form/${token}`,
        dto
      )
      .pipe(catchError(this.handleError));
  }

  listarProjetosComPdf(): Observable<
    Array<{ id: number; titulo: string; has_pdf: boolean }>
  > {
    return this.listarProjetosRaw().pipe(
      map((lista) =>
        (lista || []).map((p: any) => ({
          id: p.id_projeto ?? p.id,
          titulo: p.titulo_projeto || p.nome || 'Projeto',
          has_pdf: !!(
            p.has_mon_final_pdf ||
            p.has_mon_parcial_pdf ||
            p.has_ideia_inicial_pdf
          ),
        }))
      ),
      catchError(this.handleError)
    );
  }

  private normalizarProjeto(dados: any): Projeto {
    return {
      id: dados.id || dados.id_projeto,
      nomeProjeto: dados.nomeProjeto || dados.titulo_projeto || 'Sem título',
      campus: dados.campus || '',
      quantidadeMaximaAlunos: dados.quantidade_alunos || 0,
      nomeOrientador:
        dados.nomeOrientador || dados.orientador || 'Não informado',
      nomesAlunos: dados.nomesAlunos || [],
      concluido: Boolean(dados?.concluido),
      status: dados?.status ?? '',
    };
  }

  private normalizarProjetoDetalhado(dados: any): ProjetoDetalhado {
    return {
      id: dados.id || dados.id_projeto,
      nomeProjeto: dados.nomeProjeto || dados.titulo_projeto || '',
      titulo_projeto: dados.titulo_projeto || dados.nomeProjeto || '',
      resumo: dados.resumo || '',
      campus: dados.campus || '',
      quantidadeMaximaAlunos:
        dados.quantidadeMaximaAlunos ?? dados.quantidade_alunos ?? 0,
      nomeOrientador: dados.nomeOrientador || dados.orientador || '',
      orientador_email: dados.orientador_email || '',
      nomesAlunos: dados.nomesAlunos || [],
      alunos: dados.alunos || [],
      id_orientador: dados.id_orientador || 0,
      id_campus: dados.id_campus || 0,
      data_criacao: dados.data_criacao || '',
      data_atualizacao: dados.data_atualizacao || '',
      concluido: Boolean(dados?.concluido),
      tipo_bolsa: dados.tipo_bolsa ?? null,
      status: dados?.status ?? '',
    };
  }

  private handleError = (error: any): Observable<never> => {
    const status: number = Number(error?.status ?? 0);
    const body = error?.error ?? null;

    let message = 'Erro inesperado';

    if (error instanceof HttpErrorResponse) {
      if (body instanceof ErrorEvent) {
        message = `Erro de rede: ${body.message}`;
      } else if (status === 422 && Array.isArray(body?.detail)) {
        message = body.detail
          .map((d: any) => `${(d.loc || []).join('.')}: ${d.msg}`)
          .join(' | ');
      } else {
        message = body?.detail || error.message || `Erro ${status}`;
      }
    } else {
      message = error?.message || body?.detail || `Erro ${status || ''}`.trim();
    }

    return throwError(() => ({
      message,
      status,
      error: body,
    }));
  };
}

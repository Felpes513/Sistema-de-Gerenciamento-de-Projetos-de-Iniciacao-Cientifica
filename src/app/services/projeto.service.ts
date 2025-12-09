import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import {
  ProjetoRequest,
  Projeto,
  ProjetoDetalhado,
  ProjetoCadastro,
  ProjetoFormulario,
  UpdateProjetoAlunosDTO,
  ProjetoInscricaoApi,
} from '@interfaces/projeto';
import { Orientador } from '@interfaces/orientador';
import { Campus } from '@interfaces/configuracao';
import { ApiMensagem } from '@interfaces/api';
import {
  AvaliacaoEnvio,
  AvaliacaoLinkInfo,
  AvaliacaoSalvarDTO,
  ConviteAvaliacaoResponse,
  ProjetoBasico,
} from '@interfaces/avaliacao';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjetoService {
  private readonly apiUrl = environment.apiBaseUrl;
  private readonly apiUrlProjetos = `${this.apiUrl}/projetos/`;
  private readonly apiUrlOrientadores = `${this.apiUrl}/orientadores`;
  private readonly apiUrlCampus = `${this.apiUrl}/campus`;
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
      }));
    }

    const cod = (projeto.cod_projeto || '').trim() || this.gerarCodProjeto();
    const ideiaDocxCrua = this.stripDataUrl(projeto.ideia_inicial_b64 || '');
    const ideiaPdfCrua = this.stripDataUrl(projeto.ideia_inicial_pdf_b64 || '');

    if (!ideiaDocxCrua || !ideiaPdfCrua) {
      return throwError(() => ({
        message:
          'Envie o documento inicial (.docx) e o PDF em Base64 para cadastrar o projeto.',
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

  private processarDadosECadastrar(
    formulario: ProjetoFormulario
  ): Observable<any> {
    return this.buscarOrientadorPorNome(formulario.orientador_nome).pipe(
      switchMap((orientador: Orientador) => {
        const payload: ProjetoRequest = {
          titulo_projeto: formulario.titulo_projeto,
          resumo: formulario.resumo || '',
          id_orientador: orientador.id,
          id_campus: formulario.id_campus,
          cod_projeto: 'P-' + new Date().getFullYear() + '-TEMP',
          ideia_inicial_b64: '',
          ideia_inicial_pdf_b64: '',
        };
        return this.http
          .post(this.apiUrlProjetos, payload)
          .pipe(catchError(this.handleError));
      })
    );
  }

  private extractProjetos(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.projetos)) return res.projetos;
    if (Array.isArray(res?.items)) return res.items;
    return [];
  }

  listarProjetos(): Observable<Projeto[]> {
    return this.http.get<any>(this.apiUrlProjetos).pipe(
      map((res) =>
        this.extractProjetos(res).map((p) => this.normalizarProjeto(p))
      ),
      catchError(this.handleError)
    );
  }

  updateAlunosProjeto(
    dto: UpdateProjetoAlunosDTO
  ): Observable<{ mensagem: string }> {
    const payload = {
      id_projeto: dto.id_projeto,
      id_alunos: dto.ids_alunos_aprovados,
    };

    return this.http.post<{ mensagem: string }>(
      `${this.apiUrlProjetos}update-alunos`,
      payload
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

  getProjetoPorId(id: number) {
    return this.http.get<any>(this.apiUrlProjetos).pipe(
      map((res) => {
        const lista = this.extractProjetos(res);
        const raw = lista.find(
          (p: any) => Number(p.id_projeto ?? p.id) === Number(id)
        );
        if (!raw) throw { message: 'Projeto não encontrado', status: 404 };
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
        const payload: ProjetoRequest = {
          titulo_projeto: formulario.titulo_projeto,
          resumo: formulario.resumo || '',
          id_orientador: orientador.id,
          id_campus: formulario.id_campus,
          cod_projeto: (formulario as any).cod_projeto,
          ideia_inicial_b64: undefined as any,
          ideia_inicial_pdf_b64: undefined as any,
        };
        Object.keys(payload).forEach(
          (k) => (payload as any)[k] === undefined && delete (payload as any)[k]
        );
        return this.http
          .put(`${this.apiUrlProjetos}${id}`, payload)
          .pipe(catchError(this.handleError));
      })
    );
  }

  listarProjetosRaw() {
    return this.http
      .get<any>(this.apiUrlProjetos)
      .pipe(map((res) => this.extractProjetos(res)));
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

  listarCampus(): Observable<Campus[]> {
    return this.http.get<{ campus: Campus[] }>(`${this.apiUrlCampus}/`).pipe(
      map((res) => res.campus),
      catchError(this.handleError)
    );
  }

  buscarCampusPorNome(nome: string): Observable<Campus> {
    return this.http
      .get<Campus>(
        `${this.apiUrlCampus}/buscar?nome=${encodeURIComponent(nome)}`
      )
      .pipe(catchError(this.handleError));
  }

  criarCampus(nome: string): Observable<Campus> {
    return this.http
      .post<Campus>(`${this.apiUrlCampus}/`, { nome })
      .pipe(catchError(this.handleError));
  }

  listarInscricoesPorProjeto(
    idProjeto: number
  ): Observable<ProjetoInscricaoApi[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/projetos/${idProjeto}/inscricoes`)
      .pipe(
        map((items: any[]) => {
          const lista = items || [];

          // 🔍 DEBUG: detectar duplicatas por (id_inscricao, id_aluno)
          const seen = new Set<string>();
          const duplicadas: any[] = [];

          for (const i of lista) {
            const idInscricao = i.id_inscricao ?? i.id ?? 0;
            const idAluno = i.aluno?.id ?? i.id_aluno ?? 0;
            const key = `${idInscricao}|${idAluno}`;

            if (seen.has(key)) {
              duplicadas.push({ idInscricao, idAluno, raw: i });
            } else {
              seen.add(key);
            }
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

          // mantém o comportamento antigo
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

  listarProjetosDoOrientador() {
    return this.http
      .get<any>(`${this.apiUrlProjetos}me`)
      .pipe(
        map((res) =>
          this.extractProjetos(res).map((p) => this.normalizarProjeto(p))
        )
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
      nomeOrientador: dados.nomeOrientador || '',
      orientador_email: dados.orientador_email || '',
      nomesAlunos: dados.nomesAlunos || [],
      alunos: dados.alunos || [],
      id_orientador: dados.id_orientador || 0,
      id_campus: dados.id_campus || 0,
      data_criacao: dados.data_criacao || '',
      data_atualizacao: dados.data_atualizacao || '',
      status: dados.status || '',
      tipo_bolsa: dados.tipo_bolsa ?? null,
    };
  }

  downloadDocx(idProjeto: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrlProjetos}${idProjeto}/ideia-inicial.docx`,
      { responseType: 'blob' }
    );
  }

  downloadPdf(idProjeto: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrlProjetos}${idProjeto}/ideia-inicial.pdf`,
      { responseType: 'blob' }
    );
  }

  uploadMonografiaParcialDocx(
    idProjeto: number,
    arquivo: File
  ): Observable<any> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http
      .put(
        `${this.apiUrlProjetos}${idProjeto}/monografia-parcial/docx`,
        formData
      )
      .pipe(catchError(this.handleError));
  }

  uploadMonografiaParcialPdf(
    idProjeto: number,
    arquivo: File
  ): Observable<any> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http
      .put(
        `${this.apiUrlProjetos}${idProjeto}/monografia-parcial/pdf`,
        formData
      )
      .pipe(catchError(this.handleError));
  }

  uploadMonografiaFinalDocx(idProjeto: number, arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http
      .put(`${this.apiUrlProjetos}${idProjeto}/monografia-final/docx`, formData)
      .pipe(catchError(this.handleError));
  }

  uploadMonografiaFinalPdf(idProjeto: number, arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http
      .put(`${this.apiUrlProjetos}${idProjeto}/monografia-final/pdf`, formData)
      .pipe(catchError(this.handleError));
  }

  downloadMonografiaParcialDocx(idProjeto: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrlProjetos}${idProjeto}/monografia-parcial.docx`,
      { responseType: 'blob' }
    );
  }

  downloadMonografiaParcialPdf(idProjeto: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrlProjetos}${idProjeto}/monografia-parcial.pdf`,
      { responseType: 'blob' }
    );
  }

  downloadMonografiaFinalDocx(idProjeto: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrlProjetos}${idProjeto}/monografia-final.docx`,
      { responseType: 'blob' }
    );
  }

  downloadMonografiaFinalPdf(idProjeto: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrlProjetos}${idProjeto}/monografia-final.pdf`,
      { responseType: 'blob' }
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
    return this.http.get<any>(this.apiUrlProjetos).pipe(
      map((res) =>
        this.extractProjetos(res).map((p: any) => ({
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

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let message = 'Erro inesperado';
    if (error.error instanceof ErrorEvent) {
      message = `Erro de rede: ${error.error.message}`;
    } else if (error.status === 422 && Array.isArray(error.error?.detail)) {
      message = error.error.detail
        .map((d: any) => `${(d.loc || []).join('.')}: ${d.msg}`)
        .join(' | ');
    } else {
      message = error.error?.detail || `Erro ${error.status}`;
    }
    return throwError(() => ({
      message,
      status: error.status,
      error: error.error,
    }));
  };

  listarOrientadoresAprovados(): Observable<Orientador[]> {
    return this.http.get<Orientador[]>(`${this.apiUrl}/orientadores/aprovados`);
  }

  tornarAlunosInadimplentes(idProjeto: number) {
    return this.http.post<{
      mensagem: string;
      total_inadimplentados: number;
    }>(`${this.apiUrl}/alunos/${idProjeto}/inadimplentar-alunos`, {});
  }

  tornarOrientadorInadimplente(idProjeto: number) {
    return this.http.post<{
      mensagem: string;
      id_orientador: number;
    }>(`${this.apiUrl}/orientadores/${idProjeto}/inadimplentar-orientador`, {});
  }

  tornarTodosInadimplentes(idProjeto: number) {
    return forkJoin({
      alunos: this.tornarAlunosInadimplentes(idProjeto),
      orientador: this.tornarOrientadorInadimplente(idProjeto),
    }).pipe(
      map(({ alunos, orientador }) => ({
        mensagem: 'Alunos e orientador marcados como inadimplentes por 2 anos.',
        detalhes: {
          alunos,
          orientador,
        },
      }))
    );
  }

  cancelarProjeto(idProjeto: number) {
    return this.http.put<{ mensagem: string }>(
      `${this.apiUrl}/projetos/${idProjeto}/cancelar`,
      {}
    );
  }
}

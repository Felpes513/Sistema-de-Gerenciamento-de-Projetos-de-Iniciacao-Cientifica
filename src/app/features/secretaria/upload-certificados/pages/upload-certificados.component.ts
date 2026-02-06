import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog/confirm-dialog.component';
import { CertificadoService } from '@core/data-access/certificados.service';

@Component({
  selector: 'app-upload-certificados',
  standalone: true,
  templateUrl: './upload-certificados.component.html',
  styleUrls: ['./upload-certificados.component.css'],
  imports: [CommonModule, MatIconModule, MatButtonModule],
})
export class UploadCertificadosComponent {
  file: File | null = null;
  loading = false;

  // flags para evitar clique duplo
  baixandoModelo = false;
  baixandoRelatorioAlunos = false;
  baixandoWorkshop = false;
  baixandoCertificados = false;

  constructor(
    private certificadoService: CertificadoService,
    private dialog: MatDialog
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.file = input.files[0];
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.file = event.dataTransfer.files[0];
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  removeFile() {
    this.file = null;
  }

  get fileName(): string | null {
    return this.file ? this.file.name : null;
  }

  private abrirAlerta(titulo: string, mensagem: string) {
    this.dialog.open(ConfirmDialogComponent, {
      data: { titulo, mensagem, modo: 'alert' },
    });
  }

  private extrairFilename(contentDisposition: string, fallback: string): string {
    const cd = contentDisposition || '';
    const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
    const raw = m?.[1] || m?.[2];
    if (!raw) return fallback;

    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  private isXlsxZip(buffer: ArrayBuffer): boolean {
    // XLSX é ZIP -> começa com "PK"
    const b = new Uint8Array(buffer);
    return b.length >= 2 && b[0] === 0x50 && b[1] === 0x4b;
  }

  private baixarXlsx(
    ev: MouseEvent,
    busyKey: 'modelo' | 'alunos' | 'workshop' | 'certificados'
  ) {
    ev.preventDefault();

    const setBusy = (v: boolean) => {
      if (busyKey === 'modelo') this.baixandoModelo = v;
      if (busyKey === 'alunos') this.baixandoRelatorioAlunos = v;
      if (busyKey === 'workshop') this.baixandoWorkshop = v;
      if (busyKey === 'certificados') this.baixandoCertificados = v;
    };

    const isBusy =
      (busyKey === 'modelo' && this.baixandoModelo) ||
      (busyKey === 'alunos' && this.baixandoRelatorioAlunos) ||
      (busyKey === 'workshop' && this.baixandoWorkshop) ||
      (busyKey === 'certificados' && this.baixandoCertificados);

    if (isBusy) return;

    setBusy(true);

    const req =
      busyKey === 'modelo'
        ? this.certificadoService.baixarModeloExcelImportacaoAlunos()
        : busyKey === 'alunos'
        ? this.certificadoService.baixarRelatorioAlunos()
        : busyKey === 'workshop'
        ? this.certificadoService.baixarRelatorioWorkshop()
        : this.certificadoService.baixarCertificadosFinais();

    const fallbackName =
      busyKey === 'modelo'
        ? 'exemplo_importacao.xlsx'
        : busyKey === 'alunos'
        ? 'relatorio_alunos.xlsx'
        : busyKey === 'workshop'
        ? 'relatorio_workshop.xlsx'
        : 'certificados_finais.xlsx';

    req.subscribe({
      next: (res) => {
        const buf = res.body;

        if (!buf || buf.byteLength === 0) {
          setBusy(false);
          this.abrirAlerta('Erro', 'O arquivo retornou vazio.');
          return;
        }

        const contentType = res.headers.get('Content-Type') || '';
        const cd = res.headers.get('Content-Disposition') || '';

        if (!this.isXlsxZip(buf)) {
          const preview = new TextDecoder('utf-8').decode(
            new Uint8Array(buf).slice(0, 350)
          );

          console.error('Download NÃO é XLSX.');
          console.error('Content-Type:', contentType);
          console.error('Content-Disposition:', cd);
          console.error('Preview (início):', preview);

          setBusy(false);
          this.abrirAlerta(
            'Erro',
            'O servidor não retornou um Excel válido. Verifique rota/autenticação.'
          );
          return;
        }

        const filename = this.extrairFilename(cd, fallbackName);

        const blob = new Blob([buf], {
          type:
            contentType ||
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        setTimeout(() => window.URL.revokeObjectURL(url), 250);
        setBusy(false);
      },
      error: (err) => {
        console.error(err);
        setBusy(false);
        this.abrirAlerta('Erro', 'Não foi possível baixar o arquivo.');
      },
    });
  }

  // ====== Downloads (chamam a função genérica) ======
  baixarModeloExcel(ev: MouseEvent) {
    this.baixarXlsx(ev, 'modelo');
  }

  baixarRelatorioAlunos(ev: MouseEvent) {
    this.baixarXlsx(ev, 'alunos');
  }

  baixarRelatorioWorkshop(ev: MouseEvent) {
    this.baixarXlsx(ev, 'workshop');
  }

  baixarCertificadosFinais(ev: MouseEvent) {
    this.baixarXlsx(ev, 'certificados');
  }

  // ====== Upload / envio ======
  onSubmit() {
    if (!this.file) {
      this.abrirAlerta('Arquivo obrigatório', 'Selecione um arquivo para enviar.');
      return;
    }

    this.loading = true;

    this.certificadoService.enviarArquivo(this.file).subscribe({
      next: (res) => {
        const qtd = res?.data?.quantidade_enviada ?? 0;
        const msg =
          res?.message || `E-mails enviados com sucesso. Quantidade enviada: ${qtd}.`;

        this.abrirAlerta('Sucesso', msg);
        this.file = null;
        this.loading = false;
      },
      error: (error) => {
        let msg = 'Erro inesperado ao enviar o arquivo.';

        if (error?.error?.detail) {
          msg = error.error.detail;
        } else if (error?.message) {
          msg = error.message;
        }

        this.abrirAlerta('Erro', msg);
        this.loading = false;
      },
    });
  }
}

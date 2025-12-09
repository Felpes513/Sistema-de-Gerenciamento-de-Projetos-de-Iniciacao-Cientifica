import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from '@services/upload.service';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

import { ConfirmDialogComponent } from '@shared/confirm-dialog/confirm-dialog.component';

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

  constructor(
    private uploadService: UploadService,
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
      data: {
        titulo,
        mensagem,
        modo: 'alert',
      },
    });
  }

  onSubmit() {
    if (!this.file) {
      this.abrirAlerta('Arquivo obrigatório', 'Selecione um arquivo para enviar.');
      return;
    }

    this.loading = true;

    this.uploadService.enviarArquivo(this.file).subscribe({
      next: (res) => {
        const qtd = res?.data?.quantidade_enviada ?? 0;
        const msg =
          res?.message ||
          `E-mails enviados com sucesso. Quantidade enviada: ${qtd}.`;

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

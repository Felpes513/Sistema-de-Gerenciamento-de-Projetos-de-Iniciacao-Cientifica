import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from '@shared/confirm-dialog/confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private dialog: MatDialog) {}

  alert(mensagem: string, titulo = 'Aviso'): Promise<void> {
    return firstValueFrom(
      this.dialog
        .open(ConfirmDialogComponent, {
          width: '500px',
          maxWidth: '90vw',
          panelClass: 'custom-dialog-container',
          data: {
            titulo,
            mensagem,
            modo: 'alert',
          },
          disableClose: false,
          autoFocus: true,
        })
        .afterClosed()
    );
  }

  confirm(mensagem: string, titulo = 'Confirmação'): Promise<boolean> {
    return firstValueFrom(
      this.dialog
        .open(ConfirmDialogComponent, {
          width: '500px',
          maxWidth: '90vw',
          panelClass: 'custom-dialog-container',
          data: {
            titulo,
            mensagem,
            modo: 'confirm',
          },
          disableClose: false,
          autoFocus: true,
        })
        .afterClosed()
    ).then((res) => !!res);
  }
}

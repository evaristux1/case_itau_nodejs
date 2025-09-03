import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeleteDialogData {
  customerName: string;
  customerId: number;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2 mat-dialog-title>Confirmar Exclusão</h2>
      </div>

      <mat-dialog-content class="dialog-content">
        <p class="confirmation-text">
          Tem certeza que deseja excluir o cliente
          <strong>{{ data.customerName }}</strong
          >?
        </p>
        <p class="warning-text">
          <mat-icon class="inline-icon">info</mat-icon>
          Esta ação irá desativar o cliente, mas seus dados serão preservados no
          sistema.
        </p>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-button">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <button
          mat-raised-button
          color="warn"
          (click)="onConfirm()"
          class="confirm-button"
        >
          <mat-icon>delete</mat-icon>
          Excluir Cliente
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        padding: 0;
      }

      .dialog-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem 1.5rem 1rem 1.5rem;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }

      .warning-icon {
        font-size: 1.75rem;
        width: 1.75rem;
        height: 1.75rem;
        color: var(--mat-sys-error);
      }

      h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--mat-sys-on-surface);
      }

      .dialog-content {
        padding: 1.5rem;
      }

      .confirmation-text {
        font-size: 1rem;
        line-height: 1.5;
        margin-bottom: 1rem;
        color: var(--mat-sys-on-surface);

        strong {
          color: var(--mat-sys-primary);
          font-weight: 600;
        }
      }

      .warning-text {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: 0.875rem;
        line-height: 1.4;
        color: var(--mat-sys-on-surface-variant);
        background-color: var(--mat-sys-secondary-container);
        padding: 0.75rem;
        border-radius: 8px;
        margin: 0;
      }

      .inline-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
        margin-top: 0.1rem;
        color: var(--mat-sys-secondary);
        flex-shrink: 0;
      }

      .dialog-actions {
        padding: 1rem 1.5rem 1.5rem 1.5rem;
        gap: 0.75rem;
        border-top: 1px solid var(--mat-sys-outline-variant);
        background-color: var(--mat-sys-surface-container-lowest);
      }

      .cancel-button {
        flex: 1;

        &:hover {
          background-color: var(--mat-sys-surface-container);
        }
      }

      .confirm-button {
        flex: 1;

        &:hover {
          background-color: var(--mat-sys-error);
        }
      }

      button mat-icon {
        font-size: 1.1rem;
        width: 1.1rem;
        height: 1.1rem;
        margin-right: 0.5rem;
      }
    `,
  ],
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close('cancel');
  }

  onConfirm(): void {
    this.dialogRef.close('confirm');
  }
}

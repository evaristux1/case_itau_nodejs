import { CommonModule } from '@angular/common';
import { Component, inject, Inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export type TransactionType = 'deposit' | 'withdraw';

export interface TransactionDialogData {
  customerName: string;
  type: TransactionType;
}

@Component({
  selector: 'app-transaction-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.type === 'deposit' ? 'Depositar' : 'Sacar' }} —
      {{ data.customerName }}
    </h2>

    <form
      [formGroup]="form"
      (ngSubmit)="submit()"
      class="tx-form"
      mat-dialog-content
    >
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Valor</mat-label>
        <input
          matInput
          type="number"
          step="0.01"
          min="0.01"
          formControlName="amount"
          placeholder="Ex.: 150.00"
          autocomplete="off"
          inputmode="decimal"
        />
        <mat-error *ngIf="form.get('amount')?.hasError('required')"
          >Informe o valor</mat-error
        >
        <mat-error *ngIf="form.get('amount')?.hasError('min')"
          >O valor deve ser maior que 0</mat-error
        >
      </mat-form-field>
    </form>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancelar</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid || submitting()"
        (click)="submit()"
      >
        {{ data.type === 'deposit' ? 'Depositar' : 'Sacar' }}
      </button>
    </div>
  `,
  styles: [
    `
      .tx-form {
        margin-top: 0.5rem;
      }
      .w-full {
        width: 100%;
      }
    `,
  ],
})
export class TransactionDialogComponent {
  submitting = signal(false);
  private readonly fb = inject(FormBuilder);
  form: FormGroup = this.fb.group({
    amount: [
      null as unknown as number,
      [Validators.required, Validators.min(0.01)],
    ],
  });

  constructor(
    private ref: MatDialogRef<TransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TransactionDialogData
  ) {}

  close() {
    this.ref.close();
  }

  submit() {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);

    const amount = String(this.form.value.amount);

    this.ref.close({ amount });
  }
}

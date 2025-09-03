import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { BrlFromCentsPipe } from '../../../../shared/pipes/brl-from-cents.pipe';
import { CpfFormatPipe } from '../../../../shared/pipes/cpf-format.pipe';
import { Customer } from '../../models/customer.model';
import { CustomersService } from '../../services/customers.service';
import { ConfirmDeleteDialogComponent } from '../confirm-dialog-delete/confirm-dialog-delete.component';
import {
  TransactionDialogComponent,
  TransactionType,
} from '../transcation-dialog/trasaction-dialog.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    CpfFormatPipe,
    BrlFromCentsPipe,
  ],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss'],
})
export class CustomerListComponent implements OnInit {
  private readonly customersService = inject(CustomersService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly customers = signal<Customer[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isDeletingCustomer = signal<number | null>(null);

  readonly processingDepositId = signal<number | null>(null);
  readonly processingWithdrawId = signal<number | null>(null);
  readonly inactiveCustomersCount = computed(
    () => this.customers().filter((customer) => customer.deletedAt).length
  );

  ngOnInit(): void {
    this.loadCustomers();
  }
  private uuid(): string {
    if ('crypto' in window && (window as any).crypto?.randomUUID) {
      return (window as any).crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  openTransactionDialog(customer: Customer, type: TransactionType): void {
    const dialogRef = this.dialog.open(TransactionDialogComponent, {
      width: '420px',
      disableClose: true,
      data: { customerName: customer.name, type },
    });

    dialogRef.afterClosed().subscribe((result?: { amount: string }) => {
      if (!result?.amount) return;

      const idempotencyKey = this.uuid();
      if (type === 'deposit') {
        this.doDeposit(customer.id, result.amount, idempotencyKey);
      } else {
        this.doWithdraw(customer.id, result.amount, idempotencyKey);
      }
    });
  }

  private doDeposit(customerId: number, amount: string, key: string): void {
    this.processingDepositId.set(customerId);

    this.customersService
      .deposit(customerId, amount, key)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao depositar:', err);
          const msg =
            err?.error?.message || 'Erro ao depositar. Tente novamente.';
          this.showErrorMessage(msg);
          return of(null);
        }),
        finalize(() => this.processingDepositId.set(null))
      )
      .subscribe((res) => {
        if (!res) return;
        this.showSuccessMessage('Depósito realizado com sucesso!');
        this.loadCustomers();
      });
  }

  private doWithdraw(customerId: number, amount: string, key: string): void {
    this.processingWithdrawId.set(customerId);

    this.customersService
      .withdraw(customerId, amount, key)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Erro ao sacar:', err);
          const msg = err?.error?.message || 'Erro ao sacar. Tente novamente.';
          this.showErrorMessage(msg);
          return of(null);
        }),
        finalize(() => this.processingWithdrawId.set(null))
      )
      .subscribe((res) => {
        if (!res) return;
        this.showSuccessMessage('Saque realizado com sucesso!');
        // Mesmo comentário do depósito
        this.loadCustomers();
      });
  }

  // Caso você queira atualizar localmente sem recarregar:
  private updateCustomerBalance(customerId: number, newBalanceCents: number) {
    const updated = this.customers().map((c) =>
      c.id === customerId ? { ...c, balanceCents: newBalanceCents } : c
    );
    this.customers.set(updated);
  }

  private loadCustomers(): void {
    this.isLoading.set(true);

    this.customersService
      .getCustomers()
      .pipe(
        catchError((error) => {
          console.error('Erro ao carregar clientes:', error);
          this.showErrorMessage('Erro ao carregar a lista de clientes');
          return of([]);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (customers) => {
          this.customers.set(customers);
        },
      });
  }

  confirmDelete(customer: Customer): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        customerName: customer.name,
        customerId: customer.id,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.deleteCustomer(customer.id);
      }
    });
  }

  private deleteCustomer(customerId: number): void {
    this.isDeletingCustomer.set(customerId);

    this.customersService
      .deleteCustomer(customerId)
      .pipe(
        catchError((error) => {
          console.error('Erro ao deletar cliente:', error);
          this.showErrorMessage('Erro ao excluir o cliente. Tente novamente.');
          return of(null);
        }),
        finalize(() => this.isDeletingCustomer.set(null))
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.showSuccessMessage('Cliente excluído com sucesso');
          }
          this.loadCustomers();
        },
      });
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      console.warn('Erro ao formatar data:', dateString);
      return 'Data inválida';
    }
  }

  /**
   * Exibe mensagem de sucesso
   */
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 4000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 6000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}

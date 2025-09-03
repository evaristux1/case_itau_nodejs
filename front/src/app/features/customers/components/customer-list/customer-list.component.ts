import { CommonModule } from '@angular/common';
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
import { CpfFormatPipe } from '../../../../shared/pipes/cpf-format.pipe';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { Customer } from '../../models/customer.model';
import { CustomersService } from '../../services/customers.service';
import { ConfirmDeleteDialogComponent } from '../confirm-dialog-delete/confirm-dialog-delete.component';

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
    CurrencyFormatPipe,
    CpfFormatPipe,
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

  readonly inactiveCustomersCount = computed(
    () => this.customers().filter((customer) => customer.deletedAt).length
  );

  ngOnInit(): void {
    this.loadCustomers();
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

  /**
   * Formata uma data para exibição no formato brasileiro
   */
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

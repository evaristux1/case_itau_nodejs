// features/customers/components/customer-list/customer-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { CpfFormatPipe } from '../../../../shared/pipes/cpf-format.pipe';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { Customer } from '../../models/customer.model';
import { CustomersService } from '../../services/customers.service';

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
    CurrencyFormatPipe,
    CpfFormatPipe,
  ],
  template: `
    <div class="customer-list">
      <div class="header">
        <h1>
          <mat-icon>people</mat-icon>
          Clientes
        </h1>
        <mat-chip class="customer-count">
          {{ customers().length }} cliente{{
            customers().length !== 1 ? 's' : ''
          }}
        </mat-chip>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="loading-container">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>Carregando clientes...</p>
      </div>

      <!-- Empty State -->
      <mat-card
        *ngIf="!isLoading() && customers().length === 0"
        class="empty-state"
      >
        <mat-card-content>
          <mat-icon class="empty-icon">people_outline</mat-icon>
          <h2>Nenhum cliente encontrado</h2>
          <p>Começe criando seu primeiro cliente</p>
          <button mat-raised-button color="primary" routerLink="/customers/new">
            <mat-icon>person_add</mat-icon>
            Criar Cliente
          </button>
        </mat-card-content>
      </mat-card>

      <!-- Customers Grid -->
      <div
        *ngIf="!isLoading() && customers().length > 0"
        class="customers-grid"
      >
        <mat-card *ngFor="let customer of customers()" class="customer-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>person</mat-icon>
            <mat-card-title>{{ customer.name }}</mat-card-title>
            <mat-card-subtitle>Cliente #{{ customer.id }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="customer-details">
              <div class="detail-row">
                <mat-icon class="detail-icon">email</mat-icon>
                <span>{{ customer.email }}</span>
              </div>

              <div class="detail-row">
                <mat-icon class="detail-icon">badge</mat-icon>
                <span>{{ customer.document | cpfFormat }}</span>
              </div>

              <div class="detail-row">
                <mat-icon
                  class="detail-icon"
                  [class.positive]="customer.balanceCents > 0"
                  [class.zero]="customer.balanceCents === 0"
                >
                  account_balance_wallet
                </mat-icon>
                <span
                  class="balance"
                  [class.positive]="customer.balanceCents > 0"
                  [class.zero]="customer.balanceCents === 0"
                >
                  {{ customer.balanceCents | currencyFormat }}
                </span>
              </div>

              <div class="detail-row">
                <mat-icon class="detail-icon">schedule</mat-icon>
                <span class="created-date">
                  Criado em {{ formatDate(customer.createdAt) }}
                </span>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions align="end">
            <button mat-button [routerLink]="['/customers', customer.id]">
              <mat-icon>visibility</mat-icon>
              Ver Detalhes
            </button>
            <button
              mat-button
              [routerLink]="['/customers', customer.id, 'edit']"
            >
              <mat-icon>edit</mat-icon>
              Editar
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Floating Action Button -->
      <button
        *ngIf="!isLoading()"
        mat-fab
        color="primary"
        class="fab"
        routerLink="/customers/new"
        aria-label="Novo Cliente"
      >
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .customer-list {
        padding: 1.5rem;
        min-height: calc(100vh - 200px);
        position: relative;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .header h1 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        color: var(--mat-sys-on-surface);
      }

      .header h1 mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
      }

      .customer-count {
        background-color: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        text-align: center;
      }

      .loading-container p {
        margin-top: 1rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .empty-state {
        text-align: center;
        padding: 3rem;
        margin: 2rem auto;
        max-width: 400px;
      }

      .empty-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        color: var(--mat-sys-on-surface-variant);
        margin-bottom: 1rem;
      }

      .empty-state h2 {
        margin: 1rem 0 0.5rem 0;
        color: var(--mat-sys-on-surface);
      }

      .empty-state p {
        color: var(--mat-sys-on-surface-variant);
        margin-bottom: 2rem;
      }

      .customers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
        margin-bottom: 5rem; /* Space for FAB */
      }

      .customer-card {
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .customer-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .customer-details {
        margin-top: 1rem;
      }

      .detail-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
      }

      .detail-row:last-child {
        margin-bottom: 0;
      }

      .detail-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .detail-icon.positive {
        color: var(--mat-sys-primary);
      }

      .detail-icon.zero {
        color: var(--mat-sys-outline);
      }

      .balance {
        font-weight: 500;
      }

      .balance.positive {
        color: var(--mat-sys-primary);
      }

      .balance.zero {
        color: var(--mat-sys-outline);
      }

      .created-date {
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .fab {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 100;
      }

      @media (max-width: 768px) {
        .customer-list {
          padding: 1rem;
        }

        .customers-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .fab {
          bottom: 1rem;
          right: 1rem;
        }
      }
    `,
  ],
})
export class CustomerListComponent implements OnInit {
  private readonly customersService = inject(CustomersService);

  readonly customers = signal<Customer[]>([]);
  readonly isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadCustomers();
  }

  private loadCustomers(): void {
    this.isLoading.set(true);
    this.customersService.getCustomers().subscribe({
      next: (customers) => {
        this.customers.set(customers);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        this.isLoading.set(false);
      },
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }
}

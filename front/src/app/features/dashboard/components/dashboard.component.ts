// features/dashboard/components/dashboard/dashboard.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { CustomersService } from '../../customers/services/customers.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CurrencyFormatPipe,
  ],
  template: `
    <div class="dashboard">
      <h1>Dashboard - Itaú Customer</h1>

      <div class="stats-grid">
        <mat-card class="stats-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">people</mat-icon>
              <div class="stat-info">
                <h3>{{ totalCustomers() }}</h3>
                <p>Total de Clientes</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stats-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">account_balance_wallet</mat-icon>
              <div class="stat-info">
                <h3>{{ totalBalance() | currencyFormat }}</h3>
                <p>Saldo Total</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stats-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">trending_up</mat-icon>
              <div class="stat-info">
                <h3>{{ averageBalance() | currencyFormat }}</h3>
                <p>Saldo Médio</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="quick-actions">
        <h2>Ações Rápidas</h2>
        <div class="actions-grid">
          <mat-card class="action-card" routerLink="/customers">
            <mat-card-content>
              <mat-icon>people</mat-icon>
              <h3>Ver Clientes</h3>
              <p>Visualize todos os clientes cadastrados</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="action-card" routerLink="/customers/new">
            <mat-card-content>
              <mat-icon>person_add</mat-icon>
              <h3>Novo Cliente</h3>
              <p>Cadastre um novo cliente</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        margin-bottom: 2rem;
        color: var(--mat-sys-on-surface);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .stats-card {
        cursor: default;
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .stat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        color: var(--mat-sys-primary);
      }

      .stat-info h3 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--mat-sys-on-surface);
      }

      .stat-info p {
        margin: 0.25rem 0 0 0;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.875rem;
      }

      .quick-actions h2 {
        margin-bottom: 1rem;
        color: var(--mat-sys-on-surface);
      }

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .action-card {
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        text-align: center;
      }

      .action-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .action-card mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        color: var(--mat-sys-primary);
        margin-bottom: 0.5rem;
      }

      .action-card h3 {
        margin: 0.5rem 0;
        color: var(--mat-sys-on-surface);
      }

      .action-card p {
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private readonly customersService = inject(CustomersService);

  readonly totalCustomers = signal<number>(0);
  readonly totalBalance = signal<number>(0);
  readonly averageBalance = signal<number>(0);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.customersService.getCustomers().subscribe({
      next: (customers) => {
        this.totalCustomers.set(customers.length);

        const total = customers.reduce(
          (sum, customer) => sum + customer.balanceCents,
          0
        );
        this.totalBalance.set(total);

        const average = customers.length > 0 ? total / customers.length : 0;
        this.averageBalance.set(average);
      },
      error: (error) =>
        console.error('Erro ao carregar dados do dashboard:', error),
    });
  }
}

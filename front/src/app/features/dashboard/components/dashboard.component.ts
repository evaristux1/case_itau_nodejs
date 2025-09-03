// features/dashboard/components/dashboard.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { AuthService } from '../../auth/services/auth.service';
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
    MatRippleModule,
    CurrencyFormatPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly customersService = inject(CustomersService);
  private readonly authService = inject(AuthService);

  readonly totalCustomers = signal<number>(0);
  readonly totalBalance = signal<number>(0);
  readonly averageBalance = signal<number>(0);
  readonly activeCustomers = signal<number>(0);
  readonly isLoading = signal<boolean>(true);

  // Dados para o gráfico de resumo rápido
  readonly quickStats = signal([
    {
      icon: 'people',
      title: 'Total de Clientes',
      value: 0,
      subtitle: 'clientes cadastrados',
      color: 'primary',
      trend: '+12%',
    },
    {
      icon: 'account_balance_wallet',
      title: 'Saldo Total',
      value: 0,
      subtitle: 'em contas',
      color: 'success',
      trend: '+8.5%',
    },
    {
      icon: 'trending_up',
      title: 'Saldo Médio',
      value: 0,
      subtitle: 'por cliente',
      color: 'info',
      trend: '+5.2%',
    },
    {
      icon: 'verified_user',
      title: 'Clientes Ativos',
      value: 0,
      subtitle: 'com saldo positivo',
      color: 'accent',
      trend: '+15%',
    },
  ]);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    this.customersService.getCustomers().subscribe({
      next: (customers) => {
        const total = customers.reduce(
          (sum, customer) => sum + customer.balanceCents,
          0
        );

        const activeCount = customers.filter((c) => c.balanceCents > 0).length;
        const average = customers.length > 0 ? total / customers.length : 0;

        // Atualiza os signals
        this.totalCustomers.set(customers.length);
        this.totalBalance.set(total);
        this.averageBalance.set(average);
        this.activeCustomers.set(activeCount);

        // Atualiza os stats para os cards
        const updatedStats = this.quickStats().map((stat) => {
          switch (stat.icon) {
            case 'people':
              return { ...stat, value: customers.length };
            case 'account_balance_wallet':
              return { ...stat, value: total };
            case 'trending_up':
              return { ...stat, value: average };
            case 'verified_user':
              return { ...stat, value: activeCount };
            default:
              return stat;
          }
        });

        this.quickStats.set(updatedStats);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar dados do dashboard:', error);
        this.isLoading.set(false);
      },
    });
  }

  getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours();

    if (hours < 12) return 'Bom dia';
    if (hours < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  getUserName(): string {
    const user = this.authService.currentUser();
    const email = user?.email || '';
    return email.split('@')[0] || 'Usuário';
  }

  formatStatValue(stat: any): string {
    if (stat.icon === 'account_balance_wallet' || stat.icon === 'trending_up') {
      return ''; // O pipe será aplicado no template
    }
    return stat.value.toString();
  }
}

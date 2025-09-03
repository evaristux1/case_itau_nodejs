import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CpfFormatPipe } from '../../../../shared/pipes/cpf-format.pipe';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { Customer } from '../../models/customer.model';
import { CustomersService } from '../../services/customers.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyFormatPipe, CpfFormatPipe],
  template: `
    <div class="customer-list">
      <div class="header">
        <h2>Clientes</h2>
        <button class="btn btn-primary" routerLink="/customers/new">
          Novo Cliente
        </button>
      </div>

      <div class="customers-grid">
        <div *ngFor="let customer of customers()" class="customer-card">
          <div class="customer-info">
            <h3>{{ customer.name }}</h3>
            <p><strong>E-mail:</strong> {{ customer.email }}</p>
            <p><strong>CPF:</strong> {{ customer.document | cpfFormat }}</p>
            <p>
              <strong>Saldo:</strong>
              <span class="balance">{{
                customer.balanceCents | currencyFormat
              }}</span>
            </p>
          </div>
          <div class="customer-actions">
            <button
              class="btn btn-outline"
              [routerLink]="['/customers', customer.id]"
            >
              Ver Detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .customer-list {
        padding: 2rem;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .customers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
      }

      .customer-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .customer-info h3 {
        margin: 0 0 1rem 0;
        color: #333;
      }

      .customer-info p {
        margin: 0.5rem 0;
        color: #666;
      }

      .balance {
        color: #28a745;
        font-weight: bold;
      }

      .customer-actions {
        margin-top: 1rem;
        text-align: right;
      }

      .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
      }

      .btn-outline {
        background-color: transparent;
        color: #007bff;
        border: 1px solid #007bff;
      }

      .btn:hover {
        opacity: 0.8;
      }
    `,
  ],
})
export class CustomerListComponent implements OnInit {
  private readonly customersService = inject(CustomersService);

  readonly customers = signal<Customer[]>([]);

  ngOnInit(): void {
    this.loadCustomers();
  }

  private loadCustomers(): void {
    this.customersService.getCustomers().subscribe({
      next: (customers) => this.customers.set(customers),
      error: (error) => console.error('Erro ao carregar clientes:', error),
    });
  }
}

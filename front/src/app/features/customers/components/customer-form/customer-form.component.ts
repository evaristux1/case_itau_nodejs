import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { CreateCustomerDto, Customer } from '../../models/customer.model';
import { CustomersService } from '../../services/customers.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
})
export class CustomerFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly customersService = inject(CustomersService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  readonly isLoading = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly currentCustomer = signal<Customer | null>(null);

  customerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    document: ['', [Validators.required, this.cpfValidator]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId && customerId !== 'new') {
      this.isEditMode.set(true);
      this.customerForm.removeControl('password');
      this.loadCustomer(+customerId);
    }
  }

  private loadCustomer(id: number): void {
    this.isLoading.set(true);
    this.customersService.getCustomer(id).subscribe({
      next: (customer) => {
        this.currentCustomer.set(customer);
        this.customerForm.patchValue({
          name: customer.name,
          email: customer.email,
          document: this.formatCpf(customer.document),
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Erro ao carregar cliente');
        this.goBack();
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
      this.isLoading.set(true);

      const formValue = { ...this.customerForm.value };
      formValue.document = this.cleanCpf(formValue.document);

      if (this.isEditMode()) {
        this.updateCustomer(formValue);
      } else {
        this.createCustomer(formValue);
      }
    }
  }

  private createCustomer(customerData: CreateCustomerDto): void {
    this.customersService.createCustomer(customerData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Cliente criado com sucesso!');
        this.router.navigate(['/customers']);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  private updateCustomer(customerData: Partial<CreateCustomerDto>): void {
    const { password, ...updateData } = customerData;
    const customerId = this.currentCustomer()?.id;

    if (customerId) {
      this.customersService.updateCustomer(customerId, updateData).subscribe({
        next: () => {
          this.notificationService.showSuccess(
            'Cliente atualizado com sucesso!'
          );
          this.router.navigate(['/customers']);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    }
  }

  onCpfInput(event: any): void {
    const value = event.target.value;
    const formattedCpf = this.formatCpf(value);
    this.customerForm
      .get('document')
      ?.setValue(formattedCpf, { emitEvent: false });
  }

  private formatCpf(cpf: string): string {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private cleanCpf(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  private cpfValidator(control: any) {
    const cpf = control.value?.replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) {
      return { invalidCpf: true };
    }
    // Aqui você pode adicionar validação de CPF mais robusta
    return null;
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}

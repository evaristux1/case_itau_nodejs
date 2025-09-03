// features/auth/components/create-account-modal/create-account-modal.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '../../../../core/services/notification.service';
import { CustomersService } from '../../../customers/services/customers.service';

@Component({
  selector: 'app-create-account-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="modal-header">
      <div class="modal-icon-container">
        <mat-icon class="modal-icon">person_add</mat-icon>
      </div>
      <h2 mat-dialog-title>Criar Nova Conta</h2>
      <p class="modal-subtitle">Preencha os dados para criar sua conta</p>
      <button
        mat-icon-button
        class="close-button"
        (click)="close()"
        aria-label="Fechar"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>

    @if (isLoading()) {
    <mat-progress-bar
      mode="indeterminate"
      class="progress-bar"
    ></mat-progress-bar>
    }

    <mat-dialog-content class="modal-content">
      <form [formGroup]="createAccountForm" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Nome completo</mat-label>
            <input
              matInput
              formControlName="name"
              placeholder="Digite seu nome completo"
              autocomplete="name"
            />
            <mat-icon matSuffix>person</mat-icon>
            @if (createAccountForm.get('name')?.hasError('required')) {
            <mat-error>Nome é obrigatório</mat-error>
            } @if (createAccountForm.get('name')?.hasError('minlength')) {
            <mat-error>Nome deve ter pelo menos 2 caracteres</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>E-mail</mat-label>
            <input
              matInput
              type="email"
              formControlName="email"
              placeholder="Digite seu e-mail"
              autocomplete="email"
            />
            <mat-icon matSuffix>email</mat-icon>
            @if (createAccountForm.get('email')?.hasError('required')) {
            <mat-error>E-mail é obrigatório</mat-error>
            } @if (createAccountForm.get('email')?.hasError('email')) {
            <mat-error>E-mail deve ser válido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>CPF</mat-label>
            <input
              matInput
              formControlName="document"
              placeholder="000.000.000-00"
              (input)="onCpfInput($event)"
              maxlength="14"
              autocomplete="off"
            />
            <mat-icon matSuffix>badge</mat-icon>
            @if (createAccountForm.get('document')?.hasError('required')) {
            <mat-error>CPF é obrigatório</mat-error>
            } @if (createAccountForm.get('document')?.hasError('invalidCpf')) {
            <mat-error>CPF deve ser válido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Senha</mat-label>
            <input
              matInput
              [type]="hidePassword() ? 'password' : 'text'"
              formControlName="password"
              placeholder="Digite uma senha"
              autocomplete="new-password"
            />
            <button
              mat-icon-button
              matSuffix
              type="button"
              (click)="togglePasswordVisibility()"
              [attr.aria-label]="
                hidePassword() ? 'Mostrar senha' : 'Esconder senha'
              "
            >
              <mat-icon>{{
                hidePassword() ? 'visibility' : 'visibility_off'
              }}</mat-icon>
            </button>
            @if (createAccountForm.get('password')?.hasError('required')) {
            <mat-error>Senha é obrigatória</mat-error>
            } @if (createAccountForm.get('password')?.hasError('minlength')) {
            <mat-error>Senha deve ter pelo menos 6 caracteres</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="info-card">
          <mat-icon>info</mat-icon>
          <div class="info-text">
            <p><strong>Instruções:</strong></p>
            <ul>
              <li>Use um e-mail válido para receber notificações</li>
              <li>O CPF será usado como documento de identificação</li>
              <li>Senha deve ter no mínimo 6 caracteres</li>
            </ul>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions class="modal-actions">
      <button
        mat-button
        type="button"
        (click)="close()"
        [disabled]="isLoading()"
        class="cancel-button"
      >
        Cancelar
      </button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="createAccountForm.invalid || isLoading()"
        class="submit-button"
      >
        <mat-icon>{{
          isLoading() ? 'hourglass_empty' : 'person_add'
        }}</mat-icon>
        {{ isLoading() ? 'Criando...' : 'Criar Conta' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .modal-header {
        position: relative;
        text-align: center;
        padding: 1.5rem 1.5rem 1rem;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }

      .modal-icon-container {
        margin-bottom: 1rem;
      }

      .modal-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        color: var(--mat-sys-primary);
        background: var(--mat-sys-surface);
        border-radius: 50%;
        padding: 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        color: var(--mat-sys-on-surface-variant);
      }

      h2[mat-dialog-title] {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--mat-sys-on-surface);
      }

      .modal-subtitle {
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.95rem;
      }

      .progress-bar {
        margin: 0;
      }

      .modal-content {
        padding: 1.5rem;
        max-height: 60vh;
        overflow-y: auto;
      }

      .form-grid {
        display: grid;
        gap: 1.25rem;
        margin-bottom: 1.5rem;
      }

      mat-form-field {
        width: 100%;
      }

      .info-card {
        display: flex;
        gap: 0.75rem;
        padding: 1rem;
        background: var(--mat-sys-surface-container);
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 12px;
        color: var(--mat-sys-on-surface-variant);

        mat-icon {
          color: var(--mat-sys-primary);
          margin-top: 0.25rem;
          font-size: 1.25rem;
          width: 1.25rem;
          height: 1.25rem;
        }
      }

      .info-text {
        flex: 1;

        p {
          margin: 0 0 0.5rem 0;
          font-weight: 500;
          color: var(--mat-sys-on-surface);
        }

        ul {
          margin: 0;
          padding-left: 1.25rem;

          li {
            margin-bottom: 0.25rem;
            font-size: 0.875rem;
          }
        }
      }

      .modal-actions {
        padding: 1rem 1.5rem 1.5rem;
        border-top: 1px solid var(--mat-sys-outline-variant);
        background: var(--mat-sys-surface-container-lowest);
        justify-content: flex-end;
        gap: 0.75rem;
      }

      .cancel-button {
        min-width: 100px;
      }

      .submit-button {
        min-width: 140px;
        height: 40px;
        border-radius: 20px;
        font-weight: 500;

        mat-icon {
          margin-right: 0.5rem;
        }
      }

      // Responsividade
      @media (max-width: 480px) {
        .modal-header {
          padding: 1rem;
        }

        .modal-content {
          padding: 1rem;
        }

        .modal-actions {
          padding: 1rem;
          flex-direction: column-reverse;

          button {
            width: 100%;
          }
        }

        .form-grid {
          gap: 1rem;
        }
      }
    `,
  ],
})
export class CreateAccountModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(
    MatDialogRef<CreateAccountModalComponent>
  );
  private readonly customersService = inject(CustomersService);
  private readonly notificationService = inject(NotificationService);

  readonly isLoading = signal(false);
  readonly hidePassword = signal(true);

  createAccountForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    document: ['', [Validators.required, this.cpfValidator]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.createAccountForm.valid) {
      this.isLoading.set(true);

      const formValue = { ...this.createAccountForm.value };
      formValue.document = this.cleanCpf(formValue.document);

      this.customersService.createCustomer(formValue).subscribe({
        next: () => {
          this.dialogRef.close({
            success: true,
            email: formValue.email,
          });
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
    this.createAccountForm
      .get('document')
      ?.setValue(formattedCpf, { emitEvent: false });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  close(): void {
    this.dialogRef.close();
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
    return null;
  }
}

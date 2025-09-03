// features/auth/components/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <h2>Login - Itaú Customer</h2>

        <div class="form-group">
          <label for="email">E-mail</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="form-control"
            [class.is-invalid]="email?.invalid && email?.touched"
          />
          <div
            *ngIf="email?.invalid && email?.touched"
            class="invalid-feedback"
          >
            E-mail é obrigatório e deve ser válido
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          [disabled]="loginForm.invalid || isLoading()"
        >
          {{ isLoading() ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .login-container {
        max-width: 400px;
        margin: 100px auto;
        padding: 2rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .form-group {
        margin-bottom: 1rem;
      }

      .form-control {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      .form-control.is-invalid {
        border-color: #dc3545;
      }

      .invalid-feedback {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .btn {
        width: 100%;
        padding: 0.75rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      h2 {
        text-align: center;
        margin-bottom: 2rem;
        color: #333;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  readonly isLoading = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get email() {
    return this.loginForm.get('email');
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);

      this.authService.login(this.loginForm.value.email).subscribe({
        next: () => {
          this.notificationService.showSuccess('Login realizado com sucesso!');
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.isLoading.set(false);
          // Erro já tratado pelo interceptor
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
    }
  }
}

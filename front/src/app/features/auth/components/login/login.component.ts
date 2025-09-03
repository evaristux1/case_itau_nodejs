// features/auth/components/login/login.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
import { Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
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
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header class="login-header">
          <mat-icon class="login-icon">account_balance</mat-icon>
          <mat-card-title>Itaú Customer</mat-card-title>
          <mat-card-subtitle>Faça login para continuar</mat-card-subtitle>
        </mat-card-header>

        <mat-progress-bar
          *ngIf="isLoading()"
          mode="indeterminate"
        ></mat-progress-bar>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-mail</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="Digite seu e-mail"
                autocomplete="email"
              />
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="email?.hasError('required')">
                E-mail é obrigatório
              </mat-error>
              <mat-error *ngIf="email?.hasError('email')">
                E-mail deve ser válido
              </mat-error>
            </mat-form-field>

            <div class="login-info">
              <mat-icon>info</mat-icon>
              <span>Digite qualquer e-mail válido para fazer login</span>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button
            mat-raised-button
            color="primary"
            type="submit"
            (click)="onSubmit()"
            [disabled]="loginForm.invalid || isLoading()"
            class="login-button"
          >
            <mat-icon *ngIf="!isLoading()">login</mat-icon>
            {{ isLoading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </mat-card-actions>
      </mat-card>

      <div class="app-info">
        <h3>Sistema de Gerenciamento de Clientes</h3>
        <p>Versão 1.0.0 - Desenvolvido para Itaú</p>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      }

      .login-card {
        width: 100%;
        max-width: 400px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .login-header {
        text-align: center;
        padding-bottom: 0;
      }

      .login-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        color: var(--mat-sys-primary);
        margin-bottom: 1rem;
      }

      .login-header mat-card-title {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
      }

      .login-header mat-card-subtitle {
        color: var(--mat-sys-on-surface-variant);
      }

      mat-card-content {
        padding-top: 1rem;
      }

      .full-width {
        width: 100%;
        margin-bottom: 1rem;
      }

      .login-info {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 1rem;
        background-color: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
        border-radius: 8px;
        margin-bottom: 1rem;
        font-size: 0.875rem;
      }

      .login-info mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
        margin-top: -2px;
      }

      .login-button {
        width: 100%;
        height: 48px;
        font-size: 1rem;
      }

      mat-progress-bar {
        margin-bottom: 1rem;
      }

      .app-info {
        text-align: center;
        margin-top: 2rem;
        color: white;
        opacity: 0.9;
      }

      .app-info h3 {
        margin: 0 0 0.5rem 0;
        font-weight: 400;
      }

      .app-info p {
        margin: 0;
        font-size: 0.875rem;
        opacity: 0.8;
      }

      @media (max-width: 480px) {
        .login-container {
          padding: 1rem 0.5rem;
        }

        .login-card {
          max-width: 100%;
        }
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

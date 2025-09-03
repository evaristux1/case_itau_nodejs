// app/app.ts
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { LoadingService } from './core/services/loading.service';
import { AuthService } from './features/auth/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="app-container">
      <!-- Loading Bar Global -->
      <mat-progress-bar
        *ngIf="loadingService.isLoading()"
        mode="indeterminate"
        class="global-loading"
      >
      </mat-progress-bar>

      <!-- Header -->
      <mat-toolbar
        *ngIf="authService.isAuthenticated()"
        color="primary"
        class="app-toolbar"
      >
        <mat-icon class="app-icon">account_balance</mat-icon>
        <span class="app-title">Itaú Customer Management</span>

        <span class="spacer"></span>

        <nav class="nav-buttons">
          <button mat-button routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </button>
          <button mat-button routerLink="/customers">
            <mat-icon>people</mat-icon>
            Clientes
          </button>
        </nav>

        <!-- User Menu -->
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <div class="user-info">
            <span>{{ authService.currentUser()?.email }}</span>
          </div>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            Sair
          </button>
        </mat-menu>
      </mat-toolbar>

      <!-- Main Content -->
      <main
        class="app-main"
        [class.with-toolbar]="authService.isAuthenticated()"
      >
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .global-loading {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
      }

      .app-toolbar {
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .app-icon {
        margin-right: 8px;
      }

      .app-title {
        font-size: 1.25rem;
        font-weight: 500;
      }

      .spacer {
        flex: 1 1 auto;
      }

      .nav-buttons {
        display: flex;
        gap: 8px;
        margin-right: 16px;
      }

      .nav-buttons button {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .user-info {
        padding: 8px 16px;
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
        border-bottom: 1px solid var(--mat-sys-outline-variant);
        margin-bottom: 8px;
      }

      .app-main {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .app-main.with-toolbar {
        padding-top: 0;
      }

      @media (max-width: 768px) {
        .nav-buttons {
          display: none;
        }

        .app-title {
          font-size: 1rem;
        }
      }
    `,
  ],
})
export class App {
  readonly authService = inject(AuthService);
  readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);

  readonly title = signal('Itaú Customer');

  logout(): void {
    this.authService.logout();
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './features/auth/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <header *ngIf="authService.isAuthenticated()" class="app-header">
        <div class="header-content">
          <h1>Itaú Customer Management</h1>
          <nav>
            <a routerLink="/dashboard">Dashboard</a>
            <a routerLink="/customers">Clientes</a>
            <button class="btn-logout" (click)="logout()">Sair</button>
          </nav>
        </div>
      </header>

      <main class="app-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        background-color: #f8f9fa;
      }

      .app-header {
        background-color: white;
        border-bottom: 1px solid #dee2e6;
        padding: 1rem 0;
      }

      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header-content h1 {
        margin: 0;
        color: #333;
      }

      nav {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      nav a {
        text-decoration: none;
        color: #007bff;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      nav a:hover {
        background-color: #f8f9fa;
      }

      .btn-logout {
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
      }

      .btn-logout:hover {
        background-color: #c82333;
      }

      .app-main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem;
      }
    `,
  ],
})
export class AppComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
  }
}

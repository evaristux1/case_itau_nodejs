// features/auth/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { ApiResponse } from '../../../core/models/api-response.model';
import { StorageService } from '../../../core/services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);

  private readonly tokenKey = 'itau_token';

  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _currentUser = signal<any>(null);

  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();

  constructor() {
    this.loadTokenFromStorage();
  }

  login(email: string): Observable<{ access_token: string }> {
    return this.http
      .post<ApiResponse<{ access_token: string }>>(
        `${environment.apiUrl}/auth/token`,
        { email }
      )
      .pipe(
        map((response) => response.data),
        tap((result) => {
          this.storageService.setItem(this.tokenKey, result.access_token);
          this._isAuthenticated.set(true);
          this._currentUser.set({ email });
        })
      );
  }

  logout(): void {
    this.storageService.removeItem(this.tokenKey);
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.storageService.getItem(this.tokenKey);
  }

  private loadTokenFromStorage(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      this._isAuthenticated.set(true);
      // Decodifica payload do JWT para obter dados do usuário
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this._currentUser.set({ email: payload.email });
      } catch {
        this.logout();
      }
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }
  verifyIsAuthenticated(): boolean {
    return this.isAuthenticated();
  }
}

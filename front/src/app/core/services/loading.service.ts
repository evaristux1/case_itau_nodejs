import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly _isLoading = signal<boolean>(false);
  private loadingCount = 0;

  readonly isLoading = this._isLoading.asReadonly();

  show(): void {
    this.loadingCount++;
    this._isLoading.set(true);
  }

  hide(): void {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    if (this.loadingCount === 0) {
      this._isLoading.set(false);
    }
  }

  forceHide(): void {
    this.loadingCount = 0;
    this._isLoading.set(false);
  }
}

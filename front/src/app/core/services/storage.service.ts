import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private isStorageAvailable(): boolean {
    try {
      return typeof Storage !== 'undefined' && localStorage !== null;
    } catch {
      return false;
    }
  }

  setItem(key: string, value: string): void {
    if (this.isStorageAvailable()) {
      sessionStorage.setItem(key, value);
    }
  }

  getItem(key: string): string | null {
    if (this.isStorageAvailable()) {
      return sessionStorage.getItem(key);
    }
    return null;
  }

  removeItem(key: string): void {
    if (this.isStorageAvailable()) {
      sessionStorage.removeItem(key);
    }
  }

  clear(): void {
    if (this.isStorageAvailable()) {
      sessionStorage.clear();
    }
  }
}

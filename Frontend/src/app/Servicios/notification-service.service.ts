import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private defaultConfig = {
    duration: 2500, // 2.5 segundos
    horizontalPosition: 'center' as const,
    verticalPosition: 'top' as const,
  };

  constructor(private snackBar: MatSnackBar) {}

  // Notificación de éxito
  showSuccess(message: string): void {
    this.snackBar.open(message, 'X', {
      ...this.defaultConfig,
      panelClass: ['success'],
    });
  }

  // Notificación de error
  showError(message: string): void {
    this.snackBar.open(message, 'X', {
      ...this.defaultConfig,
      panelClass: ['error'],
    });
  }

  // Notificación genérica
  show(message: string, panelClass: string = ''): void {
    this.snackBar.open(message, '', {
      ...this.defaultConfig,
      panelClass: [panelClass],
    });
  }
}

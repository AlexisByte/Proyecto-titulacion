import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]'); // Obtener roles guardados
    const tokenTimestamp = localStorage.getItem('token_timestamp');

    // Si no hay token, redirigir al login
    if (!token || !tokenTimestamp) {
      this.clearSession();
      return false;
    }

    // Verificar si el token ha expirado (8 horas = 28800000 milisegundos)
    const currentTime = Date.now();
    if (currentTime - Number(tokenTimestamp) > 8 * 60 * 60 * 1000) {
      this.clearSession();
      return false;
    }
    const routeName = route.routeConfig?.path; // Obtener el nombre de la ruta

    // Permitir acceso a la ruta 'roles' sin verificar roles
    if (routeName === 'roles') {
      return true;
    }

    // Verificar si alguno de los roles del usuario coincide con la ruta
    const hasAccess = roles.some((role: any) => role.nombre_rol === routeName);

    if (!hasAccess) {
      this.router.navigate(['']); // Redirigir si no tiene acceso
      return false;
    }

    return true;
  }

  private clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
    localStorage.removeItem('token_timestamp');
    this.router.navigate(['/']); // Redirigir al login
  }

  

}

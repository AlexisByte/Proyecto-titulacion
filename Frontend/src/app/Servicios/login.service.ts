import { Injectable, Injector, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, tap, map } from 'rxjs/operators';
import { UserServiceService } from '../Servicios/API/user-service.service';
import { API_CONFIG } from '../../config/api -config';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private http = inject(HttpClient);
  private injector = inject(Injector);

  private apiUrl = `${API_CONFIG.BASE_URL}/api`;

  private userService!: UserServiceService;

  // 🔥 BehaviorSubject para actualización dinámica del usuario
  private usuarioSubject = new BehaviorSubject<any>(this.getUserLocal());
  usuario$ = this.usuarioSubject.asObservable();

  constructor() {}

  /** -----------------------------------------------------------
   * Obtiene instancia del UserService sin crear dependencia circular
   * ------------------------------------------------------------*/
  private getUserService(): UserServiceService {
    if (!this.userService) {
      this.userService = this.injector.get(UserServiceService);
    }
    return this.userService;
  }

  /** ----------------------------- */
  /**            LOGIN              */
  /** ----------------------------- */
  login(email: string, contrasena: string): Observable<any> {
    const body = { email, contrasena };

    return this.http.post<any>(`${this.apiUrl}/login`, body, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token || '');
        localStorage.setItem('token_timestamp', Date.now().toString());
        localStorage.setItem('user', response.usuario ? JSON.stringify(response.usuario) : '{}');

        // 🔥 actualizar usuario en vivo
        this.usuarioSubject.next(response.usuario);
      }),
      switchMap(response => {

        if (response.roles && response.roles.length > 0) {
          return this.getRolesByIds(response.roles).pipe(
            map(roles => {
              localStorage.setItem('roles', JSON.stringify(roles));
              return { ...response, roles };
            }),
            catchError(() => {
              localStorage.setItem('roles', '[]');
              return of(response);
            })
          );
        }

        localStorage.setItem('roles', '[]');
        return of(response);
      }),
      catchError(error => this.handleError(error))
    );
  }

  /** ----------------------------- */
  /**       MANEJO DE ERRORES       */
  /** ----------------------------- */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error inesperado.';

    if (error.status === 404) {
      errorMessage = 'Usuario no encontrado.';
    } else if (error.status === 401) {
      errorMessage = 'Credenciales incorrectas.';
    } else if (error.status === 500) {
      errorMessage = 'Error en el servidor.';
    }

    return throwError(() => new Error(errorMessage));
  }

  /** ----------------------------- */
  /**   Roles por ID (forkJoin)     */
  /** ----------------------------- */
  getRolesByIds(roleIds: number[]): Observable<any[]> {
    const requests = roleIds.map(id =>
      this.http.get<any>(`${this.apiUrl}/roles/${id}`)
    );
    return forkJoin(requests);
  }

  /** ----------------------------- */
  /**            LOGOUT             */
  /** ----------------------------- */
  logout(): Observable<{ message: string }> {
    return new Observable(observer => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('roles');
      localStorage.removeItem('token_timestamp');

      observer.next({ message: 'Cierre de sesión exitoso.' });
      observer.complete();

      setTimeout(() => window.location.href = '/', 500);
    });
  }

  /** ----------------------------- */
  /** Obtener TOKEN                 */
  /** ----------------------------- */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** ----------------------------- */
  /**       USUARIO LOCAL           */
  /** ----------------------------- */
  getUserLocal(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /** ----------------------------- */
  /**  Recargar usuario desde BD    */
  /** ----------------------------- */
  cargarUsuario(): Observable<any> {
    const local = this.getUserLocal();

    if (!local?.id_usuario) return of(null);

    return this.getUserService().obtenerUsuariosId(local.id_usuario).pipe(
      tap(usuarioReal => {
        localStorage.setItem('user', JSON.stringify(usuarioReal));
        this.usuarioSubject.next(usuarioReal);
      })
    );
  }

  /** ----------------------------- */
  /**   Obtener usuario dinámico    */
  /** ----------------------------- */
  getUser(): Observable<any> {
    return this.usuario$;
  }

  /** ----------------------------- */
  /** Recuperar / Cambiar contraseña */
  /** ----------------------------- */
  CambiarContrasena(email: string, currentPassword: string, newPassword: string) {
    return this.http.post<any>(`${this.apiUrl}/cambiar-clave`,
      { email, currentPassword, newPassword },
      { headers: this.getHeaders() }
    );
  }

  RecuperarContrasena(email: string) {
    return this.http.post<any>(`${this.apiUrl}/recuperar-clave`,
      { email },
      { headers: this.getHeaders() }
    );
  }

  RestablecerContrasena(email: string, token: string, newPassword: string) {
    return this.http.post<any>(`${this.apiUrl}/restablecer-clave`,
      { email, token, newPassword },
      { headers: this.getHeaders() }
    );
  }

  /** ----------------------------- */
  /**        Headers JWT            */
  /** ----------------------------- */
  private getHeaders() {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

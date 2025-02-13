import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { catchError, switchMap, tap, map } from 'rxjs/operators';
import { UserServiceService } from '../Servicios/API/user-service.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = "http://localhost:5000/api";
  private userService!: UserServiceService;

  constructor(
    private http: HttpClient,
    private injector: Injector
  ) {}

  private getUserService(): UserServiceService {
    if (!this.userService) {
      this.userService = this.injector.get(UserServiceService); // ✅ Se obtiene solo cuando es necesario
    }
    return this.userService;
  }

  // Método de login
  login(email: string, contrasena: string): Observable<any> {
    const body = { email, contrasena };

    return this.http.post<any>(`${this.apiUrl}/login`, body, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      tap(response => {
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', response.token || '');
        localStorage.setItem('token_timestamp', Date.now().toString()); // Guardar timestamp
        localStorage.setItem('user', response.usuario ? JSON.stringify(response.usuario) : '{}');
      }),
      switchMap(response => {
        // Si hay roles, buscar los detalles
        if (response.roles && response.roles.length > 0) {
          return this.getRolesByIds(response.roles).pipe(
            map(roles => {
              localStorage.setItem('roles', JSON.stringify(roles));
              return { ...response, roles }; // Retornar la respuesta completa con roles detallados
            }),
            catchError(error => {
              console.error('Error obteniendo roles:', error);
              localStorage.setItem('roles', '[]');
              return of(response); // Continuar con el flujo normal
            })
          );
        } else {
          localStorage.setItem('roles', '[]');
          return of(response); // Continuar con el flujo normal
        }
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error inesperado.Error en el servidor';

    if (error.status === 404) {
      errorMessage = 'Usuario no encontrado. Verifica tu correo y contraseña.';
    } else if (error.status === 401) {
      errorMessage = 'Credenciales incorrectas. Inténtalo nuevamente.';
    } else if (error.status === 500) {
      errorMessage = 'Error en el servidor. Inténtalo más tarde.';
    }

    console.error('Error en login:', error);
    return throwError(() => new Error(errorMessage));
  }
  
  // Método para obtener los roles por ID
  getRolesByIds(roleIds: number[]): Observable<any[]> {
    const requests = roleIds.map(id => 
      this.http.get<any>(`${this.apiUrl}/roles/${id}`, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      })
    );

    return forkJoin(requests); // Combina todas las solicitudes en un solo observable
  }

  logout(): Observable<{ message: string }> {
    return new Observable(observer => {
      // Eliminar datos de localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('roles');
      localStorage.removeItem('token_timestamp');

      // Emitir mensaje de éxito
      observer.next({ message: 'Cierre de sesión exitoso.' });
      observer.complete();
  
      // Redirigir al usuario a la página de login
      setTimeout(() => {
        window.location.href = '/';
      }, 500); // Pequeña demora para que el mensaje pueda mostrarse antes de redirigir
    });
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser1(): any {
    const user = localStorage.getItem('user');
    //console.log('Retrieved user from localStorage:', user);
    return user ? JSON.parse(user) : null; 
  }
  
  getUser(): any {
    try {
      const user = this.getUserService().obtenerUsuariosId(this.getUser1().id_usuario)
      //console.log("Login"+user)

      return user; // ✅ Se llama al servicio correctamente
    } catch (error) {
      console.error("Error al parsear el usuario:", error);
      return null;
    }
  }

  getRoles(): string | null {
    return localStorage.getItem('roles');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  CambiarContrasena(email: any,currentPassword:any,newPassword:any){
    return this.http.post<any>(`${this.apiUrl}/cambiar-clave`, { email, currentPassword, newPassword });
  }

  RecuperarContrasena(email: any){
    return this.http.post<any>(`${this.apiUrl}/recuperar-clave`, {email });
  }

  RestablecerContrasena(email: any,token: any,newPassword:any){
    return this.http.post<any>(`${this.apiUrl}/restablecer-clave`, {email,token,newPassword });
  }

}

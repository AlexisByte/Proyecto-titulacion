import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LoginService } from '../../Servicios/login.service';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  private apiUrl = 'http://localhost:5000/api/users';

  constructor(
    private http: HttpClient,
    private auth: LoginService,
  ) { }

  private getHeaders() {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Asegura que envías JSON
    });
  }

  obtenerUsuarios(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() });
  }

  obtenerUsuariosId(id:number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  agregarUsuario(usuario: { nombre: string; email: string; contrasena: string; rol: number }): Observable<any> {
    return this.http.post(this.apiUrl, usuario, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al agregar usuario:', error);
        return throwError(() => new Error('No se pudo agregar el usuario'));
      })
    );
  }

  actualizarUsuario(id_usuario: number,usuario: { nombre: string; email: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id_usuario}`, usuario, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al actualizar usuario:', error);
        return throwError(() => new Error('No se pudo actualizar el usuario'));
      })
    );  
  }

  eliminarUsuarios(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
  
  cambiarEstadoUsuario(id_usuario: number, usuario: { activo: boolean }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id_usuario}`, usuario, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al cambiar el estado del usuario:', error);
        return throwError(() => new Error('No se pudo actualizar el estado del usuario'));
      })
    );    
  }
  
}

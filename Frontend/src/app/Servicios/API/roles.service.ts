import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LoginService } from '../../Servicios/login.service';
import { catchError } from 'rxjs/operators';
import { API_CONFIG } from './../../../config/api -config';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private apiUrl = `${API_CONFIG.BASE_URL}/api/roles`;

  constructor(
    private http: HttpClient,
    private auth: LoginService,

  ) {
  }


  private getHeaders() {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Asegura que envías JSON
    });
  }

  obtenerRoles(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error al obtener roles:', error);
        return throwError(() => new Error('No se pudo obtener los roles'));
      })
    );
  }

  agregarRoles(usuario: { nombre_rol: string; descripcion: string }): Observable<any> {
    return this.http.post(this.apiUrl, usuario, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al agregar rol:', error);
        return throwError(() => new Error('No se pudo agregar el rol'));
      })
    );
  }

  actualizarRoles(id_rol: number, usuario: { nombre_rol: string; descripcion: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id_rol}`, usuario, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al actualizar rol:', error);
        return throwError(() => new Error('No se pudo actualizar el rol'));
      })
    );
  }

  eliminarRoles(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al eliminar rol:', error);
        return throwError(() => new Error('No se pudo eliminar el rol'));
      })
    );
  }
}

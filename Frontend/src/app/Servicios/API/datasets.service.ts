import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LoginService } from '../../Servicios/login.service';
import { catchError } from 'rxjs/operators';
import { API_CONFIG } from './../../../config/api -config';

@Injectable({
  providedIn: 'root'
})
export class DatasetsService {
  private apiUrl = `${API_CONFIG.BASE_URL}/api/datasets`;

  constructor(
    private http: HttpClient,
    private auth: LoginService,
  ) {
  }

  private getHeaders(isFormData = false) {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    // Solo agrega Content-Type si no es FormData
    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }
  
    return headers;
  }

  obtener(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() });
  }

  agregar(nuevo: FormData): Observable<any> {
    return this.http.post(this.apiUrl, nuevo, {
      headers: this.getHeaders(true) // No agrega Content-Type manualmente
    }).pipe(
      catchError((error) => {
        console.error('Error al subir Dataset:', error);
        return throwError(() => new Error('No se pudo subir el Dataset'));
      })
    );
  }


  actualizar(editado: number, modelo: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${editado}`, modelo, { 
      headers: this.getHeaders(true) 
    }).pipe(
      catchError((error) => {
        console.error('Error al actualizar modelo:', error);
        return throwError(() => new Error('No se pudo actualizar el modelo'));
      })
    );
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  obtenerPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}

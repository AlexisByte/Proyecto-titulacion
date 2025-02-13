import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LoginService } from '../../Servicios/login.service';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ModelosService {
  private apiUrl = 'http://localhost:5000/api/modelosIA';

  constructor(
    private http: HttpClient,
    private auth: LoginService,
  ) { }

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

  obtenerModelos(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() });
  }

  agregarModelo(modelo: FormData): Observable<any> {
    return this.http.post(this.apiUrl, modelo, {
      headers: this.getHeaders(true) // No agrega Content-Type manualmente
    }).pipe(
      catchError((error) => {
        console.error('Error al subir modelo:', error);
        return throwError(() => new Error('No se pudo subir el modelo'));
      })
    );
  }


  actualizarModelos(id_modelo: number, modelo: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id_modelo}`, modelo, { 
      headers: this.getHeaders(true) 
    }).pipe(
      catchError((error) => {
        console.error('Error al actualizar modelo:', error);
        return throwError(() => new Error('No se pudo actualizar el modelo'));
      })
    );
  }

  eliminarModelos(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}

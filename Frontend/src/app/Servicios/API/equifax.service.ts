import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LoginService } from '../../Servicios/login.service';
import { catchError } from 'rxjs/operators';
import { API_CONFIG } from './../../../config/api -config';

@Injectable({
  providedIn: 'root'
})
export class EquifaxService {

  private apiUrl = `${API_CONFIG.BASE_URL}/api/equifax`;

  constructor(
    private http: HttpClient,
    private auth: LoginService
  ) {}

  private getHeaders(isFormData = false) {
    const token = this.auth.getToken();

    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return headers;
  }

  /**
   * 🔍 Analizar archivo Equifax (PDF o XML)
   */
  analizarEquifax(archivo: File, idUsuario: number): Observable<any> {

    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('id_usuario', idUsuario.toString());

    return this.http.post(
      `${this.apiUrl}/analizar`,
      formData,
      { headers: this.getHeaders(true) }
    ).pipe(
      catchError(error => {
        console.error('Error al analizar Equifax:', error);

        const mensaje =
          error?.error?.error ||
          error?.message ||
          'No se pudo analizar el reporte Equifax';

        return throwError(() => new Error(mensaje));
      })
    );
  }
}

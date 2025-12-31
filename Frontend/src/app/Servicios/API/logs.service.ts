import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoginService } from '../../Servicios/login.service';
import { API_CONFIG } from './../../../config/api -config';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private apiUrl = `${API_CONFIG.BASE_URL}/api/logs`;

  constructor(
    private http: HttpClient,
    private auth: LoginService,
  ) {
  }
    private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return headers;
  }

  obtener(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error al obtener actividades:', error);
          return throwError(() => error);
        })
      );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LoginService } from '../../Servicios/login.service';
import { catchError } from 'rxjs/operators';
import { UrlServiciosWebService } from '../../Servicios/url-servicios-web.service';

@Injectable({
  providedIn: 'root'
})
export class EntrenamientoService {

  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private auth: LoginService,
    private urlService: UrlServiciosWebService,

  ) {
    this.apiUrl = `${this.urlService.urlServiciosTest}/api/resultados-entrenamiento`;
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

  Entrenar(entrenamiento: { id_version: number; id_dataset: number;skip_columns:number,test_size:number,random_state:number,id_usuario_creador:number }): Observable<any> {
    return this.http.post(this.apiUrl+"/entrenamiento", entrenamiento, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error al entrenar:', error);
        return throwError(() => new Error('No se pudo entrenar'));
      })
    );
  }

  obtener(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() });
  }

  ClasificarCSV(formData: FormData): Observable<any> {
    const url = this.apiUrl+"/clasificar/csv";
    return this.http.post(url, formData, {
      headers: this.getHeaders(true)
    }).pipe(
      catchError((error) => {
        console.error('Error al clasificar CSV:', error);
        return throwError(() => new Error('No se pudo clasificar por CSV'));
      })
    );
  }

  ClasificarFormulario(formData: FormData): Observable<any> {
    const url = this.apiUrl+"/clasificar/formulario";
    return this.http.post(url, formData, {
      headers: this.getHeaders(true)
    }).pipe(
      catchError((error) => {
        console.error('Error al clasificar por formulario:', error);
        return throwError(() => new Error('No se pudo clasificar por formulario'));
      })
    );
  }
}

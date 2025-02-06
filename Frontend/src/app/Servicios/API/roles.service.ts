import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; // Faltaba importar Observable
import { LoginService } from '../../Servicios/login.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private apiUrl = 'http://localhost:5000/api/roles';

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

  obtenerRoles(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() });
  }
  ListadoRoles() {
    return this.http.get<any[]>(this.apiUrl)
  }
  agregarRoles(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario, { headers: this.getHeaders() });
  }

  actualizarRoles(usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${usuario.id_usuario}`, usuario, { headers: this.getHeaders() });
  }

  eliminarRoles(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}

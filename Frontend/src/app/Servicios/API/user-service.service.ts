import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; // Faltaba importar Observable
import { LoginService } from '../../Servicios/login.service';

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

  agregarUsuario(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario, { headers: this.getHeaders() });
  }

  actualizarUsuario(usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${usuario.id_usuario}`, usuario, { headers: this.getHeaders() });
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}

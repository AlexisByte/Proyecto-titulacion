import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginService } from '../Servicios/login.service';

@Injectable({
  providedIn: 'root'
})
export class UrlServiciosWebService {
  urlServiciosTest = "http://localhost:5000";
  user: any;
  constructor(
    private http: HttpClient,
    private auth: LoginService,

  ) {    
  }
  private getHeaders() {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Se envía el token en la cabecera
    });
  }
  //Roles
  ListadoRoles() {
    return this.http.get<any[]>(this.urlServiciosTest + '/api/roles')
  }
  //Usuarios
  ListadoUsuarios() {
    return this.http.get<any>(
      `${this.urlServiciosTest}/api/users`,
      { headers: this.getHeaders() }  // Se agregan los headers con el token
    );
  }

}

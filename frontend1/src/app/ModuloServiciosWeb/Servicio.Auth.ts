import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UrlServicios } from './urlServiciosWeb.component';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    urlServiciosTest: String="";
    user: any;
    authToken: any;
    
    constructor(
      private http: HttpClient, 
      server: UrlServicios, 
      private hpptclient: HttpClient
    ) {
      this.urlServiciosTest = server.urlServicio ;
    }

  login(credentials: { correo_electronico: string, contrasena: string }): Observable<any> {
    return this.hpptclient.post<any>(this.urlServiciosTest + '/api/auth/login', credentials)
      .pipe(
        tap(response => {
          if (response && response.token && response.user.estado) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user)); // Almacena la información del usuario
          }
          else{
            response.user.tipousuario = 4
          }
        })
      );
  }

  registerCiudadano(user: { fecha_nac: Date, telefono: string, apellido: string, nombre: string, correo_electronico: string, contrasena: string }): Observable<any> {
    return this.http.post<any>(this.urlServiciosTest + '/api/auth/register/ciudadano', user);
  }

  registerNegocio(user: FormData): Observable<any> {
    return this.http.post<any>(this.urlServiciosTest + '/api/auth/register/negocio', user);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Elimina la información del usuario
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    console.log('Retrieved user from localStorage:', user);
        return user ? JSON.parse(user) : null; 
  }

  getInfo(id_cdn:number): any {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.hpptclient.get<any>(this.urlServiciosTest + '/api/ciudadanos/'+id_cdn)
  }

  //---------------------------------------NEGOCIO------------------------------------------
  getNegocio(): any {
    const negocio = localStorage.getItem('user');
    console.log('Retrieved user from localStorage:', negocio);
        return negocio ? JSON.parse(negocio) : null; 
  }

  validateRuc(ruc: string): Observable<any> {
    return this.http.post<any>(this.urlServiciosTest+'/api/auth/validate-ruc', { ruc });
  }

  getInfoNegocio(id_neg:number): any {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.hpptclient.get<any>(this.urlServiciosTest + '/api/negocios/'+id_neg)
  }

  getInfoHistorialOfertas(ce_user:any): any {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.hpptclient.get<any>(this.urlServiciosTest + '/api/ofertas_greencoins/historial-ofertas/'+ce_user)
  }

  
  getInfoHistorialReciclaje(id_cdn:number): any {
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.hpptclient.get<any>(this.urlServiciosTest + '/api/reciclaje/historial/ciudadano/'+id_cdn)

  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getProtectedData(): Observable<any> {
    const token = this.getToken();
    if (!token) {
        throw new Error('No token found');
    }

    return this.hpptclient.get<any>(this.urlServiciosTest + '/protected', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
  }

  recuperar(correo_electronico: any): Observable<any> {
    //console.log("CORREOOOOOOO "+ correo_electronico)
    let parametros = {email: correo_electronico};
    return this.hpptclient.post(this.urlServiciosTest + '/api/recuperar-password', parametros);
  }

}

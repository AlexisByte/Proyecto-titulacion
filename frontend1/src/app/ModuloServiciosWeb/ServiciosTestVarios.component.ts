import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UrlServicios } from './urlServiciosWeb.component';
import { EmailValidator } from '@angular/forms';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
  })
export class ServiciviosVarios {
  urlServiciosTest: String="";
  user: any;
  constructor(private http: HttpClient, server: UrlServicios, private hpptclient: HttpClient) {
    this.urlServiciosTest = server.urlServicio ;
    
  }

  //Roles
  ListadoRoles() {
    return this.http.get<any[]>(this.urlServiciosTest + '/api/roles')
  }

//   // MATERIALES
//   // Se ontiene todos los materiales
//   ListadoMaterial() {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//  //   let parametros = opcion + "/" + tipo + "/" + codCarrera + "/" + param;
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/materiales',  { headers })
//   }

//   // Se ontiene los materiales activos
//   ListadoMaterialActivos() {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//  //   let parametros = opcion + "/" + tipo + "/" + codCarrera + "/" + param;
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/materiales/activo',  { headers })
//   }

//   NuevoMaterial(intvalor:any, strnombre:any) {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     let parametros = { valor_por_libra: intvalor, tipo: strnombre } ;
//     return this.hpptclient.post<any>(this.urlServiciosTest + '/api/materiales', parametros)
//   }

//   EstadoCambiarMaterial(idMaterial:number,estado:any) {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     console.log("AAAAAAAAAA: "+estado+idMaterial);
//     let parametros = { estado: estado } ;
//      return this.hpptclient.put<any>(this.urlServiciosTest + '/api/materiales/'+idMaterial, parametros)
//   }

//   ActualizacionMaterial(idMaterial:number,nombre:any, valorlibra:any) {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     let parametros = { tipo: nombre, valor_por_libra: valorlibra } ;
//      return this.hpptclient.put<any>(this.urlServiciosTest + '/api/materiales/'+idMaterial, parametros)
//   }

//   //Ofertas
//   ListadoOfertas() {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//  //   let parametros = opcion + "/" + tipo + "/" + codCarrera + "/" + param;
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/ofertas')
//   }
//   //Listado de todas las Ofertas activas
//   ListadoOfertasActivas() {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/ofertas/active')
//   }

//   ListadoOfertasInactivas() {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/ofertas/inactive')
//   }

//   HistorialNegocio(negocio_id:number){
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/reciclaje/historial/negocio/'+negocio_id)
//   }

//   HistorialCiudadano(id_cdn:number){
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/reciclaje/historial/ciudadano/'+id_cdn)
//   }


//   //Listado de todas las Ofertas activas de un negocio
//   ListadoOfertasActivasNegocio(negocio_id:number) {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/ofertas/active/'+negocio_id)
//   }

//   NuevaOferta(descripcion: string, gc_necesarios: number, negocio_id: number, fecha_inicio: any, fecha_fin: any){
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     const parametros = { descripcion, gc_necesarios, negocio_id, fecha_inicio, fecha_fin };
//     return this.http.post<any>(this.urlServiciosTest + '/api/ofertas', parametros, { headers });
//   }

//   ActualizarOferta(idOferta: number, descripcion: string, gc_necesarios: number, negocio_id: number, fecha_inicio: Date, fecha_fin: Date) {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     const parametros = { descripcion, gc_necesarios, negocio_id, fecha_inicio, fecha_fin };
//     return this.hpptclient.put<any>(`${this.urlServiciosTest}/api/ofertas/${idOferta}`, parametros, { headers });
//   }

//   DesactivarOfert(idOferta: number) {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.hpptclient.delete<any>(this.urlServiciosTest+'/api/ofertas/'+idOferta, { headers });
//   }

//   EstadoCambiarOfertas(idOferta: number, estado: boolean) {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     const parametros = { estado: estado };
//     return this.hpptclient.put<any>(`${this.urlServiciosTest}/api/ofertas/${idOferta}`, parametros, { headers });
//   }
//   //Actualizacion de una oferta con las validaciones de fechas
//   ActualizacionOfertas(idOferta: number, descripcion: string, gc_necesarios: number, negocio_id: number, fecha_inicio: Date, fecha_fin: Date, estado: boolean) {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     const parametros = { descripcion, gc_necesarios, negocio_id, fecha_inicio, fecha_fin, estado };
//     return this.hpptclient.put<any>(`${this.urlServiciosTest}/api/ofertas/${idOferta}`, parametros, { headers });
//   }

//   //Puntos verdes
//   // Listado de Puntos Verdes
//   ListadoPuntosVerdes(){
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/puntos_verdes')
//   }

//   // Listado de un punto verde por el id de negocio
//   ListadoPuntoVerdeNegocio(id_negocio:any) {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//  //   let parametros = opcion + "/" + tipo + "/" + codCarrera + "/" + param;
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/puntos_verdes/negocio/'+id_negocio, { headers })
//   }
 
//   // Crear un nuevo Punto Verde
//   NuevoPuntoVerde(descripcion: string, direccion: string, latitud: number, longitud: number, negocio_id: number, estado: boolean = true){
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     const parametros = { descripcion, direccion, latitud, longitud, negocio_id, estado };
//     return this.http.post<any>(`${this.urlServiciosTest}/api/puntos_verdes`, parametros, { headers });
//   }

//   // Cambiar el estado de un Punto Verde
//   EstadoCambiarPuntoVerde(idPuntoVerde: number, estadoo: boolean){
//     const headers = new HttpHeaders().set('Content-Type', 'application/json');
//     const parametros = { estado: estadoo };
//     return this.http.put<any>(`${this.urlServiciosTest}/api/puntos_verdes/${idPuntoVerde}`, parametros, { headers });
//   }

//   //Eliminado logico de un Punto Verde
//   DesactivarPuntoVerde(idPuntoVerde: number){
//     const headers = new HttpHeaders().set('Content-Type', 'application/json');
//     return this.http.delete<any>(this.urlServiciosTest+'/api/puntos_verdes/logico/'+idPuntoVerde, { headers });
//   }

//   // Actualizar un Punto Verde
//   ActualizacionPuntoVerde(idPuntoVerde: number, descripcion: string, direccion: string, latitud: number, longitud: number, negocio_id: number, estado: boolean) {
//     const headers = new HttpHeaders().set('Content-Type', 'application/json');
//     const parametros = { descripcion, direccion, latitud, longitud, negocio_id, estado };
//     return this.http.put<any>(`${this.urlServiciosTest}/api/puntos_verdes/${idPuntoVerde}`, parametros, { headers });
//   }

//   ListadoPuntosActivas() {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/puntos_verdes/activos')
//   }

//   ListadoPuntosInactivas() {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/puntos_verdes/inactivos')
//   }


//   //Negocios
//   ListadoNegocios(){
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/negocios')
//   }

//   ListadoNegociosActive() {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/negocios/active')
//   }

//   ListadoNegociosInactive() {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/negocios/inactive')
//   }

//   NegocioId(idNegocio: number){
//     return this.hpptclient.get<any>(`${this.urlServiciosTest}/api/negocios/${idNegocio}`);
//   }
  
//   // Cambiar el estado de un Negocio
//   EstadoCambiarNegocio(idcredencial:number,idNegocio: number, formData: FormData) {
//     const headers = new HttpHeaders().set('Content-Type', 'application/json');
//     const parametros = { estado: formData.get('estado') }; // Assuming 'estado' is a field in formData
//     this.http.put<any>(`${this.urlServiciosTest}/api/credenciales/${idcredencial}`, parametros, { headers });
//     return this.http.put<any>(`${this.urlServiciosTest}/api/negocios/${idNegocio}`, formData);
//   }

//   // Actualizar un Negocio
//   ActualizacionNegocio(idNegocio: any, formData: FormData) {
//     return this.http.put<any>(`${this.urlServiciosTest}/api/negocios/${idNegocio}`, formData);
//   }



//   //Administradores
//   ListadoAdministradores(){
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/admins')
//   }
  
//   CredencialIduserType(usuario_id: number, tipousuario: number): Observable<any> {
//     return this.http.get<any>(`${this.urlServiciosTest}/api/credenciales/${usuario_id}/${tipousuario}`);
//   }

//   NuevoAdmin(nombre:any, correo:any, clave:any): Observable<any> {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     let parametros = { nombre: nombre, correo_electronico: correo,contrasena: clave } ;
//     return this.hpptclient.post<any>(this.urlServiciosTest + '/api/auth/register/admin', parametros)
//   }

//   ActualizacionAdmin(idAdmin: number,nombre:number){
//     const headers = new HttpHeaders().set('Content-Type', 'application/json');
//     const parametros = { nombre };
//     return this.http.put<any>(`${this.urlServiciosTest}/api/admins/${idAdmin}`, parametros, { headers });
//   }

//   AdminPorId(idAdmin: number){
//     return this.http.get<any>(`${this.urlServiciosTest}/api/admins/${idAdmin}`);
//   }

//   ActualizacionEstadoAdmin(idcredencial: number,idAdmin:number,estado:boolean){
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     let parametros = { estado } ;
//     this.http.put<any>(`${this.urlServiciosTest}/api/credenciales/${idcredencial}`, parametros, { headers });
//     return this.http.put<any>(`${this.urlServiciosTest}/api/admins/${idAdmin}`, parametros, { headers });
//   }

//   EliminarAdmin(idcredencial: number, idAdmin: number){
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.http.delete<any>(`${this.urlServiciosTest}/api/admins/delete/${idcredencial}/${idAdmin}`);
//   }

//   CambiarContrasena(correo: any,claveActual:any,NuevaClave:any){
//     return this.http.post<any>(`${this.urlServiciosTest}/api/cambiar-password`, { correo_electronico: correo, currentPassword: claveActual, newPassword: NuevaClave });
//   }

//   //Ciudadanos
//   ListadoCiudadanos() {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/ciudadanos')
//   }

//   ListadoCiudadanossActive() {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/ciudadanos/active')
//   }

//   ListadoCiudadanossInactive() {
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     return this.hpptclient.get<any>(this.urlServiciosTest + '/api/ciudadanos/inactive')
//   }

//   ActualizacionEstadoCiudadano(idcredencial: number,idCiudadano:number,estado:boolean){
//     let headers = new HttpHeaders();
//     headers.append('Content-Type', 'application/json');
//     let parametros = { estado } ;
//     this.http.put<any>(`${this.urlServiciosTest}/api/credenciales/${idcredencial}`, parametros, { headers });
//     return this.http.put<any>(`${this.urlServiciosTest}/api/ciudadanos/${idCiudadano}`, parametros, { headers });
//   }



  //   ListadoDimension() {
  //     let headers = new HttpHeaders();
  //     headers.append('Content-Type', 'application/json');
  //  //   let parametros = opcion + "/" + tipo + "/" + codCarrera + "/" + param;
  //     return this.hpptclient.get<any>(this.urlServiciosTest + '/wsSimulador/rutadimension/ListadoDimensionTodos')
  //   }
  // ActualizacionDimension(idDimension:number,intvalor:any) {
  //   let headers = new HttpHeaders();
  //   headers.append('Content-Type', 'application/json');
  //   let parametros = { int_valor: intvalor } ;
  //    return this.hpptclient.put<any>(this.urlServiciosTest + '/wsSimulador/rutadimension/ActualizarDimension/'+idDimension, parametros)
  // }
  // EstadoCambiarDimension(idDimension:number,estado:any) {
  //   let headers = new HttpHeaders();
  //   headers.append('Content-Type', 'application/json');
  //   let parametros = { bl_estado: estado } ;
  //    return this.hpptclient.put<any>(this.urlServiciosTest + '/wsSimulador/rutadimension/DesactivarDimension/'+idDimension, parametros)
  // }
  // NuevaDimension(intvalor:any) {
  //   let headers = new HttpHeaders();
  //   headers.append('Content-Type', 'application/json');
  //    let parametros = { int_valor: intvalor } ;
  //    return this.hpptclient.post<any>(this.urlServiciosTest + '/wsSimulador/rutadimension/CrearDimension', parametros)
  // }

  // // Registro de un reciclaje
  // RegReciclaje(user: {  correo_electronico: string, negocio_id:any, punto_verde_id:any, cantidad:any, material_id:any, descripcion:any }): Observable<any> {
  //   return this.http.post<any>(this.urlServiciosTest + '/api/reciclaje/registrar', user);
  // }

  // // Validar un codigo
  // ValCodigo(params: {  codigo: string, negocio_id:any}): Observable<any> {
  //   return this.http.post<any>(this.urlServiciosTest + '/api/ofertas_greencoins/validar-codigo-canje', params);
  // }

  // CanjearOferta(correo_electronico: any, ofertas_id: number) {
  //   let headers = new HttpHeaders();
  //   headers.append('Content-Type', 'application/json');
  //   const parametros = { correo_electronico, ofertas_id };
  //   return this.http.post<any>(`${this.urlServiciosTest}/api/ofertas_greencoins/canjear-oferta`, parametros, { headers });
  // }


}

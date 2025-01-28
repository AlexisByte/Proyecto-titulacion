import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UrlServicios } from '../ModuloServiciosWeb/urlServiciosWeb.component';
@Injectable({
    providedIn: 'root'
  })
export class ServiciosWeb {
  urlServiciosTest: String="";
  user: any;
  authToken: any;
  constructor(private http: HttpClient, server: UrlServicios, private hpptclient: HttpClient) {
    this.urlServiciosTest = server.urlServicio ;
    
  }

//LISTADO ACTIVOS


//LISTADO TODOS


ListadoOfertas() {
  let headers = new HttpHeaders();
  headers.append('Content-Type', 'application/json');
  return this.hpptclient.get<any>(this.urlServiciosTest + '/api/ofertas/active')
}

ListadoCodigosGenerado(id_ciudadano:any) {
  let headers = new HttpHeaders();
  headers.append('Content-Type', 'application/json');
  return this.hpptclient.get<any>(this.urlServiciosTest + '/api/canjea_ofertas/estado/generado/' + id_ciudadano, { headers })
}

//ACTUALIZACION 
ActualizacionSeccion(idSeccion:number,strNombre:any) {
  let headers = new HttpHeaders();
  headers.append('Content-Type', 'application/json');
   let parametros =  { id_seccion: idSeccion, str_nombre: strNombre } ;
  return this.hpptclient.put<any>(this.urlServiciosTest + '/wsSimulador/rutaseccion/ActualizarSeccion', parametros)
}

ActualizacionInstruccion(idInstruccion:number,strNombre:any,strDescripcion:any) {
  let headers = new HttpHeaders();
  headers.append('Content-Type', 'application/json');
   let parametros =  { id_instruccion: idInstruccion, str_nombre: strNombre, str_descripcion: strDescripcion } ;
  return this.hpptclient.put<any>(this.urlServiciosTest + '/wsSimulador/rutainstruccion/ActualizarInstruccion', parametros)
}

ActualizacionRecomendacion(idRecomendacion:number,strNombre:any,strDescripcion:any) {
  let headers = new HttpHeaders();
  headers.append('Content-Type', 'application/json');
   let parametros =  { id_recomendacion: idRecomendacion, str_nombre: strNombre, str_descripcion: strDescripcion } ;
  return this.hpptclient.put<any>(this.urlServiciosTest + '/wsSimulador/rutarecomendacion/ActualizarRecomendacion', parametros)
}

//CAMBIAR ESTADO (BORRAR)
EstadoCambiarSeccion(idSeccion:number,blEstado:any) {
  let headers = new HttpHeaders();
  headers.append('Content-Type', 'application/json');
   let parametros =  { id_seccion: idSeccion, bl_estado: blEstado } ;
  return this.hpptclient.put<any>(this.urlServiciosTest + '/wsSimulador/rutaseccion/DesactivarSeccion', parametros)
}

EstadoCambiarInstruccion(idInstruccion:number,blEstado:any) {
  let headers = new HttpHeaders();
  headers.append('Content-Type', 'application/json');
   let parametros =  { id_instruccion: idInstruccion, bl_estado: blEstado } ;
  return this.hpptclient.put<any>(this.urlServiciosTest + '/wsSimulador/rutainstruccion/DesactivarInstruccion', parametros)
}

EstadoCambiarRecomendacion(idRecomendacion:number,blEstado:any) {
  let headers = new HttpHeaders();
  headers.append('Content-Type', 'application/json');
   let parametros =  { id_recomendacion: idRecomendacion, bl_estado: blEstado } ;
  return this.hpptclient.put<any>(this.urlServiciosTest + '/wsSimulador/rutarecomendacion/DesactivarRecomendacion', parametros)
}

//AGREGAR REGISTRO
NuevoSeccion(strNombre:any) {
  let headers = new HttpHeaders();
  headers.append('Content-Type', 'application/json');
   let parametros = { str_nombre: strNombre } ;
   return this.hpptclient.post<any>(this.urlServiciosTest + '/wsSimulador/rutaseccion/CrearSeccion', parametros)
}

NuevoInstruccion(strNombre:any, strDescripcion: any) {
  let headers = new HttpHeaders();
  headers.append('Content-Type', 'application/json');
   let parametros = { str_nombre: strNombre, str_descripcion: strDescripcion } ;
   return this.hpptclient.post<any>(this.urlServiciosTest + '/wsSimulador/rutainstruccion/CrearInstruccion', parametros)
}

NuevoRecomendacion(strNombre:any, strDescripcion: any) {
  let headers = new HttpHeaders();
  headers.append('Content-Type', 'application/json');
   let parametros = { str_nombre: strNombre, str_descripcion: strDescripcion } ;
   return this.hpptclient.post<any>(this.urlServiciosTest + '/wsSimulador/rutarecomendacion/CrearRecomendacion', parametros)
}

/*
NuevoSeccion(strNombre:any) {
  let headers = new HttpHeaders();
  headers.append('Content-Type', 'application/json');
   let parametros =  { str_nombre: strNombre } ;
  return this.hpptclient.post<any>(this.urlServiciosTest + '/wsSimulador/rutaseccion/CrearSeccion'+parametros)
}*/
}

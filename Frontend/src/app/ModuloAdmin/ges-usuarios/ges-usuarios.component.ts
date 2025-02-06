import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { NotificationService } from '../../Servicios/notification-service.service';
import { UrlServiciosWebService } from '../../Servicios/url-servicios-web.service';

@Component({
  selector: 'app-ges-usuarios',
  templateUrl: './ges-usuarios.component.html',
  styleUrls: ['./ges-usuarios.component.css',
     './../../../assets/vendor/bootstrap-icons/bootstrap-icons.css'
  ]
})
export class GesUsuariosComponent {
  @ViewChild('dt1') table!: Table;

  lsListado:any=[];
  
  objSeleccion:any="-1";

  nombre:string="";
  email:string = '';
  contrasena:string = '';
  roles: any[] = [];

  
  estado:boolean=true;


  strEstado:any="";

  visibleEditar: boolean=false;
  visibleEstado: boolean=false;
  visibleNuevo: boolean=false;

  constructor
  (
    private servicios: UrlServiciosWebService,

  ) { }

async ngOnInit() {
  await this.ListadoInformacion();

}

applyFilter(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input) {
    this.table.filterGlobal(input.value, 'contains');
  }
}

clear(table: Table) {
  table.clear();
}

ModalNuevoInformacion() {
  this.visibleNuevo = true;

}

ModalEditarInformacion(seleccion:any) {
  this.objSeleccion = { ...seleccion };
  this.visibleEditar = true;

}

ModalCambiarEstado(seleccion:any) {
  this.objSeleccion = { ...seleccion };
  this.visibleEstado = true;

}

async ListadoInformacion() {
  this.lsListado = await new Promise<any>(resolve => this.servicios.ListadoUsuarios().subscribe(translated => { resolve(translated) }));
  //console.log(this.lsListado)
}

RegistrarNuevo(){

}

RegistrarActualizacion(){

}

EstadoCambiarActualizacion(){

}


}

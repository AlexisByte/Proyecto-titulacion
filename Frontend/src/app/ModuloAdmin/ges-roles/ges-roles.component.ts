import { Component, HostListener, ViewChild } from '@angular/core';
import { RolesService } from '../../Servicios/API/roles.service';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { NotificationService } from '../../Servicios/notification-service.service';

@Component({
  selector: 'app-ges-roles',
  templateUrl: './ges-roles.component.html',
  styleUrls: ['./ges-roles.component.css',
     './../../../assets/vendor/bootstrap-icons/bootstrap-icons.css'
  ]
})
export class GesRolesComponent {
  @ViewChild('dt1') table!: Table;

  visibleEditar: boolean=false;
  visibleEstado: boolean=false;
  visibleNuevo: boolean=false;
  
  id_rol: number  = 0;
  nombre: string  = '';
  descripcion: string = '';
  objSeleccion:any="-1";

  seccion: string = '1';
  title = 'GreenPoint';
  sidebarCollapsed = false;

  lsListado: any[] = [];

  constructor(
    private router: Router,
    private servicios: RolesService,
    private notificationService: NotificationService, // Inyecta el servicio MatSnackBar
  ) {}

  async ngOnInit() {
    await this.ListadoInformacion();
  }

  async ListadoInformacion() {
    this.lsListado = await new Promise<any>(resolve => this.servicios.ListadoRoles().subscribe(translated => { resolve(translated) }));
    //console.log(this.all_ofertas)
  }

  ModalNuevoInformacion() {
    this.nombre="";
    this.descripcion="";
    this.visibleNuevo = true;
  }

  ModalEditarInformacion(seleccion:any) {
    this.objSeleccion = seleccion;
    this.nombre = this.objSeleccion.nombre_rol;
    this.descripcion = this.objSeleccion.descripcion;
    //console.log(this.objSeleccion)
    this.visibleEditar = true;
  }

  ModalCambiarEstado(seleccion:any) {
    this.objSeleccion=seleccion;
    this.visibleEstado = true;
  }

  async RegistrarNuevo(form: any) {

    if (form.valid) { 
      try {
        const { nombre, descripcion } = form.value;  
  
        // Asegurar que los datos coincidan con lo que espera la API
        const nuevoRol = { nombre_rol: nombre, descripcion };
  
        // Llamada al servicio y espera de la respuesta
        const data = await lastValueFrom(this.servicios.agregarRoles(nuevoRol));
  
        // Verificar si la respuesta contiene un mensaje antes de mostrarlo
        if (data?.message) {
          this.notificationService.showSuccess(data.message);
        }
  
        // Cerrar modal y actualizar listado
        this.visibleNuevo = false;
        this.ListadoInformacion();
  
      } catch (error) {
        console.error("Error al crear el rol:", error);
        this.notificationService.showError("Error al crear el rol. Intente nuevamente.");
      }
    } else {
      console.warn("Formulario inválido, revisa los campos.");
      this.notificationService.showError("Formulario inválido. Verifique los campos.");
    }
  }

  async RegistrarActualizacion(form: any) {
    
    if (form.valid) { 
      try {
        const { nombre, descripcion } = form.value;  
  
        // Asegurar que los datos coincidan con lo que espera la API
        const editRol = { nombre_rol: nombre, descripcion };
        console.log(form.value+this.objSeleccion.id_rol)
        // Llamada al servicio y espera de la respuesta
        const data = await lastValueFrom(this.servicios.actualizarRoles(this.objSeleccion.id_rol, editRol));
  
        // Verificar si la respuesta contiene un mensaje antes de mostrarlo
        if (data?.message) {
          this.notificationService.showSuccess(data.message);
        }
  
        // Cerrar modal y actualizar listado
        this.visibleEditar = false;
        this.ListadoInformacion();
  
      } catch (error) {
        console.error("Error al actualizar el rol:", error);
        this.notificationService.showError("Error al actualizar el rol. Intente nuevamente.");
      }
    } else {
      console.warn("Formulario inválido, revisa los campos.");
      this.notificationService.showError("Formulario inválido. Verifique los campos.");
    }
  }

  async Desactivar() {
    try {
      const data = await lastValueFrom(this.servicios.eliminarRoles(this.objSeleccion.id_rol));
  
      if (data?.message) {
        this.notificationService.showSuccess(data.message);
      } else {
        this.notificationService.showSuccess("Rol eliminado correctamente.");
      }
      this.visibleEstado = false;
      this.ListadoInformacion();
    } catch (error) {
      console.error("Error al eliminar el rol:", error);
      this.notificationService.showError("Error al eliminar el rol. Intente nuevamente.");
    }
  }
  
  Cancelar() {
    this.visibleEstado = false; // Cierra el modal sin eliminar
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

}
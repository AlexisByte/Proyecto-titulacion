import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { NotificationService } from '../../Servicios/notification-service.service';
import { ModelosService } from '../../Servicios/API/modelos.service';
import { lastValueFrom } from 'rxjs';
import { NgForm } from '@angular/forms';
import { LoginService } from '../../Servicios/login.service';


@Component({
  selector: 'app-ges-modelos',
  templateUrl: './ges-modelos.component.html',
  styleUrls: ['./ges-modelos.component.css']
})
export class GesModelosComponent {
  @ViewChild('dt1') table!: Table;

  lsListado:any=[];
  
  objSeleccion:any="-1";

  nombre_modelo:string="";
  version:string = '';
  descripcion:string = '';
  id_usuario_creador: number = 0;
  modelo: File | null = null;
  id_modelo: number = 0;
  estado:boolean=true;


  strEstado:any="";

  visibleEditar: boolean=false;
  visibleEstado: boolean=false;
  visibleNuevo: boolean=false;

  constructor
  (
    private servicios: ModelosService,
    private notificationService: NotificationService,
    private serviciolog: LoginService,

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
    this.nombre_modelo="";
    this.version= '';
    this.descripcion= "";
    this.modelo= null;
  }

  ModalEditarInformacion(seleccion:any) {
    this.objSeleccion = {...seleccion};
    this.id_modelo=this.objSeleccion.id_version;
    this.nombre_modelo=this.objSeleccion.nombre_modelo;
    this.version= this.objSeleccion.version;
    this.descripcion= this.objSeleccion.descripcion;
    this.visibleEditar = true;
  }

  ModalCambiarEstado(seleccion:any) {
    this.objSeleccion = seleccion;
    this.visibleEstado = true;
  }

  async ListadoInformacion() {
    this.lsListado = await new Promise<any>(resolve => this.servicios.obtenerModelos().subscribe(translated => { resolve(translated) }));
    //console.log(this.lsListado)
  }


  onFileSelected(event: any) {
    const file: File = event.target.files[0];
  
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'py') {
        this.modelo = file;
      } else {
        this.notificationService.showError("Debe seleccionar un archivo .py válido.");
        event.target.value = ""; // Resetea el input si no es válido
      }
    }
  }

  async RegistrarNuevo(form: any) {
    if (form.invalid || !this.modelo) {
      this.notificationService.showError("Formulario inválido o archivo no seleccionado.");
      return;
    }

    try {
      const { nombre_modelo, version, descripcion } = form.value;  
      const id = this.serviciolog.getUser();
      const nuevo = new FormData();

      nuevo.append("nombre_modelo", nombre_modelo);
      nuevo.append("version", version);
      nuevo.append("descripcion", descripcion);
      nuevo.append("id_usuario_creador", id.id_usuario);
      nuevo.append("contenido", this.modelo); // Añadir archivo al FormData

      const data = await lastValueFrom(this.servicios.agregarModelo(nuevo));

      if (data?.message) {
        this.notificationService.showSuccess(data.message);
      }

      // Cerrar modal, actualizar lista y resetear formulario
      this.visibleNuevo = false;
      this.ListadoInformacion();
      form.resetForm();
      this.modelo = null; // Reinicia el archivo
    } catch (error) {
      console.error("Error al crear el modelo:", error);
      this.notificationService.showError("Error al crear el modelo. Intente nuevamente.");
    }
}

async RegistrarActualizacion(form: any) {
  try {
    const { nombre_modelo, version, descripcion } = form.value || {};
    const user = this.serviciolog.getUser();

    if (!user?.id_usuario) {
      this.notificationService.showError("Usuario no autenticado.");
      throw new Error("No se pudo obtener el ID del usuario.");
    }

    if (!this.objSeleccion?.id_version) {
      this.notificationService.showError("No se ha seleccionado un modelo para actualizar.");
      return;
    }

    const edit = new FormData();
    edit.append("nombre_modelo", nombre_modelo);
    edit.append("version", version);
    edit.append("descripcion", descripcion);
    edit.append("id_usuario_creador", user.id_usuario.toString());

    if (this.modelo) {
      edit.append("contenido", this.modelo);
    }

    console.log("Datos enviados:");
    edit.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    const data = await lastValueFrom(this.servicios.actualizarModelos(this.objSeleccion.id_version, edit));

    if (data?.message) {
      this.notificationService.showSuccess(data.message);

      // Solo reiniciar si la actualización fue exitosa
      this.visibleEditar = false;
      this.ListadoInformacion();
      form.resetForm();
      this.modelo = null;
    }

  } catch (error) {
    console.error("Error al actualizar el modelo:", error);
    this.notificationService.showError("Error al actualizar el modelo. Intente nuevamente.");
  }
}

  async Desactivar() {
    try {
      const nuevoEstado = { activo: !this.objSeleccion.activo };
  
      //console.log(`Cambiando estado de usuario ${this.objSeleccion.id_usuario} a ${nuevoEstado.activo}`);
  
      // Llamar al servicio correcto
      const data = await lastValueFrom(this.servicios.eliminarModelos(this.objSeleccion.id_version));
  
      if (data?.message) {
        this.notificationService.showSuccess(data.message);
      } else {
        this.notificationService.showSuccess("Estado del usuario actualizado correctamente.");
      }
  
      this.visibleEstado = false;
      this.ListadoInformacion();
  
    } catch (error) {
      console.error("Error al cambiar el estado del usuario: ", error);
      this.notificationService.showError("Error al cambiar el estado del usuario. Intente nuevamente.");
    }
  }

  Cancelar() {
    this.visibleEstado = false; // Cierra el modal sin eliminar
  }

}

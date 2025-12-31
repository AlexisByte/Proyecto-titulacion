import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { NotificationService } from '../../Servicios/notification-service.service';
import { RolesService } from '../../Servicios/API/roles.service';
import { UserServiceService } from '../../Servicios/API/user-service.service';
import { lastValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { DatasetsService} from '../../Servicios/API/datasets.service';
import { NgForm } from '@angular/forms';
import { LoginService } from '../../Servicios/login.service';

@Component({
  selector: 'app-ges-reglas-negocio',
  templateUrl: './ges-reglas-negocio.component.html',
  styleUrls: ['./ges-reglas-negocio.component.css']
})
export class GesReglasNegocioComponent {
   @ViewChild('dt1') table!: Table;

  lsListado:any=[];
  
  objSeleccion:any="-1";

  nombre:string="";
  descripcion:string = '';
  dataset: File | null = null;
  id_dataset: number = 0;
  estado:boolean=true;


  strEstado:any="";

  visibleEditar: boolean=false;
  visibleEstado: boolean=false;
  visibleNuevo: boolean=false;

  constructor
  (
    private servicios: DatasetsService,
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
    this.nombre="";
    this.descripcion= "";
    this.dataset= null;
  }

  ModalEditarInformacion(seleccion:any) {
    this.objSeleccion = {...seleccion};
    this.id_dataset=this.objSeleccion.id_dataset;
    this.nombre=this.objSeleccion.nombre_dataset;
    this.descripcion= this.objSeleccion.descripcion;
    this.visibleEditar = true;
  }

  ModalCambiarEstado(seleccion:any) {
    this.objSeleccion = seleccion;
    this.visibleEstado = true;
  }

  async ListadoInformacion() {
    this.lsListado = await new Promise<any>(resolve => this.servicios.obtener().subscribe(translated => { resolve(translated) }));
    //console.log(this.lsListado)
  }


  onFileSelected(event: any) {
    const file: File = event.target.files[0];
  
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'csv') {
        this.dataset = file;
      } else {
        this.notificationService.showError("Debe seleccionar un archivo .csv válido.");
        event.target.value = ""; // Resetea el input si no es válido
      }
    }
  }

  cargando: boolean = false;
  procesado: boolean = false;

  async RegistrarNuevo(form: any) {
    if (form.invalid || !this.dataset) {
      this.notificationService.showError("Formulario inválido o archivo no seleccionado.");
      return;
    }

    this.cargando = true;  // Inicia carga
    this.procesado = false;

    try {
      const { nombre, descripcion } = form.value;  
      const id = this.serviciolog.getUserLocal();
      const nuevo = new FormData();

      nuevo.append("nombre", nombre);
      nuevo.append("descripcion", descripcion);
      nuevo.append("id_usuario_creador", id.id_usuario);
      nuevo.append("archivo", this.dataset); // Añadir archivo al FormData

      const data = await lastValueFrom(this.servicios.agregar(nuevo));
      
      this.procesado = true; // Marca como procesado

      if (data?.message) {
        this.notificationService.showSuccess(data.message);
      }

      // Cerrar modal, actualizar lista y resetear formulario
      this.visibleNuevo = false;
      this.ListadoInformacion();
      form.resetForm();
      this.dataset = null; // Reinicia el archivo
    } catch (error) {
      console.error("Error al crear el dataset:", error);
      this.notificationService.showError("Error al crear el dataset. Intente nuevamente.");
    }
    finally {
    this.cargando = false; // Finaliza carga
    }
}

async RegistrarActualizacion(form: any) {
  try {
    const { nombre_dataset, version, descripcion } = form.value || {};
    const user = this.serviciolog.getUserLocal();

    if (!user?.id_usuario) {
      this.notificationService.showError("Usuario no autenticado.");
      throw new Error("No se pudo obtener el ID del usuario.");
    }

    if (!this.objSeleccion?.id_version) {
      this.notificationService.showError("No se ha seleccionado un dataset para actualizar.");
      return;
    }

    const edit = new FormData();
    edit.append("nombre_dataset", nombre_dataset);
    edit.append("version", version);
    edit.append("descripcion", descripcion);
    edit.append("id_usuario_creador", user.id_usuario.toString());

    if (this.dataset) {
      edit.append("contenido", this.dataset);
    }

    console.log("Datos enviados:");
    edit.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    const data = await lastValueFrom(this.servicios.actualizar(this.objSeleccion.id_version, edit));

    if (data?.message) {
      this.notificationService.showSuccess(data.message);

      // Solo reiniciar si la actualización fue exitosa
      this.visibleEditar = false;
      this.ListadoInformacion();
      form.resetForm();
      this.dataset = null;
    }

  } catch (error) {
    console.error("Error al actualizar el dataset:", error);
    this.notificationService.showError("Error al actualizar el dataset. Intente nuevamente.");
  }
}

  async Eliminar() {
    try {
      const data = await lastValueFrom(this.servicios.eliminar(this.objSeleccion.id_dataset));
  
      if (data?.message) {
        this.notificationService.showSuccess(data.message);
      } else {
        this.notificationService.showSuccess("Dataset eliminado correctamente.");
      }

      this.visibleEstado = false;
      this.ListadoInformacion();
  
    } catch (error) {
      console.error("Error al eliminar el dataset: ", error);
      this.notificationService.showError("Error al al eliminar el dataset. Intente nuevamente.");
    }
  }

  Cancelar() {
    this.visibleEstado = false; // Cierra el modal sin eliminar
  }

}


import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { NotificationService } from '../../Servicios/notification-service.service';
import { RolesService } from '../../Servicios/API/roles.service';
import { UserServiceService } from '../../Servicios/API/user-service.service';
import { lastValueFrom } from 'rxjs';

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
  email:string = '';
  contrasena:string = '';
  roles: any[] = [];
  rol: number = 0;

  
  estado:boolean=true;


  strEstado:any="";

  visibleEditar: boolean=false;
  visibleEstado: boolean=false;
  visibleNuevo: boolean=false;

  constructor
  (
    private serviciosRol: RolesService,
    private serviciosUsuarios: UserServiceService,
    private notificationService: NotificationService,
  ) { }

  async ngOnInit() {
    await this.ListadoInformacion();
    await this.loadRoles();
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
    this.email= '';
    this.rol= 0;
  }

  ModalEditarInformacion(seleccion:any) {
    this.objSeleccion = {...seleccion};
    this.nombre=this.objSeleccion.nombre;
    this.email= this.objSeleccion.email;
    this.visibleEditar = true;
  }

  ModalCambiarEstado(seleccion:any) {
    this.objSeleccion = seleccion;
    this.visibleEstado = true;
  }

  async ListadoInformacion() {
    this.lsListado = await new Promise<any>(resolve => this.serviciosUsuarios.obtenerUsuarios().subscribe(translated => { resolve(translated) }));
    //console.log(this.lsListado)
  }

  async loadRoles() {
    this.serviciosRol.obtenerRoles().subscribe(
      (data) => {
        this.roles = data; // Asigna los roles al arreglo
      },
      (error) => {
        console.error('Error al cargar los roles:', error);
      }
    );
  }

  async RegistrarNuevo(form: any) {
    try {
      const { nombre, email, contrasena, rol } = form.value;  
      const nuevo = { nombre, email, contrasena, rol };

      // Llamada al servicio con el objeto correcto
      const data = await lastValueFrom(this.serviciosUsuarios.agregarUsuario(nuevo));

      if (data?.message) {
        this.notificationService.showSuccess(data.message);
      }

      // Cerrar modal, actualizar lista y resetear formulario
      this.visibleNuevo = false;
      this.ListadoInformacion();
      form.resetForm();

    } catch (error) {
      console.error("Error al crear el rol:", error);
      this.notificationService.showError("Error al crear el rol. Intente nuevamente.");
    }
  }

  async RegistrarActualizacion(form: any) {
    if (form.valid) { 
      try {
        const { nombre, email } = form.value;  
        const edit = { nombre, email };
  
        console.log({ ...edit, id_usuario: this.objSeleccion.id_usuario });
  
        // Verifica que el servicio correcto sea llamado
        const data = await lastValueFrom(this.serviciosUsuarios.actualizarUsuario(this.objSeleccion.id_usuario, edit));
  
        if (data?.message) {
          this.notificationService.showSuccess(data.message);
        }
  
        this.visibleEditar = false;
        this.ListadoInformacion();
  
      } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        this.notificationService.showError("Error al actualizar el usuario. Intente nuevamente.");
      }
    } else {
      this.notificationService.showError("Formulario inválido. Verifique los campos.");
    }
  }

  async Desactivar() {
    try {
      const nuevoEstado = { activo: !this.objSeleccion.activo };
  
      //console.log(`Cambiando estado de usuario ${this.objSeleccion.id_usuario} a ${nuevoEstado.activo}`);
  
      // Llamar al servicio correcto
      const data = await lastValueFrom(this.serviciosUsuarios.cambiarEstadoUsuario(this.objSeleccion.id_usuario, nuevoEstado));
  
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

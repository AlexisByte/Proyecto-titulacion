import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { NotificationService } from '../../Servicios/notification-service.service';
import { RolesService } from '../../Servicios/API/roles.service';
import { UserServiceService } from '../../Servicios/API/user-service.service';
import { lastValueFrom } from 'rxjs';
import { NgForm } from '@angular/forms';
import { LoginService } from '../../Servicios/login.service';

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
  rol: number = 0;

  
  estado:boolean=true;
  showPassword: boolean = false;


  strEstado:any="";

  visibleEditar: boolean=false;
  visibleEstado: boolean=false;
  visibleNuevo: boolean=false;

  constructor
  (
    private serviciosRol: RolesService,
    private servicioLog: LoginService,
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
    const id_user = this.servicioLog.getUserLocal().id_usuario;
    //console.log('Formulario válido:', id_user);
    this.lsListado = await new Promise<any>(resolve => {
      this.serviciosUsuarios.obtenerUsuarios().subscribe(usuarios => {
        const usuariosFiltrados = usuarios.filter((usuario: any) => usuario.id_usuario !== id_user);
        resolve(usuariosFiltrados);
      });
    });
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
    if (form.valid) {
      try {
        console.log('Formulario válido:', form.value);
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
        //console.error("Error al crear el rol:", error);
        this.notificationService.showError("Error al crear el usuario. Intente nuevamente.");
        console.log('Formulario inválido0:', form.value);
      }
    }else{
      this.notificationService.showError("Ingrese todos los campos. Intente nuevamente.");
      console.log('Formulario inválido:', form.value);
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}

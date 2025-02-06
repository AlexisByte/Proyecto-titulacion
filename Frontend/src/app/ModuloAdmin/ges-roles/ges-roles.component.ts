import { Component, HostListener, ViewChild } from '@angular/core';
import { RolesService } from '../../Servicios/API/roles.service';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { UrlServiciosWebService } from '../../Servicios/url-servicios-web.service';

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
  
  newoferta: string  = '';
  objSeleccion:any="-1";
  gc_necesarios: any;
  fecha_inicio: Date = new Date;
  fecha_fin: Date = new Date;
  seccion: string = '1';
  title = 'GreenPoint';
  descripcion: string = 'Nada fuera de lo normal';
  negocio: any = {};
  sidebarCollapsed = false;
  cantidad: number = 0;
  lsListado: any[] = [];
  loading: boolean = false;

  constructor(
    public authService: RolesService,
    private router: Router,
    private servicios: UrlServiciosWebService,
    
  ) {}

  async ngOnInit() {
    await this.ListadoInformacion();
    await this.addFormValidation();
  }

  async ListadoInformacion() {
    this.loading = true;
    this.lsListado = await new Promise<any>(resolve => this.authService.ListadoRoles().subscribe(translated => { resolve(translated) }));
    //console.log(this.all_ofertas)
  }

  ModalNuevoInformacion() {
    this.newoferta="";
    this.gc_necesarios=0;
    this.fecha_inicio = new Date;
    this.fecha_fin = new Date;
    this.visibleNuevo = true;
  }

    ModalEditarInformacion(seleccion:any) {
      this.objSeleccion = seleccion;
      this.newoferta = this.objSeleccion.descripcion;
      this.gc_necesarios = this.objSeleccion.gc_necesarios;
        this.visibleEditar = true;
    }

    ModalCambiarEstado(seleccion:any) {
      this.objSeleccion=seleccion;
      //console.log(this.objSeleccion)
      this.visibleEstado = true;
    }

    async addFormValidation() {
      setTimeout(() => {
        const forms = document.querySelectorAll('.needs-validation');
        Array.prototype.slice.call(forms).forEach((form: HTMLFormElement) => {
          form.addEventListener('submit', (event: Event) => {
              if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
              }
            form.classList.add('was-validated');
          }, false);
        });
      });
    }

  async RegistrarNuevo(form: NgForm){
    if (form.valid){ 
      try {
        console.log("ID DE LA OFERTA:"+this.objSeleccion.ofertas_id);
        await this.Obtener_Ofertas();
        this.visibleNuevo =false;

      } catch (error) {
        console.error("Error al crear la oferta: ", error);
        //this.messages1 = [{severity:'error', summary:'Error', detail: "Error al crear la oferta "}];
      }
    }else{
    }
  }

  async RegistrarActualizacion(form: NgForm){
    if (form.valid){ 
      try {
        console.log("ID DE LA OFERTA:"+this.objSeleccion.ofertas_id);
        await this.Obtener_Ofertas();
        this.visibleEditar =false;

      } catch (error) {
        //console.error("Error al actualizar la oferta: ", error);
        //this.messages1 = [{severity:'error', summary:'Error', detail: "Error al crear la oferta "}];
      }
    }else{
    }
  }

  async DesactivarOferta(){
    //this.loading = true;
    try {
      console.log("ID DE LA OFERTA:"+this.objSeleccion.ofertas_id);
      await this.Obtener_Ofertas();
      this.visibleEstado=false;
    } catch (error) {
      console.error("Error al desactivar la oferta: ", error);
    } finally {
      this.loading = false;
    }
  }

  menus: { [key: string]: boolean } = {};

  toggleMenu(menu: string, event: Event) {
    this.menus[menu] = !this.menus[menu];
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    Object.keys(this.menus).forEach(menu => {
      this.menus[menu] = false;
    });
  }


  async Obtener_Ofertas() {
    this.loading = true;
    try {
    } catch (error) {
      console.error("Error obteniendo las ofertas: ", error);
    } finally {
      this.loading = false;
    }
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
import { Router } from '@angular/router';
import { Component, OnInit,HostListener} from '@angular/core';
import { NotificationService } from '../../Servicios/notification-service.service';
import { LoginService } from '../../Servicios/login.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-inicio-admin',
  templateUrl: './inicio-admin.component.html',
  styleUrls: ['./inicio-admin.component.css',
  "../../../assets/vendor/bootstrap-icons/bootstrap-icons.css"]
})

export class InicioAdminComponent  implements OnInit{

  seccion: string = '1';
  activeMenu: string = ''; // Variable para rastrear el menú activo
  activeSection: string = ''; // Variable para rastrear la sección activa
  collapsed: boolean = true; // O `false` según tu estado inicial

  dato: any = {};

  sidebarCollapsed = false;
  showProfileMenu = false; // Variable para controlar la visibilidad del dropdown

  constructor(
    public  authService: LoginService, 
    private router: Router,
    private notificationService: NotificationService, // Inyecta el servicio MatSnackBar

  ) {}

  ngOnInit(): void {
    this.loadUserData()
    this.collapsed = !this.collapsed;

  }
  async loadUserData(): Promise<void> {
    this.dato = await lastValueFrom(this.authService.getUser()); // 🔥 Convertimos el Observable en una Promise
    //console.log(this.user);
  }
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
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

  // Función para cerrar el dropdown cuando se hace clic fuera de él
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.profile')) {
      this.showProfileMenu = false;
    }
  }

   private setActiveMenu(menu: string) {
    this.activeMenu = menu;
  }

  private setActiveSection(section: string) {
    this.activeSection = section;
  }

  logout() {
    this.authService.logout().subscribe(response => {
      this.notificationService.showSuccess(response.message);
      console.log(response.message); // Puedes usar un servicio de notificación aquí
      this.router.navigate(['/']);

    });    
  }
  SeccionPanelPrincipal(event: Event) {
    this.setActiveMenu('dashboard'); // Marca el menú "Panel Principal" como activo
    this.setActiveSection(''); // Limpia la sección activa
    event.preventDefault();
    this.seccion = '1';
  }
  SeccionUsuarios(event: Event){
    event.preventDefault();
    this.seccion = '2';
    this.setActiveSection('Usuarios');
    this.setActiveMenu(''); 
    //console.log("Sección cambiada a:", this.seccion);
  }

  SeccionRoles(event: Event){
    event.preventDefault();
    this.seccion = '3';
    this.setActiveSection('Roles');
    this.setActiveMenu(''); 
    //console.log("Sección cambiada a:", this.seccion);
  }

  SeccionModelos(event: Event){
    event.preventDefault();
    this.seccion = '4';
    this.setActiveSection('Modelos');
    this.setActiveMenu(''); 
    //console.log("Sección cambiada a:", this.seccion);
  }
  SeccionReglas(event: Event){
    event.preventDefault();
    this.seccion = '5';
    this.setActiveSection('Reglas');
    this.setActiveMenu(''); 
    //console.log("Sección cambiada a:", this.seccion);
  }
  SeccionPerfil(event: Event) {
    event.preventDefault();
    this.setActiveMenu('profile'); // Marca el menú "Perfil" como activo
    this.setActiveSection(''); // Limpia la sección activa
    this.collapsed = true; // Colapsa la sección de gestión
    this.seccion = '8';
  }
}


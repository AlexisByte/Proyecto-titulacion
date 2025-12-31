import { Router } from '@angular/router';
import { Component, OnInit,HostListener} from '@angular/core';
import { NotificationService } from '../../Servicios/notification-service.service';
import { LoginService } from '../../Servicios/login.service';
import { lastValueFrom } from 'rxjs';
import { DatasetsService} from '../../Servicios/API/datasets.service';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { ModelosService } from '../../Servicios/API/modelos.service';
import { EntrenamientoService } from '../../Servicios/API/entrenamiento.service';

@Component({
  selector: 'app-inicio-admin',
  templateUrl: './inicio-admin.component.html',
  styleUrls: ['./inicio-admin.component.css',
  "../../../assets/vendor/bootstrap-icons/bootstrap-icons.css"]
})

export class InicioAdminComponent  implements OnInit{

    // Tarjetas
  totalDatasets : number = 0;
  totalModelosIA : number = 0;
  totalModelosEntrenados : number = 0;

  barChartLabels: string[] = [];
  barChartData: ChartDataset<'bar'>[] = [];

  radarChartLabels: string[] = ['Precisión', 'Recall', 'F1 Score', 'Exactitud'];
  radarChartData: ChartDataset<'radar'>[] = [];

  // Gráfico de barras (Top 5 modelos entrenados)
  barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Top 5 Modelos' }
    }
  };


  // Radar chart
  radarChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 1,
        ticks: {
          stepSize: 0.1,
          backdropColor: 'transparent'
        },
        grid: {
          circular: true
        },
        pointLabels: {
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: { display: true },
      title: { display: false }
    }
  };


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
    private serviciosData: DatasetsService,
    private serviciosModelos: ModelosService,
    private serviciosEntrenados:EntrenamientoService,

  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadUserData()
    await this.ListadoInformacion();
    this.collapsed = !this.collapsed;
    await this.cargarGraficosTop5();
  }

  top5Modelos: any[] = []; // Para usarlo en onBarClick

  async cargarGraficosTop5(): Promise<void> {
    try {
      const entrenados = await lastValueFrom(this.serviciosEntrenados.obtener());

      // Ordena por precisión y toma los primeros 5
      this.top5Modelos = entrenados.sort((a: any, b: any) => b.precision - a.precision).slice(0, 5);

      this.barChartLabels = this.top5Modelos.map(m => m.modelo_version.nombre_modelo);
      const precisionData = this.top5Modelos.map(m => m.precision);
      const f1ScoreData = this.top5Modelos.map(m => m.f1_score);

      this.barChartData = [
        { label: 'Precisión', data: precisionData, backgroundColor: '#4ade80' },
        { label: 'F1 Score', data: f1ScoreData, backgroundColor: '#60a5fa' }
      ];

      this.setRadarData(this.top5Modelos[0]); // Cargar radar por defecto (primer modelo)

    } catch (error) {
      console.error('Error al cargar modelos entrenados', error);
    }
  }

  setRadarData(modelo: any): void {
    this.radarChartData = [
      {
        label: modelo.modelo_version.nombre_modelo,
        data: [
          modelo.precision,
          modelo.recall,
          modelo.f1_score,
          modelo.exactitud
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.4)',
        borderColor: '#6366f1',
        pointBackgroundColor: '#6366f1'
      }
    ];
  }

  onBarClick(event: any): void {
    const index = event?.active?.[0]?.index;
    if (index != null && this.top5Modelos[index]) {
      this.setRadarData(this.top5Modelos[index]);
    }
  }

  async loadUserData(): Promise<void> {
    this.authService.getUser().subscribe(user => {
      this.dato = user;
    });
    //console.log(this.user);
  }

  async ListadoInformacion() {
    const data = await new Promise<any>(resolve => 
      this.serviciosData.obtener().subscribe(translated => resolve(translated))
    );
    this.totalDatasets = data.length;
    const modelos = await new Promise<any>(resolve => 
      this.serviciosModelos.obtenerModelos().subscribe(translated => resolve(translated))
    );
    this.totalModelosIA = modelos.length;
    const entrenados = await new Promise<any>(resolve => 
      this.serviciosEntrenados.obtener().subscribe(translated => resolve(translated))
    );
    this.totalModelosEntrenados = entrenados.length;
    console.log(this.totalDatasets+"-"+this.totalModelosIA+"-"+this.totalModelosEntrenados)
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
  SeccionDataset(event: Event){
    event.preventDefault();
    this.seccion = '5';
    this.setActiveSection('Datasets');
    this.setActiveMenu(''); 
    //console.log("Sección cambiada a:", this.seccion);
  } 
  SeccionReglas(event: Event){
    event.preventDefault();
    this.seccion = '6';
    this.setActiveSection('Reglas');
    this.setActiveMenu(''); 
    //console.log("Sección cambiada a:", this.seccion);
  }
  SeccionEntrenamiento(event: Event) {
    event.preventDefault();
    this.setActiveMenu('entrenamiento'); // Marca el menú "Perfil" como activo
    this.setActiveSection(''); // Limpia la sección activa
    this.collapsed = true; // Colapsa la sección de gestión
    this.seccion = '7';
  } 
   SeccionModeloIa(event: Event) {
    event.preventDefault();
    this.setActiveMenu('modeloIa'); // Marca el menú "Perfil" como activo
    this.setActiveSection(''); // Limpia la sección activa
    this.collapsed = true; // Colapsa la sección de gestión
    this.seccion = '8';
  } 
   SeccionClasificar(event: Event) {
    event.preventDefault();
    this.setActiveMenu('clasificar'); // Marca el menú "Perfil" como activo
    this.setActiveSection(''); // Limpia la sección activa
    this.collapsed = true; // Colapsa la sección de gestión
    this.seccion = '9';
  } 
  SeccionPerfil(event: Event) {
    event.preventDefault();
    this.setActiveMenu('profile'); // Marca el menú "Perfil" como activo
    this.setActiveSection(''); // Limpia la sección activa
    this.collapsed = true; // Colapsa la sección de gestión
    this.seccion = '10';
  }
  SeccionLogs(event: Event) {
    event.preventDefault();
    this.setActiveMenu('logs'); // Marca el menú "Perfil" como activo
    this.setActiveSection(''); // Limpia la sección activa
    this.collapsed = true; // Colapsa la sección de gestión
    this.seccion = '11';
  }
}


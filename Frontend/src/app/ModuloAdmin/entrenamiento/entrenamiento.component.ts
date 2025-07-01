import { Component, OnInit,HostListener} from '@angular/core';
import { NotificationService } from '../../Servicios/notification-service.service';
import { LoginService } from '../../Servicios/login.service';
import { DatasetsService} from '../../Servicios/API/datasets.service';
import { ModelosService } from '../../Servicios/API/modelos.service';
import { EntrenamientoService } from '../../Servicios/API/entrenamiento.service';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { lastValueFrom } from 'rxjs';
import { ChartConfiguration, ChartData, ChartType ,ChartOptions} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables, ChartDataLabels);


@Component({
  selector: 'app-entrenamiento',
  templateUrl: './entrenamiento.component.html',
  styleUrls: ['./entrenamiento.component.css']
})
export class EntrenamientoComponent {
  ModeloSeleccionado: number | null = null;
  DatasetSeleccionado: number | null = null;

  collapsed: boolean = true; // O `false` según tu estado inicial
  activeMenu: string = ''; // Variable para rastrear el menú activo
  showProfileMenu = false; // Variable para controlar la visibilidad del dropdown

 
  skip_columns: number | null = 0;
  test_size: number | null = 0.2;
  random_state: number | null = 64;

  cargando: boolean = false;
  procesado: boolean = false;
  entrenamientoCompletado: boolean = false;

  maxColumnas: number=0;
  lsListadoModel:any=[];
  lsListadoData:any=[];

  matrizConfusion: number[][] = [];
  etiquetas: string[][] = [];
  precision : number=0;
  exactitud : number=0;
  recall : number=0;
  f1Score :number=0;

  tiempoProcesamiento: string = ''; 

  menus: { [key: string]: boolean } = {
      Dashboard: false,
  };  
  
  toggleMenu(menu: string, event: Event) {
    this.menus[menu] = !this.menus[menu];
    event.stopPropagation();
  }
 // Configuración para el gráfico de barras de métricas
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Métricas de Evaluación del Modelo'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: function(value) {
            return (Number(value) * 100).toFixed(0) + '%';
          }
        }
      }
    }
  };

  // Configuración para el gráfico de dona de la matriz de confusión
 public doughnutChartOptions: any = { // <-- usa any para evitar errores TS
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          generateLabels: (chart: Chart<'doughnut'>) => {
            const data = chart.data.datasets[0].data as number[];
            const labels = chart.data.labels as string[];
            const bgColors = chart.data.datasets[0].backgroundColor as string[];
            const total = data.reduce((a, b) => a + b, 0);
            return labels.map((label, i) => ({
              text: `${label}: ${data[i]} (${((data[i] / total) * 100).toFixed(1)}%)`,
              fillStyle: bgColors[i],
              strokeStyle: '#000',
              lineWidth: 1,
              hidden: false,
              index: i
            }));
          }
        }
      },
      title: {
        display: true,
        text: 'Distribución de Clasificaciones'
      },
      datalabels: {
        color: 'black',
         formatter: (value: number, ctx: any) => {
          const data = ctx.chart.data.datasets[0].data as number[];
          const total = data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return [value.toString(), `(${percentage}%)`]; // <== esto crea dos líneas
        },
        font: {
          weight: 'bold',
          size: 12
        }
      }
    }
  };

  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };

  private formatearDuracion(ms: number): string {
    const horas = Math.floor(ms / 3600000);
    const minutos = Math.floor((ms % 3600000) / 60000);
    const segundos = Math.floor((ms % 60000) / 1000);
    const milisegundos = Math.floor(ms % 1000);

    return `${this.pad(horas)}:${this.pad(minutos)}:${this.pad(segundos)}.${milisegundos}`;
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  constructor
    (
      private notificationService: NotificationService,
      private serviciolog: LoginService,
      private serviciosData: DatasetsService,
      private serviciosModelo: ModelosService,
      private servicios:EntrenamientoService,
    ) { }
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

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

   async ngOnInit() {
    await this.ListadoInformacion();
    this.prepararDatosGraficos();
  }

  async ListadoInformacion() {
    this.lsListadoModel = await new Promise<any>(resolve => this.serviciosModelo.obtenerModelos().subscribe(translated => { resolve(translated) }));
    this.lsListadoData = await new Promise<any>(resolve => this.serviciosData.obtener().subscribe(translated => { resolve(translated) }));
    //console.log(this.lsListadoModel)
    //console.log(this.lsListadoData)
  }

  verificarActivarOpcionesAvanzadas(): void {
    const modeloSeleccionadoValido = !!this.ModeloSeleccionado;
    const datasetSeleccionadoValido = !!this.DatasetSeleccionado;

    // Activar si ambos están seleccionados
    if (modeloSeleccionadoValido && datasetSeleccionadoValido) {
      this.menus['OpcionesAvanzadas'] = true;

      // Establecer límite para skip_columns
      const dataset = this.lsListadoData.find((d: any) => d.id_dataset === this.DatasetSeleccionado);
      if (dataset && dataset.num_columnas != null) {
        this.maxColumnas = Math.floor(dataset.num_columnas / 2);
      }
    } else {
      this.menus['OpcionesAvanzadas'] = false;
    }
  }

  async Entrenar(form: any){
    if (form.invalid ) {
      this.notificationService.showError("Formulario inválido o archivo no seleccionado.");
      return;
    }      

    if (!this.ModeloSeleccionado || !this.DatasetSeleccionado) {
      this.notificationService.showError("Debe seleccionar modelo y dataset.");
      return;
    }
     // Validación adicional
    if (this.skip_columns! < 0 || this.skip_columns! > this.maxColumnas ||
        this.test_size! < 0.2 || this.test_size! > 0.4 ||
        this.random_state! < 64 || this.random_state! > 100) {
      this.notificationService.showError("Parámetros avanzados fuera de rango.");
      return;
    }

    this.cargando = true;  // Inicia carga
    this.procesado = false;

    try {
          const { ModeloSeleccionado, DatasetSeleccionado,skip_columns,test_size,random_state } = form.value;  
          const id = this.serviciolog.getUser1();
          
          if (!id?.id_usuario) {
            this.notificationService.showError("Usuario no autenticado.");
            throw new Error("No se pudo obtener el ID del usuario.");
          }

          const entrenamiento = {
            id_version: this.ModeloSeleccionado,
            id_dataset: this.DatasetSeleccionado,
            skip_columns: this.skip_columns ?? 0,      // usa 0 si es null
            test_size: this.test_size ?? 0.2,          // valor por defecto
            random_state: this.random_state ?? 64, 
            id_usuario_creador: id.id_usuario
          };          
          //console.log(entrenamiento)
          const tiempoInicio = performance.now(); // ⏱️ INICIO

          const data = await lastValueFrom(this.servicios.Entrenar(entrenamiento));
          
          const tiempoFin = performance.now(); // ⏱️ FIN
          const duracionMs = tiempoFin - tiempoInicio;
          this.tiempoProcesamiento = this.formatearDuracion(duracionMs);
          this.procesado = true; // Marca como procesado

          if (data?.message) {
            console.log("Respuesta Servidor:\n" + JSON.stringify(data, null, 2));
            this.notificationService.showSuccess(data.message);
            this.menus['Dashboard'] = true;

            const res = data.nuevoResultado;
            const matrizObj = JSON.parse(res.matriz_confusion);
            this.matrizConfusion = matrizObj.matriz;
            this.etiquetas = matrizObj.etiquetas;

            this.precision = res.precision;
            this.exactitud = res.exactitud;
            this.recall = res.recall;
            this.f1Score = res.f1_score;
            
            // Actualizar gráficos
            this.actualizarGraficos();

            // Actualizar gráfico de dona
            this.prepararDatosGraficos();

            this.entrenamientoCompletado = true;
            this.cargando = false;

          }
    
          // Cerrar modal, actualizar lista y desactivar el formulario
          form.form.disable();   // 🔒 Desactiva todo el formulario
        } catch (error) {
          console.error("Error al entrenar:", error);

            if (error instanceof HttpErrorResponse) {
              if (error.status === 409) {
                const mensaje = error.error?.message || "Ya existe un resultado para esta combinación.";
                this.notificationService.showError(mensaje);
              } else {
                this.notificationService.showError("Error al entrenar el modelo. Código: " + error.status);
              }
            } else {
              this.notificationService.showError("Error desconocido. Intente nuevamente.");
            }        }
        finally {
        this.cargando = false; // Finaliza carga
        }
  }

  actualizarGraficos(): void {
    // Actualizar datos del gráfico de barras
    this.barChartData.datasets[0].data = [
      this.precision, 
      this.exactitud, 
      this.recall, 
      this.f1Score
    ];

    // Forzar actualización del gráfico
    if (this.chart) {
      this.chart.update();
    }
  }

  prepararDatosGraficos(): void {
    if (!this.matrizConfusion || this.matrizConfusion.length === 0) {
      this.doughnutChartData = { labels: [], datasets: [] };
      return;
    }

    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColor: string[] = [];

    for (let i = 0; i < this.matrizConfusion.length; i++) {
      labels.push(`${this.etiquetas[i] || 'Clase ' + i}`);
      data.push(this.matrizConfusion[i][i] || 0);
      backgroundColor.push(`hsla(${(i * 120) % 360}, 70%, 60%, 0.8)`);
    }

    this.doughnutChartData = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColor,
        borderColor: backgroundColor.map(color => color.replace('0.8', '1')),
        borderWidth: 2
      }]
    };

    if (this.chart) {
      this.chart.update();
    }
  }

  formatearPorcentaje(valor: number): string {
    return (valor * 100).toFixed(2) + '%';
  }

  getColorCelda(i: number, j: number): string {
    if (!this.matrizConfusion || !this.matrizConfusion[i] || this.matrizConfusion[i][j] === undefined) {
      return 'transparent';
    }

    const valor = this.matrizConfusion[i][j];
    const maximo = Math.max(...this.matrizConfusion.flat());
    const intensidad = valor / (maximo || 1); // Evita división por cero

    return i === j
      ? `rgba(76, 175, 80, ${0.3 + intensidad * 0.7})`
      : `rgba(244, 67, 54, ${0.1 + intensidad * 0.6})`;
  }

  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Precisión', 'Exactitud', 'Recall', 'F1-Score'],
    datasets: [
      {
        data: [this.precision*100, this.exactitud*100, this.recall*100, this.f1Score*100],
        label: 'Valores',
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 205, 86, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 205, 86, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  reiniciarFormulario() {
    this.entrenamientoCompletado = false;
    this.ModeloSeleccionado = null;
    this.DatasetSeleccionado = null;
    this.skip_columns = 0;
    this.test_size = 0.2;
    this.random_state = 64;
    this.matrizConfusion = [];
    this.precision = 0;
    this.exactitud = 0;
    this.recall = 0;
    this.f1Score = 0;
    this.etiquetas = [];
    this.procesado = false;

    // Volver a preparar gráficos vacíos
    this.actualizarGraficos();

    // Reactivar el formulario HTML si fue deshabilitado
    const formElement = document.querySelector('form');
    if (formElement) {
      const inputs = formElement.querySelectorAll('input, select, textarea, button');
      inputs.forEach(input => (input as HTMLInputElement).disabled = false);
    }
  }

}

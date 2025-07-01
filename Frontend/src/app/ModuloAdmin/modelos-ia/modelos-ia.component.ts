import { Component, OnInit,HostListener} from '@angular/core';
import { NotificationService } from '../../Servicios/notification-service.service';
import { LoginService } from '../../Servicios/login.service';
import { DatasetsService} from '../../Servicios/API/datasets.service';
import { ModelosService } from '../../Servicios/API/modelos.service';
import { EntrenamientoService } from '../../Servicios/API/entrenamiento.service';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { NgForm } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { ChartConfiguration, ChartData, ChartType,ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { BaseChartDirective } from 'ng2-charts';
import { ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-modelos-ia',
  templateUrl: './modelos-ia.component.html',
  styleUrls: ['./modelos-ia.component.css']
})
export class ModelosIAComponent {
  collapsed: boolean = true; // O `false` según tu estado inicial
  activeMenu: string = ''; // Variable para rastrear el menú activo
  showProfileMenu = false; // Variable para controlar la visibilidad del dropdown
  matrizConfusion: number[][] = [];
  etiquetas: string[][] = [];
  precision : number=0;
  exactitud : number=0;
  recall : number=0;
  f1Score :number=0;

  lsListado:any=[];
  
  objSeleccion:any="-1";
  
  visibleEditar: boolean=false;  

  menus: { [key: string]: boolean } = {
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

  constructor
    (
      private notificationService: NotificationService,
      private servicios:EntrenamientoService,

    ) { }
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    Object.keys(this.menus).forEach(menu => this.menus[menu] = false);
    if (!(event.target as HTMLElement).closest('.profile')) {
      this.showProfileMenu = false;
    }
  }

   async ngOnInit() {
    await this.ListadoInformacion();
    this.prepararDatosGraficos();
  }
  

  async ListadoInformacion() {
    this.lsListado = await new Promise<any>(resolve => this.servicios.obtener().subscribe(translated => { resolve(translated) }));
    console.log(this.lsListado)
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
    return (valor*100).toFixed(2) + '%';
  }

  getColorCelda(i: number, j: number): string {
    const valor = this.matrizConfusion[i][j];
    const maximo = Math.max(...this.matrizConfusion.flat());
    const intensidad = valor / maximo;
    
    if (i === j) {
      // Diagonal principal (predicciones correctas) - verde
      return `rgba(76, 175, 80, ${0.3 + intensidad * 0.7})`;
    } else {
      // Errores - rojo
      return `rgba(244, 67, 54, ${0.1 + intensidad * 0.6})`;
    }
  }

  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Precisión', 'Exactitud', 'Recall', 'F1-Score'],
    datasets: [
      {
        data: [this.precision, this.exactitud, this.recall, this.f1Score],
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

   @ViewChild('dt1') table!: Table;
  
    applyFilter(event: Event) {
      const input = event.target as HTMLInputElement;
      if (input) {
        this.table.filterGlobal(input.value, 'contains');
      }
    }
  
    clear(table: Table) {
      table.clear();
    }
  
    Ver(seleccion: any) {
      this.visibleEditar=true;  

      this.objSeleccion = { ...seleccion };
      console.log("Seleccionado:\n", this.objSeleccion);

      // ✅ Detectar si es string o ya objeto
      let matrizObj;
      if (typeof this.objSeleccion.matriz_confusion === 'string') {
        try {
          matrizObj = JSON.parse(this.objSeleccion.matriz_confusion);
        } catch (error) {
          this.notificationService.showError("Error al interpretar la matriz de confusión.");
          return;
        }
      } else {
        matrizObj = this.objSeleccion.matriz_confusion;
      }

      // Asignar valores
      this.matrizConfusion = matrizObj.matriz;
      this.etiquetas = matrizObj.etiquetas;
      this.precision = this.objSeleccion.precision;
      this.exactitud = this.objSeleccion.exactitud;
      this.recall = this.objSeleccion.recall;
      this.f1Score = this.objSeleccion.f1_score; // fallback por si viene con nombre distinto

      // Actualizar gráficos
      this.actualizarGraficos();
      this.prepararDatosGraficos();
    }

}

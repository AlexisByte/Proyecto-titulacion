import { Component, OnInit,HostListener} from '@angular/core';
import { NotificationService } from '../../Servicios/notification-service.service';
import { LoginService } from '../../Servicios/login.service';
import { EntrenamientoService } from '../../Servicios/API/entrenamiento.service';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { lastValueFrom } from 'rxjs';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ViewChild } from '@angular/core';
import { DatasetsService} from '../../Servicios/API/datasets.service';
import { API_CONFIG } from '../../../config/api -config';
import { ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-clasificar',
  templateUrl: './clasificar.component.html',
  styleUrls: ['./clasificar.component.css']
})
export class ClasificarComponent {
  @ViewChild('form') form!: NgForm;

  ModeloSeleccionado: number | null = null;
  Seleccionado: number | null = null;

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
  lsListado:any=[];

  precision : number=0;
  exactitud : number=0;
  recall : number=0;
  f1Score :number=0;

  archivoCsv: File | null = null;
  columnasFormulario: string[] = [];
  valoresFormulario: { [key: string]: any } = {};

  resultadoFormulario: any = null;
  tiempoProcesamiento: string = ''; 
  archivoClasificado: string | null = null;

  lsListadoOpc = [
    { id: 1, nombre: 'CSV' },
    { id: 2, nombre: 'Formulario' }
  ];

  menus: { [key: string]: boolean } = {
      Dashboard: false,
  };  
  
  toggleMenu(menu: string, event: Event) {
    this.menus[menu] = !this.menus[menu];
    event.stopPropagation();
  }
 
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
      private servicios:EntrenamientoService,
      private serviciosDataset:DatasetsService,
      private cdr: ChangeDetectorRef,

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
  }

 async ListadoInformacion() {
  const data = await lastValueFrom(this.servicios.obtener());
  this.lsListado = data.map((item: any) => {
    return {
      ...item,
      displayLabel: `${item.modelo_version.nombre_modelo} - ${item.dataset.nombre} - (${item.precision.toFixed(2)}%-${item.exactitud.toFixed(2)}%) - ${new Date(item.fecha_entrenamiento).toLocaleDateString('es-EC', { year: '2-digit', month: '2-digit', day: '2-digit' })}`
    };
  });
  console.log(this.lsListado)
}

cargarMetricasModelo(idSeleccionado: number) {
  const modelo = this.lsListado.find((m: any) => m.id_resultado === idSeleccionado);
  this.Seleccionado = null; // 🔹 Limpiar selección CSV/Formulario
  this.columnasFormulario = [];
  this.valoresFormulario = {};
  if (modelo) {
    this.precision = modelo.precision ?? 0;
    this.exactitud = modelo.exactitud ?? 0;
    this.recall = modelo.recall ?? 0;
    this.f1Score = modelo.f1_score ?? 0;
  } else {
    this.menus['Dashboard'] = false;
    this.precision = 0;
    this.exactitud = 0;
    this.recall = 0;
    this.f1Score = 0;
  }
  this.menus['Dashboard'] = true;
}

  onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.archivoCsv = file;
      console.log("Archivo CSV seleccionado:", this.archivoCsv);
    } else {
      this.notificationService.showError("Por favor seleccione un archivo CSV válido.");
    }
  }

  onSeleccionForma() {
    if (this.Seleccionado === 2) {
      console.log("formulario")
      this.cargarColumnasFormulario(); // Carga columnas dinámicamente
    } else {
      this.columnasFormulario = [];
      this.valoresFormulario = {};
    }
  }

  async cargarColumnasFormulario() {
    if (!this.ModeloSeleccionado) return;

    const modelo = this.lsListado.find((m: any) => m.id_resultado === this.ModeloSeleccionado);
    const idDataset = modelo.id_dataset;
    console.log(modelo);
    console.log(idDataset);

    if (!idDataset) return;

    try {
      const metadata = await lastValueFrom(this.serviciosDataset.obtenerPorId(idDataset));
      console.log(metadata);

      this.columnasFormulario = [
        ...(metadata.columnas_categoricas || []),
        ...(metadata.columnas_numericas || [])
      ];

      this.valoresFormulario = {};
      for (const col of this.columnasFormulario) {
        this.valoresFormulario[col] = '';
      }
    } catch (error) {
      console.error("Error obteniendo metadata del dataset:", error);
      this.notificationService.showError("No se pudo obtener la estructura del dataset.");
    }
  }

  ngOnChanges() {
    if (this.Seleccionado === 2) {
      this.cargarColumnasFormulario();
    }
  }

  get puedeClasificar(): boolean {
    if (!this.ModeloSeleccionado || !this.Seleccionado) return false;

    if (this.Seleccionado === 1) {
      // CSV: necesita archivo
      return !!this.archivoCsv;
    }

    if (this.Seleccionado === 2) {
      // Formulario: al menos 40% de campos llenos
      const total = this.columnasFormulario.length;
      const llenos = Object.values(this.valoresFormulario || {}).filter(v => v?.trim() !== '').length;
      return total > 0 && (llenos / total) >= 0.4;
    }

    return false;
  }

  async Clasificar(form: any) {
    if (form.invalid || !this.ModeloSeleccionado || !this.Seleccionado) {
      this.notificationService.showError("Debe seleccionar el modelo y la forma de clasificación.");
      return;
    }

    const usuarioLocal = this.serviciolog.getUserLocal();
    if (!usuarioLocal || !usuarioLocal.id_usuario) {
      this.notificationService.showError("Usuario no autenticado.");
      return;
    }

    // Deshabilitar formulario completo
    form.form.disable();

    this.cargando = true;
    this.procesado = false;
    this.archivoClasificado = null;
    this.resultadoFormulario = null;
    const formData = new FormData();
    formData.append('id_modelo_entrenado', this.ModeloSeleccionado.toString());
    formData.append('id_usuario_creador', usuarioLocal.id_usuario.toString());

    const tiempoInicio = performance.now();

    try {
      let respuesta: any;

      if (this.Seleccionado === 1) {
        // CSV
        if (!this.archivoCsv) {
          this.notificationService.showError("Debe seleccionar un archivo CSV.");
          return;
        }

        formData.append('archivo', this.archivoCsv);
        // Mostrar contenido del FormData en consola
        formData.forEach((valor, clave) => {
          if (valor instanceof File) {
            console.log(`🔹 ${clave}: [Archivo] ${valor.name}, tipo: ${valor.type}, tamaño: ${valor.size} bytes`);
          } else {
            console.log(`🔹 ${clave}: ${valor}`);
          }
        });
        respuesta = await lastValueFrom(this.servicios.ClasificarCSV(formData));

        const resultado = respuesta?.resultado;
        if (resultado?.archivo_salida) {
this.archivoClasificado = `${API_CONFIG.BASE_URL}/${resultado.archivo_salida}`;

          this.resultadoFormulario = {
            resumen: resultado.resumen,
            filas_clasificadas: resultado.filas_clasificadas,
            tiempo: resultado.tiempo_procesamiento_seg
          };
        }

      } else if (this.Seleccionado === 2) {
        // Formulario
        const datos = JSON.stringify(this.valoresFormulario);
        formData.append('datosFormulario', datos);
        // Mostrar lo que contiene formData
        formData.forEach((valor, clave) => {
          if (valor instanceof File) {
            console.log(`🔹 ${clave}: [Archivo] ${valor.name}, tipo: ${valor.type}, tamaño: ${valor.size} bytes`);
          } else {
            console.log(`🔹 ${clave}: ${valor}`);
          }
        });
        /*
        respuesta = await lastValueFrom(this.servicios.ClasificarFormulario(formData));

        const resultado = respuesta?.resultado;
        if (resultado?.prediccion) {
          this.resultadoFormulario = {
            prediccion: resultado.prediccion,
            columna: resultado.columna_objetivo
          };
        }*/
      }

      const tiempoFin = performance.now();
      this.tiempoProcesamiento = this.formatearDuracion(tiempoFin - tiempoInicio);
      this.procesado = true;
      this.entrenamientoCompletado = true;

      if (respuesta?.message) {
        this.notificationService.showSuccess(respuesta.message);
      }

      // Si vienen métricas
      if (respuesta?.resultado?.metricas) {
        const met = respuesta.resultado.metricas;
        this.precision = met.precision;
        this.exactitud = met.exactitud;
        this.recall = met.recall;
        this.f1Score = met.f1_score;
        this.menus['Dashboard'] = true;
      }

    } catch (error) {
      console.error("Error durante la clasificación:", error);

      if (error instanceof HttpErrorResponse) {
        this.notificationService.showError(error.error?.error || "Error en el servidor.");
      } else {
        this.notificationService.showError("Error desconocido.");
      }

    } finally {
      this.cargando = false;
    }
  }

  formatearPorcentaje(valor: number): string {
    return (valor * 100).toFixed(2) + '%';
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

  compareById = (a: any, b: any) => a === b;

  async reiniciarFormulario(form: NgForm) {
    form.form.enable();
    // 🔁 Reset variables
    this.ModeloSeleccionado = null;
    this.Seleccionado = null;
    this.archivoCsv = null;
    this.columnasFormulario = [];
    this.valoresFormulario = {};
    this.precision = 0;
    this.exactitud = 0;
    this.recall = 0;
    this.f1Score = 0;
    this.archivoClasificado = null;
    this.resultadoFormulario = null;
    this.tiempoProcesamiento = '';
    this.entrenamientoCompletado = false;
    this.procesado = false;
    this.cargando = false;
    this.menus['Dashboard'] = false;

    // 🔁 Limpia listas y refresca vista
    this.lsListado = [];
    this.lsListadoOpc = [];

    this.cdr.detectChanges(); // 🔁 Fuerza el redibujado

    // ⏳ Espera micro-tarea y vuelve a cargar
    setTimeout(async () => {
      await this.ListadoInformacion();
      this.lsListadoOpc = [
        { id: 1, nombre: 'CSV' },
        { id: 2, nombre: 'Formulario' }
      ];
      this.cdr.detectChanges(); // 🔁 Vuelve a forzar que el DOM se actualice
      form.form.enable();
    }, 0);
  }


}

import { Component } from '@angular/core';
import { EquifaxService } from '../../Servicios/API/equifax.service';
import { LoginService } from '../../Servicios/login.service';
import { NotificationService } from '../../Servicios/notification-service.service';
import { lastValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { fakeAsync } from '@angular/core/testing';

@Component({
  selector: 'app-equifax',
  templateUrl: './equifax.component.html',
  styleUrls: ['./equifax.component.css']
})
export class EquifaxComponent {

  archivoEquifax: File | null = null;
  resultado: any = null;
  cargando = false;

  private chart: Chart | null = null;

  constructor(
    private notificationService: NotificationService,
    private serviciolog: LoginService,
    private equifaxService: EquifaxService
  ) {}

  // 📁 Selección de archivo
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const tiposPermitidos = ['application/pdf', 'text/xml'];

    if (!tiposPermitidos.includes(file.type)) {
      this.notificationService.showError('Seleccione un archivo PDF o XML válido.');
      return;
    }

    this.archivoEquifax = file;
    this.resultado = null;

    console.log('Archivo Equifax seleccionado:', file.name);
  }

  // 🔍 Análisis Equifax
  async analizarEquifax() {
    if (!this.archivoEquifax) {
      this.notificationService.showError('Debe seleccionar un archivo Equifax.');
      return;
    }

    const usuarioLocal = this.serviciolog.getUserLocal();
    if (!usuarioLocal?.id_usuario) {
      this.notificationService.showError('Usuario no autenticado.');
      return;
    }

    this.cargando = true;
    this.resultado = null;

    try {
      const respuesta = await lastValueFrom(
        this.equifaxService.analizarEquifax(
          this.archivoEquifax,
          usuarioLocal.id_usuario
        )
      );

      // 🧠 Resultado final
      this.resultado = {
        ...respuesta.analisis_riesgo,
        factores_negativos: respuesta.analisis_riesgo?.factores_negativos || []
      };

      this.notificationService.showSuccess('Análisis Equifax completado correctamente.');
      console.log('Resultado Equifax:', this.resultado);

      // 📊 Renderizar gráfica
      setTimeout(() => {
        this.renderGrafica(this.resultado.score_final);
      }, 100);

    } catch (error: any) {
      console.error('Error Equifax:', error);

      if (error instanceof HttpErrorResponse) {
        this.notificationService.showError(
          error.error?.error || 'Error al analizar Equifax.'
        );
      } else {
        this.notificationService.showError('Error inesperado al analizar Equifax.');
      }

    } finally {
      this.cargando = false;
    }
  }

  // 📊 Gráfica tipo dashboard
  renderGrafica(score: number) {
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('graficaScore', {
      type: 'doughnut',
      data: {
        labels: ['Pobre', 'Suficiente', 'Bueno', 'Muy Bueno', 'Excelente'],
        datasets: [{
          data: [20, 20, 20, 20, 20],
          backgroundColor: [
            '#ff0000',
            '#ff9800',
            '#ffeb3b',
            '#8bc34a',
            '#4caf50'
          ],
          borderWidth: 0
        }]
      },
      options: {
        rotation: -90,
        circumference: 180,
        cutout: '70%',
        plugins: {
          legend: { display: false }  
        }
      },
      plugins: [{
        id: 'needle',
        afterDraw: chart => {
          const { ctx, chartArea } = chart;

          const scoreRedondeado = Math.ceil(score);

          // 🎯 Ángulo CORRECTO
          const angle = -Math.PI + (scoreRedondeado / 100) * Math.PI;

          console.log('Score:', scoreRedondeado);
          console.log('Ángulo:', angle);

            // 🎯 Centro REAL del gráfico
          const meta = chart.getDatasetMeta(0);
          const arc = meta.data[0];
          const cx = arc.x;
          const cy = arc.y;

          const length = 120;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);

          ctx.beginPath();
          ctx.moveTo(0, -5);
          ctx.lineTo(length, 0);
          ctx.lineTo(0, 5);
          ctx.fillStyle = '#000';
          ctx.fill();

          ctx.restore();

          // Punto central
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#000';
          ctx.fill();
        }
      }]
    });
  }


  

}

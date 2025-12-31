import { Component, HostListener, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { LogsService } from '../../Servicios/API/logs.service';


@Component({
  selector: 'app-actividades',
  templateUrl: './actividades.component.html',
  styleUrls: ['./actividades.component.css']
})
export class ActividadesComponent {
 @ViewChild('dt1') table!: Table;

  sidebarCollapsed = false;

  lsListado: any[] = [];

  constructor(
    private servicios: LogsService,
  ) {}

  async ngOnInit() {
    await this.ListadoInformacion();
  }

  async ListadoInformacion() {
    this.lsListado = await new Promise<any>(resolve => this.servicios.obtener().subscribe(translated => { resolve(translated) }));
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

import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse

@Component({
  selector: 'app-ges-usuarios',
  templateUrl: './ges-usuarios.component.html',
  styleUrls: ['./ges-usuarios.component.css']
})
export class GesUsuariosComponent {
  @ViewChild('dt1') table!: Table;
  lsListado: any[] = [];
  objSeleccion: any = "-1";
  intvalor: number = 0;
  strnombre: string = "";
  strEstado: string = "";
  visibleEditar: boolean = false;
  visibleEstado: boolean = false;
  visibleNuevo: boolean = false;

  selectedSize: any = 'p-datatable-sm';

  constructor(
  ) {}
  clear(table: Table) {
    table.clear();
  }
}

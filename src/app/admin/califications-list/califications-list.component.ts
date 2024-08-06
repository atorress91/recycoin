import { Component, ViewChild, HostListener, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';

import { Grading } from '@app/core/models/grading-model/grading.model';
import { GradingService } from '@app/core/service/grading-service/grading.service';
import { PrintService } from '@app/core/service/print-service/print.service';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';

const header = [
  'Nombre del Calificación',
  'Descripción',
  'Estado de Calificación',
  'Fecha de Registro',
];

@Component({
  selector: 'app-califications-list',
  templateUrl: './califications-list.component.html',
  providers: [ToastrService],
})
export class CalificationsListComponent implements OnInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  properties: any = [];
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private modalService: NgbModal,
    private gradingService: GradingService,
    private printService: PrintService,
    private clipboardService: ClipboardService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCalificationList();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.table) {
      this.scrollBarHorizontal = window.innerWidth < 1200;
      this.table.recalculate();
      this.table.recalculateColumns();
    }
  }

  getRowHeight(row) {
    return row.height;
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  createOpenModal(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  loadCalificationList() {
    this.gradingService.getAll().subscribe((resp: Grading[]) => {
      if (resp !== null) {
        this.temp = [...resp];
        this.rows = resp;
      }
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 500);
    });
  }

  onPrint() {
    const body = this.temp.map((items: any) => {
      const data = [
        items.name,
        items.description,
        items.status === true ? 'Activo' : 'Inactivo',
        items.created_at,
      ];
      return data;
    });

    this.printService.print(header, body, 'Lista de Calificaciones', false);
  }

  clipBoardCopy() {
    let properties = ['name', 'description', 'status', 'created_at'];

    let value = JSON.stringify(this.temp, this.properties);
    value = value.replace(/[[\]"']/g, '');
    this.clipboardService.copyFromContent(value);

    if (this.temp.length === 0) {
      this.toastr.info('No data to copy');
    } else {
      this.toastr.success('Copied ' + this.temp.length + ' rows successfully');
    }
  }

  deleteSingleRow(value) {
    Swal.fire({
      title: 'Are you sure?',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.value) {
        this.deleteRecord(value);
      }
    });
  }

  deleteRecordSuccess(count) {
    this.toastr.success(count + ' Records Deleted Successfully', '');
  }

  deleteRecord(id: number) {
    this.gradingService.delete(id).subscribe((response) => {
      if (response.success) {
        this.deleteRecordSuccess(1);
        this.loadCalificationList();
      }
    });
  }
}

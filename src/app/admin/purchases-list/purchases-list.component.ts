import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';

import { PaginationRequest } from '@app/core/interfaces/pagination-request';
import { InvoiceService } from '@app/core/service/invoice-service/invoice.service';
import { PrintService } from '@app/core/service/print-service/print.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
const header = [
  'Afiliado',
  'Nombre y Apellido',
  'No. Factura',
  'Fecha',
  'Estado Factura',
  'Pagado'
];
@Component({
  selector: 'app-purchases-list',
  templateUrl: './purchases-list.component.html',
  providers: [ToastrService],
})
export class PurchasesListComponent implements OnInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  startDate: string = null;
  endDate: string = null;
  selectedInvoice: any = null;
  modal: any;
  @ViewChild('detailsModal') detailsModal: ElementRef;
  @ViewChild('table') table: DatatableComponent;
  totalElements: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;

  constructor(
    private toastr: ToastrService,
    private clipboardService: ClipboardService,
    private printService: PrintService,
    private invoiceService: InvoiceService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }

  getRowHeight(row) {
    return row.height;
  }

  loadData() {
    const request: PaginationRequest = {
      pageSize: this.pageSize,
      pageNumber: this.currentPage,
      startDate: this.startDate ? new Date(this.startDate) : null,
      endDate: this.endDate ? new Date(this.endDate) : null
    };

    this.loadingIndicator = true;
    this.invoiceService.getAllInvoices(request).subscribe({
      next: (response) => {
        if (response?.success) {
          this.rows = response.data.items;
          this.temp = response.data.items;
          this.totalElements = response.data.totalCount;
          this.pageSize = response.data.pageSize;
          this.currentPage = response.data.currentPage;
        }
        this.loadingIndicator = false;
      },
      error: (error) => {
        console.error(error);
        this.loadingIndicator = false;
        this.toastr.error('Error al cargar los datos');
      }
    });
  }

  onPage(event: any) {
    this.currentPage = event.offset + 1;
    this.loadData();
  }

  onDateFilterChange() {
    if (this.startDate && this.endDate) {
      if (new Date(this.startDate) > new Date(this.endDate)) {
        this.toastr.warning('La fecha de inicio no puede ser mayor que la fecha final');
        return;
      }
    }
    this.loadData();
  }

  clearDateFilters() {
    this.startDate = null;
    this.endDate = null;
    this.loadData();
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    const temp = this.temp.filter(function (d) {
      return (
        d.name?.toLowerCase().indexOf(val) !== -1 ||
        d.lastName?.toLowerCase().indexOf(val) !== -1 ||
        d.userName?.toLowerCase().indexOf(val) !== -1 ||
        d.id?.toString().indexOf(val) !== -1 ||
        !val
      );
    });

    this.rows = temp;
    this.table.offset = 0;
  }

  clipBoardCopy() {
    var string = JSON.stringify(this.temp);
    var result = this.clipboardService.copyFromContent(string);

    if (this.temp.length === 0) {
      this.toastr.info('no data to copy');
    } else {
      this.toastr.success('copied ' + this.temp.length + ' rows successfully');
    }
  }


  onPrint() {
    const body = this.temp.map((items: any) => {
      const data = [
        items.userName,
        `${items.name} ${items.lastName}`,
        items.id,
        items.date,
        items.status ? 'Activa' : 'Pendiente o Anulada',
        items.totalInvoice
      ];
      return data;
    });

    this.printService.print(
      header,
      body,
      'Lista de Compras',
      false
    );
  }

  showDetails(invoice: any) {
    this.selectedInvoice = invoice;
    this.modal = this.modalService.open(this.detailsModal, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
  }

  closeDetails() {
    this.modal?.close();
    this.selectedInvoice = null;
  }

  printInvoiceDetails() {
    if (!this.selectedInvoice) return;

    const header = [
      'Producto',
      'Cantidad',
      'Precio',
      'Total'
    ];

    const body = this.selectedInvoice.invoicesDetails.map(detail => [
      detail.productName,
      detail.productQuantity,
      detail.productPrice,
      detail.baseAmount
    ]);

    this.printService.print(
      header,
      body,
      `Detalle de Compra #${this.selectedInvoice.id}`,
      true
    );
  }

  async exportToExcel() {
    try {
      this.loadingIndicator = true;
      const startDate = this.startDate ? new Date(this.startDate) : null;
      const endDate = this.endDate ? new Date(this.endDate) : null;

      this.invoiceService.exportToExcel(startDate, endDate).subscribe({
        next: (blob: Blob) => {
          const today = new Date();
          const dateStr = today.toLocaleDateString('es-CO').replace(/\//g, '-');
          const timeStr = today.toLocaleTimeString('es-CO').replace(/:/g, '-');
          const fileName = `Lista_de_compras_${dateStr}_${timeStr}.xlsx`;

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(url);

          this.loadingIndicator = false;
          this.toastr.success('Excel generado exitosamente');
        },
        error: (error) => {
          console.error('Error al exportar el excel', error);
          this.loadingIndicator = false;
          this.toastr.error('Error al generar el excel');
        }
      });
    } catch (error) {
      console.error('Error al exportar el excel', error);
      this.toastr.error('Error al generar el excel');
      this.loadingIndicator = false;
    }
  }
}

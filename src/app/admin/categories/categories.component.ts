import { Component, HostListener, OnInit, ViewChild } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { ProductCategoryService } from '@app/core/service/product-category-service/product-category.service';
import { PrintService } from '@app/core/service/print-service/print.service';

const header = ['Nombre de Categoría', 'Descripción', 'Categoría Padre'];
@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
})
export class CategoriesComponent implements OnInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  properties: any = [];
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private modalService: NgbModal,
    private productCategoryService: ProductCategoryService,
    private toastr: ToastrService,
    private printService: PrintService
  ) {}

  ngOnInit(): void {
    this.loadCategoryList();
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
    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    this.rows = temp;
    this.table.offset = 0;
  }

  createOpenModal(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
  }

  loadCategoryList() {
    this.productCategoryService.getAll().subscribe((resp) => {
      this.temp = [...resp];
      this.rows = resp;
      this.loadingIndicator = false;
    });
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
    this.productCategoryService.delete(id).subscribe((response) => {
      if (response.success) {
        this.deleteRecordSuccess(1);
        this.loadCategoryList();
      }
    });
  }

  onPrint() {
    const body = this.temp.map((items: any) => {
      const data = [items.name, items.description, items.category];

      return data;
    });

    this.printService.print(header, body, 'Lista de Categorías', false);
  }
}

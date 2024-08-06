import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';

import { ConfigurationService } from '@app/core/service/configuration-service/configuration.service';
import { ProductConfiguration } from '@app/core/models/product-configuration-model/product-configuration.model';

@Component({
  selector: 'app-products-services-configurations',
  templateUrl: './products-services-configurations.component.html',
})
export class ProductsServicesConfigurationsComponent implements OnInit {
  productConfigurationForm!: FormGroup;
  productConfiguration: ProductConfiguration = new ProductConfiguration();
  submitted = false;
  active = 1;
  tab = 1;
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private modalService: NgbModal,
    private configurationService: ConfigurationService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.loadValidations();
    this.loadProductConfiguration();
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

  loadValidations() {
    this.productConfigurationForm = this.formBuilder.group({
      activate_shipping_system: [''],
      passive_payments_module: [''],
      activate_public_store: [''],
      days_product_label: [''],
      currency_symbol: [''],
      symbol_commissionable_value: [''],
      points_symbol_qualify: [''],
      binary_points_symbol: [''],
    })
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  get product__configuration_controls(): { [key: string]: AbstractControl } {
    return this.productConfigurationForm.controls;
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    this.rows = temp;
    this.table.offset = 0;
  }

  createCarrierOpenModal(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
  }

  loadProductConfiguration() {
    this.configurationService.getProductConfiguration().subscribe((resp: ProductConfiguration) => {
      if (resp != null) {
        this.productConfigurationForm.setValue({
          activate_shipping_system: resp.activate_shipping_system,
          passive_payments_module: resp.activate_passive_payments_module,
          activate_public_store: resp.activate_public_shop,
          days_product_label: resp.new_product_label,
          currency_symbol: resp.currency_symbol,
          symbol_commissionable_value: resp.symbol_commissionable_value,
          points_symbol_qualify: resp.symbol_points_qualify,
          binary_points_symbol: resp.binary_points_symbol,
        })
      }
    });
  }

  onSaveProductConfiguration() {
    this.submitted = true;
    if (this.productConfigurationForm.invalid) {
      return;
    }
    this.productConfiguration.activate_shipping_system = this.productConfigurationForm.value.activate_shipping_system;
    this.productConfiguration.activate_passive_payments_module = this.productConfigurationForm.value.passive_payments_module;
    this.productConfiguration.activate_public_shop = this.productConfigurationForm.value.activate_public_store;
    this.productConfiguration.new_product_label = this.productConfigurationForm.value.days_product_label;
    this.productConfiguration.currency_symbol = this.productConfigurationForm.value.currency_symbol;
    this.productConfiguration.symbol_commissionable_value = this.productConfigurationForm.value.symbol_commissionable_value;
    this.productConfiguration.symbol_points_qualify = this.productConfigurationForm.value.points_symbol_qualify;
    this.productConfiguration.binary_points_symbol = this.productConfigurationForm.value.binary_points_symbol;

     this.configurationService.createProductConfiguration(this.productConfiguration).subscribe((resp)=>{
          if(resp.success){
           this.showSuccess('The product configuration was update successfully!');
           this.loadProductConfiguration();
          }
     });
  }
}

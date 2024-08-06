import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';

import { WalletRequestRequest } from '@app/core/models/wallet-request-request-model/wallet-request-request.model';
import { WalletWithdrawalsConfiguration } from '@app/core/models/wallet-withdrawals-configuration-model/wallet-withdrawals-configuration.model';
import { CoinpaymentService } from '@app/core/service/coinpayment-service/coinpayment.service';
import { ConfigurationService } from '@app/core/service/configuration-service/configuration.service';
import { WalletRequestService } from '@app/core/service/wallet-request/wallet-request.service';
import { CoinPaymentWithdrawalResponse } from '@app/core/models/coinpayment-model/coinpayment-withdrawal-response.model'
import { CoinpayService } from '@app/core/service/coinpay-service/coinpay.service';
import { CoinPayWithdrawal } from '@app/core/models/coinpay-model/coinpay-withdrawal.model';

@Component({
  selector: 'app-wallet-removal',
  templateUrl: './wallet-removal.component.html',
})
export class WalletRemovalComponent implements OnInit {
  rows = [];
  temp = [];
  proccessOptionValue: number = 0;
  selectedRows: any[] = [];
  selectAll: boolean;
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  walletWithdrawalConfig: WalletWithdrawalsConfiguration;
  @ViewChild('table') table: DatatableComponent;

  constructor(
    private walletRequestService: WalletRequestService,
    private toastr: ToastrService,
    private configurationService: ConfigurationService,
    private coinPaymentService: CoinpaymentService,
    private coinpayService: CoinpayService
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

  private loadData() {
    forkJoin({
      walletRequests: this.walletRequestService.getAllWallets(),
      walletConfig: this.configurationService.getWithdrawalsWalletConfiguration()
    }).subscribe({
      next: ({ walletRequests, walletConfig }) => {

        this.walletWithdrawalConfig = walletConfig;
        this.updateTable(walletRequests);
      },
      error: err => this.showError('Error!' + err),
    });
  }

  private updateTable(resp: WalletRequestRequest[]) {
    const filteredData = resp.filter(item => item.status == 0);

    filteredData.forEach(item => {
      if (this.walletWithdrawalConfig) {
        item.retention = this.walletWithdrawalConfig.commission_amount;
      }
      item.isSelected = false;
    });

    this.temp = [...filteredData];
    this.rows = filteredData;
    this.loadingIndicator = false;
    this.rows.reverse();
  }

  showSuccess(message) {
    this.toastr.success(message);
  }

  showError(message) {
    this.toastr.error(message);
  }

  getRowHeight(row) {
    return row.height;
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    const temp = this.temp.filter(function (d) {
      return d.adminUserName.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp.reverse();
    this.table.offset = 0;
  }

  copyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      this.showSuccess('Se ha copiado al portapapeles')
    } catch (err) {
      this.showError('No se pudo copiar');
    }

    document.body.removeChild(textArea);
  }

  clipBoardCopy() {
    const rows = this.table._internalRows;
    if (rows && rows.length) {
      const headers = [
        'Afiliado',
        'Observación',
        'Monto a retirar (USD)',
        'Retención (%)',
        'Total a pagar (USD)',
        'Fecha',
        'Detalle'
      ];

      const data = rows.map(row => [
        row.adminUserName,
        row.concept,
        row.amount,
        row.retention,
        row.amount,
        row.createdAt,
        '...'
      ]);

      const tableText = [headers, ...data].map(row => row.join('\t')).join('\n');
      this.copyTextToClipboard(tableText);
    }
  }

  onPrint() {
    const DATA = document.getElementById('htmlTable');

    html2canvas(DATA).then(canvas => {
      let pdf = new jsPDF('l', 'mm', 'a4');

      const pageWidth = 297;
      const imgWidth = pageWidth - 40;

      const imgHeight = canvas.height * imgWidth / canvas.width;

      const posX = 20;
      const posY = 30;

      pdf.setFontSize(18);
      pdf.text('Lista de retiros', pageWidth / 2, 20, { align: 'center' });

      const contentDataURL = canvas.toDataURL('image/png');
      pdf.addImage(contentDataURL, 'PNG', posX, posY, imgWidth, imgHeight);
      pdf.save('retiros.pdf');
    });
  }

  selectAllRows(event: any) {
    const isChecked = event.target.checked;
    this.rows.forEach(row => {
      row.isSelected = isChecked;
      const selectedIndex = this.selectedRows.indexOf(row);
      if (isChecked && selectedIndex === -1) {

        this.selectedRows.push(row);
      } else if (!isChecked && selectedIndex > -1) {

        this.selectedRows.splice(selectedIndex, 1);
      }
    });
  }

  onRowSelectChange(row: any) {
    if (row.isSelected) {

      if (this.selectedRows.indexOf(row) === -1) {
        this.selectedRows.push(row);
      }
    } else {

      const index = this.selectedRows.indexOf(row);
      if (index > -1) {
        this.selectedRows.splice(index, 1);
      }
    }
  }

  onProccessOption() {
    if (this.proccessOptionValue == 0 || this.selectedRows.length == 0) {
      return;
    }

    switch (this.proccessOptionValue) {
      case 1:
        this.handleDenyOption(this.selectedRows);
        break;
      case 2:
        this.handleCoinPaymentOption(this.selectedRows);
        break;
      case 3:
        this.handleCoinPayCr(this.selectedRows);
        break;
      case 4:
        this.handlePayItAll(this.selectedRows);
        break;
      default:
        console.error('Invalid proccessOptionValue:', this.proccessOptionValue);
        break;
    }
  }

  handleDenyOption(rows: WalletRequestRequest[]) {
    const ids: number[] = rows.map(row => row.id);

    this.walletRequestService.processOption(1, ids).subscribe({
      next: (value) => {
        if (value) {
          this.showSuccess('The request has been processed correctly.');
          this.resetWalletRequest();
          this.loadData();
          this.proccessOptionValue = 0
        }
      },
      error: (err) => {
        this.showError('Error');
      },
    });
  }

  handleCoinPaymentOption(rows: WalletRequestRequest[]) {
    this.coinPaymentService.createMassWithdrawal(rows).subscribe({
      next: (value: CoinPaymentWithdrawalResponse) => {
        if (value && value.error === "ok" && value.result) {
          let successfulPayments: string[] = [];
          let failedPayments: string[] = [];

          for (let key in value.result) {
            if (value.result[key].error === "ok") {
              successfulPayments.push(key);
            } else {
              failedPayments.push(`${key}: ${value.result[key].error}`);
            }
          }

          if (successfulPayments.length > 0) {
            this.showSuccess(`Pagos realizados correctamente: ${successfulPayments.join(', ')}`);
            this.resetWalletRequest();
            this.loadData();
          }

          if (failedPayments.length > 0) {
            this.showError(`Errores en los pagos: ${failedPayments.join('. ')}`);
          }
        } else {
          this.showError('No se pudo realizar el pago');
        }
      },
      error: () => {
        this.showError('Error');
      },
    });
  }

  handleCoinPayCr(rows: any[]) {
    const filteredRows: CoinPayWithdrawal[] = rows.map(row => {
      const coinPayWithdrawal = new CoinPayWithdrawal();
      coinPayWithdrawal.id = row.id;
      coinPayWithdrawal.affiliateId = row.affiliateId;
      coinPayWithdrawal.amount = row.amount;
      return coinPayWithdrawal;
    });

    this.coinpayService.sendFunds(filteredRows).subscribe({
      next: (response) => {
        if (response.success) {

          let detailsHtml = '<ul>';
          response.data.successfulResponses.forEach(sr => {
            detailsHtml += `<li>Exitosos: Transaction ID ${sr.transactionId} - ${sr.message}</li>`;
          });
          response.data.failedResponses.forEach(fr => {
            detailsHtml += `<li>Fallidos: ${fr.message}</li>`;
          });
          detailsHtml += '</ul>';

          Swal.fire({
            title: 'Resultados del retiro',
            icon: 'info',
            html: detailsHtml,
            confirmButtonText: 'Close'
          });
        }
      },
      error: (err) => {

        Swal.fire({
          title: 'Error',
          text: 'Failed to process the request.',
          icon: 'error',
          confirmButtonText: 'Close'
        });
        console.error('Error occurred:', err);
      },
    });
  }

  handlePayItAll(rows: WalletRequestRequest[]) {
    this.walletRequestService.administrativePayment(rows).subscribe({
      next: () => {
        this.showSuccess('Pago realizado correctamente');
        this.resetWalletRequest();
        this.loadData();
      },
      error: () => {
        this.showError('No se pudo realizar el pago');
      },
    })
  }

  confirmOption() {
    if (this.selectedRows.length === 0 || this.proccessOptionValue === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Debe seleccionar una opción y un retiro antes de continuar.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
    } else {

      Swal.fire({
        title: 'Está seguro de realizar la operación!',
        text: 'Una vez realizada no se puede revertir',
        showCancelButton: true,
        icon: 'warning',
        confirmButtonColor: '#8963ff',
        cancelButtonColor: '#fb7823',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Sí, estoy seguro.'
      }).then((result) => {
        if (result.isConfirmed) {
          this.onProccessOption();
        }
      });
    }
  }

  resetWalletRequest() {
    this.selectedRows = [];
  }
}

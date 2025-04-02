import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am5themes_Animated from '@amcharts/amcharts4/themes/animated';
import { ChangeDetectorRef, Component, NgZone, ViewChild } from '@angular/core';
import { AffiliateBtcService } from '@app/core/service/affiliate-btc-service/affiliate-btc.service';
import { ChartComponent } from 'ng-apexcharts';
import { EMPTY, map, Subject, switchMap, takeUntil } from 'rxjs';

import { AffiliateBtc } from '@app/core/models/affiliate-btc-model/affiliate-btc.model';
import { Response } from '@app/core/models/response-model/response.model';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { BalanceInformationModel1A } from '@app/core/models/wallet-model-1a/balance-information-1a.model';
import { BalanceInformationModel1B } from '@app/core/models/wallet-model-1b/balance-information-1b.model';
import { BalanceInformation } from '@app/core/models/wallet-model/balance-information.model';
import { PurchasePerMonthDto } from '@app/core/models/wallet-model/network-purchases.model';
import { StatisticsInformation } from '@app/core/models/wallet-model/statisticsInformation';
import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { ModelsVisibilityService } from '@app/core/service/models-visibility-service/models-visibility.service';
import { WalletModel1AService } from '@app/core/service/wallet-model-1a-service/wallet-model-1a.service';
import { WalletModel1BService } from '@app/core/service/wallet-model-1b-service/wallet-model-1b.service';
import { WalletService } from '@app/core/service/wallet-service/wallet.service';
import { EChartsOption } from 'echarts';
import { ToastrService } from 'ngx-toastr';

am4core.useTheme(am5themes_Animated);

@Component({
  selector: 'app-main',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  public user: UserAffiliate;
  private destroy$ = new Subject();
  balanceInformation: BalanceInformation = new BalanceInformation();
  balanceInformationModel1A: BalanceInformationModel1A = new BalanceInformationModel1A();
  balanceInformationModel1B: BalanceInformationModel1B = new BalanceInformationModel1B();
  withdrawalBalance: number = 0;
  totalPaid: number = 0;
  maps: any[] = [];
  circles = [];
  currentYearPurchases: PurchasePerMonthDto[] = [];
  previousYearPurchases: PurchasePerMonthDto[] = [];
  area_line_chart: EChartsOption;
  currentYear: number;
  previousYear: number;
  @ViewChild('chart') chart1: ChartComponent;
  canSeePaymentModels: boolean = false;
  recycoinInfo = {
    usdValue: 1250000,
    tokenAmount: 5000000,
    marketCap: 10000000,
    change24h: 5.75,
    contractAddress: "0x7c482FF834dfb546A8E48C14f3C34652E9826723",
    bnbAddress: ''
  };

  information: StatisticsInformation = new StatisticsInformation();
  private chart: am4maps.MapChart;
  public pieChartOptions: any;
  public pieChartOptionsModel1A: any;
  public pieChartOptionsModel1B: any;

  constructor(
    private authService: AuthService,
    private walletService: WalletService,
    private toastr: ToastrService,
    private affiliateService: AffiliateService,
    private walletModel1AService: WalletModel1AService,
    private walletModel1BService: WalletModel1BService,
    private modelsVisibilityService: ModelsVisibilityService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private affiliateBtService: AffiliateBtcService
  ) {
    this.pieChartOptions = {series: [], chart: {}, labels: [], responsive: [], dataLabels: {}, legend: {}};
    this.pieChartOptionsModel1A = {series: [], chart: {}, labels: [], responsive: [], dataLabels: {}, legend: {}};
    this.pieChartOptionsModel1B = {series: [], chart: {}, labels: [], responsive: [], dataLabels: {}, legend: {}};

    this.currentYear = new Date().getFullYear();
    this.previousYear = this.currentYear - 1;
    this.OnInitMethod();
  }

  OnInitMethod() {
    this.authService.currentUserAffiliate.pipe(
      takeUntil(this.destroy$),
      switchMap(user => {
        if (user && user.id) {
          this.user = user;
          return this.modelsVisibilityService.canUserSeePaymentModels().pipe(
            map(canSee => ({user, canSee}))
          );
        }
        return EMPTY;
      })
    ).subscribe(({user, canSee}) => {
      this.canSeePaymentModels = canSee;
      this.resetComponent();
      this.loadUserData(user.id);
    });

    this.loadLocations();
    this.getPurchasesInMyNetwork();
    this.loadInformation();
    this.loadBnbAddress();
  }

  loadUserData(userId: number) {
    this.loadBalancesWithRetry(userId, 5)
      .then(() => {
        this.ngZone.run(() => {
          this.initializeBalanceCharts();
          this.cdr.detectChanges();
        });
      })
      .catch(error => {
        console.error('Failed to load balance data after multiple retries:', error);
      });
  }

  initializeBalanceCharts() {

    try {
      this.initChartModel2();
    } catch (error) {
      console.error('Error initializing Model 2 Chart:', error);
    }

    // try {
    //   this.initChartModel1A();
    // } catch (error) {
    //   console.error('Error initializing Model 1A Chart:', error);
    // }
    //
    // if (this.canSeePaymentModels) {
    //   try {
    //     this.initChartModel1B();
    //   } catch (error) {
    //     console.error('Error initializing Model 1B Chart:', error);
    //   }
    // } else {
    //   console.error('User cannot see payment models, skipping Model 1B Chart');
    // }
  }

  get registerUrl() {
    return `https://www.recycoin.net/welcome/${this.user.user_name.toString()}`;
  }

  showSuccess(message: string) {
    this.toastr.success(message);
  }

  showError(message: string) {
    this.toastr.error(message);
  }

  setMapInfo() {
    this.chart = am4core.create('chartdiv', am4maps.MapChart);
    this.chart.geodata = am4geodata_worldLow;
    this.chart.projection = new am4maps.projections.Miller();

    let polygonSeries = this.chart.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.exclude = ['AQ'];
    polygonSeries.useGeodata = true;

    const imageSeries = this.chart.series.push(new am4maps.MapImageSeries());
    const imageSeriesTemplate = imageSeries.mapImages.template;
    const circle = imageSeriesTemplate.createChild(am4core.Circle);

    circle.radius = 14;
    circle.fill = am4core.color('#765cbf');
    circle.stroke = am4core.color('#B27799');
    circle.strokeWidth = 1;
    circle.nonScaling = true;

    circle.tooltipText = '[bold]{Title}[/]\nCantidad: {Value}';

    imageSeriesTemplate.propertyFields.latitude = 'Lat';
    imageSeriesTemplate.propertyFields.longitude = 'Lng';

    const centerLabel = imageSeriesTemplate.createChild(am4core.Label);
    centerLabel.text = '{Value}';
    centerLabel.horizontalCenter = 'middle';
    centerLabel.verticalCenter = 'middle';
    centerLabel.fill = am4core.color('#55555');
    centerLabel.nonScaling = true;

    const data = this.maps.map(item => item);
    imageSeries.addData(data);

    let polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = '{name}';
    polygonTemplate.fill = am4core.color('#96a2b4');
    let hs = polygonTemplate.states.create('hover');
    hs.properties.fill = am4core.color('#74X999');
  }

  initializeAreaLineChart() {
    const currentYearData = this.fillMissingMonths(this.currentYearPurchases);
    const previousYearData = this.fillMissingMonths(this.previousYearPurchases);

    this.area_line_chart = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: [this.previousYear.toString(), this.currentYear.toString()],
        textStyle: {
          color: '#9aa0ac',
          padding: [0, 5, 0, 5],
        },
      },
      toolbox: {
        show: !0,
        feature: {
          magicType: {
            show: !0,
            title: {
              line: 'Line',
              bar: 'Bar',
              stack: 'Stack',
            },
            type: ['line'],
          },
          restore: {
            show: !0,
            title: 'Restore',
          },
          saveAsImage: {
            show: !0,
            title: 'Save Image',
          },
        },
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: !1,
          data: [
            'ENE',
            'FEB',
            'MAR',
            'ABR',
            'MAY',
            'JUN',
            'JUL',
            'AGO',
            'SEP',
            'OCT',
            'NOV',
            'DIC',
          ],
          axisLabel: {
            fontSize: 10,
            color: '#9aa0ac',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            fontSize: 10,
            color: '#9aa0ac',
          },
        },
      ],
      series: [
        {
          name: this.currentYear.toString(),
          type: 'line',
          smooth: !0,
          areaStyle: {},
          emphasis: {
            focus: 'series',
          },
          data: currentYearData,
        },
        {
          name: this.previousYear.toString(),
          type: 'line',
          smooth: !0,
          areaStyle: {},
          emphasis: {
            focus: 'series',
          },
          data: previousYearData,
        },
      ],
      color: ['#9f78ff', '#fa626b'],
    }
  };

  isBalanceInformationValid(balance: BalanceInformation): boolean {
    return balance.serviceBalance !== undefined &&
      balance.availableBalance !== undefined &&
      balance.totalCommissionsPaid !== undefined &&
      balance.totalAcquisitions !== undefined &&
      balance.reverseBalance !== undefined &&
      balance.bonusAmount !== undefined;
  }

  private initChartModel2() {

    if (!this.balanceInformation || !this.isBalanceInformationValid(this.balanceInformation)) {
      console.error('Invalid balance information for Model 2');
      return;
    }
    this.pieChartOptions = {
      series: [
        this.balanceInformation.serviceBalance,
        this.balanceInformation.availableBalance,
        this.balanceInformation.totalCommissionsPaid,
        this.balanceInformation.totalAcquisitions,
        this.balanceInformation.reverseBalance
      ],

      colors: ['#f44336', '#2196f3', '#96a2b4', '#4caf50', '#9c27b0'],
      chart: {
        type: 'donut',
        width: 200,
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      labels: [
        'Saldo de servicios',
        'Saldo Disponible',
        'Total Pagado',
        'Total Adquisiciones',
        'Saldo balance'
      ],
      responsive: [
        {
          breakpoint: 480,
          options: {
            dataLabels: {
              enabled: true,
              formatter: function (val: any) {
                return val + "%"
              },
              plotOptions: {
                pie: {
                  expandOnClick: false
                }
              }
            }
          },
        },
      ],
    };
  }

  loadLocations() {
    this.affiliateService.getTotalAffiliatesByCountries().subscribe({
      next: (value) => {
        this.maps = value.data;
        this.setMapInfo();
      },
      error: (err) => {
        console.error('Error fetching locations:', err);
      },
    })
  }

  openNewWindow(url: string) {
    window.open(url)
  }

  getPurchasesInMyNetwork() {
    this.walletService.getPurchasesInMyNetwork(this.user.id).subscribe(data => {
      if (data) {
        this.currentYearPurchases = data.currentYearPurchases;
        this.previousYearPurchases = data.previousYearPurchases;
        this.initializeAreaLineChart();
      }
    });
  }

  fillMissingMonths(yearPurchases: PurchasePerMonthDto[]): number[] {
    const monthlyData = new Array(12).fill(0);

    for (let purchase of yearPurchases) {
      monthlyData[purchase.month - 1] = purchase.totalPurchases;
    }

    return monthlyData;
  }

  getBalanceInformationModel2(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.walletService.getBalanceInformationByAffiliateId(id).subscribe({
        next: (value: BalanceInformation) => {
          console.log(value);
          this.balanceInformation = value;
          resolve();
        },
        error: (err) => {
          console.error('Error fetching balance information for Model 2:', err);
          reject(err);
        }
      });
    });
  }

  getBalanceInformationModel1A(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.walletModel1AService.getBalanceInformationByAffiliateId(id).subscribe({
        next: (value: BalanceInformationModel1A) => {
          this.balanceInformationModel1A = value;
          resolve();
        },
        error: (err) => {
          console.error('Error fetching balance information for Model 1A:', err);
          reject(err);
        }
      });
    });
  }

  getBalanceInformationModel1B(id: number): Promise<void> {
    if (!this.canSeePaymentModels) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.walletModel1BService.getBalanceInformationByAffiliateId(id).subscribe({
        next: (value: BalanceInformationModel1B) => {
          this.balanceInformationModel1B = value;
          resolve();
        },
        error: (err) => {
          console.error('Error fetching balance information for Model 1B:', err);
          reject(err);
        }
      });
    });
  }

  loadBalancesWithRetry(userId: number, maxRetries: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const attemptLoad = (retryCount: number) => {
        Promise.all([
          this.getBalanceInformationModel2(userId),
          this.getBalanceInformationModel1A(userId),
          this.canSeePaymentModels ? this.getBalanceInformationModel1B(userId) : Promise.resolve()
        ]).then(() => {
          resolve();
        }).catch((error) => {
          if (retryCount < maxRetries) {
            setTimeout(() => attemptLoad(retryCount + 1), 2000);
          } else {
            reject(error);
          }
        });
      };
      attemptLoad(0);
    });
  }

  resetComponent() {
    this.balanceInformation = new BalanceInformation();
    this.balanceInformationModel1A = new BalanceInformationModel1A();
    this.balanceInformationModel1B = new BalanceInformationModel1B();
    this.pieChartOptions = {series: [], chart: {}, labels: [], responsive: [], dataLabels: {}, legend: {}};
    this.pieChartOptionsModel1A = {series: [], chart: {}, labels: [], responsive: [], dataLabels: {}, legend: {}};
    this.pieChartOptionsModel1B = {series: [], chart: {}, labels: [], responsive: [], dataLabels: {}, legend: {}};
  }

  loadInformation() {
    this.walletService.getStatisticsInformationByAffiliateId(this.user.id).subscribe({
      next: (value) => {
        this.information = value;
      },
      error: (err) => {
        console.error('Error fetching statistics information:', err);
      },
    })
  }

  loadBnbAddress() {
    this.affiliateBtService.getAffiliateBtcByAffiliateId(this.user.id).subscribe({
      next: (value: Response & { data: AffiliateBtc[] }) => {
        if (value.success) {

          const address = value.data.reduce((acc: any, item: any) => {
            if (item?.networkId === 2) {
              acc.bnb_address = item.address;
            }
            return acc;
          }, {bnb_address: ''});

          this.recycoinInfo.bnbAddress = address.bnb_address;
        }
      }, error: (err) => {
        console.error('Error fetching BNB address:', err);
      },
    })
  }

  copyToClipboard(text: string, type: string) {
    if (text != '') {
      navigator.clipboard.writeText(text)
        .then(() => {

          this.showCopyNotification(type);
        })
        .catch(err => {
          console.error('Error al copiar:', err);
        });
    }
  }

  private showCopyNotification(type: string) {
    this.toastr.success(`${type} copiado al portapapeles`);
  }
}

import { __decorate } from "tslib";
import { Component, ViewChild } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import am5themes_Animated from '@amcharts/amcharts4/themes/animated';
import { EMPTY, map, Subject, switchMap, takeUntil } from 'rxjs';
import { BalanceInformation } from '@app/core/models/wallet-model/balance-information.model';
import { BalanceInformationModel1A } from '@app/core/models/wallet-model-1a/balance-information-1a.model';
import { BalanceInformationModel1B } from '@app/core/models/wallet-model-1b/balance-information-1b.model';
import { StatisticsInformation } from '@app/core/models/wallet-model/statisticsInformation';
am4core.useTheme(am5themes_Animated);
let HomeComponent = class HomeComponent {
    constructor(authService, walletService, toastr, affiliateService, walletModel1AService, walletModel1BService, modelsVisibilityService, ngZone, cdr, affiliateBtService) {
        this.authService = authService;
        this.walletService = walletService;
        this.toastr = toastr;
        this.affiliateService = affiliateService;
        this.walletModel1AService = walletModel1AService;
        this.walletModel1BService = walletModel1BService;
        this.modelsVisibilityService = modelsVisibilityService;
        this.ngZone = ngZone;
        this.cdr = cdr;
        this.affiliateBtService = affiliateBtService;
        this.destroy$ = new Subject();
        this.balanceInformation = new BalanceInformation();
        this.balanceInformationModel1A = new BalanceInformationModel1A();
        this.balanceInformationModel1B = new BalanceInformationModel1B();
        this.withdrawalBalance = 0;
        this.totalPaid = 0;
        this.maps = [];
        this.circles = [];
        this.currentYearPurchases = [];
        this.previousYearPurchases = [];
        this.canSeePaymentModels = false;
        this.recycoinInfo = {
            usdValue: 1250000,
            tokenAmount: 5000000,
            marketCap: 10000000,
            change24h: 5.75,
            contractAddress: "0x7c482FF834dfb546A8E48C14f3C34652E9826723",
            bnbAddress: ''
        };
        this.information = new StatisticsInformation();
        this.pieChartOptions = { series: [], chart: {}, labels: [], responsive: [], dataLabels: {}, legend: {} };
        this.pieChartOptionsModel1A = { series: [], chart: {}, labels: [], responsive: [], dataLabels: {}, legend: {} };
        this.pieChartOptionsModel1B = { series: [], chart: {}, labels: [], responsive: [], dataLabels: {}, legend: {} };
        this.currentYear = new Date().getFullYear();
        this.previousYear = this.currentYear - 1;
        this.OnInitMethod();
    }
    OnInitMethod() {
        this.authService.currentUserAffiliate.pipe(takeUntil(this.destroy$), switchMap(user => {
            if (user && user.id) {
                this.user = user;
                return this.modelsVisibilityService.canUserSeePaymentModels().pipe(map(canSee => ({ user, canSee })));
            }
            return EMPTY;
        })).subscribe(({ user, canSee }) => {
            this.canSeePaymentModels = canSee;
            this.resetComponent();
            this.loadUserData(user.id);
        });
        this.loadLocations();
        this.getPurchasesInMyNetwork();
        this.loadInformation();
        this.loadBnbAddress();
    }
    loadUserData(userId) {
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
        }
        catch (error) {
            console.error('Error initializing Model 2 Chart:', error);
        }
        try {
            this.initChartModel1A();
        }
        catch (error) {
            console.error('Error initializing Model 1A Chart:', error);
        }
        if (this.canSeePaymentModels) {
            try {
                this.initChartModel1B();
            }
            catch (error) {
                console.error('Error initializing Model 1B Chart:', error);
            }
        }
        else {
            console.error('User cannot see payment models, skipping Model 1B Chart');
        }
    }
    get registerUrl() {
        return `https://www.recycoin.net/main-options/${this.user.user_name.toString()}`;
    }
    showSuccess(message) {
        this.toastr.success(message);
    }
    showError(message) {
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
        };
    }
    ;
    isBalanceInformationValid(balance) {
        return balance.serviceBalance !== undefined &&
            balance.availableBalance !== undefined &&
            balance.totalCommissionsPaid !== undefined &&
            balance.totalAcquisitions !== undefined &&
            balance.reverseBalance !== undefined &&
            balance.bonusAmount !== undefined;
    }
    isBalanceInformation1AValid(balance) {
        return balance.serviceBalance !== undefined &&
            balance.availableBalance !== undefined &&
            balance.totalCommissionsPaid !== undefined &&
            balance.totalAcquisitions !== undefined &&
            balance.reverseBalance !== undefined;
    }
    isBalanceInformation1BValid(balance) {
        return balance.serviceBalance !== undefined &&
            balance.availableBalance !== undefined &&
            balance.totalCommissionsPaid !== undefined &&
            balance.totalAcquisitions !== undefined &&
            balance.reverseBalance !== undefined;
    }
    initChartModel2() {
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
                            formatter: function (val) {
                                return val + "%";
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
    initChartModel1A() {
        if (!this.balanceInformationModel1A || !this.isBalanceInformation1AValid(this.balanceInformationModel1A)) {
            console.error('Invalid balance information for Model 1A');
            return;
        }
        this.pieChartOptionsModel1A = {
            series: [
                this.balanceInformationModel1A.serviceBalance,
                this.balanceInformationModel1A.availableBalance,
                this.balanceInformationModel1A.totalCommissionsPaid,
                this.balanceInformationModel1A.totalAcquisitions,
                this.balanceInformationModel1A.reverseBalance
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
                            formatter: function (val) {
                                return val + "%";
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
    initChartModel1B() {
        if (!this.balanceInformationModel1B || !this.isBalanceInformation1BValid(this.balanceInformationModel1B)) {
            console.error('Invalid balance information for Model 1B');
            return;
        }
        this.pieChartOptionsModel1B = {
            series: [
                this.balanceInformationModel1B.serviceBalance,
                this.balanceInformationModel1B.availableBalance,
                this.balanceInformationModel1B.totalCommissionsPaid,
                this.balanceInformationModel1B.totalAcquisitions,
                this.balanceInformationModel1B.reverseBalance
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
                            formatter: function (val) {
                                return val + "%";
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
                this.showError("Error");
            },
        });
    }
    openNewWindow(url) {
        window.open(url);
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
    fillMissingMonths(yearPurchases) {
        const monthlyData = new Array(12).fill(0);
        for (let purchase of yearPurchases) {
            monthlyData[purchase.month - 1] = purchase.totalPurchases;
        }
        return monthlyData;
    }
    getBalanceInformationModel2(id) {
        return new Promise((resolve, reject) => {
            this.walletService.getBalanceInformationByAffiliateId(id).subscribe({
                next: (value) => {
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
    getBalanceInformationModel1A(id) {
        return new Promise((resolve, reject) => {
            this.walletModel1AService.getBalanceInformationByAffiliateId(id).subscribe({
                next: (value) => {
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
    getBalanceInformationModel1B(id) {
        if (!this.canSeePaymentModels) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            this.walletModel1BService.getBalanceInformationByAffiliateId(id).subscribe({
                next: (value) => {
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
    loadBalancesWithRetry(userId, maxRetries) {
        return new Promise((resolve, reject) => {
            const attemptLoad = (retryCount) => {
                Promise.all([
                    this.getBalanceInformationModel2(userId),
                    this.getBalanceInformationModel1A(userId),
                    this.canSeePaymentModels ? this.getBalanceInformationModel1B(userId) : Promise.resolve()
                ]).then(() => {
                    resolve();
                }).catch((error) => {
                    if (retryCount < maxRetries) {
                        setTimeout(() => attemptLoad(retryCount + 1), 2000);
                    }
                    else {
                        reject(error);
                    }
                });
            };
            attemptLoad(0);
        });
    }
    initChartWithRetry(initFunction, chartName, maxRetries = 5) {
        const attempt = (retryCount) => {
            try {
                initFunction();
            }
            catch (error) {
                console.error(`Error initializing ${chartName}:`, error);
                if (retryCount < maxRetries) {
                    setTimeout(() => attempt(retryCount + 1), 1000);
                }
                else {
                    console.error(`Failed to initialize ${chartName} after ${maxRetries} attempts:`, error);
                }
            }
        };
        attempt(0);
    }
    resetComponent() {
        this.balanceInformation = new BalanceInformation();
        this.balanceInformationModel1A = new BalanceInformationModel1A();
        this.balanceInformationModel1B = new BalanceInformationModel1B();
        this.pieChartOptions = { series: [], chart: {}, labels: [], responsive: [], dataLabels: {}, legend: {} };
        this.pieChartOptionsModel1A = { series: [], chart: {}, labels: [], responsive: [], dataLabels: {}, legend: {} };
        this.pieChartOptionsModel1B = { series: [], chart: {}, labels: [], responsive: [], dataLabels: {}, legend: {} };
    }
    loadInformation() {
        this.walletService.getStatisticsInformationByAffiliateId(this.user.id).subscribe({
            next: (value) => {
                this.information = value;
            },
            error: (err) => {
                this.showError('Error');
            },
        });
    }
    loadBnbAddress() {
        this.affiliateBtService.getAffiliateBtcByAffiliateId(this.user.id).subscribe({
            next: (value) => {
                if (value.success) {
                    const address = value.data.reduce((acc, item) => {
                        if (item.networkId == 2) {
                            acc.bnb_address = item.address;
                        }
                        return acc;
                    }, { bnb_address: '' });
                    this.recycoinInfo.bnbAddress = address.bnb_address;
                }
            }, error: (err) => {
                this.showError('No se pudo cargar la billetera Bnb Smart Chain.');
            },
        });
    }
};
__decorate([
    ViewChild('chart')
], HomeComponent.prototype, "chart1", void 0);
HomeComponent = __decorate([
    Component({
        selector: 'app-main',
        templateUrl: './home.component.html',
        styleUrls: ['./home.component.scss']
    })
], HomeComponent);
export { HomeComponent };
//# sourceMappingURL=home.component.js.map
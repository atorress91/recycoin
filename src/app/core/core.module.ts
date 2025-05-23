import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { AuthGuard } from '@app/core/guard/auth.guard';
import { throwIfAlreadyLoaded } from '@app/core/guard/module-import.guard';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import {
  DynamicScriptLoaderService
} from '@app/core/service/dynamic-script-loader-service/dynamic-script-loader.service';
import { RightSidebarService } from '@app/core/service/rightsidebar-service/rightsidebar.service';
import { MaintenanceGuard } from './guard/maintenance.guard';
import { FaceApiService } from './service/face-api-service/face-api.service';
import { TermsConditionsService } from './service/terms-conditions-service/terms-conditions.service';

import { AffiliateAddressService } from '@app/core/service/affiliate-address-service/affiliate-address.service';
import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { CartService } from '@app/core/service/cart.service/cart.service';
import { ChatBotService } from '@app/core/service/chat-service/chat-bot.service';
import { ChatService } from '@app/core/service/chat-service/chat.service';
import { CoinpaymentService } from '@app/core/service/coinpayment-service/coinpayment.service';
import {
  ConceptConfigurationService
} from '@app/core/service/concept-configuration-service/concept-configuration.service';
import { ConceptService } from '@app/core/service/concept-service/concept.service';
import { ConfigurationService } from '@app/core/service/configuration-service/configuration.service';
import { GradingService } from '@app/core/service/grading-service/grading.service';
import { PaymentGroupsService } from '@app/core/service/payment-groups-service/payment-groups.service';
import { PdfViewerService } from "@app/core/service/pdf-viewer-service/pdf-viewer.service";
import { PrintService } from '@app/core/service/print-service/print.service';
import { RolService } from '@app/core/service/rol-service/rol.service';
import { UserService } from '@app/core/service/user-service/user.service';
import { WalletRequestService } from '@app/core/service/wallet-request/wallet-request.service';
import { AffiliateBtcService } from './service/affiliate-btc-service/affiliate-btc.service';
import { UserDataService } from './service/affiliate-service/user-data.service';
import { CoinService } from './service/coin-service/coin.service';
import { ConfigureWalletService } from './service/configure-wallet-service/configure-wallet.service';
import { DocumentCheckService } from './service/document-check-service/document-check.service';
import { EncryptService } from './service/encrypt-service/encrypt.service';
import { IncentiveService } from './service/incentive-service/incentive.service';
import { InvoiceService } from './service/invoice-service/invoice.service';
import { LogoService } from './service/logo-service/logo.service';
import { MaintenanceService } from './service/maintenance-service/maintenance.service';
import { MatrixConfigurationService } from './service/matrix-configuration/matrix-configuration.service';
import { MatrixService } from './service/matrix-service/matrix.service';
import { MenuConfigurationService } from './service/menu-configuration-service/menu.configuration.service';
import { ModelsVisibilityService } from './service/models-visibility-service/models-visibility.service';
import { PagaditoService } from './service/pagadito-service/pagadito.service';
import { PaymentTransactionService } from './service/payment-transaction-service/payment-transaction.service';
import { PrivilegeService } from './service/privilege-service/privilege.service';
import { ProcessGradingService } from './service/process-grading-service/process-grading.service';
import { ProductAttributeValueService } from './service/product-attribute-value/product-attribute-value.service';
import { ProductAttributeService } from './service/product-attribute/product-attribute.service';
import { ProductCategoryService } from './service/product-category-service/product-category.service';
import { ProductCombinationService } from './service/product-combination-service/product-combination.service';
import { ProductDiscountService } from './service/product-discount-service/product-discount.service';
import { ProductInventoryService } from './service/product-inventory-service/product-inventory.service';
import { ProductService } from './service/product-service/product.service';
import { ResultsEcoPoolService } from './service/results-ecopool-service/results-ecopool.service';
import { SessionService } from './service/session-service/session.service';
import { TicketCategoriesService } from './service/ticket-categories-service/ticket-categories.service';
import { TicketHubService } from './service/ticket-service/ticket-hub.service';
import { TicketService } from './service/ticket-service/ticket.service';
import { WalletModel1AService } from './service/wallet-model-1a-service/wallet-model-1a.service';
import { WalletModel1BService } from './service/wallet-model-1b-service/wallet-model-1b.service';
import { WalletPeriodService } from './service/wallet-period-service/wallet-period.service';
import { WalletRetentionConfigService } from './service/wallet-retention-config-service/wallet-retention-config.service';
import { WalletService } from './service/wallet-service/wallet.service';
import { WalletWaitService } from './service/wallet-wait-service/wallet-wait.service';
import { WalletWithDrawalService } from './service/wallet-withdrawal-service/wallet-withdrawal.service';
import {MatrixQualificationService} from "@app/core/service/matrix-qualification-service/matrix-qualification.service";

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule],
  exports: [],
  providers: [
    RightSidebarService,
    AuthGuard,
    AuthService,
    DynamicScriptLoaderService,
    CartService,
    UserService,
    RolService,
    PrivilegeService,
    MenuConfigurationService,
    AffiliateService,
    PrintService,
    ConfigurationService,
    ConceptConfigurationService,
    ConceptService,
    GradingService,
    PaymentGroupsService,
    IncentiveService,
    ProductService,
    ProductCategoryService,
    ProductAttributeService,
    ProductDiscountService,
    ProductAttributeValueService,
    ProductCombinationService,
    ProductInventoryService,
    CoinService,
    WalletService,
    WalletPeriodService,
    WalletWithDrawalService,
    InvoiceService,
    WalletWaitService,
    WalletRetentionConfigService,
    FaceApiService,
    WalletRequestService,
    ProcessGradingService,
    ResultsEcoPoolService,
    EncryptService,
    UserDataService,
    DocumentCheckService,
    ConfigureWalletService,
    AffiliateBtcService,
    ChatService,
    ChatBotService,
    LogoService,
    AffiliateAddressService,
    CoinpaymentService,
    SessionService,
    TermsConditionsService,
    TicketCategoriesService,
    TicketService,
    TicketHubService,
    PaymentTransactionService,
    WalletModel1AService,
    WalletModel1BService,
    PagaditoService,
    MaintenanceService,
    MaintenanceGuard,
    ModelsVisibilityService,
    PdfViewerService,
    MatrixConfigurationService,
    MatrixService,
    MatrixQualificationService
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}

export class AffiliateBtc {

  id: number;
  affiliateId: number;
  password: string;
  verificationCode: string;
  trc20Address: string;
  bscAddress: string;

  constructor() {
    this.id = 0;
    this.affiliateId = 0;
    this.password = '';
    this.trc20Address = '';
    this.bscAddress = '';
    this.verificationCode = '';
  }
}

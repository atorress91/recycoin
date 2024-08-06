import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl, FormControl,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Country } from '@app/core/models/country-model/country.model';
import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';

@Component({
  selector: 'app-affiliates-list-edit-modal',
  templateUrl: './affiliates-list-edit-modal.component.html',
  providers: [ToastrService],
})
export class AffiliatesListEditModalComponent implements OnInit {
  editAffiliateForm: FormGroup;
  submitted = false;
  listCountry: Country[] = [];
  affiliate = new UserAffiliate();
  @ViewChild('affiliateEditModal') affiliateEditModal: NgbModal;
  @Output('loadAffiliateList') loadAffiliateList: EventEmitter<any> =
    new EventEmitter();

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private affiliateService: AffiliateService
  ) { }

  editOpenModal(content, affiliate: UserAffiliate) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
    this.affiliate = affiliate;
    this.fetchCountry();
    this.getUserInfo(this.affiliate.id);
  }

  setValues(affiliate: UserAffiliate) {
    this.affiliate = affiliate;

    let birthdayFormatted = '';
    const birthdayDate = new Date(affiliate.birthday);
    birthdayFormatted = birthdayDate.toISOString().split('T')[0];

    this.editAffiliateForm.setValue({
      identification: affiliate.identification,
      user_name: affiliate.user_name,
      name: affiliate.name,
      last_name: affiliate.last_name,
      email: affiliate.email,
      father: affiliate.father_user ? affiliate.father_user.user_name ?? '' : '',
      phone: affiliate.phone,
      address: affiliate.address ?? '',
      status: affiliate.status !== 1,
      tax_id: affiliate.tax_id ?? '',
      country: affiliate.country,
      zip_code: affiliate.zip_code,
      created_at: affiliate.created_at,
      birthday: birthdayFormatted,
      beneficiary_name: affiliate.beneficiary_name ?? '',
      legal_authorized_first: affiliate.legal_authorized_first ?? '',
      legal_authorized_second: affiliate.legal_authorized_second ?? '',
    });
  }

  ngOnInit(): void {
    this.loadValidations();
  }

  getUserInfo(id: number) {
    this.affiliateService.getAffiliateById(id).subscribe((response) => {
      if (response.success) {
        this.setValues(response.data);
      }
    });
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  showError(message) {
    this.toastr.error(message, 'Error!');
  }

  private fetchCountry() {
    this.affiliateService.getCountries().subscribe((data) => {
      this.listCountry = data;
    });
  }

  loadValidations() {
    this.editAffiliateForm = this.formBuilder.group({
      identification: [],
      user_name: new FormControl({ value: '', disabled: true }),
      name: new FormControl({ value: '', disabled: true }),
      last_name: new FormControl({ value: '', disabled: true }),
      email: ['', Validators.required],
      father: new FormControl({ value: '', disabled: true }),
      phone: ['', Validators.required],
      address: [],
      country: [],
      tax_id: [],
      zip_code: [],
      created_at: new FormControl({ value: '', disabled: true }),
      birthday: [],
      status: [],
      beneficiary_name: [],
      legal_authorized_first: [],
      legal_authorized_second: [],
    });
  }

  onEditRowSave() {
    this.submitted = true;
    if (this.editAffiliateForm.invalid) {
      return;
    }

    this.affiliate.identification = this.editAffiliateForm.value.identification;
    this.affiliate.phone = this.editAffiliateForm.value.phone;
    this.affiliate.address = this.editAffiliateForm.value.address;
    this.affiliate.zip_code = this.editAffiliateForm.value.zip_code;
    this.affiliate.email = this.editAffiliateForm.value.email;
    this.affiliate.country = this.editAffiliateForm.value.country;
    this.affiliate.birthday = this.editAffiliateForm.value.birthday;
    this.affiliate.tax_id = this.editAffiliateForm.value.tax_id;
    this.affiliate.beneficiary_name = this.editAffiliateForm.value.beneficiary_name;
    this.affiliate.status = this.editAffiliateForm.value.status === true ? 0 : 1;
    this.affiliate.legal_authorized_first = this.editAffiliateForm.value.legal_authorize_first;
    this.affiliate.legal_authorized_second = this.editAffiliateForm.value.legal_authorize_second;
    this.affiliateService.updateAffiliate(this.affiliate).subscribe((response: UserAffiliate) => {
      if (response !== null) {
        this.showSuccess('The credentials is valid!');
        this.setValues(response);
      }
      else {
        this.showError('Error!');
        console.log('error', response)
      }
    });
  }

  closeModals() {
    this.modalService.dismissAll();
  }
}


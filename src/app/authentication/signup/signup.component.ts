import {Component, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {City} from '@app/core/models/cities-model/cities.model';
import {Country} from '@app/core/models/country-model/country.model';
import {State} from '@app/core/models/state-model/state.model';
import {UserAffiliate} from '@app/core/models/user-affiliate-model/user.affiliate.model';
import {AffiliateService} from '@app/core/service/affiliate-service/affiliate.service';
import {LogoService} from '@app/core/service/logo-service/logo.service';
import {PdfViewerService} from '@app/core/service/pdf-viewer-service/pdf-viewer.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {CreateAffiliate} from '@app/core/models/user-affiliate-model/create-affiliate.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  registerForm: FormGroup;
  key = '';
  side = '';
  submitted = false;
  error = '';
  sponsor = '';
  user: UserAffiliate = new UserAffiliate();
  listcountry: Country[] = [];
  listState: State[] = [];
  selectedState: string = '';
  listCity: City[] = [];
  logoUrl = '';

  constructor(
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private affiliateService: AffiliateService,
    private toastr: ToastrService,
    private logoService: LogoService,
    private pdfViewerService: PdfViewerService
  ) {
    this.key = this.activatedRoute.snapshot.params.key || '';
    this.side = this.user.side?.toString() || '';

    if (this.key) {
      this.loadValidations();
      this.getUserByUsername(this.key);
    }

    this.fetchCountry();
  }

  private fetchCountry() {
    this.affiliateService.getCountries().subscribe((data) => {
      this.listcountry = data;
    });
  }

  ngOnInit(): void {
    this.getLogoUrl();
    this.loadValidations();
  }

  onCountrySelected(countryIso: any) {
    let country = this.listcountry.find((c) => c.id == countryIso);
    if (!country) {
      return;
    }
    if (country.phoneCode === '1') {
      return;
    }
    this.registerForm.patchValue({
      phone: country.phoneCode
    });
  }

  loadValidations() {
    this.registerForm = this.formBuilder.group(
      {
        user_name: ['', [Validators.required, NoWhitespaceValidator]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/)
          ]
        ],
        repitpassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/)
          ]
        ],
        name: ['', Validators.required],
        last_name: ['', Validators.required],
        phone: ['', Validators.required],
        country: ['', Validators.required],
        email: ['', Validators.required],
        terms_conditions: [false, Validators.requiredTrue]
      },
      {
        validator: passwordMatchValidator
      }
    );
  }

  getUserByUsername(key: string) {
    if (!key) return;

    this.affiliateService.getAffiliateByUserName(key).subscribe(
      (user: UserAffiliate) => {
        if (user !== null) {
          this.sponsor = user.user_name;
          this.user = user;
        } else {
          this.router.navigate(['/signin']).then();
        }
      },
      () => {
        this.router.navigate(['/signin']).then();
      }
    );
  }

  get f(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.registerForm.invalid) {
      this.showError("Formulario invalido.");
      return;
    }

    let user = new CreateAffiliate();
    user.user_name = this.registerForm.value.user_name;
    user.password = this.registerForm.value.password;
    user.name = this.registerForm.value.name;
    user.last_name = this.registerForm.value.last_name;
    user.phone = this.registerForm.value.phone;
    user.country = this.registerForm.value.country;
    user.state_place = '';
    user.city = '';
    user.email = this.registerForm.value.email;
    user.affiliate_type = this.registerForm.value.affiliate_type;
    user.father = this.user.id;
    user.sponsor = this.user.id;
    user.binary_sponsor = this.user.id;
    user.binary_matrix_side = +this.side;
    user.status = 1;
    this.affiliateService.createAffiliate(user).subscribe((response) => {
      if (response.success) {
        this.showSuccess(response.message);
        setTimeout(() => {
          this.router.navigate(['/signin']).then();
        }, 5000);
      } else {
        this.showError(response.message);
      }
    });
  }

  openModal(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
      scrollable: true
    });
  }

  showSuccess(message: string) {
    this.toastr.success(message);
  }

  showError(message: string) {
    this.toastr.error(message);
  }

  getLogoUrl() {
    this.logoUrl = this.logoService.getLogoSrc();
  }

  showTermsAndConditions() {
    const doc = {
      url: '/assets/pdf/T&C RecyCoin V1.2.pdf',
      title: 'Términos y condiciones'
    };

    this.pdfViewerService.showPdf(doc);
  }
}

// Validador para comparar contraseñas a nivel de formulario
export function passwordMatchValidator(formGroup: FormGroup) {
  const password = formGroup.get('password').value;
  const confirmPassword = formGroup.get('repitpassword').value;
  return password === confirmPassword ? null : {passwordMismatch: true};
}

// Validador para evitar espacios en blanco en el User name
export function NoWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  if (control.value.indexOf(' ') >= 0) {
    return {whitespace: true};
  } else {
    return null;
  }
}

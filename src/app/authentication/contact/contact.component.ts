import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AffiliateService} from "@app/core/service/affiliate-service/affiliate.service";
import {ToastrService} from "ngx-toastr";
import {ContactUsRequest} from "@app/core/models/user-affiliate-model/contactUsRequest.model";

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm: FormGroup;
  submitted = false;
  success = false;

  constructor(private formBuilder: FormBuilder,
              private affiliateService: AffiliateService,
              private toastr: ToastrService) {
    this.contactForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['',],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.contactForm.valid) {
      const contact: ContactUsRequest = {
        fullName: this.contactForm.get('fullName')?.value,
        email: this.contactForm.get('email')?.value,
        phoneNumber: this.contactForm.get('phoneNumber')?.value,
        subject: this.contactForm.get('subject')?.value,
        message: this.contactForm.get('message')?.value
      };

      this.affiliateService.contactUs(contact).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = true;
            this.contactForm.reset();
            this.submitted = false;
            this.toastr.success('Formulario enviado correctamente');
          } else {
            this.toastr.error(response.message || 'Error al enviar el formulario');
          }
        },
        error: (error) => {
          console.error('Error sending form:', error);
          this.toastr.error('Error al enviar el formulario');
        }
      });
    } else {
      this.toastr.error('Por favor, complete todos los campos requeridos correctamente');
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
declare var particlesJS: any;

import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss'],
})
export class ForgotComponent implements OnInit {
  forgotPassword: FormGroup;
  submitted = false;
  constructor(private affiliateService: AffiliateService) { }

  ngOnInit(): void {
    this.initForgotPassword();

  }

  get create_forgot_controls(): { [key: string]: AbstractControl } {
    return this.forgotPassword.controls;
  }

  initForgotPassword() {
    this.forgotPassword = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    })
  }

  sendPasswordRecovery() {
    this.submitted = true;

    if (this.forgotPassword.invalid)
      return;


    let email = this.forgotPassword.value.email;

    this.affiliateService.sendPasswordRecovery(email).subscribe({
      next: (value) => {
        this.emailConfirmation();
      },
      error: () => {

      },
    })
  }

  validateEmail() {
    const emailControl = this.forgotPassword.get('email');
    if (emailControl.errors) {
      return;
    }

    if (emailControl.dirty) {
      emailControl.updateValueAndValidity();
    }
  }

  emailConfirmation() {
    Swal.fire({
      title: 'Restablecimiento de contraseña',
      text: 'Se ha enviado un correo electrónico con un enlace para restablecer su contraseña. Por favor, revisa la bandeja de entrada o carpeta de spam.',
      icon: 'success',
      confirmButtonText: 'Entendido',
    });
  }


}

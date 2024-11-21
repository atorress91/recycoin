import {AuthService} from 'src/app/core/service/authentication-service/auth.service';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormControl, FormGroup} from '@angular/forms';
import {Validators} from '@angular/forms';
import {Response} from '@app/core/models/response-model/response.model';
import {ToastrService} from 'ngx-toastr';

declare var particlesJS: any;
import {TranslateService} from '@ngx-translate/core';

import {Signin} from '@app/core/models/signin-model/signin.model';
import {LogoService} from '@app/core/service/logo-service/logo.service';
import {DeviceDetectorService} from 'ngx-device-detector';
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  animations: [
    trigger('backgroundFade', [
      state('visible', style({
        opacity: 1
      })),
      state('hidden', style({
        opacity: 0
      })),
      transition('visible => hidden', animate('1000ms ease-out')),
      transition('hidden => visible', animate('1000ms ease-in'))
    ])
  ]
})
export class SigninComponent implements OnInit, OnDestroy {
  submitted = false;
  error = '';
  loading = false;
  hide = true;
  logoUrl: string;
  username: string = 'Usuario';
  password: string = 'Contraseña';
  remember: string = 'Recordar';
  forgot: string = 'Cambiar contraseña';
  signin: string = 'Iniciar sesión';
  passwordIsRequerid = 'La contraseña es requerida.';
  userNameIsRequerid = 'El usuario es requerido.';
  passwordErrorMessage =
    'La contraseña debe tener al menos 6 y un máximo de 15 caracteres';
  userNameErrorMessage = 'El nombre de usuario no es válido';
  backgroundImages: string[] = [
    '/assets/images/login-option-1.png',
    '/assets/images/login-option-2.png',
    '/assets/images/login-option-3.png'
  ];
  currentImageIndex = 0;
  private intervalId: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
    private logoService: LogoService,
    private translate: TranslateService,
    private deviceService: DeviceDetectorService
  ) {
  }

  ngOnInit() {
    this.getTheme();
    this.authService.logoutUser();
    particlesJS.load(
      'particles-js',
      'assets/particles/particles.json',
      function () {
      }
    );
    this.setLabels();
    this.setErrorMessages();
    this.startBackgroundRotation();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  authLogin = new FormGroup({
    remeber: new FormControl('', []),
    email: new FormControl('', [Validators.required]),
    pwd: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(15),
    ]),
  });

  setLabels() {
    if (this.translate.currentLang != undefined) {
      this.username = this.translate.instant('SIGNIN.USER-NAME.TEXT');
      this.password = this.translate.instant('SIGNIN.PASSWORD.TEXT');
      this.remember = this.translate.instant('SIGNIN.REMEMBER-ME.TEXT');
      this.forgot = this.translate.instant('SIGNIN.FORGOT-PASS.TEXT');
      this.signin = this.translate.instant('SIGNIN.TITLE.TEXT');
    }
  }

  setErrorMessages() {
    if (this.translate.currentLang != undefined) {
      this.passwordIsRequerid = this.translate.instant(
        'SIGNIN.PASS-IS-REQUIRED.TEXT'
      );
      this.userNameIsRequerid = this.translate.instant(
        'SIGNIN.USER-NAME-IS-REQUIRED.TEXT'
      );
      this.passwordErrorMessage = this.translate.instant(
        'SIGNIN.PASS-MESSAGE-ERROR.TEXT'
      );
      this.userNameErrorMessage = this.translate.instant(
        'SIGNIN.USER-NAME-MESSAGE-ERROR.TEXT'
      );
    }
  }

  loginSubmitted() {
    let signin = new Signin();
    this.submitted = true;
    this.error = '';
    signin.userName = this.authLogin.value.email;
    signin.password = this.authLogin.value.pwd;

    signin.browserInfo = this.deviceService.getDeviceInfo().browser;
    signin.operatingSystem = this.deviceService.getDeviceInfo().os;

    this.authService.fetchIpAddress().subscribe((ip) => {
      signin.ipAddress = ip;
      console.log(signin);

      if (signin.userName === '' || signin.password === '') {
        return;
      }
      this.loading = true;

      this.authService.loginUser(signin).subscribe((response: Response) => {
        if (response.success) {
          if (response.data.is_affiliate) {
            this.router.navigate(['/app/home']).then();
          } else {
            this.router.navigate(['admin/home-admin']).then();
          }
        } else {
          this.showError(response.message);
        }
        this.loading = false;
      });
    });
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Success!');
  }

  showError(message: string) {
    this.toastr.error(message, 'Error!');
  }

  get f() {
    return this.authLogin.controls;
  }

  get Email(): FormControl {
    return this.authLogin.get('email') as FormControl;
  }

  get Pwd(): FormControl {
    return this.authLogin.get('pwd') as FormControl;
  }

  getTheme() {
    this.logoUrl = this.logoService.getLogoSrc();
  }

  private startBackgroundRotation() {
    this.intervalId = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.backgroundImages.length;
    }, 10000);
  }
}

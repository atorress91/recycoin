import { ImageProfileService } from './../../core/service/image-profile-service/image-profile.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { UpdateImageProfile } from '@app/core/models/user-affiliate-model/update-image-profile.model';
import { ToastrService } from 'ngx-toastr';
import { User } from '@app/core/models/user-model/user.model';
import { UserService } from '@app/core/service/user-service/user.service';


@Component({
  selector: 'app-img-profile',
  templateUrl: './img-profile.component.html',
  styleUrls: ['./img-profile.component.sass']
})
export class ImgProfileComponent implements OnInit {
  @ViewChild('profileImgModal', { static: true }) private modalContent: TemplateRef<any>;
  file: File | null = null;
  fileRef: any;
  user: UserAffiliate = new UserAffiliate();
  userAdmin: User = new User();

  constructor(private modalService: NgbModal,
    private storage: Storage,
    private authService: AuthService,
    private affiliateService: AffiliateService,
    private toastr: ToastrService,
    private imageProfileService: ImageProfileService,
    private userService: UserService
  ) {
  }

  ngOnInit(): void {
    this.user = this.authService.currentUserAffiliateValue;
    console.log(this.user)
    this.userAdmin = this.authService.currentUserAdminValue;
    console.log(this.userAdmin)
  }

  showSuccess(message) {
    this.toastr.success(message);
  }

  showError(message) {
    this.toastr.error(message);
  }

  openProfileImgModal() {
    this.modalService.open(this.modalContent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      centered: true,
    });
  }

  onFileSelected(event: any): void {
    this.file = event.addedFiles[0];
    const isUserAffiliate = this.user && this.user.id;
    const filePath = isUserAffiliate
      ? 'affiliates/profile/' + `${this.user.user_name}/` + `${this.user.id}`
      : 'admins/profile/' + `${this.userAdmin.user_name}/` + `${this.userAdmin.id}`;

    this.fileRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(this.fileRef, this.file);

    uploadTask.on('state_changed',
      (snapshot) => { },
      (error) => {
        console.log(error);
        this.showError('Error al subir la imagen');
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          let updateImage = new UpdateImageProfile();
          updateImage.image_profile_url = downloadURL;

          if (isUserAffiliate) {
            this.affiliateService.updateImageProfile(this.user.id, updateImage).subscribe({
              next: (value) => {
                this.authService.setUserAffiliateValue(value);
                this.user.image_profile_url = downloadURL;
                this.showSuccess('Imagen actualizada correctamente');
              },
              error: () => {
                this.showError('No se pudo actualizar la imagen de perfil.');
              }
            });
          } else {
            this.userService.updateImageProfile(this.userAdmin.id, updateImage).subscribe({
              next: (value) => {
                this.authService.setUserAdminValue(value);
                this.userAdmin.image_profile_url = downloadURL;
                this.showSuccess('Imagen actualizada correctamente');
              },
              error: () => {
                this.showError('No se pudo actualizar la imagen de perfil.');
              }
            });
          }
        });
      }
    );
  }

  removeImage(): void {
    let updateImage = new UpdateImageProfile();
    updateImage.image_profile_url = '';
    const isUserAffiliate = this.user && this.user.id;

    if (isUserAffiliate) {
      this.affiliateService.updateImageProfile(this.user.id, updateImage).subscribe({
        next: (value) => {
          this.authService.setUserAffiliateValue(value);
          this.user.image_profile_url = null;
          this.file = null;
          this.showSuccess('Imagen eliminada correctamente');
        },
        error: () => {
          this.showError('No se pudo eliminar la imagen de perfil del afiliado.');
        }
      });
    } else {
      this.userService.updateImageProfile(this.userAdmin.id, updateImage).subscribe({
        next: (value) => {
          this.authService.setUserAdminValue(value);
          this.userAdmin.image_profile_url = null;
          this.file = null;
          this.showSuccess('Imagen de admin eliminada correctamente');
        },
        error: () => {
          this.showError('No se pudo eliminar la imagen de perfil del admin.');
        }
      });
    }
  }
}

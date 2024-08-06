import { Rol } from './../../../core/models/rol-model/rol.model';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { User } from '@app/core/models/user-model/user.model';
import { UserService } from '@app/core/service/user-service/user.service';
import { _ParseAST } from '@angular/compiler';

@Component({
  selector: 'app-users-list-edit-modal',
  templateUrl: './users-list-edit-modal.component.html',
})
export class UsersListEditModalComponent implements OnInit {
  editUserForm: FormGroup;
  submitted = false;
  user = new User();
  @Input() selectRol: Rol = new Rol();
  @ViewChild('userEditModal') userEditModal: NgbModal;
  @Output('loadUserList') loadUserList: EventEmitter<any> = new EventEmitter();

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private userService: UserService
  ) {}

  get edit_user_controls(): { [key: string]: AbstractControl } {
    return this.editUserForm.controls;
  }

  editOpenModal(content, user: User) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
    this.user = user;
    this.editUserForm.setValue({
      user_name: user.user_name,
      name: user.name,
      last_name: user.last_name,
      phone: user.phone,
      email: user.email,
      rol_id: user.rol_id,
      observation: user.observation,
      address: user.address,
      status: user.status,
    });
  }

  ngOnInit(): void {
    this.loadValidations();
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  showError(message) {
    this.toastr.error(message, 'Error!');
  }

  loadValidations() {
    this.editUserForm = this.formBuilder.group({
      user_name: ['', Validators.required],
      name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      rol_id: ['', Validators.required],
      status: [],
      observation: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  onEditRowSave() {
    this.submitted = true;
    if (this.editUserForm.invalid) {
      return;
    }
    this.user.user_name = this.editUserForm.value.user_name;
    this.user.rol_id = this.editUserForm.value.rol_id;
    this.user.name = this.editUserForm.value.name;
    this.user.last_name = this.editUserForm.value.last_name;
    this.user.email = this.editUserForm.value.email;
    this.user.phone = this.editUserForm.value.phone;
    this.user.observation = this.editUserForm.value.observation;
    this.user.address = this.editUserForm.value.address;
    this.user.status = this.editUserForm.value.status ?? false;

    this.userService.updateUser(this.user).subscribe({
      next: (value) => {
        this.showSuccess('The user was updated successfully!');
        this.closeModals();
        this.loadUserList.emit();
      },
      error: (err) => {
        this.showError('Error!' + err);
      },
    });
  }

  closeModals() {
    this.modalService.dismissAll();
  }
}

export function MustMatch(controlName: string, matchingControlName: string) {
  return (group: AbstractControl) => {
    const control = group.get(controlName);
    const matchingControl = group.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      return null;
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
    return null;
  };
}

import {
  Component,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Rol } from '@app/core/models/rol-model/rol.model';
import { RolService } from '@app/core/service/rol-service/rol.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rol-list-create-modal',
  templateUrl: './rol-list-create-modal.component.html',
  providers: [ToastrService],
})
export class RolListCreateModalComponent implements OnInit {
  createRolForm: FormGroup;
  submitted = false;
  rolGlobal: Rol = new Rol();

  @ViewChild('rolCreateModal') rolCreateModal: NgbModal;
  @Output('loadRolList') loadRolList: EventEmitter<any> = new EventEmitter();
  constructor(
    private modalService: NgbModal,
    private rolService: RolService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) {}

  get create_rol_controls(): { [key: string]: AbstractControl } {
    return this.createRolForm.controls;
  }

  ngOnInit() {
    this.loadValidations();
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  loadValidations() {
    this.createRolForm = this.formBuilder.group({
      rol_name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  createOpenModal(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  showError(message) {
    this.toastr.error(message, 'Error!');
  }

  onAddRowSave() {
    this.submitted = true;
    if (this.createRolForm.invalid) {
      return;
    }
    let rol = new Rol();
    rol.name = this.createRolForm.value.rol_name;
    rol.description = this.createRolForm.value.description;

    this.rolService.createRol(rol).subscribe({
      next: (value) => {
        this.showSuccess('The rol was created successfully!');
        this.closeModals();
        this.loadRolList.emit();
      },
      error: (err) => {
        this.showError('Error!' + err);
      },
    });
  }
}

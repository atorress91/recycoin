import {Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Storage, ref, uploadBytesResumable, getDownloadURL} from '@angular/fire/storage';
import {concatAll, from, Observable} from 'rxjs';
import {toArray} from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';

import {TicketCategoriesService} from '@app/core/service/ticket-categories-service/ticket-categories.service';
import {TicketCategories} from '@app/core/models/ticket-categories-model/ticket-categories.model';
import {TicketRequest} from '@app/core/models/ticket-model/ticketRequest.model'
import {AuthService} from '@app/core/service/authentication-service/auth.service';
import {UserAffiliate} from '@app/core/models/user-affiliate-model/user.affiliate.model';
import {TicketHubService} from '@app/core/service/ticket-service/ticket-hub.service';
import {TicketImagesRequest} from "@app/core/models/ticket-model/ticket-images-request.model";

@Component({
  selector: 'app-create-ticket-modal',
  templateUrl: './create-ticket-modal.component.html',
  styleUrls: ['./create-ticket-modal.component.scss']
})
export class CreateTicketModalComponent implements OnInit {
  createTicketForm: FormGroup;
  submitted: boolean = false;
  categories: TicketCategories[] = [];
  files: File[] = [];
  ticket: TicketRequest = new TicketRequest();
  user: UserAffiliate = new UserAffiliate();

  @Output() reloadRequested = new EventEmitter<void>();
  @ViewChild('createTicketModal') createTicketModal: TemplateRef<any>;

  constructor(private modalService: NgbModal,
              private ticketCategoriesService: TicketCategoriesService,
              private storage: Storage,
              private authService: AuthService,
              private toast: ToastrService,
              private ticketHubService: TicketHubService
  ) {
  }

  ngOnInit() {
    this.user = this.authService.currentUserAffiliateValue;
    this.initCreateTicketForm();
    this.getAllTicketCategories()
    this.ticketHubService.startConnection().then();
  }

  initCreateTicketForm() {
    this.createTicketForm = new FormGroup({
      subject_ticket: new FormControl('', Validators.required),
      category: new FormControl("", Validators.required),
      description: new FormControl("", [Validators.required, Validators.maxLength(255)]),
    });
  }

  showSuccess(message: string) {
    this.toast.success(message);
  }

  showError(message: string) {
    this.toast.error(message);
  }

  getAllTicketCategories() {
    this.ticketCategoriesService.getAll().subscribe({
      next: (value: TicketCategories[]) => {
        this.categories = value;
      },
      error: () => {
        this.showError('Error al cargar las categorías.');
      },
    })
  }

  openModal() {
    this.modalService.open(this.createTicketModal, {size: 'lg', centered: true});
  }

  createTicket(): void {
    this.submitted = true;

    if (this.createTicketForm.invalid) return;

    this.ticket.affiliateId = this.user.id;
    this.ticket.subject = this.createTicketForm.get('subject_ticket').value;
    this.ticket.description = this.createTicketForm.get('description').value;
    this.ticket.categoryId = parseInt(this.createTicketForm.get('category').value);

    if (this.files.length > 0) {
      this.startTicketImageUpload();
    } else {
      this.saveTicket(this.ticket);
    }
  }

  startTicketImageUpload(): void {
    const filePathBase = `tickets/${this.user.user_name}/${this.user.id}/`;
    const uploads = this.files.map(file => {
      const fileRef = ref(this.storage, `${filePathBase}${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      return new Observable<TicketImagesRequest>((subscriber) => {
        uploadTask.on(
          'state_changed',
          () => {
          },
          (error) => {
            subscriber.error(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(
              (downloadURL) => {
                let imageRequest = new TicketImagesRequest();
                imageRequest.imagePath = downloadURL;
                subscriber.next(imageRequest);
                subscriber.complete();
              },
              (error) => {
                subscriber.error(error);
              }
            );
          }
        );
      });
    });

    from(uploads).pipe(
      concatAll(),
      toArray()
    ).subscribe({
      next: (imageRequests) => {
        this.ticket.images.push(...imageRequests);
        this.saveTicket(this.ticket);
      },
      error: () => {
        this.showError('Error al cargar las imágenes.');
        this.saveTicket(this.ticket);
      }
    });
  }

  onFileSelected(event: any): void {
    const newFiles: File[] = event.addedFiles;
    if (newFiles && newFiles.length > 0) {
      this.files = [...this.files, ...newFiles];
    }
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  private saveTicket(ticket: TicketRequest): void {
    this.ticketHubService.createTicket(ticket)
      .then(() => {
        this.showSuccess('Ticket creado correctamente!');
        this.reloadRequested.emit();
      })
      .catch(error => {
        this.showError('Error al crear el ticket.' + error);
      })
      .finally(() => {
        this.modalService.dismissAll();
      });
  }
}

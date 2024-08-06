import {Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TicketCategories} from "@app/core/models/ticket-categories-model/ticket-categories.model";
import {TicketRequest} from "@app/core/models/ticket-model/ticketRequest.model";
import {UserAffiliate} from "@app/core/models/user-affiliate-model/user.affiliate.model";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {TicketCategoriesService} from "@app/core/service/ticket-categories-service/ticket-categories.service";
import {getDownloadURL, ref, Storage, uploadBytesResumable} from "@angular/fire/storage";

import {ToastrService} from "ngx-toastr";
import {TicketHubService} from "@app/core/service/ticket-service/ticket-hub.service";
import {concatAll, from, Observable} from "rxjs";
import {TicketImagesRequest} from "@app/core/models/ticket-model/ticket-images-request.model";
import {toArray} from "rxjs/operators";
import {AffiliateService} from "@app/core/service/affiliate-service/affiliate.service";

@Component({
  selector: 'app-create-admin-modal',
  templateUrl: './create-admin-modal.component.html',
  styleUrls: ['./create-admin-modal.component.scss']
})
export class CreateAdminModalComponent implements OnInit {
  createTicketForm: FormGroup;
  submitted: boolean = false;
  categories: TicketCategories[] = [];
  files: File[] = [];
  ticket: TicketRequest = new TicketRequest();
  user: UserAffiliate = new UserAffiliate();
  allUsers: UserAffiliate[] = [];
  filteredUsers: UserAffiliate[] = [];
  showSuggestions = false;

  @Output() reloadRequested = new EventEmitter<void>();
  @ViewChild('createTicketModal') createTicketModal: TemplateRef<any>;

  constructor(private modalService: NgbModal,
              private ticketCategoriesService: TicketCategoriesService,
              private storage: Storage,
              private toast: ToastrService,
              private ticketHubService: TicketHubService,
              private affiliateService: AffiliateService,
  ) {
  }

  ngOnInit() {
    this.initCreateTicketForm();
    this.getAllUsers();
    this.getAllTicketCategories()
    this.ticketHubService.startConnection().then();
  }

  initCreateTicketForm() {
    this.createTicketForm = new FormGroup({
      userSearch: new FormControl(''),
      userId: new FormControl('', Validators.required),
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

    this.ticket.affiliateId = this.createTicketForm.get('userId').value;
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

  getAllUsers() {
    this.affiliateService.getAll().subscribe((value: UserAffiliate[]) => {
      this.allUsers = value;
    })
  }

  updateFilteredUsers() {
    const searchTerm = this.createTicketForm.get('userSearch').value.toLowerCase();
    if (searchTerm) {
      this.filteredUsers = this.allUsers.filter(user =>
        user.user_name.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredUsers = [];
    }
  }

  selectUser(user: UserAffiliate) {
    this.createTicketForm.get('userSearch').setValue(user.user_name);
    this.createTicketForm.get('userId').setValue(user.id);  // Asumiendo que también guardas el ID
    this.showSuggestions = false;
  }

  hideSuggestions() {
    // Retrasa la ocultación para permitir la selección de un elemento
    setTimeout(() => this.showSuggestions = false, 200);
  }
}

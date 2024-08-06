import {Component, OnInit, ViewChild} from '@angular/core';
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {Router} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ToastrService} from 'ngx-toastr';
import {DatatableComponent, SelectionType} from '@swimlane/ngx-datatable';

import {TicketHubService} from "@app/core/service/ticket-service/ticket-hub.service";
import {Ticket} from "@app/core/models/ticket-model/ticket.model";
import {TicketCategoriesService} from "@app/core/service/ticket-categories-service/ticket-categories.service";
import {TicketCategories} from "@app/core/models/ticket-categories-model/ticket-categories.model";
import Swal from 'sweetalert2';
import {CreateAdminModalComponent} from "@app/admin/tickets/create-admin-modal/create-admin-modal.component";

@Component({
  selector: 'app-tickets-admin',
  templateUrl: './tickets-admin.component.html',
})
export class TicketsAdminComponent implements OnInit {
  tickets: Ticket[] = [];
  private unsubscribe$ = new Subject<void>();
  categories: TicketCategories[] = [];
  selectedTicket: any = {};
  selectedTickets: Ticket[] = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  SelectionType = SelectionType;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(CreateAdminModalComponent) private createTicketModal: CreateAdminModalComponent;

  constructor(private ticketHubService: TicketHubService,
              private ticketCategoryService: TicketCategoriesService,
              private router: Router,
              private modalService: NgbModal,
              private toast: ToastrService) {
  }

  async ngOnInit(): Promise<void> {
    this.ticketHubService.connectionEstablished.subscribe(connected => {
      if (connected) {
        this.loadTicketCategories();
        this.getAllTickets();
      } else {
        console.error('Connection is not established.');
      }
    });
  }

  showSuccess(message: string) {
    this.toast.success(message);
  }

  showError(message: string) {
    this.toast.error(message);
  }

  loadTicketCategories() {
    this.ticketCategoryService.getAll().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (value) => {
        this.categories = value;
      },
      error: () => {
        this.showError('Error al cargar las categorías')
      },
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.categoryName : 'Categoría no encontrada';
  }

  getAllTickets() {
    this.ticketHubService.getAllTickets().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.loadingIndicator = false;
      },
      error: () => {
        this.showError('Error al cargar los tickets');
      }
    });
  }

  openTicketMessage(ticket: Ticket) {
    this.ticketHubService.setTicket(ticket.id);
    this.router.navigate(['admin/ticket-for-admin/message']).then();
  }

  openModal(content: any, ticket: Ticket) {
    this.selectedTicket.images = ticket.images || [];

    this.modalService.open(content, {size: 'lg', centered: true}).result.then(() => {
    });
  }

  onSelectTicket(ticket: Ticket, selected: boolean) {
    if (selected) {
      this.selectedTickets.push(ticket);
    } else {
      const index = this.selectedTickets.findIndex(t => t.id === ticket.id);
      if (index !== -1) {
        this.selectedTickets.splice(index, 1);
      }
    }
  }

  isTicketSelected(ticket: Ticket): boolean {
    return this.selectedTickets.some(t => t.id === ticket.id);
  }

  onDeleteTickets(): void {
    if (this.selectedTickets.length > 0 && this.ticketHubService.connectionEstablished) {
      const idsToDelete = this.selectedTickets.map(ticket => ticket.id);

      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Los tickets seleccionados serán eliminados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.ticketHubService.deleteTickets(idsToDelete).then(() => {
            this.tickets = this.tickets.filter(ticket => !idsToDelete.includes(ticket.id));
            this.selectedTickets = [];
            this.showSuccess('Tickets eliminados exitosamente');
          }).catch(() => {
            this.showError('Error eliminando tickets');
          });
        }
      });
    } else {
      this.showError('No ha seleccionado tickets.');
    }
  }

  openCreateTicketModal() {
    this.createTicketModal.openModal();
  }
}


